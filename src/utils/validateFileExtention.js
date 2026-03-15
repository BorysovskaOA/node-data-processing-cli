import { extname } from 'node:path';
import { InvalidInputError } from './errors.js';


export const validateFileExtention = (fileName, ext) => {
  const allowedExt = Array.isArray(ext) ? ext.map((e) => e.toLowerCase()) : [ext.toLowerCase()];
  const fileExt = extname(fileName).toLowerCase();
  if (!allowedExt.includes(fileExt)) {
    throw new InvalidInputError('Invalid file extention');
  }
}
