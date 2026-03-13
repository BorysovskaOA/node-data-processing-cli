import { countHandler } from './commands/count.js'
import { csvToJsonHandler } from './commands/csvToJson.js'
import { jsonToCsvHandler } from './commands/jsonToCsv.js'
import { upHandler, cdHandler, lsHandler } from './navigation.js'

export const COMMAND_HANDLERS_MAP = {
  up: upHandler,
  cd: cdHandler,
  ls: lsHandler,
  'csv-to-json': csvToJsonHandler,
  'json-to-csv': jsonToCsvHandler,
  count: countHandler,
}
