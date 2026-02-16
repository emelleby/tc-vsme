# Multi-FormCard Contributor Tracking Plan

## Problem Statement

The General page has multiple FormCards (e.g., "Company information", "Sustainability initiatives"), each needing its own contributor and last modified date. Currently, the `formGeneral` table only has document-level `lastModifiedBy` and `lastModifiedAt` fields, which don't support section-specific tracking.

## Current Structure

```typescript
// convex/schema.ts
formGeneral: defineTable({
  orgId: v.string(),
  orgNumber: v.string(),
  reportingYear: v.number(),
  draftData: v.any(),              // Form data
  data: v.optional(v.any()),       // Submitted data
  status: v.string(),              // "draft" | "submitted"
  versions: v.array(v.any()),      // Version history
  createdBy: v.string(),
  createdAt: v.number(),
  lastModifiedBy: v.string(),      // Document-level only
  lastModifiedAt: v.number(),      // Document-level only
})
```

## Proposed Solution: Separate Records Per Section

Create separate records for each FormCard section. Each record has its own `lastModifiedBy` and `lastModifiedAt` fields, making it simple to track contributors per section.

### Schema Changes

Add a `section` field to identify which FormCard the record belongs to:

```typescript
// Section enum validator
const formSectionValidator = v.union(
  v.literal("companyInfo"),
  v.literal("sustainabilityInitiatives"),
)

// Updated formGeneral table
formGeneral: defineTable({
  orgId: v.string(),
  orgNumber: v.string(),
  reportingYear: v.number(),
  section: formSectionValidator,       // NEW: Identifies which FormCard
  draftData: v.any(),
  data: v.optional(v.any()),
  status: v.string(),
  versions: v.array(v.any()),
  createdBy: v.string(),
  createdAt: v.number(),
  lastModifiedBy: v.string(),          // Now section-specific
  lastModifiedAt: v.number(),          // Now section-specific
})
  .index("by_org_year", ["orgId", "reportingYear"])
  .index("by_org_year_section", ["orgId", "reportingYear", "section"])  // NEW
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│              formGeneral Record 1                           │
├─────────────────────────────────────────────────────────────┤
│ orgId: "org_123"                                            │
│ reportingYear: 2024                                         │
│ section: "companyInfo"                                      │
│ draftData: { ... }                                          │
│ lastModifiedBy: "user_123"                                  │
│ lastModifiedAt: 1707111111111                               │
│ status: "submitted"                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              formGeneral Record 2                           │
├─────────────────────────────────────────────────────────────┤
│ orgId: "org_123"                                            │
│ reportingYear: 2024                                         │
│ section: "sustainabilityInitiatives"                        │
│ draftData: { ... }                                          │
│ lastModifiedBy: "user_456"                                  │
│ lastModifiedAt: 1707123456789                               │
│ status: "draft"                                             │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### 1. Update Schema (convex/schema.ts)

- Add `formSectionValidator` union type
- Add `section` field to `formGeneral` table
- Add composite index `by_org_year_section`

### 2. Update Utils (convex/forms/_utils.ts)

- Add `FormSection` type export
- Add `formSectionValidator` export
- Add helper function to get form record by section

```typescript
export type FormSection = "companyInfo" | "sustainabilityInitiatives"

