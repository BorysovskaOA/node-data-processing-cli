import os from 'node:os';

let currentDirectory  = os.homedir();

export const onChangeCurrentDirectory = (newDirectory) => {
  currentDirectory = newDirectory;
}

export const getCurrentDirectory = () => {
  return currentDirectory;
}

export const upHandler = () => {
  console.log('upHandler');

}

export const cdHandler = () => {
  console.log('cdHandler');
}

export const lsHandler = () => {
  console.log('lsHandler');
}