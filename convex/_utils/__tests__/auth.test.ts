/**
 * Unit tests for Convex authentication utility functions.
 *
 * These tests verify that auth utilities correctly extract user and organization
 * information from authenticated context and handle unauthorized access.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  requireUserId,
  getOrgId,
  requireOrgId,
  getAuthIdentity,
  getUserEmail,
  getUserName,
  getOrgRole,
} from '../auth'

// Mock Convex context with authenticated user
const createAuthenticatedContext = (overrides = {}) => ({
  auth: {
    getUserIdentity: vi.fn().mockResolvedValue({
      subject: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      org_id: 'org_456',
      org_role: 'admin',
      ...overrides,
    }),
  },
})

// Mock Convex context without authentication
const createUnauthenticatedContext = () => ({
  auth: {
    getUserIdentity: vi.fn().mockResolvedValue(null),
  },
})

// Mock Convex context with authenticated user but no organization
const createAuthenticatedContextNoOrg = () => ({
  auth: {
    getUserIdentity: vi.fn().mockResolvedValue({
      subject: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      org_id: null,
      org_role: null,
    }),
  },
})

describe('requireUserId', () => {
  it('returns userId when user is authenticated', async () => {
    const ctx = createAuthenticatedContext()
    const userId = await requireUserId(ctx)
    expect(userId).toBe('user_123')
  })

  it('throws error when user is not authenticated', async () => {
    const ctx = createUnauthenticatedContext()
    await expect(requireUserId(ctx)).rejects.toThrow(
      'Unauthorized: User must be authenticated'
    )
  })
})

describe('getOrgId', () => {
  it('returns orgId when organization is selected', async () => {
    const ctx = createAuthenticatedContext()
    const orgId = await getOrgId(ctx)
    expect(orgId).toBe('org_456')
  })

  it('returns null when no organization is selected', async () => {
    const ctx = createAuthenticatedContextNoOrg()
    const orgId = await getOrgId(ctx)
    expect(orgId).toBeNull()
  })

  it('returns null when user is not authenticated', async () => {
    const ctx = createUnauthenticatedContext()
    const orgId = await getOrgId(ctx)
    expect(orgId).toBeNull()
  })
})

describe('requireOrgId', () => {
  it('returns orgId when organization is selected', async () => {
    const ctx = createAuthenticatedContext()
    const orgId = await requireOrgId(ctx)
    expect(orgId).toBe('org_456')
  })

  it('throws error when no organization is selected', async () => {
    const ctx = createAuthenticatedContextNoOrg()
    await expect(requireOrgId(ctx)).rejects.toThrow(
      'Unauthorized: Organization must be selected'
    )
  })

  it('throws error when user is not authenticated', async () => {
    const ctx = createUnauthenticatedContext()
    await expect(requireOrgId(ctx)).rejects.toThrow(
      'Unauthorized: Organization must be selected'
    )
  })
})

describe('getAuthIdentity', () => {
  it('returns full identity when user is authenticated', async () => {
    const ctx = createAuthenticatedContext()
    const identity = await getAuthIdentity(ctx)
    expect(identity).toEqual({
      subject: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      org_id: 'org_456',
      org_role: 'admin',
    })
  })

  it('returns null when user is not authenticated', async () => {
    const ctx = createUnauthenticatedContext()
    const identity = await getAuthIdentity(ctx)
    expect(identity).toBeNull()
  })
})

describe('getUserEmail', () => {
  it('returns user email when authenticated', async () => {
    const ctx = createAuthenticatedContext()
    const email = await getUserEmail(ctx)
    expect(email).toBe('test@example.com')
  })

  it('returns null when user is not authenticated', async () => {
    const ctx = createUnauthenticatedContext()
    const email = await getUserEmail(ctx)
    expect(email).toBeNull()
  })

  it('returns null when email is not available', async () => {
    const ctx = createAuthenticatedContext({ email: null })
    const email = await getUserEmail(ctx)
    expect(email).toBeNull()
  })
})

describe('getUserName', () => {
  it('returns user name when authenticated', async () => {
    const ctx = createAuthenticatedContext()
    const name = await getUserName(ctx)
    expect(name).toBe('Test User')
  })

  it('returns null when user is not authenticated', async () => {
    const ctx = createUnauthenticatedContext()
    const name = await getUserName(ctx)
    expect(name).toBeNull()
  })

  it('returns null when name is not available', async () => {
    const ctx = createAuthenticatedContext({ name: null })
    const name = await getUserName(ctx)
    expect(name).toBeNull()
  })
})

describe('getOrgRole', () => {
  it('returns organization role when authenticated', async () => {
    const ctx = createAuthenticatedContext()
    const role = await getOrgRole(ctx)
    expect(role).toBe('admin')
  })

  it('returns null when user is not authenticated', async () => {
    const ctx = createUnauthenticatedContext()
    const role = await getOrgRole(ctx)
    expect(role).toBeNull()
  })

  it('returns null when no organization is selected', async () => {
    const ctx = createAuthenticatedContextNoOrg()
    const role = await getOrgRole(ctx)
    expect(role).toBeNull()
  })

  it('returns null when role is not available', async () => {
    const ctx = createAuthenticatedContext({ org_role: null })
    const role = await getOrgRole(ctx)
    expect(role).toBeNull()
  })
})

describe('requireUserId - Edge Cases', () => {
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
})

describe('requireUserId - ID Field Fallbacks', () => {
  it('uses tokenIdentifier when subject is missing', async () => {
    const ctx = createAuthenticatedContext({
      subject: undefined,
      tokenIdentifier: 'user_456',
    })
    const userId = await requireUserId(ctx)
    expect(userId).toBe('user_456')
  })

  it('uses sub claim when subject and tokenIdentifier are missing', async () => {
    const ctx = createAuthenticatedContext({
      subject: undefined,
      tokenIdentifier: undefined,
      sub: 'user_789',
    })
    const userId = await requireUserId(ctx)
    expect(userId).toBe('user_789')
  })

  it('throws error when all ID fields are missing', async () => {
    const ctx = createAuthenticatedContext({
      subject: undefined,
      tokenIdentifier: undefined,
      sub: undefined,
    })
    await expect(requireUserId(ctx)).rejects.toThrow(
      'Unauthorized: User must be authenticated'
    )
  })
})

describe('getOrgId - New JWT Layout', () => {
  it('extracts orgId from new JWT layout (o.id)', async () => {
    const ctx = createAuthenticatedContext({
      org_id: undefined,
      o: { id: 'org_789', rol: 'member' },
    })
    const orgId = await getOrgId(ctx)
    expect(orgId).toBe('org_789')
  })

  it('prefers old layout (org_id) over new layout (o.id)', async () => {
    const ctx = createAuthenticatedContext({
      org_id: 'org_old',
      o: { id: 'org_new', rol: 'member' },
    })
    const orgId = await getOrgId(ctx)
    expect(orgId).toBe('org_old')
  })

  it('ignores o when it is not an object', async () => {
    const ctx = createAuthenticatedContext({
      org_id: undefined,
      o: 'not_an_object',
    })
    const orgId = await getOrgId(ctx)
    // When org_id is undefined and o is not an object, returns undefined
    expect(orgId).toBeUndefined()
  })
})

describe('getOrgRole - New JWT Layout', () => {
  it('extracts orgRole from new JWT layout (o.rol)', async () => {
    const ctx = createAuthenticatedContext({
      org_role: undefined,
      o: { id: 'org_789', rol: 'member' },
    })
    const role = await getOrgRole(ctx)
    expect(role).toBe('member')
  })

  it('prefers old layout (org_role) over new layout (o.rol)', async () => {
    const ctx = createAuthenticatedContext({
      org_role: 'admin',
      o: { id: 'org_789', rol: 'member' },
    })
    const role = await getOrgRole(ctx)
    expect(role).toBe('admin')
  })
})

describe('Per-Request Identity Caching', () => {
  it('calls getUserIdentity only once when multiple auth utilities are called with same ctx', async () => {
    const getUserIdentitySpy = vi.fn().mockResolvedValue({
      subject: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      org_id: 'org_456',
      org_role: 'admin',
    })

    const ctx = {
      auth: {
        getUserIdentity: getUserIdentitySpy,
      },
    }

    // Call multiple auth utilities with the same ctx
    await requireUserId(ctx)
    await getOrgId(ctx)

    // getUserIdentity should only be called once due to caching
    expect(getUserIdentitySpy).toHaveBeenCalledTimes(1)
  })

  it('calls getUserIdentity only once when calling requireUserId, getUserEmail, and getOrgRole', async () => {
    const getUserIdentitySpy = vi.fn().mockResolvedValue({
      subject: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      org_id: 'org_456',
      org_role: 'admin',
    })

    const ctx = {
      auth: {
        getUserIdentity: getUserIdentitySpy,
      },
    }

    // Call three different auth utilities
    await requireUserId(ctx)
    await getUserEmail(ctx)
    await getOrgRole(ctx)

    // getUserIdentity should only be called once
    expect(getUserIdentitySpy).toHaveBeenCalledTimes(1)
  })

  it('calls getUserIdentity once per ctx object (different ctx = different cache)', async () => {
    const getUserIdentitySpy1 = vi.fn().mockResolvedValue({
      subject: 'user_123',
      email: 'test@example.com',
    })

    const getUserIdentitySpy2 = vi.fn().mockResolvedValue({
      subject: 'user_456',
      email: 'other@example.com',
    })

    const ctx1 = {
      auth: {
        getUserIdentity: getUserIdentitySpy1,
      },
    }

    const ctx2 = {
      auth: {
        getUserIdentity: getUserIdentitySpy2,
      },
    }

    // Call with first ctx
    await requireUserId(ctx1)
    await getOrgId(ctx1)

    // Call with second ctx
    await requireUserId(ctx2)
    await getOrgId(ctx2)

    // Each spy should be called exactly once
    expect(getUserIdentitySpy1).toHaveBeenCalledTimes(1)
    expect(getUserIdentitySpy2).toHaveBeenCalledTimes(1)
  })

  it('caches the promise, not the resolved value (handles concurrent calls)', async () => {
    let resolveIdentity: (value: any) => void
    const identityPromise = new Promise((resolve) => {
      resolveIdentity = resolve
    })

    const getUserIdentitySpy = vi.fn().mockReturnValue(identityPromise)

    const ctx = {
      auth: {
        getUserIdentity: getUserIdentitySpy,
      },
    }

    // Start two concurrent calls
    const promise1 = requireUserId(ctx)
    const promise2 = getOrgId(ctx)

    // getUserIdentity should only be called once, even though both calls are in flight
    expect(getUserIdentitySpy).toHaveBeenCalledTimes(1)

    // Resolve the identity
    resolveIdentity!({
      subject: 'user_123',
      org_id: 'org_456',
    })

    // Both promises should resolve with the same data
    const [userId, orgId] = await Promise.all([promise1, promise2])
    expect(userId).toBe('user_123')
    expect(orgId).toBe('org_456')

    // Still only one call to getUserIdentity
    expect(getUserIdentitySpy).toHaveBeenCalledTimes(1)
  })

  it('returns same error when cached identity call fails', async () => {
    const error = new Error('JWT verification failed')
    const getUserIdentitySpy = vi.fn().mockRejectedValue(error)

    const ctx = {
      auth: {
        getUserIdentity: getUserIdentitySpy,
      },
    }

    // Both calls should fail with the same error
    await expect(requireUserId(ctx)).rejects.toThrow('JWT verification failed')
    await expect(getOrgId(ctx)).rejects.toThrow('JWT verification failed')

    // getUserIdentity should only be called once (error is cached)
    expect(getUserIdentitySpy).toHaveBeenCalledTimes(1)
  })
})