export async function getFormRecordBySection(
  ctx: any,
  table: FormTable,
  orgId: string,
  reportingYear: number,
  section: FormSection
) {
  return await ctx.db
    .query(table)
    .withIndex("by_org_year_section", (q: any) =>
      q.eq("orgId", orgId)
       .eq("reportingYear", reportingYear)
       .eq("section", section)
    )
    .first()
}
```

### 3. Update Save Mutation (convex/forms/save.ts)

- Add `section` as a required argument
- Query by section when checking for existing records
- Create new records with section field

```typescript
export const saveForm = mutation({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
    section: formSectionValidator,  // Required
    data: v.any(),
  },
  handler: async (ctx, args) => {
    // ... auth checks ...
    
    const existing = await getFormRecordBySection(
      ctx, args.table, orgId, args.reportingYear, args.section
    )
    
    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        draftData: args.data,
        lastModifiedBy: userId,
        lastModifiedAt: Date.now(),
        // ... version handling ...
      })
    } else {
      // Create new record with section
      await ctx.db.insert(args.table, {
        orgId,
        orgNumber: org.orgNumber ?? "",
        reportingYear: args.reportingYear,
        section: args.section,  // NEW
        draftData: args.data,
        status: "draft",
        // ... other fields ...
      })
    }
  }
})
```

### 4. Update Get Query (convex/forms/get.ts)

- Add `section` as a required argument
- Query by section

```typescript
export const getForm = query({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
    section: formSectionValidator,  // Required
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgId(ctx)
    return await getFormRecordBySection(ctx, args.table, orgId, args.reportingYear, args.section)
  }
})
```

### 5. Add Get All Sections Query (convex/forms/get.ts)

- Add query to fetch all sections for a reporting year

```typescript
export const getFormAllSections = query({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgId(ctx)
    
    const records = await ctx.db
      .query(args.table)
      .withIndex("by_org_year", (q: any) =>
        q.eq("orgId", orgId).eq("reportingYear", args.reportingYear)
      )
      .collect()
    
    // Return as a map for easy lookup
    return Object.fromEntries(
      records.map(r => [r.section, r])
    )
  }
})
```

### 6. Update Frontend (src/routes/_appLayout/app/general/index.tsx)

- Fetch all sections with a single query
- Map records to FormCards by section

```typescript
function GeneralPage() {
  const reportingYear = useStore(yearStore, (state) => state.selectedYear)
  const { organization } = useOrganization()
  
  // Fetch all form sections for the reporting year
  const formSections = useQuery(
    api.forms.get.getFormAllSections,
    organization?.id 
      ? { table: 'formGeneral', reportingYear }
      : 'skip'
  )
  
  // Extract section-specific data
  const companyInfo = formSections?.companyInfo
  const sustainability = formSections?.sustainabilityInitiatives
  
  return (
    <>
      <FormCard
        title="Company information"
        updatedDate={formatDate(companyInfo?.lastModifiedAt)}
        contributor={{ name: getContributorName(companyInfo?.lastModifiedBy) }}
        status={companyInfo?.status ?? 'draft'}
      >
        <B1GeneralForm section="companyInfo" />
      </FormCard>
      
      <FormCard
        title="Sustainability initiatives"
        updatedDate={formatDate(sustainability?.lastModifiedAt)}
        contributor={{ name: getContributorName(sustainability?.lastModifiedBy) }}
        status={sustainability?.status ?? 'draft'}
      >
        {/* Future form component */}
      </FormCard>
    </>
  )
}
```

### 7. Update useFormSubmission Hook

- Pass section to save mutation

```typescript
interface UseFormSubmissionProps<TData> {
  table: FormTable
  reportingYear: number
  section: FormSection  // NEW
  defaultValues: TData
  schema: any
}

// In handleSaveDraft:
await saveForm({
  table,
  reportingYear,
  section,  // NEW
  data: data || form.state.values,
})
```

### 8. Update B1GeneralForm Component

- Pass section to useFormSubmission

```typescript
export function B1GeneralForm() {
  const reportingYear = useYearStore(yearStore, (state) => state.selectedYear)
  
  const { form, ... } = useFormSubmission<B1GeneralFormValues>({
    table: 'formGeneral',
    reportingYear,
    section: 'companyInfo',  // NEW
    schema: b1GeneralSchema,
    defaultValues: { ... },
  })
  
  // ...
}
```

## Contributor Display Flow

This section details how contributor information flows from the database to the FormCard component.

### The Challenge

The `lastModifiedBy` field stores a Clerk user ID (e.g., `user_123`), but the FormCard needs to display a human-readable name (e.g., "John Doe"). We need to:

1. Fetch the form record(s) to get `lastModifiedBy` and `lastModifiedAt`
2. Resolve the Clerk user ID to a display name
3. Format the timestamp to a readable date
4. Pass both to the FormCard component

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  formGeneral table                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ section: "companyInfo"                                               │   │
│  │ lastModifiedBy: "user_123"  ← Clerk ID                               │   │
│  │ lastModifiedAt: 1707111111111  ← Unix timestamp                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              QUERY LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  getFormAllSections query returns:                                          │
│  {                                                                          │
│    companyInfo: { lastModifiedBy: "user_123", lastModifiedAt: 1707... },   │
│    sustainabilityInitiatives: { lastModifiedBy: "user_456", ... }          │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  GeneralPage component:                                                     │
│  1. Fetches all sections via getFormAllSections                             │
│  2. For each section with lastModifiedBy, fetches user display name         │
│  3. Formats timestamp to readable date                                      │
│  4. Passes to FormCard as props                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Implementation: User Display Name Resolution

#### Option A: Batch User Lookup (Recommended)

Fetch all contributor names in a single query:

```typescript
// convex/forms/get.ts
export const getFormAllSectionsWithContributors = query({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgId(ctx)
    
    const records = await ctx.db
      .query(args.table)
      .withIndex("by_org_year", (q: any) =>
        q.eq("orgId", orgId).eq("reportingYear", args.reportingYear)
      )
      .collect()
    
    // Get unique contributor IDs
    const contributorIds = [...new Set(records.map(r => r.lastModifiedBy))]
    
    // Fetch all contributors in parallel
    const contributors = await Promise.all(
      contributorIds.map(async (clerkId) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkId", q => q.eq("clerkId", clerkId))
          .first()
        return [clerkId, user] as const
      })
    )
    
    // Build contributor lookup map
    const contributorMap = Object.fromEntries(
      contributors.map(([clerkId, user]) => [
        clerkId,
        user ? {
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Unknown',
        } : { name: 'Unknown' }
      ])
    )
    
    // Return sections with resolved contributor info
    return Object.fromEntries(
      records.map(r => [
        r.section,
        {
          ...r,
          contributor: contributorMap[r.lastModifiedBy] || { name: 'Unknown' },
        }
      ])
    )
  }
})
```

#### Option B: Separate User Query

Use a separate query to resolve user names on the frontend:

```typescript
// convex/users.ts
export const getDisplayNames = query({
  args: {
    clerkIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx)
    
    const users = await Promise.all(
      args.clerkIds.map(async (clerkId) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkId", q => q.eq("clerkId", clerkId))
          .first()
        return [clerkId, user] as const
      })
    )
    
    return Object.fromEntries(
      users.map(([clerkId, user]) => [
        clerkId,
        user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
        } : null
      ])
    )
  }
})
```

### Recommended Approach: Option A (Batch User Lookup)

**Why Option A is better:**
1. **Single query** - All data fetched in one Convex call
2. **No N+1 problem** - Contributors resolved efficiently on the server
3. **Simpler frontend** - No need to manage multiple query states
4. **Better performance** - Reduced network round trips

### Frontend Implementation

```typescript
// src/routes/_appLayout/app/general/index.tsx

