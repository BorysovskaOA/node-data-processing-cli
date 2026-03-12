

import readline from 'node:readline';
import { InvalidInputError, INVALID_INPUT_ERROR_CODE } from './utils/errors.js';
import { getCurrentDirectory } from './navigation.js';
import { COMMAND_HANDLERS_MAP } from './commands.js';

const WELCOME_TEXT = 'Welcome to Data Processing CLI!';
const EXIT_TEXT = 'Thank you for using Data Processing CLI!';
const INVALID_COMMAND_TEXT = 'Invalid input';
const OPERATION_FAILED_TEXT = 'Operation failed';
const CURRENT_DIRECTORY_PREFIX = 'You are currently in';

export const initRepl = () => {
  const onSuccess = () => {
    console.log(`${CURRENT_DIRECTORY_PREFIX} ${getCurrentDirectory()}`);
  }

  const onError = (err) => {
    if (err.code === INVALID_INPUT_ERROR_CODE) {
      console.log(INVALID_COMMAND_TEXT);
    } else {
      console.log(OPERATION_FAILED_TEXT);
    }
  }
  
  const handleCommand = async(command, commandArgs) => {
    if (command in COMMAND_HANDLERS_MAP) {
      try {
        await COMMAND_HANDLERS_MAP[command](commandArgs);
        onSuccess()
      } catch (err) {
        onError(err)
      }
  
    } else {
      onError(new InvalidInputError());
    }
  }

  const rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout,
    prompt: '> '
  });

  rl.on('line', async (line) => {
    const lineTrimmed = line.trim().toLowerCase();
    const [command, ...commandArgs] = lineTrimmed.split(' ');

    if (command === '.exit' && commandArgs.length === 0) {
      rl.close()
    } else {
      await handleCommand(command, commandArgs);
      rl.prompt();
    }
  });

  rl.on('SIGINT', () => {
    rl.close()
  });

  rl.on('close', () => {
    console.log(EXIT_TEXT)
    process.exit(0);
  });

  console.log(WELCOME_TEXT);
  // Initial display of directory
  onSuccess();
  rl.prompt();
}
