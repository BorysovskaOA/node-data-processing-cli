import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { createReadStream, createWriteStream } from 'node:fs';
import { argParser } from '../utils/argParser.js';

const SUPPORTED_ALGORYTHMS = ['sha256', 'md5', 'sha512'];

export const hashHandler = async (args) => {
  const parsedArgs = argParser(args, {
    input: { type: 'path', required: true },
    algorithm: { type: 'string', default: 'sha256' },
    save: { type: 'boolean', default: false },
  });

  if (!SUPPORTED_ALGORYTHMS.includes(parsedArgs.algorithm)) {
    throw new Error('Algorithm is not supported');
  }

  const hash = createHash(parsedArgs.algorithm);
  const readableStream = createReadStream(parsedArgs.input);

  await pipeline(readableStream, hash);

  const hashedValue = hash.digest('hex');

  if (parsedArgs.save) {
    const outputPath = `${parsedArgs.input}.${parsedArgs.algorithm}`;

    await pipeline(Readable.from(hashedValue), createWriteStream(outputPath));
  }

  console.log(`${parsedArgs.algorithm}: ${hashedValue}`);
}