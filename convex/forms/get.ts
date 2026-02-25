import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireOrgId } from "../_utils/auth"
import { formTableValidator, formSectionValidator, getFormRecordBySection } from "./_utils"

export const getEnvironmentalReportingYears = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrgId(ctx)
    
    const records = await ctx.db
      .query("formEnvironmental")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .collect()
    
    // Extract unique reporting years and sort ascending
    const years = [...new Set(records.map(r => r.reportingYear))]
    return years.sort((a, b) => a - b)
  }
})

export const getForm = query({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
    section: formSectionValidator,  // Required
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgId(ctx)
    
    return await getFormRecordBySection(ctx, args.table, orgId, args.reportingYear, args.section)
  }
})

export const getBaseYearEmissions = query({
  args: {
    reportingYear: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgId(ctx)
    
    // Fetch both energyEmissions and scope3Emissions sections for the given year
    const [energyEmissionsRecord, scope3EmissionsRecord] = await Promise.all([
      getFormRecordBySection(ctx, "formEnvironmental", orgId, args.reportingYear, "energyEmissions"),
      getFormRecordBySection(ctx, "formEnvironmental", orgId, args.reportingYear, "scope3Emissions"),
    ])
    
    // Return what is found, with status info for UI feedback
    const energyData = energyEmissionsRecord?.status === "submitted" 
      ? energyEmissionsRecord.data as {
          scope1Emissions?: number
          scope2EmissionsMarketBased?: number
        } | null
      : null
    
    const scope3Data = scope3EmissionsRecord?.status === "submitted"
      ? scope3EmissionsRecord.data as {
          totalScope3Emissions?: number
          category1?: number
          category2?: number
          category3?: number
          category4?: number
          category5?: number
          category6?: number
          category7?: number
          category8?: number
          category9?: number
          category10?: number
          category11?: number
          category12?: number
          category13?: number
          category14?: number
          category15?: number
        } | null
      : null
    
    return {
      scope1Emissions: energyData?.scope1Emissions ?? null,
      scope2EmissionsMarketBased: energyData?.scope2EmissionsMarketBased ?? null,
      totalScope3Emissions: scope3Data?.totalScope3Emissions ?? null,
      category1: scope3Data?.category1 ?? null,
      category2: scope3Data?.category2 ?? null,
      category3: scope3Data?.category3 ?? null,
      category4: scope3Data?.category4 ?? null,
      category5: scope3Data?.category5 ?? null,
      category6: scope3Data?.category6 ?? null,
      category7: scope3Data?.category7 ?? null,
      category8: scope3Data?.category8 ?? null,
      category9: scope3Data?.category9 ?? null,
      category10: scope3Data?.category10 ?? null,
      category11: scope3Data?.category11 ?? null,
      category12: scope3Data?.category12 ?? null,
      category13: scope3Data?.category13 ?? null,
      category14: scope3Data?.category14 ?? null,
      category15: scope3Data?.category15 ?? null,
      energyEmissionsStatus: energyEmissionsRecord?.status ?? null,
      scope3EmissionsStatus: scope3EmissionsRecord?.status ?? null,
    }
  }
})

export const getFormAllSectionsWithContributors = query({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgId(ctx)
    
    const records = await ctx.db
      .query(args.table)
      .withIndex("by_org_year", (q: any) =>
        q.eq("orgId", orgId).eq("reportingYear", args.reportingYear)
      )
      .collect()
    
    // Get unique contributor IDs
    const contributorIds = [...new Set(records.map(r => r.lastModifiedBy))]
    
    // Fetch all contributors in parallel
    const contributors = await Promise.all(
      contributorIds.map(async (clerkId) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkId", q => q.eq("clerkId", clerkId))
          .first()
        return [clerkId, user] as const
      })
    )
    
    // Build contributor lookup map
    const contributorMap = Object.fromEntries(
      contributors.map(([clerkId, user]) => [
        clerkId,
        user ? {
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Unknown',
        } : { name: 'Unknown' }
      ])
    )
    
    // Return sections with resolved contributor info
    // Filter to only include records with section field (formGeneral only)
    const recordsWithSection = records.filter((r): r is typeof r & { section: string } => 'section' in r)
    
    return Object.fromEntries(
      recordsWithSection.map(r => [
        r.section,
        {
          ...r,
          contributor: contributorMap[r.lastModifiedBy] || { name: 'Unknown' },
        }
      ])
    )
  }
})
