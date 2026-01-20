import { describe, it, expect, beforeEach } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from '../_generated/api'
import schema from '../schema'
import { modules } from '../test.setup'

describe('organizations mutations', () => {
  let t: ReturnType<typeof convexTest>

  beforeEach(async () => {
    t = convexTest(schema, modules)
    await t.run(async (ctx) => {
      // Clear organizations table before each test
      const orgs = await ctx.db.query('organizations').collect()
      for (const org of orgs) {
        await ctx.db.delete(org._id)
      }
    })
  })

  describe('createOrganization', () => {
    it('creates organization with clerkOrgId, name, and slug', async () => {
      const orgId = await t.mutation(api.organizations.createOrganization, {
        clerkOrgId: 'org_123',
        name: 'Test Org',
        slug: 'test-org'
      })

      expect(orgId).toBeDefined()

      const org = await t.query(api.organizations.getByClerkOrgId, {
        clerkOrgId: 'org_123'
      })

      expect(org).toMatchObject({
        clerkOrgId: 'org_123',
        name: 'Test Org',
        slug: 'test-org'
      })
    })

    it('throws error for duplicate clerkOrgId', async () => {
      await t.mutation(api.organizations.createOrganization, {
        clerkOrgId: 'org_123',
        name: 'Test Org',
        slug: 'test-org'
      })

      await expect(
        t.mutation(api.organizations.createOrganization, {
          clerkOrgId: 'org_123',
          name: 'Duplicate Org',
          slug: 'duplicate-org'
        })
      ).rejects.toThrow('Organization already exists')
    })
  })

  describe('getByClerkOrgId', () => {
    it('fetches organization by clerkOrgId', async () => {
      await t.mutation(api.organizations.createOrganization, {
        clerkOrgId: 'org_456',
        name: 'Another Org',
        slug: 'another-org'
      })

      const org = await t.query(api.organizations.getByClerkOrgId, {
        clerkOrgId: 'org_456'
      })

      expect(org?.name).toBe('Another Org')
    })

    it('returns null for non-existent org', async () => {
      const org = await t.query(api.organizations.getByClerkOrgId, {
        clerkOrgId: 'org_nonexistent'
      })

      expect(org).toBeNull()
    })
  })

  describe('exists', () => {
    it('returns true when org exists', async () => {
      await t.mutation(api.organizations.createOrganization, {
        clerkOrgId: 'org_789',
        name: 'Existing Org',
        slug: 'existing-org'
      })

      const exists = await t.query(api.organizations.exists, {
        clerkOrgId: 'org_789'
      })

      expect(exists).toBe(true)
    })

    it('returns false when org does not exist', async () => {
      const exists = await t.query(api.organizations.exists, {
        clerkOrgId: 'org_nonexistent'
      })

      expect(exists).toBe(false)
    })
  })
})

