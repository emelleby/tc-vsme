---
trigger: model_decision
description: Rule applies when creating or modifying form validation logic, Zod schemas, field components, or Convex form schemas.
---

# Form Validation Rule

When working with forms, validation, Zod schemas, field components, or Convex form schemas, you **MUST** follow the patterns defined in the Form Validation Guide.

## 🔴 The Rule

All form validation must follow the architecture and patterns documented in:
**`docs/forms/validation-guide.md`**

This document is the **source of truth** for form validation in the TC-VSME project.

## ✅ Required Actions

Before creating or modifying any form-related code:

1. **Read** `docs/forms/validation-guide.md`
2. **Follow** the exact patterns for:
   - Zod schema definitions
   - TanStack Form integration
   - Field component implementations
   - Convex schema validators
   - Convex mutations (save/submit)
3. **Verify** all validation checklist items are met
4. **Avoid** all documented common pitfalls

## 🚨 Critical Rules

### Frontend (Zod Schemas)

- ✅ Use `z.number({ message: '...' })` for required number fields
- ❌ **NEVER** use `z.coerce.number()` (converts empty strings to 0)
- ✅ Always export the inferred type: `export type MyFormValues = z.infer<typeof myFormSchema>`
- ✅ Use `validators: { onSubmit: schema }` for form validation
- ✅ Always include `onSubmitInvalid: ({ formApi }) => focusFirstError(formApi)`

### Field Components (NumberField)

- ✅ Convert empty strings to `undefined`: `rawValue === '' ? undefined : Number(rawValue)`
- ❌ **NEVER** convert empty strings to `0`
- ✅ Display value: `field.state.value ?? ''`
- ✅ Type: `useFieldContext<number | undefined>()`

### Backend (Convex Schemas)

- ✅ Use strict validators for `data` field: `data: v.optional(formGeneralDataValidator)`
- ✅ Use `v.any()` for `draftData` field: `draftData: v.any()`
- ✅ Match Zod and Convex types exactly (string → v.string(), number → v.number())
- ✅ Group validators by form category (General, Environmental, Social, Governance)

### Convex Mutations

- ✅ `saveForm`: No validation, stores in `draftData`
- ✅ `submitForm`: Coerces types, moves to `data` field
- ✅ Always coerce string numbers to actual numbers before submitting

## 📋 Validation Checklist

Before completing any form-related task, verify:

- [ ] Zod schema defined in `src/lib/forms/schemas/`
- [ ] Convex validator defined in `convex/schema.ts`
- [ ] Zod and Convex types match exactly
- [ ] Form uses `validators: { onSubmit: schema }`
- [ ] Form uses `onSubmitInvalid: ({ formApi }) => focusFirstError(formApi)`
- [ ] NumberField converts empty → `undefined` (not `0`)
- [ ] No use of `z.coerce.number()`
- [ ] `draftData` uses `v.any()`, `data` uses typed validator
- [ ] Error messages are user-friendly

## 🔗 Reference

For complete patterns, examples, and detailed explanations, see:
**`docs/forms/validation-guide.md`**

## ⚠️ Why This Matters

Incorrect validation patterns lead to:
- ❌ Empty fields being saved as `0` or `""`
- ❌ Invalid data bypassing validation
- ❌ Poor user experience (can't clear fields)
- ❌ Type mismatches between frontend and backend
- ❌ Data corruption in the database

Following the validation guide ensures:
- ✅ Proper validation of required fields
- ✅ Clean, clearable input fields
- ✅ Type safety across the stack
- ✅ Consistent user experience
- ✅ Data integrity

## 🎯 Quick Examples

### ✅ CORRECT: Required Number Field

**Zod:**
```typescript
revenue: z.number({ message: 'Dette feltet er påkrevd' }).min(0, 'Må være 0 eller mer')
```

**Convex:**
```typescript
revenue: v.number()
```

**NumberField:**
```typescript
const value = rawValue === '' ? undefined : Number(rawValue)
```

### ❌ INCORRECT: Using z.coerce.number()

```typescript
// ❌ DON'T DO THIS
revenue: z.coerce.number().min(0)  // Converts "" to 0, bypasses validation!
```

### ❌ INCORRECT: Converting empty to 0

```typescript
// ❌ DON'T DO THIS
const value = rawValue === '' ? 0 : Number(rawValue)  // User can't clear field!
```

---

**Always consult `docs/forms/validation-guide.md` for complete guidance.**

