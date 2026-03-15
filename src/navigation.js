import fs from 'node:fs/promises';
import { getCwd, chCwd, initialCwd } from './cwdState.js';
import { InvalidInputError } from './utils/errors.js';
import { pathResolver } from './utils/pathResolver.js';


export const upHandler = () => {
  if (getCwd() !== initialCwd) {
    const newDirectory = pathResolver(`${getCwd()}/..`);
    chCwd(newDirectory);
  }
}

export const cdHandler = async (args) => {
  const pathToDirectory = args[0];
  if (!pathToDirectory) {
    throw new InvalidInputError('No path/to/directory');
  }
  const newDirPath = pathResolver(pathToDirectory);

  const stats = await fs.stat(newDirPath);

  if (stats.isDirectory()) {
    chCwd(newDirPath)
  } else {
    throw new InvalidInputError('Path is not a directory');
  }
}

export const lsHandler = async () => {
  const dirEntities = await fs.readdir(getCwd(), { withFileTypes: true });

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
