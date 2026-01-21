/// <reference types="vite/client" />

// Manually import all convex modules for testing
// This is needed because import.meta.glob is not available in Bun test runner
import * as organizations from './organizations'
import * as users from './users'
import * as todos from './todos'
import * as schema from './schema'
import * as auth from './_utils/auth'
import * as emissions from './emissions'

export const modules = {
  './organizations.ts': () => Promise.resolve(organizations),
  './users.ts': () => Promise.resolve(users),
  './todos.ts': () => Promise.resolve(todos),
  './schema.ts': () => Promise.resolve(schema),
  './_utils/auth.ts': () => Promise.resolve(auth),
  './emissions.ts': () => Promise.resolve(emissions),
  './_generated/api.d.ts': () => Promise.resolve({}),
  './_generated/api.js': () => Promise.resolve({}),
  './_generated/dataModel.d.ts': () => Promise.resolve({}),
  './_generated/server.d.ts': () => Promise.resolve({}),
  './_generated/server.js': () => Promise.resolve({}),
}

