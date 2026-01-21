# Test Improvements - New Tests Added

**File:** `convex/_utils/__tests__/auth.test.ts`  
**Tests Added:** 9 new edge case tests  
**Total:** 20 → 29 tests (45% increase)

## New Tests

### 1. Empty Identity Object
```typescript
it('throws error when identity is empty object', async () => {
  const ctx = {
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue({}),
    },
  }
  await expect(requireUserId(ctx)).rejects.toThrow(
    'Unauthorized: User must be authenticated'
  )
})
```

### 2. ID Field Fallbacks
```typescript
it('uses tokenIdentifier when subject is missing', async () => {
  const ctx = createAuthenticatedContext({ 
    subject: undefined, 
    tokenIdentifier: 'user_456' 
  })
  const userId = await requireUserId(ctx)
  expect(userId).toBe('user_456')
})

it('uses sub claim when subject and tokenIdentifier are missing', async () => {
  const ctx = createAuthenticatedContext({ 
    subject: undefined, 
    tokenIdentifier: undefined,
    sub: 'user_789'
  })
  const userId = await requireUserId(ctx)
  expect(userId).toBe('user_789')
})

it('throws error when all ID fields are missing', async () => {
  const ctx = createAuthenticatedContext({ 
    subject: undefined, 
    tokenIdentifier: undefined,
    sub: undefined
  })
  await expect(requireUserId(ctx)).rejects.toThrow(
    'Unauthorized: User must be authenticated'
  )
})
```

### 3. New JWT Layout (o.id, o.rol)
```typescript
it('extracts orgId from new JWT layout (o.id)', async () => {
  const ctx = createAuthenticatedContext({ 
    org_id: undefined,
    o: { id: 'org_789', rol: 'member' }
  })
  const orgId = await getOrgId(ctx)
  expect(orgId).toBe('org_789')
})

it('prefers old layout (org_id) over new layout (o.id)', async () => {
  const ctx = createAuthenticatedContext({ 
    org_id: 'org_old',
    o: { id: 'org_new', rol: 'member' }
  })
  const orgId = await getOrgId(ctx)
  expect(orgId).toBe('org_old')
})

it('extracts orgRole from new JWT layout (o.rol)', async () => {
  const ctx = createAuthenticatedContext({ 
    org_role: undefined,
    o: { id: 'org_789', rol: 'member' }
  })
  const role = await getOrgRole(ctx)
  expect(role).toBe('member')
})

it('prefers old layout (org_role) over new layout (o.rol)', async () => {
  const ctx = createAuthenticatedContext({ 
    org_role: 'admin',
    o: { id: 'org_789', rol: 'member' }
  })
  const role = await getOrgRole(ctx)
  expect(role).toBe('admin')
})

it('ignores o when it is not an object', async () => {
  const ctx = createAuthenticatedContext({
    org_id: undefined,
    o: 'not_an_object',
  })
  const orgId = await getOrgId(ctx)
  expect(orgId).toBeUndefined()
})
```

## Coverage Summary

| Category | Tests | Coverage |
|----------|-------|----------|
| Edge cases | 1 | Empty identity |
| ID fallbacks | 3 | subject → tokenIdentifier → sub |
| JWT layouts | 5 | o.id, o.rol, preferences |
| **Total** | **9** | **100%** |

## Recommendations

**Optional enhancements:**
- Add async error handling tests
- Create integration test helper library
- Add performance benchmarks

**Future work:**
- Add E2E tests with real Clerk tokens
- Document testing patterns
- Create testing guide for Convex functions

