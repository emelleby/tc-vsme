# Form Validation Guide

**Version:** 1.0  
**Last Updated:** 2026-02-15  
**Status:** ✅ Source of Truth

This document defines the complete validation architecture for forms in the TC-VSME project, covering both frontend (client-side) and backend (Convex) validation.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Validation](#frontend-validation)
3. [Backend Validation](#backend-validation)
4. [Field Components](#field-components)
5. [Validation Patterns](#validation-patterns)
6. [Common Pitfalls](#common-pitfalls)

---

## Architecture Overview

### Validation Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    VALIDATION LAYERS                         │
└─────────────────────────────────────────────────────────────┘

1. Field Component Layer (NumberField, TextField, etc.)
   ↓ Converts user input to proper types
   
2. Zod Schema Layer (Client-side)
   ↓ Validates on form submission
   
3. TanStack Form Layer
   ↓ Manages validation state & errors
   
4. Convex Mutation Layer (Backend)
   ↓ Type coercion & data integrity
   
5. Convex Schema Layer (Database)
   ↓ Final type validation before storage
```

### Two Submission Paths

| Action         | Validation           | Storage Field            | Status        |
| -------------- | -------------------- | ------------------------ | ------------- |
| **Save Draft** | ❌ None               | `draftData` (v.any())    | `"draft"`     |
| **Submit**     | ✅ Full Zod + Backend | `data` (typed validator) | `"submitted"` |

---

## Frontend Validation

### 1. Zod Schema Definition

**Location:** `src/lib/forms/schemas/`

**Pattern:**
```typescript
import { z } from 'zod'

export const myFormSchema = z.object({
  // String fields
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  
  // Number fields (required)
  revenue: z
    .number({ message: 'Dette feltet er påkrevd' })
    .min(0, 'Må være 0 eller mer'),
  
  // Number fields (optional)
  optionalField: z.number().min(0).optional(),
  
  // Boolean fields
  agreed: z.boolean().refine((v) => v === true, {
    message: 'You must agree to continue',
  }),
  
  // Array fields
  items: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
  })).optional(),
})

export type MyFormValues = z.infer<typeof myFormSchema>
```

**Key Rules:**
- ✅ Use `z.number({ message: '...' })` for required number fields
- ✅ Use `.min()`, `.max()`, `.email()`, `.regex()` for validation
- ✅ Always export the inferred type
- ❌ **NEVER** use `z.coerce.number()` (converts empty strings to 0)
- ❌ **NEVER** use `z.any()` in schemas

---

### 2. TanStack Form Integration

**Location:** `src/hooks/use-form-submission.ts` or component files

**Pattern:**
```typescript
import { useAppForm } from '@/hooks/tanstack-form'
import { focusFirstError } from '@/hooks/use-form'
import { myFormSchema, type MyFormValues } from '@/lib/forms/schemas/my-form-schema'

const form = useAppForm<MyFormValues>({
  defaultValues: {
    name: '',
    revenue: 0,
    agreed: false,
  } as MyFormValues,

  validators: {
    onSubmit: myFormSchema,  // ✅ Validates only on submit
  },

  onSubmitInvalid: ({ formApi }) => {
    focusFirstError(formApi)  // ✅ Auto-focus first error
  },

  onSubmit: async ({ value }) => {
    // Handle submission (only called if validation passes)
    await saveData(value)
  },
})
```

**Validation Modes:**

| Mode       | When                   | Use Case                                    |
| ---------- | ---------------------- | ------------------------------------------- |
| `onSubmit` | On form submission     | ✅ **Recommended** - Best UX, validates once |
| `onChange` | On every keystroke     | ⚠️ Use sparingly - Can be annoying           |
| `onBlur`   | When field loses focus | ⚠️ Use for specific fields only              |

**Key Rules:**
- ✅ Use `validators: { onSubmit: schema }` for most forms
- ✅ Always use `onSubmitInvalid` with `focusFirstError()`
- ✅ Use `form.state.values` to access current form data
- ❌ Don't validate on every keystroke unless necessary

---

### 3. Error Display

**Automatic Error Handling:**

The `Field` component automatically shows errors when:
1. Field has been touched (`isTouched`)
2. Field has validation errors (`!isValid`)

**Visual Feedback:**
- Red border on invalid fields (`data-invalid` attribute)
- Error message below field (via `FieldError` component)
- First invalid field gets focus on submit

**Example:**
```typescript
// Field component automatically handles this
<Field data-invalid={isInvalid}>
  <FieldLabel>Revenue</FieldLabel>
  <InputGroupInput value={field.state.value} ... />
  {isInvalid && <FieldError errors={field.state.meta.errors} />}
</Field>
```

---

## Backend Validation

### 1. Convex Schema Validators

**Location:** `convex/schema.ts`

**Pattern:**
```typescript
import { v } from 'convex/values'

// Define data validator for each form section
const myFormDataValidator = v.object({
  reportingYear: v.string(),
  revenue: v.number(),
  balanceSheetTotal: v.number(),
  employees: v.number(),
  organizationName: v.string(),
  // ... all fields with strict types
})

// Group validators by form category
const formGeneralDataValidator = v.union(
  companyInfoDataValidator,
  sustainabilityInitiativesDataValidator,
  businessModelDataValidator,
)

const formEnvironmentalDataValidator = v.union(
  energyEmissionsDataValidator,
  // Add more environmental sections here
)

// Apply to table definition
formGeneral: defineTable({
  orgId: v.string(),
  reportingYear: v.number(),
  section: formSectionValidator,
  draftData: v.any(),  // ✅ Flexible for drafts
  data: v.optional(formGeneralDataValidator),  // ✅ Strict for submitted data
  status: v.string(),
  // ...
})
```

**Key Rules:**
- ✅ Use strict validators for `data` field
- ✅ Use `v.any()` for `draftData` field (allows partial saves)
- ✅ Group validators by form category (General, Environmental, Social, Governance)
- ✅ Match Zod schema types exactly (string → v.string(), number → v.number())

---

### 2. Convex Mutations

**Location:** `convex/forms/save.ts`, `convex/forms/submit.ts`

**Save Draft (No Validation):**
```typescript
export const saveForm = mutation({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
    section: formSectionValidator,
    data: v.any(),  // ✅ Accepts any data for drafts
  },
  handler: async (ctx, args) => {
    // Save to draftData field (no validation)
    await ctx.db.patch(existing._id, {
      draftData: args.data,  // ✅ Stored as-is
      status: "draft",
    })
  }
})
```

**Submit Form (With Validation):**
```typescript
export const submitForm = mutation({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
    section: formSectionValidator,
  },
  handler: async (ctx, args) => {
    const existing = await getFormRecordBySection(...)

    // Type coercion for safety
    const dataToSubmit = { ...existing.draftData }
    const numericFields = ['revenue', 'balanceSheetTotal', 'employees']
    for (const key of numericFields) {
      if (typeof dataToSubmit[key] === 'string' && dataToSubmit[key] !== '') {
        dataToSubmit[key] = Number(dataToSubmit[key])
      }
    }

    // Move to strict data field (triggers schema validation)
    await ctx.db.patch(existing._id, {
      data: dataToSubmit,  // ✅ Validated against schema
      status: "submitted",
    })
  }
})
```

**Key Rules:**
- ✅ `saveForm`: No validation, stores in `draftData`
- ✅ `submitForm`: Coerces types, moves to `data` field
- ✅ Always coerce string numbers to actual numbers
- ✅ Convex schema validates `data` field on insert/patch

---

## Field Components

### NumberField Component

**Location:** `src/components/form-fields/NumberField.tsx`

**Critical Implementation:**
```typescript
export function NumberField({ ... }: NumberFieldProps) {
  const field = useFieldContext<number | undefined>()

  const handleChange = (rawValue: string) => {
    // ✅ Convert empty string to undefined (not 0!)
    const value = rawValue === '' ? undefined : Number(rawValue)
    field.handleChange(value)
  }

  return (
    <InputGroupInput
      type="number"
      value={field.state.value ?? ''}  // ✅ Display empty string if undefined
      onChange={(e) => handleChange(e.target.value)}
    />
  )
}
```

**Why This Matters:**

| Approach                        | Empty Input → | Zod Validation          | UX                       |
| ------------------------------- | ------------- | ----------------------- | ------------------------ |
| ❌ `rawValue === '' ? 0`         | `0`           | ✅ Passes (0 >= 0)       | User can't clear field   |
| ❌ `rawValue === '' ? ''`        | `""`          | ✅ Passes (coerced to 0) | Invalid data saved       |
| ✅ `rawValue === '' ? undefined` | `undefined`   | ❌ Fails correctly       | Clean, proper validation |

**Key Rules:**
- ✅ Empty input → `undefined` (not `0` or `""`)
- ✅ Display value: `field.state.value ?? ''`
- ✅ Type: `useFieldContext<number | undefined>()`
- ❌ **NEVER** convert empty strings to `0`

---

## Validation Patterns

### Pattern 1: Required Number Field

**Zod Schema:**
```typescript
revenue: z
  .number({ message: 'Dette feltet er påkrevd' })
  .min(0, 'Må være 0 eller mer')
