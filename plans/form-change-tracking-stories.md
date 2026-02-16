# Form Change Tracking - Implementation Stories

This document breaks down the form change tracking implementation into smaller, manageable stories/tasks.

## Overview

We are implementing a form change tracking system for VSME reporting. The system will:
- Save form data to Convex DB with change tracking
- Support 4 form pages (General, Environmental, Social, Governance)
- Track version history (last 4 versions) with rollback capability
- Support draft/submitted status workflow

**Plan Document:** `plans/form-change-tracking-plan.md`

---

## Story 1: Database Schema

**Goal:** Add 4 form tables to Convex schema with proper indexes.

**Files to modify:**
- `convex/schema.ts`

**Tasks:**
1. Add `formGeneral` table with indexes
2. Add `formEnvironmental` table with indexes
3. Add `formSocial` table with indexes
4. Add `formGovernance` table with indexes

**Schema Structure (each table):**
```typescript
defineTable({
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
  .index("by_orgId", ["orgId"])
```

**References:**
- Convex schema conventions: `.agent/skills/convex/SKILL.md`
- Existing schema: `convex/schema.ts`

---

## Story 2: Convex Form Utilities

**Goal:** Create shared types and utilities for form operations.

**Files to create:**
- `convex/forms/_utils.ts`

**Tasks:**
1. Define `FormTable` type union
2. Define `FormVersion` interface
3. Define `FieldChange` interface
4. Create `detectChanges()` function for diff detection

**Code Example:**
```typescript
// convex/forms/_utils.ts
import { v } from "convex/values"

export type FormTable = "formGeneral" | "formEnvironmental" | "formSocial" | "formGovernance"

export const formTableValidator = v.union(
  v.literal("formGeneral"),
  v.literal("formEnvironmental"),
  v.literal("formSocial"),
  v.literal("formGovernance")
)

export interface FieldChange {
  field: string
  oldValue: unknown
  newValue: unknown
}

export interface FormVersion {
  version: number
  data: any
  changes: FieldChange[]
  changedBy: string
  changedAt: number
}

export function detectChanges(oldData: Record<string, any>, newData: Record<string, any>): FieldChange[] {
  const changes: FieldChange[] = []
  
  for (const key of Object.keys(newData)) {
    if (!isEqual(oldData[key], newData[key])) {
      changes.push({
        field: key,
        oldValue: oldData[key],
        newValue: newData[key]
      })
    }
  }
  
  return changes
}

// Simple deep equality check
function isEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
```

**References:**
- Convex validators: `.agent/skills/convex/SKILL.md`

---

## Story 3: Save Form Mutation

**Goal:** Create generic mutation to save form data with change tracking.

**Files to create:**
- `convex/forms/save.ts`

**Tasks:**
1. Create `saveForm` mutation with table parameter
2. Handle new form creation
3. Handle existing form update with change detection
4. Trim version history to last 4 versions

**Code Example:**
```typescript
// convex/forms/save.ts
import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireUserId, requireOrgId } from "../_utils/auth"
import { formTableValidator, detectChanges, type FormVersion } from "./_utils"

export const saveForm = mutation({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const orgId = await requireOrgId(ctx)
    
    // Get org for orgNumber
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerkOrgId", q => q.eq("clerkOrgId", orgId))
      .first()
    
    if (!org) throw new Error("Organization not found")
    
    // Find existing submission
    const existing = await ctx.db
      .query(args.table)
      .withIndex("by_org_year", q =>
        q.eq("orgId", orgId).eq("reportingYear", args.reportingYear)
      )
      .first()
    
    if (existing) {
      // Calculate changes
      const changes = detectChanges(existing.data, args.data)
      
      // Create new version
      const newVersion: FormVersion = {
        version: existing.versions.length + 1,
        data: args.data,
        changes,
        changedBy: userId,
        changedAt: Date.now(),
      }
      
      // Keep only last 4 versions
      const versions = [...existing.versions, newVersion].slice(-4)
      
      // Update document
      await ctx.db.patch(existing._id, {
        data: args.data,
        versions,
        lastModifiedBy: userId,
        lastModifiedAt: Date.now(),
      })
      
      return { _id: existing._id, version: newVersion.version }
    } else {
      // Create new submission
      const initialVersion: FormVersion = {
        version: 1,
        data: args.data,
        changes: [],
        changedBy: userId,
        changedAt: Date.now(),
      }
      
      const id = await ctx.db.insert(args.table, {
        orgId,
        orgNumber: org.orgNumber ?? "",
        reportingYear: args.reportingYear,
        data: args.data,
        status: "draft",
        versions: [initialVersion],
        createdBy: userId,
        createdAt: Date.now(),
        lastModifiedBy: userId,
        lastModifiedAt: Date.now(),
      })
      
      return { _id: id, version: 1 }
    }
  }
})
```

**References:**
- Auth utilities: `convex/_utils/auth.ts`
- Convex mutations: `.agent/skills/convex/SKILL.md`

---

## Story 4: Get Form Query

**Goal:** Create generic query to retrieve form data.

**Files to create:**
- `convex/forms/get.ts`

**Tasks:**
1. Create `getForm` query with table parameter
2. Return form data or null

