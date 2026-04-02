import { describe, it, expect, beforeEach } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from '../../_generated/api'
import schema from '../../schema'
import { modules } from '../../test.setup'

describe('B3 Energy Emissions Form Schema Persistence', () => {
  let t: ReturnType<typeof convexTest>
  const CLERK_ORG_ID = 'org_clerk_b3_test'
  const USER_ID = 'user_b3_test'
  const TABLE = 'formEnvironmental'
  const YEAR = 2024
  const SECTION = 'energyEmissions'

  beforeEach(async () => {
    t = convexTest(schema, modules)
    
    // Seed organization
    await t.run(async (ctx) => {
      await ctx.db.insert("organizations", {
        clerkOrgId: CLERK_ORG_ID,
        name: "B3 Test Org",
        slug: "b3-test-org",
        orgNumber: "123456789"
      })
    })
  })

  it('should save and retrieve all B3 fields including new ones', async () => {
    const data = {
      reportingYear: "2024",
      renewableElectricity: 100,
      nonRenewableElectricity: 200,
      stationaryCombustion: 300,
      mobileCombustion: 400,
      renewableFuels: 500,
      otherEnergySources: 600,
      emissionsIntensity: 1.5,
      scope1Emissions: 10.5,
      scope2EmissionsLocationBased: 5.2,
      scope2EmissionsMarketBased: 4.8,
      climateDataCollectionMethod: "Detailed measurements from all facilities.",
      dataUncertainty: "Minor uncertainty due to one missing meter in Q3."
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

    console.log('Retrieved form:', JSON.stringify(form, null, 2))

    expect(form).toBeDefined()
    expect(form?.draftData).toEqual(data)
    expect(form?.draftData.stationaryCombustion).toBe(300)
    expect(form?.draftData.mobileCombustion).toBe(400)
    expect(form?.draftData.renewableFuels).toBe(500)
    expect(form?.draftData.otherEnergySources).toBe(600)
  })

  it('should track changes for new fields', async () => {
    const initialData = {
      reportingYear: "2024",
      renewableElectricity: 100,
      nonRenewableElectricity: 200,
      stationaryCombustion: 100,
      mobileCombustion: 100,
      renewableFuels: 100,
      otherEnergySources: 100,
      emissionsIntensity: 1.0,
      scope1Emissions: 10.0,
      scope2EmissionsLocationBased: 5.0,
      scope2EmissionsMarketBased: 4.0,
      climateDataCollectionMethod: "Initial collection method.",
      dataUncertainty: "No uncertainty recorded."
    }

    await t.withIdentity({ subject: USER_ID, org_id: CLERK_ORG_ID })
      .mutation(api.forms.save.saveForm, {
        table: TABLE,
        reportingYear: YEAR,
        section: SECTION,
        data: initialData
      })

    const updatedData = { ...initialData, stationaryCombustion: 999 }

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

    expect(form?.draftData.stationaryCombustion).toBe(999)
    const latestVersion = form?.versions[form.versions.length - 1]
    expect(latestVersion?.changes).toContainEqual({
      field: 'stationaryCombustion',
      oldValue: 100,
      newValue: 999
    })
  })
})
