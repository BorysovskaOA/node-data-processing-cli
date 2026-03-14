import { parseArgs } from 'node:util';
import { pathResolver } from './pathResolver.js';
import { InvalidInputError } from './errors.js';


const formatArgValue = (type, value) => {
  switch (type) {
    case 'path': {
      return pathResolver(value);
    }
    default:
      return value;
  }
}

export const argParser = (args, options) => {
  const argOptions = Object.keys(options)
    .reduce((acc, key) => {
      return {
        ...acc,
        [key]: {
          type: options[key].type === 'boolean' ? 'boolean' : 'string',
          default: options[key].default
        }
      }
    }, {});

  let parsedArgs;

  try {
    parsedArgs = parseArgs({ args, options: argOptions }).values;
  } catch (err) {
    throw new InvalidInputError(err);
  }

  const parsedArgsKeys = Object.keys(parsedArgs);

  if (parsedArgsKeys.some((key) => (options[key].required && parsedArgs[key] === undefined))) {
    throw new InvalidInputError('Invalid input');
  }

  return parsedArgsKeys.reduce((acc, key) => {
    return {
      ...acc,
      [key]: formatArgValue(options[key].type, parsedArgs[key])
    }
  }, {})
}
