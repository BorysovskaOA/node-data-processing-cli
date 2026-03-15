import { countHandler } from './commands/count.js';
import { hashHandler } from './commands/hash.js';
import { hashCompareHandler } from './commands/hashCompare.js';
import { csvToJsonHandler } from './commands/csvToJson.js';
import { jsonToCsvHandler } from './commands/jsonToCsv.js';
import { upHandler, cdHandler, lsHandler } from './navigation.js';
import { logStatsHandler } from './commands/logStats.js';
import { encryptHandler } from './commands/encrypt.js';
import { decryptHandler } from './commands/decrypt.js';


export const COMMAND_HANDLERS_MAP = {
  up: upHandler,
  cd: cdHandler,
  ls: lsHandler,
  'csv-to-json': csvToJsonHandler,
  'json-to-csv': jsonToCsvHandler,
  count: countHandler,
  hash: hashHandler,
  'hash-compare': hashCompareHandler,
  'log-stats': logStatsHandler,
  encrypt: encryptHandler,
  decrypt: decryptHandler,
}
