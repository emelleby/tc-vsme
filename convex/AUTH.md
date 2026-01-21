# Convex Authentication Guide

This document describes the authentication implementation for Convex with Clerk, including best practices and common pitfalls.

## Overview

This project uses **Clerk** for authentication and **Convex** as the backend database. Clerk JWT tokens are passed to Convex to authenticate users and authorize access to data.

## Architecture

```
Frontend (React) → Clerk Auth → JWT Token → Convex Backend → Database
```

1. User signs in via Clerk
2. Clerk issues a JWT token with user/org claims
3. `ConvexProviderWithClerk` sends the token with each Convex request
4. Convex verifies the token and provides `ctx.auth.getUserIdentity()`
5. Auth utility functions extract user/org info from the identity

## Auth Utility Functions

Located in `convex/_utils/auth.ts`:

| Function | Returns | Description |
|----------|---------|-------------|
| `requireUserId(ctx)` | `Promise<string>` | User ID from JWT `sub` claim. Throws if not authenticated. |
| `getOrgId(ctx)` | `Promise<string \| null>` | Organization ID from JWT. Returns null if no org selected. |
| `requireOrgId(ctx)` | `Promise<string>` | Organization ID. Throws if no org selected. |
| `getAuthIdentity(ctx)` | `Promise<object \| null>` | Full identity object with all JWT claims. |
| `getUserEmail(ctx)` | `Promise<string \| null>` | User email from JWT. |
| `getUserName(ctx)` | `Promise<string \| null>` | User name from JWT. |
| `getOrgRole(ctx)` | `Promise<string \| null>` | Organization role from JWT. |

## ⚠️ Critical: All Auth Functions Are Async

**The most important thing to remember:** All auth utility functions are `async` and must be `await`ed.

### ✅ Correct Usage

```typescript
import { requireUserId, getOrgId } from './_utils/auth'

export const myQuery = query({
  handler: async (ctx) => {
    // CORRECT: await the async function
    const userId = await requireUserId(ctx)
    const orgId = await getOrgId(ctx)

    // Now use userId and orgId...
  },
})
```

### ❌ Incorrect Usage (Common Mistake)

```typescript
export const myQuery = query({
  handler: async (ctx) => {
    // WRONG: Missing await!
    const userId = requireUserId(ctx)  // Returns Promise, not string!

    // This will fail - userId is a Promise object, not the actual ID
    return await ctx.db.query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', userId))
      .unique()
  },
})
```

## Why Async/Await Matters

The underlying Convex method `ctx.auth.getUserIdentity()` returns a **Promise**, not a direct value:

```typescript
// Inside auth.ts
export async function requireUserId(ctx: any): Promise<string> {
  // getUserIdentity() returns a Promise!
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw new Error("Unauthorized: User must be authenticated")
  }

  return identity.subject
}
```

If you forget `await`:
- You get a Promise object instead of the identity
- Checking `identity.subject` on a Promise returns `undefined`
- Your code throws "User must be authenticated" even when the user IS authenticated

## JWT Token Structure

The Clerk JWT token (using the `convex` template) contains:

```json
{
  "sub": "user_xxxxx",           // User ID
  "aud": "convex-tc-vsme",       // Audience (must match Convex config)
  "email": "user@example.com",
  "name": "John Doe",
  "org_id": "org_xxxxx",         // Organization ID (if selected)
  "org_role": "admin",           // Organization role (if in org)
  "o": {                         // New Clerk layout (also supported)
    "id": "org_xxxxx",
    "rol": "admin"
  }
}
```

The auth utilities support both the old layout (`org_id`, `org_role`) and new layout (`o.id`, `o.rol`).

## Configuration Files

### `convex/auth.config.ts`

```typescript
import type { AuthConfig } from 'convex/server'

export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL,
      applicationID: process.env.CONVEX_JWT_AUDIENCE,
    },
  ],
} satisfies AuthConfig
```



## Lessons Learned

### The Async/Await Bug (January 2026)

**Symptom:** Users were getting "Unauthorized: User must be authenticated" errors even when logged in.

**Initial Investigation (Wrong Direction):**
- Suspected JWT token layout changes (Clerk moved org claims to nested `o` object)
- Created multiple debug utilities to inspect JWT tokens
- JWT tokens were actually correct - contained all expected claims

**Root Cause:**
The auth utility functions were calling `ctx.auth.getUserIdentity()` **without `await`**:

```typescript
// BROKEN CODE
export function requireUserId(ctx: any): string {
  const identity = ctx.auth.getUserIdentity()  // Returns Promise!
  // identity is a Promise object, not the actual identity
  // identity.subject is undefined (Promises don't have this property)
  if (!identity.subject) {
    throw new Error("Unauthorized")  // Always throws!
  }
}
```

**The Fix:**
Added `async`/`await` to all auth functions:

```typescript
// FIXED CODE
export async function requireUserId(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()  // Now correctly awaited
  // identity is the actual identity object with subject, email, etc.
}
```

**Key Takeaway:** In Convex, `ctx.auth.getUserIdentity()` is async and returns a Promise. Always await it!

## Troubleshooting

### Error: "Unauthorized: User must be authenticated"

1. **Check await:** Make sure you're `await`ing auth functions
2. **Check login status:** Verify user is actually signed in with Clerk
3. **Check Convex logs:** Look for JWT verification errors
4. **Check JWT template:** Ensure `convex` template exists in Clerk Dashboard

### Error: "Unauthorized: Organization must be selected"

1. **Check org selection:** User must select an organization via `OrganizationSwitcher`
2. **Check JWT claims:** Verify `org_id` or `o.id` is in the token

### Debugging JWT Contents

Add temporary logging to see what's in the identity:

```typescript
export async function requireUserId(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  console.log('[Auth Debug] Identity:', JSON.stringify(identity, null, 2))
  // ... rest of function
}
```

## Related Files

- `convex/_utils/auth.ts` - Auth utility functions
- `convex/auth.config.ts` - Convex auth configuration
- `src/integrations/convex/provider.tsx` - ConvexProviderWithClerk setup
- `.env.local` - Environment variables

## References

- [Convex Auth Documentation](https://docs.convex.dev/auth)
- [Clerk JWT Templates](https://clerk.com/docs/backend-resources/jwt-templates)
- [Convex + Clerk Integration](https://docs.convex.dev/auth/clerk)
