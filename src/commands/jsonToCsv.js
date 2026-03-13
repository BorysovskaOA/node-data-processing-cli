import { Transform } from 'node:stream';
import { fileConfersionHandler } from '../utils/fileConversionHandler.js';

const getJsonToCsvTransformSteam = () => {
  let jsonStringBuffer = '';

  return new Transform({
    transform(chunk, _, callback) {
      jsonStringBuffer += chunk;
      callback();
    },
    flush(callback) {
      const jsonData = JSON.parse(jsonStringBuffer);
      jsonStringBuffer = '';
      if (!Array.isArray(jsonData)) {
        throw new Error('Invalid json type');
      }

      const headerSet = new Set();
      jsonData.map((row) => Object.keys(row).forEach(h => headerSet.add(h)));
      const headers = Array.from(headerSet);

      this.push(`${headers.join(',')}\n`)

      jsonData.forEach(row => {
        const valuesInHeadersOrder = headers.map((header) => row[header] || '');
        this.push(`${valuesInHeadersOrder.join(',')}\n`);
      })

      callback();
    }
  });
}

export const jsonToCsvHandler = async (args) => {
  const transformStream = getJsonToCsvTransformSteam();
  return fileConfersionHandler(args, '.json', transformStream);
}
