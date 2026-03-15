import { stat } from 'node:fs/promises';
import { extname } from 'node:path';
import { availableParallelism } from 'node:os';
import { Worker } from 'node:worker_threads';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { InvalidInputError } from '../utils/errors.js';
import { argParser } from '../utils/argParser.js';
import { INITIAL_LOG_STATS, mergeStats } from '../utils/mergeLogStats.js';


const runWorker = (data) => {
  const workerPath = new URL('../workers/logWorker.js', import.meta.url);

  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath);
    worker.on('message', (data) => {
      resolve(data);
      worker.terminate();
    });
    worker.on('error', (error) => {
      reject(error);
      worker.terminate();
    });
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });

    worker.postMessage(data);
  });
}

export const logStatsHandler = async (args) => {
  const parsedArgs = argParser(args, {
    input: { type: 'path', required: true },
    output: { type: 'path', required: true },
  });

  const inputFileExt = extname(parsedArgs.input).toLowerCase();
  if (!['.txt', '.log'].includes(inputFileExt)) {
    throw new InvalidInputError('Invalid file extention');
  }

  const maxWorkersAvailable = availableParallelism();
  const inputFileStats = await stat(parsedArgs.input);
  const inputFileBitesLength = inputFileStats.size;

  const bytesPerWorker = Math.floor(inputFileBitesLength / maxWorkersAvailable);
  const positionsToReadByWorker = Array.from({ length: maxWorkersAvailable }).map((_, i) => ({
    filePath: parsedArgs.input,
    start: i * bytesPerWorker,
    end: (i === (maxWorkersAvailable - 1)) ? inputFileBitesLength : i * bytesPerWorker + bytesPerWorker,
  }));

  const workerChunkStats = await Promise.all(positionsToReadByWorker.map(runWorker));
  const mergedStats = workerChunkStats.reduce(mergeStats, INITIAL_LOG_STATS);

  // Need just 2 most popular
  const topPaths = Object.entries(mergedStats.paths)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([path, count]) => ({ path, count }))

  const mergedFormattedStats = {
    total: mergedStats.total,
    levels: mergedStats.levels,
    status: mergedStats.status,
    topPaths,
    avgResponseTimeMs: mergedStats.avgResponseTimeMs.toFixed(2),
  }

  await pipeline(Readable.from(JSON.stringify(mergedFormattedStats, null, 2)), createWriteStream(parsedArgs.output, 'utf-8'));
}