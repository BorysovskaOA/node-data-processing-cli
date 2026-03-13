import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
import { InvalidInputError } from './utils/errors.js';

export const upHandler = () => {
  if (process.cwd() !== os.homedir()) {
    const newDirectory = process.cwd()
    .split(path.sep)
    .slice(0, -1)
    .join(path.sep);

    process.chdir(newDirectory);
  }
}

export const cdHandler = async (args) => {
  const pathToDirectory = args[0];
  if (!pathToDirectory) {
    throw new InvalidInputError('No path/to/directory');
  }
  const newDirPath = path.resolve(process.cwd(), pathToDirectory);

  const stats = await fs.stat(newDirPath);
  
  if (stats.isDirectory()) {
    process.chdir(newDirPath);
  } else {
    throw new InvalidInputError('Path is not a directory');
  }
}

export const lsHandler = async () => {
  const dirEntities = await fs.readdir(process.cwd(), { withFileTypes: true });

  const folders = [];
  const files = [];

  let maxEntitName = 0;

  dirEntities.forEach((dirEnt) => {
    maxEntitName = Math.max(maxEntitName, dirEnt.name.length);

    if (dirEnt.isDirectory()) {
      folders.push(dirEnt.name);
    } else if (dirEnt.isFile()) {
      files.push(dirEnt.name);
    }
  });

  const formatEntityName = (entitiName) => `${entitiName}${' '.repeat(maxEntitName - entitiName.length)}`

  folders.sort((a, b) => a.localeCompare(b)).forEach((ent) => {
    console.log(`${formatEntityName(ent)}    [folder]`)
  });
  files.sort((a, b) => a.localeCompare(b)).forEach((ent) => {
    console.log(`${formatEntityName(ent)}    [file]`)
  });
}
