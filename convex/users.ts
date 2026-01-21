import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { requireUserId } from './_utils/auth'

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
    // Require authentication
    await requireUserId(ctx)

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
 * Fetch the currently authenticated user's data.
 * Returns null if user record doesn't exist in Convex.
 *
 * Note: This function fetches the authenticated user's own data only.
 * It does not accept a clerkId argument to prevent cross-user data access.
 */
export const getMe = query({
  args: {},
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
  handler: async (ctx) => {
    // Require authentication
    const userId = await requireUserId(ctx)

    // Fetch the authenticated user's own data
    return await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', userId))
      .unique()
  },
})

/**
 * Fetch user by Clerk user ID (admin/internal use only).
 * Returns null if not found.
 *
 * WARNING: This function allows fetching any user by clerkId.
 * It should only be used internally by trusted code paths.
 * For frontend use, use getMe() instead.
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
    // Require authentication
    const userId = await requireUserId(ctx)

    // Users can only fetch their own data
    if (userId !== args.clerkId) {
      throw new Error("Unauthorized: Can only fetch own user data")
    }

    return await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique()
  },
})

export default {
  upsertUser,
  getMe,
  getByClerkId,
}

