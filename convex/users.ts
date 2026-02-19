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
    hasVsme: v.optional(v.boolean()),
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
      const updates: any = { updatedAt: Date.now() }

      if (!orgIds.includes(args.organizationId)) {
        updates.organizationIds = [...orgIds, args.organizationId]
      }

      // Update hasVsme if provided
      if (args.hasVsme !== undefined) {
        updates.hasVsme = args.hasVsme
      }

      await ctx.db.patch(existing._id, updates)
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
    if (args.hasVsme !== undefined) {
      userData.hasVsme = args.hasVsme
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
      hasVsme: v.optional(v.boolean()),
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
      hasVsme: v.optional(v.boolean()),
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

/**
 * Get user display info by clerkId.
 * Returns minimal info needed for displaying contributor names.
 * Any authenticated user can call this (for showing who edited forms).
 */
export const getDisplayName = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.union(
    v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      username: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Require authentication
    await requireUserId(ctx)

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique()

    if (!user) return null

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
    }
  },
})

/**
 * Get permission flags for the currently authenticated user.
 * Returns the hasVsme flag for the calling user only.
 * No user ID parameter to prevent cross-user data access.
 */
export const getPermissionFlags = query({
  args: {},
  returns: v.object({
    hasVsme: v.boolean(),
  }),
  handler: async (ctx) => {
    // Require authentication and get the user's ID
    const userId = await requireUserId(ctx)

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', userId))
      .unique()

    // If user doesn't exist or hasVsme is missing, default to false
    // (conservative — user hasn't been explicitly granted create-org permission)
    return {
      hasVsme: user?.hasVsme ?? false,
    }
  },
})

export default {
  upsertUser,
  getMe,
  getByClerkId,
  getDisplayName,
  getPermissionFlags,
}

