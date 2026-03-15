import { INVALID_INPUT_ERROR_CODE } from '../constants.js';


export class InvalidInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidInputError';
    this.code = INVALID_INPUT_ERROR_CODE;

    Error.captureStackTrace(this, this.constructor);
  }
}
