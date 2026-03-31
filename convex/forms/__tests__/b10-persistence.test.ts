import { describe, it, expect, beforeEach } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from '../../_generated/api'
import schema from '../../schema'
import { modules } from '../../test.setup'

describe('B10 Compensation Form Schema Persistence', () => {
  let t: ReturnType<typeof convexTest>
  const CLERK_ORG_ID = 'org_clerk_b10_test'
  const USER_ID = 'user_b10_test'
  const TABLE = 'formSocial'
  const YEAR = 2024
  const SECTION = 'compensationCollective'

  beforeEach(async () => {
    t = convexTest(schema, modules)
    
    // Seed organization
    await t.run(async (ctx) => {
      await ctx.db.insert("organizations", {
        clerkOrgId: CLERK_ORG_ID,
        name: "B10 Test Org",
        slug: "b10-test-org",
        orgNumber: "987654321"
      })
    })
  })

  it('should save and retrieve all B10 fields including new ones', async () => {
    const data = {
      reportingYear: "2024",
      hourlyPayMale: 250.5,
      hourlyPayFemale: 245.0,
      collectiveBargainingAgreement: 85,
      collectiveBargainingShare: 92.5,
      minstelonnsansvar: true
    }
    
    // Save as draft
    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.save.saveForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION,
        data
      })

    // Retrieve
    const form = await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .query(api.forms.get.getForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION
      })

    expect(form).toBeDefined()
    expect(form?.draftData).toEqual(data)
    expect(form?.draftData.hourlyPayMale).toBe(250.5)
    expect(form?.draftData.hourlyPayFemale).toBe(245.0)
    expect(form?.draftData.collectiveBargainingAgreement).toBe(85)
    expect(form?.draftData.minstelonnsansvar).toBe(true)
  })

  it('should track changes for new B10 fields', async () => {
    const initialData = {
      reportingYear: "2024",
      hourlyPayMale: 200,
      hourlyPayFemale: 200,
      collectiveBargainingAgreement: 50,
      collectiveBargainingShare: 50,
      minstelonnsansvar: false
    }

    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.save.saveForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION,
        data: initialData
      })

    const updatedData = { ...initialData, hourlyPayMale: 210 }

    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.save.saveForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION,
        data: updatedData
      })

    const form = await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .query(api.forms.get.getForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION
      })

    expect(form?.versions.length).toBe(2)
    const latestVersion = form?.versions[form.versions.length - 1]
    expect(latestVersion.changes).toContainEqual({
      field: 'hourlyPayMale',
      oldValue: 200,
      newValue: 210
    })
  })
})
