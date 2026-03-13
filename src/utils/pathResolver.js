import path from 'node:path';
import { getCwd } from '../cwdState.js';

export const pathResolver = (pathArg) => {
  return path.resolve(getCwd(), pathArg);
}