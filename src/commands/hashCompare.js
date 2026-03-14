import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { readFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { argParser } from '../utils/argParser.js';
import { SUPPORTED_ALGORYTHMS } from '../constants.js';


export const hashCompareHandler = async (args) => {
  const parsedArgs = argParser(args, {
    input: { type: 'path', required: true },
    hash: { type: 'path', required: true },
    algorithm: { type: 'string', default: 'sha256' },
  });

  if (!SUPPORTED_ALGORYTHMS.includes(parsedArgs.algorithm)) {
    throw new Error('Algorithm is not supported');
  }

  const hash = createHash(parsedArgs.algorithm);
  const readableStream = createReadStream(parsedArgs.input);

  await pipeline(readableStream, hash);

  const hashedValue = hash.digest('hex');

  const savedHash = await readFile(parsedArgs.hash, { encoding: 'utf-8' });

  const isValid = hashedValue === savedHash.trim().toLowerCase();

  console.log(isValid ? 'OK' : ' MISMATCH');
}