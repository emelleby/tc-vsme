/**
 * Emissions Action Test
 *
 * Tests for the getEmissionsByOrgId action that fetches emissions data
 * from MongoDB with authentication and authorization.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from '../_generated/api'
import schema from '../schema'
import { modules } from '../test.setup'

describe('Emissions Action', () => {
  let t: ReturnType<typeof convexTest>
  const HARDCODED_ORG_ID = 'org_2tWO47gV8vEOLN1lrpV57N02Dh2'

  beforeEach(() => {
    t = convexTest(schema, modules)
  })

  afterEach(async () => {
    // Clean up MongoDB connections
    try {
      const { closeMongoClient } = await import('../mongodb/client')
      await closeMongoClient()
    } catch (error) {
      // Ignore if module doesn't exist
    }
  })

  it('should export getEmissionsByOrgId action', async () => {
    expect(api.emissions.getEmissionsByOrgId).toBeDefined()
  })

  it('should require authentication', async () => {
    // Without auth, should throw error
    await expect(
      t.action(api.emissions.getEmissionsByOrgId, {
        orgIdToUse: HARDCODED_ORG_ID
      })
    ).rejects.toThrow('Unauthorized')
  })

  it('should prevent cross-org access', async () => {
    // Since orgId is hardcoded in the backend, trying to access a different org should fail
    await expect(
      t.withIdentity({ subject: 'user_123', org_id: HARDCODED_ORG_ID })
        .action(api.emissions.getEmissionsByOrgId, {
          orgIdToUse: 'org_different_org'
        })
    ).rejects.toThrow('Cannot access other organizations')
  })

  it('should fetch data for authenticated user org', async () => {
    // Mock authenticated user with the hardcoded org
    const result = await t
      .withIdentity({ subject: 'user_123', org_id: HARDCODED_ORG_ID })
      .action(api.emissions.getEmissionsByOrgId, {
        orgIdToUse: HARDCODED_ORG_ID
      })

    // Result should be an object with success field
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  it('should support optional year parameter', async () => {
    // Access with year parameter
    const result = await t
      .withIdentity({ subject: 'user_123', org_id: HARDCODED_ORG_ID })
      .action(api.emissions.getEmissionsByOrgId, {
        orgIdToUse: HARDCODED_ORG_ID,
        year: 2024,
      })

    expect(result).toBeDefined()
  })

  it('should allow access to hardcoded org when user has no org context', async () => {
    // User authenticated but no org context - should still work with hardcoded org
    const result = await t
      .withIdentity({ subject: 'user_123' })
      .action(api.emissions.getEmissionsByOrgId, {
        orgIdToUse: HARDCODED_ORG_ID
      })

    // Should not throw error
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })
})