/**
 * Format a timestamp to a human-readable date string
 */
function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return 'Never'
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function GeneralPage() {
  const reportingYear = useStore(yearStore, (state) => state.selectedYear)
  const { organization } = useOrganization()
  
  // Single query fetches all sections with resolved contributor names
  const formSections = useQuery(
    api.forms.get.getFormAllSectionsWithContributors,
    organization?.id 
      ? { table: 'formGeneral', reportingYear }
      : 'skip'
  )
  
  // Extract section-specific data with contributor already resolved
  const companyInfo = formSections?.companyInfo
  const sustainability = formSections?.sustainabilityInitiatives
  
  return (
    <div className="grid gap-4 md:grid-cols-1 mt-4 max-w-6xl w-full mx-auto">
      <h1 className="text-2xl font-bold">General information</h1>
      
      <FormCard
        title="Company information"
        updatedDate={formatDate(companyInfo?.lastModifiedAt)}
        contributor={companyInfo?.contributor || { name: 'Unknown' }}
        status={companyInfo?.status ?? 'draft'}
        toolTip="Click to expand"
      >
        <B1GeneralForm section="companyInfo" />
      </FormCard>
      
      <FormCard
        title="Sustainability initiatives"
        updatedDate={formatDate(sustainability?.lastModifiedAt)}
        contributor={sustainability?.contributor || { name: 'Unknown' }}
        status={sustainability?.status ?? 'draft'}
        toolTip="Click to expand"
      >
        {/* Future form component */}
      </FormCard>
    </div>
  )
}
```

### FormCard Props Interface

The FormCard component expects:

```typescript
interface FormCardProps {
  title: string
  updatedDate: string          // Formatted date string (e.g., "Mar 1, 2024")
  contributor: { name: string; image?: string }
  status: string               // "draft" | "submitted"
  toolTip: string
  buttonText?: string
  onClick?: () => void
  children?: React.ReactNode
}
```

### Summary: Data Flow Steps

1. **Database**: `formGeneral` records contain `lastModifiedBy` (Clerk ID) and `lastModifiedAt` (timestamp)
2. **Query**: `getFormAllSectionsWithContributors` fetches all sections and resolves contributor names
3. **Frontend**: `GeneralPage` receives data with contributor names already resolved
4. **Formatting**: `formatDate()` converts timestamp to readable string
5. **Display**: `FormCard` receives `updatedDate` and `contributor` props

## Benefits of This Approach

1. **Simplicity**: Each record is self-contained with its own metadata
2. **Natural CRUD**: Standard create/update operations work without special logic
3. **Independent Versioning**: Each section has its own version history
4. **Easy Queries**: Single query can fetch all sections, or query specific section
5. **Scalable**: Adding new sections just requires adding to the union type

## Migration Considerations

For existing data without a `section` field:
1. Default to `companyInfo` for existing records
2. Run a migration script to set section field on existing records
3. Use `v.optional()` temporarily during transition

## Checklist

### Backend Changes
- [ ] Update schema with `section` field and new index
- [ ] Add `FormSection` type and validators to `_utils.ts`
- [ ] Add `getFormRecordBySection` helper function
- [ ] Update `saveForm` mutation to require `section`
- [ ] Update `getForm` query to require `section`
- [ ] Add `getFormAllSectionsWithContributors` query (includes user resolution)

### Frontend Changes
- [ ] Update `useFormSubmission` hook to accept `section`
- [ ] Update `B1GeneralForm` to pass `section`
- [ ] Update `GeneralPage` to use `getFormAllSectionsWithContributors`
- [ ] Add `formatDate` helper function
- [ ] Map section data to FormCard props

### Testing
- [ ] Add tests for new query functions
- [ ] Add tests for section-specific save logic
- [ ] Add tests for contributor resolution
