import { upHandler, cdHandler, lsHandler } from './navigation.js'

export const COMMAND_HANDLERS_MAP = {
  up: upHandler,
  cd: cdHandler,
  ls: lsHandler
}
