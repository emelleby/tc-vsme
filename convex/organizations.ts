import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { requireUserId, requireOrgId } from './_utils/auth'

/**
 * Create a new organization record in Convex.
 * Throws error if organization with same clerkOrgId already exists.
 */
export const createOrganization = mutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.string(),
  },
  returns: v.id('organizations'),
  handler: async (ctx, args) => {
    // Require authentication
    await requireUserId(ctx)

    // Check if org already exists
    const existing = await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()

    if (existing) {
      throw new Error('Organization already exists')
    }

    // Create new organization
    return await ctx.db.insert('organizations', {
      clerkOrgId: args.clerkOrgId,
      name: args.name,
      slug: args.slug,
    })
  },
})

/**
 * Upsert organization record: create if not exists, update name and slug if exists.
 * This handles both new organizations and updating existing ones with correct data.
 */
export const upsertOrganization = mutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.string(),
    orgNumber: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.optional(v.array(v.string())),
        postalCode: v.optional(v.string()),
        city: v.optional(v.string()),
        country: v.optional(v.string()),
        countryCode: v.optional(v.string()),
      }),
    ),
    orgForm: v.optional(v.string()),
    website: v.optional(v.string()),
    naceCode: v.optional(v.string()),
    industry: v.optional(v.string()),
    numberEmployees: v.optional(v.number()),
    businessModel: v.optional(v.string()),
    hasVsme: v.optional(v.boolean()),
  },
  returns: v.id('organizations'),
  handler: async (ctx, args) => {
    // Require authentication
    await requireUserId(ctx)

    // Check if org already exists
    const existing = await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()

    // Check for slug uniqueness if slug is being set/changed
    if (!existing || existing.slug !== args.slug) {
      const slugCollision = await ctx.db
        .query('organizations')
        .withIndex('by_slug', (q) => q.eq('slug', args.slug))
        .unique()

      if (slugCollision) {
        throw new Error(`Slug "${args.slug}" is already taken.`)
      }
    }

    if (existing) {
      // Update existing organization
      await ctx.db.patch(existing._id, {
        name: args.name,
        slug: args.slug,
        orgNumber: args.orgNumber,
        address: args.address,
        orgForm: args.orgForm,
        website: args.website,
        naceCode: args.naceCode,
        industry: args.industry,
        numberEmployees: args.numberEmployees,
        businessModel: args.businessModel,
        hasVsme: args.hasVsme,
      })
      return existing._id
    }

    // Create new organization
    return await ctx.db.insert('organizations', {
      clerkOrgId: args.clerkOrgId,
      name: args.name,
      slug: args.slug,
      orgNumber: args.orgNumber,
      address: args.address,
      orgForm: args.orgForm,
      website: args.website,
      naceCode: args.naceCode,
      industry: args.industry,
      numberEmployees: args.numberEmployees,
      businessModel: args.businessModel,
      hasVsme: args.hasVsme,
    })
  },
})

/**
 * Fetch organization by Clerk organization ID.
 * Returns null if not found.
 */
export const getByClerkOrgId = query({
  args: {
    clerkOrgId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id('organizations'),
      _creationTime: v.number(),
      clerkOrgId: v.string(),
      name: v.string(),
      slug: v.string(),
      orgNumber: v.optional(v.string()),
      address: v.optional(
        v.object({
          street: v.optional(v.array(v.string())),
          postalCode: v.optional(v.string()),
          city: v.optional(v.string()),
          country: v.optional(v.string()),
          countryCode: v.optional(v.string()),
        }),
      ),
      orgForm: v.optional(v.string()),
      website: v.optional(v.string()),
      naceCode: v.optional(v.string()),
      industry: v.optional(v.string()),
      numberEmployees: v.optional(v.number()),
      businessModel: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Require authentication and organization context
    await requireUserId(ctx)
    await requireOrgId(ctx)

    // Verify user has access to this organization
    // (Optional: Add additional authorization logic here)

    return await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()
  },
})

/**
 * Check if organization exists by Clerk organization ID.
 */
export const exists = query({
  args: {
    clerkOrgId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    // Require authentication
    await requireUserId(ctx)

    const org = await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()

    return org !== null
  },
})

/**
 * Get permission flags for an organization.
 * Returns hasVsme flag and whether the organization exists in the database.
 * The exists field replaces the concept of vsmeDb.
 */
export const getPermissionFlags = query({
  args: {
    clerkOrgId: v.string(),
  },
  returns: v.object({
    hasVsme: v.boolean(),
    exists: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // Require authentication
    await requireUserId(ctx)

    const org = await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()

    if (!org) {
      return { hasVsme: false, exists: false }
    }

    // If org exists but hasVsme is missing, default to true
    // (because setup already ran — the record's existence proves it)
    return {
      hasVsme: org.hasVsme ?? true,
      exists: true,
    }
  },
})

export default {
  createOrganization,
  upsertOrganization,
  getByClerkOrgId,
  exists,
  getPermissionFlags,
}

