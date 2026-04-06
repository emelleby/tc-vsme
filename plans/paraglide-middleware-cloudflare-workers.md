# Paraglide Middleware Bypassed on Cloudflare Workers

## What this is

The app uses [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) for i18n with a `url` strategy — meaning the user's language is determined by the URL (e.g. `/no/dashboard` for Norwegian, `/en/dashboard` for English).

For this to work on the **server**, every incoming request needs to pass through `paraglideMiddleware` before being handled. This is set up in `src/server.ts`:

```ts
// src/server.ts
import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server.js'

export default {
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, () => handler.fetch(req))
  },
}
```

## The problem

`wrangler.jsonc` currently points `main` at TanStack Start's generic entry:

```jsonc
{
  "main": "@tanstack/react-start/server-entry"  // ← bypasses src/server.ts
}
```

Wrangler deploys this generic entry directly. `src/server.ts` is never called. The Paraglide middleware never runs.

## What the user will see in production

- The app always renders in the **default/fallback language**, regardless of the URL
- Navigating to `/no/dashboard` shows English content instead of Norwegian
- Language switcher appears to work (URL changes) but the page language doesn't change on reload
- SSR-rendered HTML has the wrong language, causing a hydration flicker when the client corrects it
- `Accept-Language`-based redirects (if configured) won't fire

## How to fix

Change `wrangler.jsonc` to point at the custom server entry instead:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tc-vsme",
  "compatibility_date": "2025-09-02",
  "compatibility_flags": ["nodejs_compat"],
  "main": "./src/server.ts"   // ← use the custom entry that wraps with Paraglide
}
```

`@cloudflare/vite-plugin` will compile `src/server.ts` through Vite as the worker entry point, so the import of `@tanstack/react-start/server-entry` inside it is resolved correctly during the build.

## Verify it works

After changing `main` and deploying, check:

1. Load `https://<worker-domain>/no/some-route` — page should render in Norwegian
2. Load `https://<worker-domain>/en/some-route` — page should render in English
3. View page source — the `<html lang="...">` attribute and text content should match the URL language (not the fallback)

## Status

- [ ] Change `wrangler.jsonc` `main` to `./src/server.ts`
- [ ] Deploy and verify language rendering in production
