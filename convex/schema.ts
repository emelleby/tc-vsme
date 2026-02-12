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
  })
    .index('by_clerkOrgId', ['clerkOrgId'])
    .index('by_slug', ['slug'])
    .index('by_orgNumber', ['orgNumber']),

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

  // Form tables
  formGeneral: defineTable({
    orgId: v.string(),
    orgNumber: v.string(),
    reportingYear: v.number(),
    data: v.any(),               // Form-specific data
    status: v.string(),          // "draft" | "submitted"
    versions: v.array(v.any()),  // Version history
    createdBy: v.string(),
    createdAt: v.number(),
    lastModifiedBy: v.string(),
    lastModifiedAt: v.number(),
  })
    .index("by_org_year", ["orgId", "reportingYear"])
    .index("by_orgNumber_year", ["orgNumber", "reportingYear"])
    .index("by_orgId", ["orgId"]),

  formEnvironmental: defineTable({
    orgId: v.string(),
    orgNumber: v.string(),
    reportingYear: v.number(),
    data: v.any(),
    status: v.string(),
    versions: v.array(v.any()),
    createdBy: v.string(),
    createdAt: v.number(),
    lastModifiedBy: v.string(),
    lastModifiedAt: v.number(),
  })
    .index("by_org_year", ["orgId", "reportingYear"])
    .index("by_orgNumber_year", ["orgNumber", "reportingYear"])
    .index("by_orgId", ["orgId"]),

  formSocial: defineTable({
    orgId: v.string(),
    orgNumber: v.string(),
    reportingYear: v.number(),
    data: v.any(),
    status: v.string(),
    versions: v.array(v.any()),
    createdBy: v.string(),
    createdAt: v.number(),
    lastModifiedBy: v.string(),
    lastModifiedAt: v.number(),
  })
    .index("by_org_year", ["orgId", "reportingYear"])
    .index("by_orgNumber_year", ["orgNumber", "reportingYear"])
    .index("by_orgId", ["orgId"]),

  formGovernance: defineTable({
    orgId: v.string(),
    orgNumber: v.string(),
    reportingYear: v.number(),
    data: v.any(),
    status: v.string(),
    versions: v.array(v.any()),
    createdBy: v.string(),
    createdAt: v.number(),
    lastModifiedBy: v.string(),
    lastModifiedAt: v.number(),
  })
    .index("by_org_year", ["orgId", "reportingYear"])
    .index("by_orgNumber_year", ["orgNumber", "reportingYear"])
    .index("by_orgId", ["orgId"]),
})
