import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),

  // Organizations table
  organizations: defineTable({
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.string(),
  })
    .index('by_clerkOrgId', ['clerkOrgId'])
    .index('by_slug', ['slug']),

  // Users table
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    organizationIds: v.array(v.string()), // Array of Clerk org IDs
    updatedAt: v.number(), // Manual timestamp for updates
  })
    .index('by_clerkId', ['clerkId'])
    .index('by_email', ['email']),
})
