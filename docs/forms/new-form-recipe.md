# New Form Recipe (TC-VSME)

**Purpose:** Quick implementation pattern for adding a new FormCard section (frontend + Convex) with consistent validation.

**Last Updated:** 2026-02-17

---

## 1) Create frontend schema

Create a file in `src/lib/forms/schemas/`, for example:
- `src/lib/forms/schemas/bX-my-form-schema.ts`

Pattern:

```ts
import { z } from 'zod'

export const bXMyFormSchema = z.object({
  reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
  myBoolean: z.boolean(),
  myRequiredNumber: z.number({ message: 'Dette feltet er påkrevd' }).min(0, 'Må være 0 eller mer'),
  myOptionalNumber: z.number().min(0, 'Må være 0 eller mer').optional(),
  myOptionalText: z.string().optional(),
})

export type BXMyFormValues = z.infer<typeof bXMyFormSchema>
```

### Conditional required fields
Use `superRefine` with raw string issue code (not `ZodIssueCode`):

```ts
.superRefine((values, ctx) => {
  if (!values.myBoolean) return

  if (values.myOptionalNumber === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['myOptionalNumber'],
      message: 'Feltet er påkrevd',
    })
  }
})
```

---

## 2) Create form component

Create `src/components/forms/bX-my-form.tsx`.

Required structure:
- Use `useFormSubmission<T>()`
- Set `table`, `reportingYear`, `section`, `schema`, `defaultValues`
- Hidden `reportingYear` field
- Main fields inside `Card` + `CardContent`
- Use `listeners.onChange` + `form.Subscribe` for conditional UI

Pattern:

```tsx
const { form, status, isSaving, isLoading, saveDraft, submit, reopen } =
  useFormSubmission<BXMyFormValues>({
    table: Depending on which route page category it is, formGeneral, formEnvironmental, formSocial or formGovernance
    reportingYear,
    section: 'mySectionKey',
    schema: bXMyFormSchema,
    defaultValues: {
      reportingYear: reportingYear.toString(),
      myBoolean: false,
    } as BXMyFormValues,
  })
```

### Field type guidance
- Use `NumberField` for numeric values.
- Use `TextField` for textual values (even if label is a “count” description).
- Use `SwitchField` for boolean toggles.
- For `NumberField` with unit, pass `unit="..."`.

---

## 3) Register section type in Convex form utils

Update `convex/forms/_utils.ts`:
- Add section key to `FormSection` union type
- Add same key to `formSectionValidator`

Example section key:
- `'mySectionKey'`

---

## 4) Register strict backend validator in Convex schema

Update `convex/schema.ts`:
- Add `v.literal('mySectionKey')` to `formSectionValidator`
- Add `mySectionDataValidator` object matching frontend schema types
- Add validator to category union (e.g. `formEnvironmentalDataValidator`)

**Important:** Backend type must match frontend schema type exactly.

---

## 5) Route/FormCard wiring

Update route page (ask if not sure which page it should be on):
- Import new form component
- Read `formSections?.mySectionKey`
- Render inside `FormCard`

This gives:
- contributor/status/version metadata
- save draft / submit / reopen lifecycle

---

## 6) Submit-time numeric coercion (only if needed)

File: `convex/forms/submit.ts`

If any numeric fields may arrive as strings, include them in `numericFields` coercion list.
Do **not** include text fields in this list.

---

## 7) Quick verification checklist

- [ ] `get_errors` clean for edited files
- [ ] New section key exists in both:
  - `convex/forms/_utils.ts`
  - `convex/schema.ts`
- [ ] Frontend schema type == Convex validator type
- [ ] Route uses `formSections?.<sectionKey>` (no placeholder key)
- [ ] Conditional fields are both:
  - hidden in UI (`form.Subscribe`)
  - validated in schema (`superRefine`)

---

## Notes from recent cleanup

- Prefer `code: 'custom'` in Zod issues (instead of deprecated `ZodIssueCode`).
- Prefer `z.number('...').min(0, '...')` over legacy patterns like `required_error`.
- For employee count style fields, use integer numbers:
  - `.number(...).int(...).min(0, ...)`
  instead of bigint/coercion unless bigint is explicitly required.
