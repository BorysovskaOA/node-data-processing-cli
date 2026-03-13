import { InvalidInputError } from './errors.js';

export const argParser = (args, argName, required = false) => {
  const argIndex = args.findIndex(arg => arg.startsWith(`--${argName}`));
  
  if (argIndex === -1) {
    if (required) {
      throw new InvalidInputError('Argument is required');
    } else {
      return;
    }
  }

  const arg = args[argIndex];
  let argValue;

  if (arg.includes('=')) {
    argValue = arg.split('=')[1];
  } else {
    const nextArgvValue = args[argIndex + 1];

    if (nextArgvValue && !nextArgvValue.startsWith('--')) {
      argValue = nextArgvValue;
    }
  }

  if (!argValue && required) {
    throw new InvalidInputError('Argument is required');
  }

  return argValue;
}