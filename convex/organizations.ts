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

export default {
  createOrganization,
  upsertOrganization,
  getByClerkOrgId,
  exists,
}

