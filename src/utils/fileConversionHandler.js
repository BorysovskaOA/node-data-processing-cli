import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { argParser } from '../utils/argParser.js';
import { validateFileExtention } from './validateFileExtention.js';


export const fileConfersionHandler = async (args, inputExt, outputExt, transformStream) => {
  const parsedArgs = argParser(args, {
    input: { type: 'path', required: true },
    output: { type: 'path', required: true },
  });

  validateFileExtention(parsedArgs.input, inputExt);
  validateFileExtention(parsedArgs.output, outputExt);

  const inputStream = createReadStream(parsedArgs.input, { encoding: 'utf-8' });
  const outputStream = createWriteStream(parsedArgs.output, { encoding: 'utf-8' });

  await pipeline(inputStream, transformStream, outputStream);
};