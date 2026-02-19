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
        } | null
      : null
    
    return {
      scope1Emissions: energyData?.scope1Emissions ?? null,
      scope2EmissionsMarketBased: energyData?.scope2EmissionsMarketBased ?? null,
      totalScope3Emissions: scope3Data?.totalScope3Emissions ?? null,
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
