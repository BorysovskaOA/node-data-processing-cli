
import { extname } from 'node:path';
import { createReadStream } from 'node:fs';
import { argParser } from '../utils/argParser.js';
import { pathResolver } from '../utils/pathResolver.js';
import { InvalidInputError } from '../utils/errors.js';

const LINE_SEPARATOR = /\r?\n/;
const WORD_SEPARATOR = /\s+/;

const getWordsFromString = (str) => {
  return str.split(WORD_SEPARATOR).filter(w => w.length > 0);
}

export const countHandler = async (args) => {
  const inputArg = argParser(args, 'input', true);
  const inputPath = pathResolver(inputArg);

  const inputFileExt = extname(inputPath).toLowerCase();

  if (inputFileExt !== '.txt') {
    throw new InvalidInputError('Invalid file extention');
  }

  const readableStream = createReadStream(inputPath, { encoding: 'utf-8' });

  let buffer = '';
  let linesCount = 0;
  let wordsCount = 0;
  let charsCount = 0;

  for await (const chunk of readableStream) {
    buffer += chunk;
    charsCount += chunk.length;

    const lines = buffer.split(LINE_SEPARATOR);
    buffer = lines.pop();

    linesCount += lines.length;

    const words = getWordsFromString(lines.join(' '));
    wordsCount += words.length;
  }

  if (buffer.length) {
    charsCount += buffer.length;
    linesCount++;

    const words = getWordsFromString(buffer);
    wordsCount += words.length;
  }

  console.log(`Lines: ${linesCount}`);
  console.log(`Words: ${wordsCount}`);
  console.log(`Characters: ${charsCount}`);
}