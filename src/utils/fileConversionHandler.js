import { pipeline } from 'node:stream/promises';
import { extname } from 'node:path';
import { createReadStream, createWriteStream } from 'node:fs';
import { argParser } from '../utils/argParser.js';
import { pathResolver } from '../utils/pathResolver.js';
import { InvalidInputError } from '../utils/errors.js';

export const fileConfersionHandler = async (args, fileExtention, transformStream) => {
  const inputArg = argParser(args, 'input', true);
  const outputArg = argParser(args, 'output', true);

  const inputPath = pathResolver(inputArg);
  const outputPath = pathResolver(outputArg);

  const inputFileExt = extname(inputPath).toLowerCase();

  if (inputFileExt !== fileExtention) {
    throw new InvalidInputError('Invalid file extention');
  }

  const inputStream = createReadStream(inputPath, { encoding: 'utf-8' });
  const outputStream = createWriteStream(outputPath, { encoding: 'utf-8' });

  await pipeline(inputStream, transformStream, outputStream);
};