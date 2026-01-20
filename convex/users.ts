import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

/**
 * Upsert user record: create if not exists, update organizationIds if exists.
 * This handles both new users and existing users joining additional organizations.
 */
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    organizationId: v.string(),
  },
  returns: v.id('users'),
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique()

    if (existing) {
      // User exists: add organizationId if not already present
      const orgIds = existing.organizationIds || []
      if (!orgIds.includes(args.organizationId)) {
        await ctx.db.patch(existing._id, {
          organizationIds: [...orgIds, args.organizationId],
          updatedAt: Date.now(),
        })
      }
      return existing._id
    }

    // User doesn't exist: create new record
    const userData: any = {
      clerkId: args.clerkId,
      email: args.email,
      organizationIds: [args.organizationId],
      updatedAt: Date.now(),
    }

    // Add optional fields only if provided
    if (args.firstName !== undefined) {
      userData.firstName = args.firstName
    }
    if (args.lastName !== undefined) {
      userData.lastName = args.lastName
    }
    if (args.username !== undefined) {
      userData.username = args.username
    }

    return await ctx.db.insert('users', userData)
  },
})

/**
 * Fetch user by Clerk user ID.
 * Returns null if not found.
 */
export const getByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      clerkId: v.string(),
      email: v.string(),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      username: v.optional(v.string()),
      organizationIds: v.array(v.string()),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique()
  },
})

export default {
  upsertUser,
  getByClerkId,
}

