# Story 3 → Story 5 Handover Document

## Story 3 Deliverables ✅

**What was built:**
- `/create-organization` route with full permission-based protection
- Clerk `OrganizationSwitcher` component integration
- Route guards ensuring only users with `hasVsme` can access
- Automatic redirect to `/app` after org creation/selection
- 5 comprehensive tests (all passing)

**Current behavior:**
1. User creates/selects org via Clerk UI
2. Clerk updates session with `orgId`
3. User redirected to `/app` (via `afterCreateOrganizationUrl`)
4. `_appLayout` route checks permissions and redirects back to `/create-organization` (because `vsmeDb` is still false)

**The gap:** No Convex records are created, so users get stuck in a redirect loop.

---

## Story 5 Integration Contract

### What Story 5 Must Implement

**1. Convex Schema** (`convex/schema.ts`)
```typescript
organizations: defineTable({
  clerkOrgId: v.string(),
  name: v.string(),
  // ... other fields
}).index('by_clerk_org_id', ['clerkOrgId'])

users: defineTable({
  clerkId: v.string(),
  email: v.string(),
  organizationIds: v.array(v.string()),
  // ... other fields
}).index('by_clerk_id', ['clerkId'])
```

**2. Convex Mutations** (`convex/organizations.ts`, `convex/users.ts`)
- `createOrganization({ clerkOrgId, name })` - Creates org record
- `upsertUser({ clerkId, email, organizationIds })` - Creates/updates user record

**3. Clerk Metadata Update**
After successful Convex record creation:
```typescript
await clerkClient.organizations.updateOrganizationMetadata(orgId, {
  publicMetadata: { hasVsme: true, vsmeDb: true }
})
```

**4. Integration Point in `/create-organization`**

Replace the TODO comment (line 113) with:
```typescript
// Listen for org creation/selection
useEffect(() => {
  if (authContext.orgId && !authContext.vsmeDb) {
    // Call Convex mutation to create org/user records
    // Update Clerk metadata with vsmeDb: true
    // Redirect to /app
  }
}, [authContext.orgId])
```

---

## Key Design Decisions

1. **Route location:** `/create-organization` is at root level (not under `_appLayout`) because users access it before having full permissions
2. **Redirect URLs:** Clerk's `afterCreateOrganizationUrl="/app"` sends users to dashboard, where `_appLayout` performs final permission check
3. **Permission flag:** `vsmeDb` is the critical flag - it's set to `true` only after Convex records exist

---

## Testing Requirements for Story 5

Add tests for:
- Convex mutation success → metadata updated → redirect to `/app` works
- Duplicate org creation handling
- User record upsert (new user vs existing user)
- Error handling (Convex failure, Clerk API failure)

---

## Files to Modify in Story 5

- `convex/schema.ts` - Add tables
- `convex/organizations.ts` - Create mutations
- `convex/users.ts` - Create mutations
- `src/routes/create-organization.tsx` - Add mutation calls (line 113)
- Tests for Convex functions

**Do NOT modify:**
- Route protection logic (already complete)
- Auth context utilities (already complete)
- `_appLayout` route (already complete)

---

## Success Criteria

Story 5 is complete when:
1. User creates org → Convex records created → `vsmeDb: true` → redirect to `/app` succeeds
2. User can access dashboard without redirect loops
3. All tests pass (existing + new Convex tests)

