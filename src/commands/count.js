
import { extname } from 'node:path';
import { createReadStream } from 'node:fs';
import { argParser } from '../utils/argParser.js';
import { InvalidInputError } from '../utils/errors.js';
import { LINE_SEPARATOR, WORD_SEPARATOR } from '../constants.js';


const getWordsFromString = (str) => str.split(WORD_SEPARATOR).filter(w => w.length > 0);
const getSum = (arr) => arr.reduce((acc, wc) => acc + wc, 0);

export const countHandler = async (args) => {
  const parsedArgs = argParser(args, {
    input: { type: 'path', required: true },
  });

  const inputFileExt = extname(parsedArgs.input).toLowerCase();
  if (inputFileExt !== '.txt') {
    throw new InvalidInputError('Invalid file extention');
  }

  const readableStream = createReadStream(parsedArgs.input, { encoding: 'utf-8' });

  let buffer = '';
  let linesCount = 0;
  let wordsCount = 0;
  let charsCount = 0;

  for await (const chunk of readableStream) {
    buffer += chunk;

    const lines = buffer.split(LINE_SEPARATOR);
    // Count all symbols in line and single line separator as 1 char
    charsCount += getSum(lines.map((line) => line.length)) + (lines.length - 1);
    buffer = lines.pop();

    linesCount += lines.length;

    wordsCount += getSum(lines.map(line => getWordsFromString(line).length));
  }

  // Add last line, even it's empty
  linesCount++;

  if (buffer.length) {
    wordsCount += getWordsFromString(buffer).length;
  }

  console.log(`Lines: ${linesCount}`);
  console.log(`Words: ${wordsCount}`);
  console.log(`Characters: ${charsCount}`);
}