```

**Convex Schema:**
```typescript
revenue: v.number()
```

**Field Component:**
```typescript
<NumberField label="Revenue" unit="NOK" />
```

---

### Pattern 2: Optional Number Field

**Zod Schema:**
```typescript
optionalRevenue: z.number().min(0).optional()
```

**Convex Schema:**
```typescript
optionalRevenue: v.optional(v.number())
```

---

### Pattern 3: Required String Field

**Zod Schema:**
```typescript
organizationName: z.string().min(1, 'Organization name is required')
```

**Convex Schema:**
```typescript
organizationName: v.string()
```

---

### Pattern 4: Email Field

**Zod Schema:**
```typescript
email: z.email('Invalid email address')
```

**Convex Schema:**
```typescript
email: v.string()
```

---

### Pattern 5: Boolean with Refinement

**Zod Schema:**
```typescript
termsAgreed: z.boolean().refine((v) => v === true, {
  message: 'You must agree to the terms',
})
```

**Convex Schema:**
```typescript
termsAgreed: v.boolean()
```

---

### Pattern 6: Array of Objects

**Zod Schema:**
```typescript
subsidiaries: z.array(
  z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
  })
).optional()
```

**Convex Schema:**
```typescript
subsidiaries: v.optional(
  v.array(
    v.object({
      id: v.string(),
      name: v.string(),
      address: v.string(),
    })
  )
)
```

---

## Common Pitfalls

### ❌ Pitfall 1: Using `z.coerce.number()`

**Problem:**
```typescript
// ❌ BAD
revenue: z.coerce.number().min(0)
```

**Why:** Converts empty string `""` to `0`, bypassing validation.

**Solution:**
```typescript
// ✅ GOOD
revenue: z.number({ message: 'Dette feltet er påkrevd' }).min(0)
```

---

### ❌ Pitfall 2: Converting Empty Strings to `0` in NumberField

**Problem:**
```typescript
// ❌ BAD
const value = rawValue === '' ? 0 : Number(rawValue)
```

**Why:** User can never clear the field, always shows `0`.

**Solution:**
```typescript
// ✅ GOOD
const value = rawValue === '' ? undefined : Number(rawValue)
```

---

### ❌ Pitfall 3: Not Using `onSubmitInvalid`

**Problem:**
```typescript
// ❌ BAD - No error focus
const form = useAppForm({
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => { ... },
})
```

**Why:** User doesn't know which field has an error.

**Solution:**
```typescript
// ✅ GOOD
const form = useAppForm({
  validators: { onSubmit: schema },
  onSubmitInvalid: ({ formApi }) => focusFirstError(formApi),
  onSubmit: async ({ value }) => { ... },
})
```

---

### ❌ Pitfall 4: Mismatched Zod and Convex Types

**Problem:**
```typescript
// Zod schema
revenue: z.string()

