import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

export const upHandler = () => {
  if (process.cwd() !== os.homedir()) {
    const newDirectory = process.cwd()
    .split(path.sep)
    .slice(0, -1)
    .join(path.sep);
    
    process.chdir(newDirectory);
  }
}

export const cdHandler = () => {
  console.log('cdHandler');
}

export const lsHandler = () => {
  console.log('lsHandler');
}