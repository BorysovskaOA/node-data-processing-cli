import { parentPort } from 'worker_threads';
import { createReadStream } from 'node:fs';
import { LINE_SEPARATOR } from '../constants.js';
import { mergeStats, INITIAL_LOG_STATS } from '../utils/mergeLogStats.js';


let readBufferLength = 0;
let isBufferRead = false;

const getBuffersToProcess = (chunk, maxBufferLength) => {
  const newReadBufferLength = readBufferLength + chunk.length;

  let chunkWithinRange;
  let chunkToFinishLastLine;

  if (newReadBufferLength < maxBufferLength) {
    chunkWithinRange = chunk;
    readBufferLength = newReadBufferLength;
  } else {
    if (!isBufferRead) {
      const requiredLenghtFromChunk = maxBufferLength - readBufferLength;
      chunkWithinRange = chunk.subarray(0, requiredLenghtFromChunk);
      readBufferLength += requiredLenghtFromChunk;
      chunkToFinishLastLine = chunk.subarray(requiredLenghtFromChunk);

      isBufferRead = true;
    } else {
      chunkToFinishLastLine = chunk;
    }
  }

  return [chunkWithinRange, chunkToFinishLastLine];
}

const processLine = (stats, line) => {
  const [, level, , statusCode, responseTime, , path] = line.split(' ');

  const lineStat = structuredClone(INITIAL_LOG_STATS);
  lineStat.total++;
  lineStat.levels[level]++;
  lineStat.status[`${statusCode.toString().charAt(0)}xx`]++;
  lineStat.avgResponseTimeMs = Number(responseTime);
  lineStat.paths = { [path]: 1 }

  return mergeStats(stats, lineStat);
}


parentPort.on('message', async ({ filePath, start, end }) => {
  let stats = INITIAL_LOG_STATS;

  const readableStream = createReadStream(filePath, { start });
  const maBufferLength = end - start;
  let shouldExcluseFirstLine = start !== 0;
  let buffer = '';

  for await (const chunk of readableStream) {
    const [chunkWithinRange, chunkToFinishLastLine] = getBuffersToProcess(chunk, maBufferLength);

    if (chunkWithinRange) {
      buffer += chunkWithinRange.toString('utf-8');
      let lines = buffer.split(LINE_SEPARATOR);
      buffer = lines.pop();

      // We don't count first line if not first part worker
      if (shouldExcluseFirstLine) {
        lines.shift();
        shouldExcluseFirstLine = false
      }

      lines.forEach(l => {
        stats = processLine(stats, l);
      });
    }

    if (chunkToFinishLastLine) {
      const lastPieceBuffer = buffer + chunkToFinishLastLine.toString('utf-8');
      let lines = lastPieceBuffer.split(LINE_SEPARATOR);
      buffer = lines.shift();

      // If we no lines left - we din't have last new line in buffer
      if (lines.length !== 0) {
        break;
      }
    }
  }

  // Processing of last line
  if (buffer.length) {
    stats = processLine(stats, buffer)
  }

  parentPort.postMessage(stats);
});
