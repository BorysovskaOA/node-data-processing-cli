
export const SPACE_SEPARATOR = /\s+/;
export const LINE_SEPARATOR = /\r?\n/;
export const WORD_SEPARATOR = /\s+/;

export const SUPPORTED_ALGORYTHMS = ['sha256', 'md5', 'sha512'];

export const INVALID_INPUT_ERROR_CODE = 'INVALID_INPUT';

export const ANSI_COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
};

export const ANSI_COLOR_RESET = '\x1b[0m';

export const ENCRYPTION_ALGORITHM = 'AES-256-GCM';
export const SALT_SIZE = 16;
export const IV_SIZE = 12;
export const AUTH_TAG_SIZE = 16;
export const KEY_SIZE = 32;