import { pipeline } from 'node:stream/promises';
import { extname } from 'node:path';
import { createReadStream, createWriteStream } from 'node:fs';
import { argParser } from '../utils/argParser.js';
import { InvalidInputError } from '../utils/errors.js';

export const fileConfersionHandler = async (args, fileExtention, transformStream) => {
  const parsedArgs = argParser(args, {
    input: { type: 'path', required: true },
    output: { type: 'path', required: true },
  });

  const inputFileExt = extname(parsedArgs.input).toLowerCase();
  if (inputFileExt !== fileExtention) {
    throw new InvalidInputError('Invalid file extention');
  }

  const inputStream = createReadStream(parsedArgs.input, { encoding: 'utf-8' });
  const outputStream = createWriteStream(parsedArgs.output, { encoding: 'utf-8' });

  await pipeline(inputStream, transformStream, outputStream);
};