// Convex schema
revenue: v.number()  // ❌ Type mismatch!
```

**Why:** Data will fail Convex validation on submit.

**Solution:**
```typescript
// ✅ Both use number
revenue: z.number({ message: 'Required' }).min(0)
revenue: v.number()
```

---

### ❌ Pitfall 5: Using `v.any()` for Submitted Data

**Problem:**
```typescript
// ❌ BAD
formGeneral: defineTable({
  data: v.optional(v.any()),  // No type safety!
})
```

**Why:** Loses all type validation benefits.

**Solution:**
```typescript
// ✅ GOOD
formGeneral: defineTable({
  draftData: v.any(),  // OK for drafts
  data: v.optional(formGeneralDataValidator),  // Strict for submitted
})
```

---

## Quick Reference

### Validation Checklist

- [ ] Zod schema defined in `src/lib/forms/schemas/`
- [ ] Convex validator defined in `convex/schema.ts`
- [ ] Zod and Convex types match exactly
- [ ] Form uses `validators: { onSubmit: schema }`
- [ ] Form uses `onSubmitInvalid: ({ formApi }) => focusFirstError(formApi)`
- [ ] NumberField converts empty → `undefined` (not `0`)
- [ ] No use of `z.coerce.number()`
- [ ] `draftData` uses `v.any()`, `data` uses typed validator
- [ ] Error messages are user-friendly (Norwegian for Norwegian users)

---

**End of Document**

