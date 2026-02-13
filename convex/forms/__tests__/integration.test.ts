import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from '../../_generated/api'
import schema from '../../schema'
import { modules } from '../../test.setup'

describe('Form Integration Tests', () => {
  let t: ReturnType<typeof convexTest>
  const CLERK_ORG_ID = 'org_clerk_123'
  const USER_ID = 'user_123'
  const TABLE = 'formGeneral'
  const YEAR = 2024
  const SECTION = 'companyInfo'  // NEW

  beforeEach(async () => {
    t = convexTest(schema, modules)
    
    // Seed organization
    await t.run(async (ctx) => {
      await ctx.db.insert("organizations", {
        clerkOrgId: CLERK_ORG_ID,
        name: "Test Org",
        slug: "test-org"
      })
    })
  })

  afterEach(async () => {
    // Clean up if needed
  })

  it('should save a new form', async () => {
    const data = { revenue: 1000 }
    
    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.save.saveForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION,  // NEW
        data
      })

    const form = await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .query(api.forms.get.getForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION  // NEW
      })

    expect(form).toBeDefined()
    expect(form?.data).toEqual(data)
    expect(form?.status).toBe('draft')
    expect(form?.versions).toHaveLength(1)
    expect(form?.versions[0].version).toBe(1)
  })

  it('should update existing form and track changes', async () => {
    // Initial save
    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.save.saveForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION,  // NEW
        data: { revenue: 1000 }
      })

    // Update
    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.save.saveForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION,  // NEW
        data: { revenue: 2000 }
      })

    const form = await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .query(api.forms.get.getForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION  // NEW
      })

    expect(form?.data.revenue).toBe(2000)
    expect(form?.versions).toHaveLength(2)
    expect(form?.versions[1].version).toBe(2)
    expect(form?.versions[1].changes[0]).toEqual({
      field: 'revenue',
      oldValue: 1000,
      newValue: 2000
    })
  })

  it('should submit form', async () => {
    // Save first
    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.save.saveForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION,  // NEW
        data: { revenue: 1000 }
      })

    // Submit
    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.submit.submitForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION  // NEW
      })

    const form = await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .query(api.forms.get.getForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION  // NEW
      })

    expect(form?.status).toBe('submitted')
  })

  it('should reopen submitted form', async () => {
    // Save and submit
    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.save.saveForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION,  // NEW
        data: { revenue: 1000 }
      })
    
    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.submit.submitForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION  // NEW
      })

    // Reopen
    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.reopen.reopenForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION  // NEW
      })

    const form = await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .query(api.forms.get.getForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION  // NEW
      })

    expect(form?.status).toBe('draft')
  })

  it('should trim version history to last 4 versions', async () => {
     // Create 5 versions
     for (let i = 1; i <= 5; i++) {
        await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
        .mutation(api.forms.save.saveForm, {
          table: TABLE,
          reportingYear: YEAR,
          section: SECTION,  // NEW
          data: { revenue: i * 1000 }
        })
     }

     const form = await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
     .query(api.forms.get.getForm, {
       table: TABLE,
       reportingYear: YEAR,
       section: SECTION  // NEW
     })

     expect(form?.versions).toHaveLength(4)
     expect(form?.versions[0].version).toBe(2) // Should have dropped version 1
     expect(form?.versions[3].version).toBe(5)
  })
})
