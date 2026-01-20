# Story 5: Code Examples & Quick Reference

## Quick Start Guide

### 1. Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  organizations: defineTable({
    clerkOrgId: v.string(),
    name: v.string(),
  }).index('by_clerkOrgId', ['clerkOrgId']),
  
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    organizationIds: v.array(v.string()),
    updatedAt: v.number(),
  })
    .index('by_clerkId', ['clerkId'])
    .index('by_email', ['email']),
})
```

### 2. Organizations Mutations

```typescript
// convex/organizations.ts
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createOrganization = mutation({
  args: { clerkOrgId: v.string(), name: v.string() },
  returns: v.id('organizations'),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()
    
    if (existing) throw new Error('Organization already exists')
    
    return await ctx.db.insert('organizations', {
      clerkOrgId: args.clerkOrgId,
      name: args.name,
    })
  },
})

export const getByClerkOrgId = query({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('organizations')
      .withIndex('by_clerkOrgId', (q) => q.eq('clerkOrgId', args.clerkOrgId))
      .unique()
  },
})
```

### 3. Users Mutations

```typescript
// convex/users.ts
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

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
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique()
    
    if (existing) {
      const orgIds = existing.organizationIds || []
      if (!orgIds.includes(args.organizationId)) {
        await ctx.db.patch(existing._id, {
          organizationIds: [...orgIds, args.organizationId],
          updatedAt: Date.now(),
        })
      }
      return existing._id
    }
    
    const userData: any = {
      clerkId: args.clerkId,
      email: args.email,
      organizationIds: [args.organizationId],
      updatedAt: Date.now(),
    }
    
    if (args.firstName) userData.firstName = args.firstName
    if (args.lastName) userData.lastName = args.lastName
    if (args.username) userData.username = args.username
    
    return await ctx.db.insert('users', userData)
  },
})

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique()
  },
})
```

### 4. Server Function (Integration)

```typescript
// src/lib/convex/setup-organization.ts
import { createServerFn } from '@tanstack/react-start'
import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL)

export const setupOrganization = createServerFn({ method: 'POST' })
  .validator((data: { orgId: string; orgName: string }) => data)
  .handler(async ({ data }) => {
    const { userId, orgId } = await auth()
    if (!userId || orgId !== data.orgId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    
    // Create org (ignore if exists)
    try {
      await convex.mutation(api.organizations.createOrganization, {
        clerkOrgId: data.orgId,
        name: data.orgName,
      })
    } catch (e: any) {
      if (!e.message?.includes('already exists')) throw e
    }
    
    // Upsert user
    await convex.mutation(api.users.upsertUser, {
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      username: user.username || undefined,
      organizationId: data.orgId,
    })
    
    // Update Clerk metadata
    await client.organizations.updateOrganizationMetadata(data.orgId, {
      publicMetadata: { hasVsme: true, vsmeDb: true },
    })
    
    return { success: true }
  })
```


