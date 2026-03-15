

import readline from 'node:readline';
import process from 'node:process';
import { getCwd } from './cwdState.js';
import { InvalidInputError } from './utils/errors.js';
import { COMMAND_HANDLERS_MAP } from './commands.js';
import { ANSI_COLORS, ANSI_COLOR_RESET, INVALID_INPUT_ERROR_CODE, SPACE_SEPARATOR } from './constants.js';


const WELCOME_TEXT = 'Welcome to Data Processing CLI!';
const EXIT_TEXT = 'Thank you for using Data Processing CLI!';
const INVALID_COMMAND_TEXT = 'Invalid input';
const OPERATION_FAILED_TEXT = 'Operation failed';
const CURRENT_DIRECTORY_PREFIX = 'You are currently in';

const onSuccess = () => {
  console.log(`${ANSI_COLORS.green}${CURRENT_DIRECTORY_PREFIX} ${getCwd()}${ANSI_COLOR_RESET}`);
}

const onError = (err) => {
  if (err.code === INVALID_INPUT_ERROR_CODE) {
    console.log(`${ANSI_COLORS.red}${INVALID_COMMAND_TEXT}${ANSI_COLOR_RESET}`);
  } else {
    console.log(`${ANSI_COLORS.red}${OPERATION_FAILED_TEXT}${ANSI_COLOR_RESET}`);
  }
}

const handleCommand = async (command, commandArgs) => {
  if (command in COMMAND_HANDLERS_MAP) {
    try {
      await COMMAND_HANDLERS_MAP[command](commandArgs);
      onSuccess()
    } catch (err) {
      onError(err)
    }

  } else {
    onError(new InvalidInputError('Invalid command'));
  }
}

export const initRepl = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  rl.on('line', async (line) => {
    const lineTrimmed = line.trim();
    const [command, ...commandArgs] = lineTrimmed.split(SPACE_SEPARATOR);

    if (command === '.exit') {
      rl.close()
    } else {
      await handleCommand(command, commandArgs);
      rl.prompt();
    }
  });

  rl.on('SIGINT', () => {
    rl.close();
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
