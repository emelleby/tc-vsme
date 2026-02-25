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
    hasScopeSpecificTargets: v.optional(
      v.object({
        scope1: v.boolean(),
        scope2: v.boolean(),
        scope3: v.boolean(),
      })
    ),
    projections: v.optional(
      v.array(
        v.object({
          year: v.number(),
          scope1: v.number(),
          scope2: v.number(),
          scope3: v.number(),
          total: v.number(),
          isBaseYear: v.optional(v.boolean()),
          isTargetYear: v.optional(v.boolean()),
          isLongTermTargetYear: v.optional(v.boolean()),
          scope3Categories: v.optional(v.object({
            category1: v.optional(v.number()),
            category2: v.optional(v.number()),
            category3: v.optional(v.number()),
            category4: v.optional(v.number()),
            category5: v.optional(v.number()),
            category6: v.optional(v.number()),
            category7: v.optional(v.number()),
            category8: v.optional(v.number()),
            category9: v.optional(v.number()),
            category10: v.optional(v.number()),
            category11: v.optional(v.number()),
            category12: v.optional(v.number()),
            category13: v.optional(v.number()),
            category14: v.optional(v.number()),
            category15: v.optional(v.number()),
          })),
        }),
      ),
    ),
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
        hasScopeSpecificTargets: args.hasScopeSpecificTargets,
        projections: args.projections,
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
      hasScopeSpecificTargets: args.hasScopeSpecificTargets,
      projections: args.projections,
      createdBy: userId,
      createdAt: now,
      lastModifiedBy: userId,
      lastModifiedAt: now,
    })
    return { updated: false, id: newId }
  },
})

/**
 * Get targets for the current organization with contributor name resolved.
 */
export const getTargets = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrgId(ctx)

    const targets = await ctx.db
      .query("targets")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", orgId))
      .first()

    if (!targets) return null

    // Resolve contributor name from lastModifiedBy
    let contributor = { name: 'Unknown' }
    if (targets.lastModifiedBy) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", targets.lastModifiedBy))
        .first()
      if (user) {
        contributor = {
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Unknown'
        }
      }
    }

    return {
      ...targets,
      contributor,
    }
  },
})
