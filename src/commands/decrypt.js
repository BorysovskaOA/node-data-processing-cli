import { createDecipheriv, scrypt } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { open, stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { promisify } from 'node:util';
import { SALT_SIZE, IV_SIZE, AUTH_TAG_SIZE, KEY_SIZE, ENCRYPTION_ALGORITHM } from '../constants.js';
import { argParser } from '../utils/argParser.js';


const getDecryptEntities = async (inputFilePath, size) => {
  const handle = await open(inputFilePath, 'r');

  const salt = Buffer.alloc(SALT_SIZE);
  const iv = Buffer.alloc(IV_SIZE);
  const authTag = Buffer.alloc(AUTH_TAG_SIZE);

  try {
    await handle.read(salt, 0, SALT_SIZE, 0);
    await handle.read(iv, 0, IV_SIZE, SALT_SIZE);
    await handle.read(authTag, 0, AUTH_TAG_SIZE, size - AUTH_TAG_SIZE);
  } finally {
    if (handle) await handle.close();
  }

  return {
    salt,
    iv,
    authTag,
  }
}

export const decryptHandler = async (args) => {
  const parsedArgs = argParser(args, {
    input: { type: 'path', required: true },
    output: { type: 'path', required: true },
    password: { type: 'string', required: true },
  });

  const { size } = await stat(parsedArgs.input);
  const { salt, iv, authTag } = await getDecryptEntities(parsedArgs.input, size);

  const key = await promisify(scrypt)(parsedArgs.password, salt, KEY_SIZE);
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const input = createReadStream(parsedArgs.input, {
    start: SALT_SIZE + IV_SIZE,
    end: size - AUTH_TAG_SIZE - 1
  });
  const output = createWriteStream(parsedArgs.output);

  await pipeline(input, decipher, output);
};