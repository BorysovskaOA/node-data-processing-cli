import os from 'node:os';
import { InvalidInputError } from './utils/errors.js';

export const initialCwd = os.homedir();
let cwd = initialCwd;

export const getCwd = () => {
  return cwd;
}

// dir - absolute path
export const chCwd = (dir) => {
  if (!dir.startsWith(initialCwd)) {
    throw new InvalidInputError('Cannot go higher than initial directory');
  }
  cwd = dir;
}