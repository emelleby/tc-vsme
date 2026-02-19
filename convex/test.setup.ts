/// <reference types="vite/client" />

// Manually import all convex modules for testing
// This is needed because import.meta.glob is not available in Bun test runner
import * as organizations from './organizations'
import * as users from './users'
import * as todos from './todos'
import * as schema from './schema'
import * as auth from './_utils/auth'
import * as emissions from './emissions'
import * as targets from './targets'
import * as formsSave from './forms/save'
import * as formsGet from './forms/get'
import * as formsSubmit from './forms/submit'
import * as formsReopen from './forms/reopen'
import * as formsUtils from './forms/_utils'

export const modules = {
  './organizations.ts': () => Promise.resolve(organizations),
  './users.ts': () => Promise.resolve(users),
  './todos.ts': () => Promise.resolve(todos),
  './schema.ts': () => Promise.resolve(schema),
  './_utils/auth.ts': () => Promise.resolve(auth),
  './emissions.ts': () => Promise.resolve(emissions),
  './targets.ts': () => Promise.resolve(targets),
  './forms/save.ts': () => Promise.resolve(formsSave),
  './forms/get.ts': () => Promise.resolve(formsGet),
  './forms/submit.ts': () => Promise.resolve(formsSubmit),
  './forms/reopen.ts': () => Promise.resolve(formsReopen),
  './forms/_utils.ts': () => Promise.resolve(formsUtils),
  './_generated/api.d.ts': () => Promise.resolve({}),
  './_generated/api.js': () => Promise.resolve({}),
  './_generated/dataModel.d.ts': () => Promise.resolve({}),
  './_generated/server.d.ts': () => Promise.resolve({}),
  './_generated/server.js': () => Promise.resolve({}),
}

