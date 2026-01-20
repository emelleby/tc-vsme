import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

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
  },
  returns: v.id('organizations'),
  handler: async (ctx, args) => {
    // Check if org already exists
    const existing = await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()

    if (existing) {
      // Update existing organization with correct name and slug
      await ctx.db.patch(existing._id, {
        name: args.name,
        slug: args.slug,
      })
      return existing._id
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
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

