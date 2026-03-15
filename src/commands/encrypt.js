import { createCipheriv, scrypt, randomBytes } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline, finished } from 'node:stream/promises';
import { promisify } from 'node:util';
import { ENCRYPTION_ALGORITHM, IV_SIZE, KEY_SIZE, SALT_SIZE } from '../constants.js';
import { argParser } from '../utils/argParser.js'

export const encryptHandler = async (args) => {
  const parsedArgs = argParser(args, {
    input: { type: 'path', required: true },
    output: { type: 'path', required: true },
    password: { type: 'string', required: true },
  });

  const salt = randomBytes(SALT_SIZE);
  const iv = randomBytes(IV_SIZE);
  const key = await promisify(scrypt)(parsedArgs.password, salt, KEY_SIZE);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  const output = createWriteStream(parsedArgs.output);

  output.write(salt);
  output.write(iv);

  await pipeline(createReadStream(parsedArgs.input), cipher, output, { end: false });

  const authTag = cipher.getAuthTag();
  output.write(authTag);
  output.end();

  await finished(output);
}