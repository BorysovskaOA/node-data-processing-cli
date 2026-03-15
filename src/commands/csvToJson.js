import { Transform } from 'node:stream';
import { fileConfersionHandler } from '../utils/fileConversionHandler.js';
import { LINE_SEPARATOR } from '../constants.js';


const EXTRA_HEADER_NAME = 'Extra';
const INDENT = 2;

const getCsvToJsonTransformSteam = () => {
  let transformBuffer = '';
  let headers = [];
  let isFirstDataRow = true;

  const getDataPrefix = () => {
    let prefix = `,\n${' '.repeat(INDENT)}`;
    if (isFirstDataRow) {
      prefix = ' '.repeat(INDENT);
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
    return JSON.stringify(obj);
  }

  return new Transform({
    transform(chunk, _, callback) {
      transformBuffer += chunk;

      const lines = transformBuffer.split(LINE_SEPARATOR);
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
        this.push('\n]');
        return callback();
      }

      const parsedLineData = transformBuffer.split(',');
      this.push(`${getDataPrefix()}${transformDataToJsonString(parsedLineData)}\n]\n`);

      transformBuffer = '';
      callback();
    }
  });
}

export const csvToJsonHandler = async (args) => {
  const transformStream = getCsvToJsonTransformSteam();
  return fileConfersionHandler(args, '.csv', '.json', transformStream);
}
