import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { requireUserId, requireOrgId } from "./_utils/auth"

/**
 * Save or update emissions targets for an organization.
 * Creates a new target record or updates the existing one for the organization.
 */
export const saveTargets = mutation({
  args: {
    baseYear: v.number(),
    baseYearEmissions: v.number(),
    targetYear: v.number(),
    targetReduction: v.number(),
    longTermTargetYear: v.optional(v.number()),
    longTermTargetReduction: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const orgId = await requireOrgId(ctx)
    const now = Date.now()

    // Check if targets already exist for this organization
    const existingTargets = await ctx.db
      .query("targets")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", orgId))
      .first()

    if (existingTargets) {
      // Update existing targets
      await ctx.db.patch(existingTargets._id, {
        baseYear: args.baseYear,
        baseYearEmissions: args.baseYearEmissions,
        targetYear: args.targetYear,
        targetReduction: args.targetReduction,
        longTermTargetYear: args.longTermTargetYear,
        longTermTargetReduction: args.longTermTargetReduction,
        lastModifiedBy: userId,
        lastModifiedAt: now,
      })
      return { updated: true, id: existingTargets._id }
    }

    // Create new targets record
    const newId = await ctx.db.insert("targets", {
      organizationId: orgId,
      baseYear: args.baseYear,
      baseYearEmissions: args.baseYearEmissions,
      targetYear: args.targetYear,
      targetReduction: args.targetReduction,
      // targetEmissions: args.targetEmissions,
      longTermTargetYear: args.longTermTargetYear,
      longTermTargetReduction: args.longTermTargetReduction,
      createdBy: userId,
      createdAt: now,
      lastModifiedBy: userId,
      lastModifiedAt: now,
    })
    return { updated: false, id: newId }
  },
})

/**
 * Get targets for the current organization.
 */
export const getTargets = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrgId(ctx)

    return await ctx.db
      .query("targets")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", orgId))
      .first()
  },
})
