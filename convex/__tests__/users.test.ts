import { describe, it, expect, beforeEach } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from '../_generated/api'
import schema from '../schema'
import { modules } from '../test.setup'

describe('users mutations', () => {
  let t: ReturnType<typeof convexTest>

  beforeEach(async () => {
    t = convexTest(schema, modules)
    await t.run(async (ctx) => {
      // Clear users table before each test
      const users = await ctx.db.query('users').collect()
      for (const user of users) {
        await ctx.db.delete(user._id)
      }
    })
  })

  describe('upsertUser', () => {
    it('creates new user with all fields', async () => {
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        organizationId: 'org_456',
      })

      expect(userId).toBeDefined()

      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_123'
      })

      expect(user).toMatchObject({
        clerkId: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        organizationIds: ['org_456'],
      })
    })

    it('creates user with minimal fields (no firstName, lastName, username)', async () => {
      const userId = await t.mutation(api.users.upsertUser, {
        clerkId: 'user_minimal',
        email: 'minimal@example.com',
        organizationId: 'org_789',
      })

      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_minimal'
      })

      expect(user).toMatchObject({
        clerkId: 'user_minimal',
        email: 'minimal@example.com',
        organizationIds: ['org_789'],
      })
      expect(user?.firstName).toBeUndefined()
      expect(user?.lastName).toBeUndefined()
      expect(user?.username).toBeUndefined()
    })

    it('updates existing user and adds new organizationId', async () => {
      // Create user with first org
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_multi',
        email: 'multi@example.com',
        organizationId: 'org_first',
      })

      // Add second org
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_multi',
        email: 'multi@example.com',
        organizationId: 'org_second',
      })

      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_multi'
      })

      expect(user?.organizationIds).toEqual(['org_first', 'org_second'])
    })

    it('does not duplicate organizationId if already present', async () => {
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_dup',
        email: 'dup@example.com',
        organizationId: 'org_same',
      })

      // Try to add same org again
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_dup',
        email: 'dup@example.com',
        organizationId: 'org_same',
      })

      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_dup'
      })

      expect(user?.organizationIds).toEqual(['org_same'])
    })
  })

  describe('getByClerkId', () => {
    it('fetches user by clerkId', async () => {
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_fetch',
        email: 'fetch@example.com',
        organizationId: 'org_test',
      })

      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_fetch'
      })

      expect(user?.email).toBe('fetch@example.com')
    })

    it('returns null for non-existent user', async () => {
      const user = await t.query(api.users.getByClerkId, {
        clerkId: 'user_nonexistent'
      })

      expect(user).toBeNull()
    })
  })

  describe('getPermissionFlags', () => {
    it('returns { hasVsme: false } when user exists but flag is missing', async () => {
      // Create user without hasVsme flag
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_no_flag',
        email: 'noflag@example.com',
        organizationId: 'org_test',
      })

      const flags = await t.query(api.users.getPermissionFlags, {})

      // Should default to false (conservative)
      expect(flags).toEqual({ hasVsme: false })
    })

    it('returns { hasVsme: true } when flag is set to true', async () => {
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_with_vsme',
        email: 'withvsme@example.com',
        organizationId: 'org_test',
        hasVsme: true,
      })

      const flags = await t.query(api.users.getPermissionFlags, {})

      expect(flags).toEqual({ hasVsme: true })
    })

    it('returns { hasVsme: false } when flag is explicitly set to false', async () => {
      await t.mutation(api.users.upsertUser, {
        clerkId: 'user_no_vsme',
        email: 'novsme@example.com',
        organizationId: 'org_test',
        hasVsme: false,
      })

      const flags = await t.query(api.users.getPermissionFlags, {})

      expect(flags).toEqual({ hasVsme: false })
    })

    it('returns { hasVsme: false } when user does not exist', async () => {
      // Query without creating a user first
      const flags = await t.query(api.users.getPermissionFlags, {})

      expect(flags).toEqual({ hasVsme: false })
    })
  })
})

