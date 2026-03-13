import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { argParser } from '../utils/argParser.js';
import { pathResolver } from '../utils/pathResolver.js';

const EXTRA_HEADER_NAME = 'Extra';
const INDENT = 2;

export const csvToJsonHandler = async (args) => {
  const inputArg = argParser(args, 'input', true);
  const outputArg = argParser(args, 'output', true);

  const inputPath = pathResolver(inputArg);
  const outputPath = pathResolver(outputArg);

  const inputStream = createReadStream(inputPath, { encoding: 'utf-8' });
  const outputStream = createWriteStream(outputPath, { encoding: 'utf-8' });

  let transformBuffer = '';
  let headers = [];
  let isFirstDataRow = true;

  const getDataPrefix = () => {
    let prefix = ',\n';
    if (isFirstDataRow) {
      prefix = '';
      isFirstDataRow = false;
    }
    return prefix;
  }

  const transformDataToJsonString = (data) => {
    const obj = {};
    let unknownHeaderCounter = 1;
    data.forEach((d, i) => {
      let header;
      if (headers[i]) {
        header = headers[i];
      } else {
        header = `${EXTRA_HEADER_NAME}${unknownHeaderCounter}`;
        unknownHeaderCounter++;
      }
      obj[header] = d;
    });
    return JSON.stringify(obj, null, INDENT).replace(/^/gm, ' '.repeat(INDENT));
  }
  
  const transformStream = new Transform({
    transform(chunk, _, callback) {
      transformBuffer += chunk;

      const lines = transformBuffer.split(/\r?\n/);
      transformBuffer = lines.pop();
      
      lines.forEach((line) => {
        if (!line.trim()) {
          return;
        }
        
        const parsedLineData = line.split(',');
    
        if (!headers.length) {
          headers = parsedLineData.map(h => h.trim());
          this.push('[\n');
        } else {
          this.push(`${getDataPrefix()}${transformDataToJsonString(parsedLineData)}`);
        }
      });

      callback();
    },
    flush(callback) {
      if (!transformBuffer.trim()) {
        return '\n]';
      }
      
      const parsedLineData = transformBuffer.split(',');
      this.push(`${getDataPrefix()}${transformDataToJsonString(parsedLineData)}\n]`);

      transformBuffer = '';
      callback();
    }
  })
  inputStream.on('error', (err) => { throw err });
  transformStream.on('error', (err) => { throw err });
  outputStream.on('error', (err) => { throw err });

  await pipeline(inputStream, transformStream, outputStream);
}