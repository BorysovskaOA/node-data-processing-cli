import process from 'node:process';
import os from 'node:os';
import { initRepl } from './repl.js';

const init = () => {
  process.chdir(os.homedir());
  
  initRepl();
}

init();