**Code Example:**
```typescript
// convex/forms/get.ts
import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireOrgId } from "../_utils/auth"
import { formTableValidator } from "./_utils"

export const getForm = query({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgId(ctx)
    
    return await ctx.db
      .query(args.table)
      .withIndex("by_org_year", q =>
        q.eq("orgId", orgId).eq("reportingYear", args.reportingYear)
      )
      .first()
  }
})
```

---

## Story 5: Get All Forms Query

**Goal:** Create query to retrieve all forms for dashboard.

**Files to create:**
- `convex/forms/getAll.ts`

**Tasks:**
1. Create `getAllForms` query
2. Use `Promise.all` for parallel queries

**Code Example:**
```typescript
// convex/forms/getAll.ts
import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireOrgId } from "../_utils/auth"

export const getAllForms = query({
  args: {
    reportingYear: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgId(ctx)
    
    const [general, environmental, social, governance] = await Promise.all([
      ctx.db.query("formGeneral")
        .withIndex("by_org_year", q => q.eq("orgId", orgId).eq("reportingYear", args.reportingYear))
        .first(),
      ctx.db.query("formEnvironmental")
        .withIndex("by_org_year", q => q.eq("orgId", orgId).eq("reportingYear", args.reportingYear))
        .first(),
      ctx.db.query("formSocial")
        .withIndex("by_org_year", q => q.eq("orgId", orgId).eq("reportingYear", args.reportingYear))
        .first(),
      ctx.db.query("formGovernance")
        .withIndex("by_org_year", q => q.eq("orgId", orgId).eq("reportingYear", args.reportingYear))
        .first(),
    ])
    
    return { general, environmental, social, governance }
  }
})
```

---

## Story 6: Submit and Reopen Mutations

**Goal:** Create mutations for status workflow.

**Files to create:**
- `convex/forms/submit.ts`
- `convex/forms/reopen.ts`

**Tasks:**
1. Create `submitForm` mutation
2. Create `reopenForm` mutation

**Note:** Due to Convex's type system, we'll need to handle the ID type carefully. Consider using string IDs and validating at runtime.

---

## Story 7: Rollback Mutation

**Goal:** Create mutation to rollback to a previous version.

**Files to create:**
- `convex/forms/rollback.ts`

**Tasks:**
1. Create `rollbackToVersion` mutation
2. Find target version
3. Create new version with rollback marker

---

## Story 8: Frontend Hook

**Goal:** Create custom hook for form submission.

**Files to create:**
- `src/hooks/use-form-submission.ts`

**Tasks:**
1. Create `useFormSubmission` hook
2. Integrate with TanStack Form
3. Handle loading existing data
4. Handle save/submit actions

**References:**
- Form conventions: `.agent/skills/form-system/SKILL.md`
- Existing form: `src/components/forms/b1-general-form.tsx`
- Year store: `src/lib/year-store.ts`

---

## Story 9: Form Buttons Component

**Goal:** Create conditional buttons based on form status.

**Files to create:**
- `src/components/form-buttons.tsx`

**Tasks:**
1. Create `FormButtons` component
2. Show Save Draft + Submit for draft status
3. Show Reopen for submitted status

---

## Story 10: Update B1 General Form

**Goal:** Integrate new hook into existing form.

**Files to modify:**
- `src/components/forms/b1-general-form.tsx`

**Tasks:**
1. Replace existing form setup with `useFormSubmission` hook
2. Add `FormButtons` component
3. Connect to year store for reporting year
4. Add version history panel

---

## Story 11: Unit Tests

**Goal:** Add tests for all Convex functions.

**Files to create:**
- `convex/forms/__tests__/save.test.ts`
- `convex/forms/__tests__/get.test.ts`
- `convex/forms/__tests__/rollback.test.ts`

**Tasks:**
1. Test save with new form
2. Test save with existing form
3. Test change detection
4. Test version trimming
5. Test rollback functionality

**References:**
- TDD workflow: `.agent/skills/tdd-workflow/SKILL.md`
- Existing tests: `convex/__tests__/`

---

## Implementation Order

1. **Story 1** - Database Schema (foundation)
2. **Story 2** - Convex Utilities (shared code)
3. **Story 3** - Save Form Mutation (core functionality)
4. **Story 4** - Get Form Query (read data)
5. **Story 5** - Get All Forms Query (dashboard)
6. **Story 6** - Submit/Reopen Mutations (status workflow)
7. **Story 7** - Rollback Mutation (version history)
8. **Story 8** - Frontend Hook (integration)
9. **Story 9** - Form Buttons Component (UI)
10. **Story 10** - Update B1 Form (complete integration)
11. **Story 11** - Unit Tests (TDD)

---

## Notes for Implementation Agent

1. **Follow TDD**: Write tests first, then implement (see `.agent/skills/tdd-workflow/SKILL.md`)
2. **Use existing patterns**: Check `convex/organizations.ts` and `convex/users.ts` for reference
3. **Auth utilities**: Always use `requireUserId` and `requireOrgId` from `convex/_utils/auth.ts`
4. **Form conventions**: Follow `.agent/skills/form-system/SKILL.md` for frontend integration
5. **Convex conventions**: Follow `.agent/skills/convex/SKILL.md` for backend code
