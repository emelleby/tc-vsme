---
name: form-system
description: Enforces project form system conventions when creating or modifying forms using the custom TanStack Form integration. This skill covers useAppForm hook usage, field components, focus management, validation patterns, and accessibility requirements.
---

# Form System Skill

## Purpose

This skill enforces the project form system conventions automatically during form development. It ensures consistent patterns for form hooks, field components, focus management, validation, server action integration, and accessibility.

## Activation

This skill activates when:

- Creating forms with `useAppForm` hook from `@/hooks/tanstack-form`
- Using field components (`TextField`, `TextareaField`, `SelectField`, `SwitchField`, `CountryField`, `ImageField`, `RadioGroupField`)
- Implementing focus management with `focusFirstError` from `@/hooks/use-form`
- Setting up form validation with Zod schemas and `b1GeneralSchema`
- Using `form.AppField` for field rendering which provides pre-bound field components
- Using `form.SubmitButton` or `form.AppForm` wrappers
- Using `form.Subscribe` for conditional fields or derived values
- Implementing array fields with `field.pushValue` and `field.removeValue`

## Workflow

1. Detect form work (imports from `@/components/ui/form` or `useAppForm`)
2. Load `references/Form-System-Conventions.md`
3. Generate/modify code following all conventions
4. Scan for violations of form patterns
5. Auto-fix all violations (no permission needed)
6. Report fixes applied

## Key Patterns

### Form Setup

- Use `useAppForm` hook from `@/hooks/tanstack-form`
- Configure validation with `validators: { onDynamic: zodSchema }` for real-time feedback or `onSubmit`
- Handle invalid submissions with `onSubmitInvalid: ({ formApi }) => focusFirstError(formApi)`
- Logic revalidation: `validationLogic: revalidateLogic()`

### Field Rendering

- Use `form.AppField` with the provided field components on the render prop:
  - `(field) => <field.TextField label="Label" />`
  - Components include: `TextField`, `SelectField`, `TextareaField`, `CountryField`, `SwitchField`, `ImageField`, `RadioGroupField`
- Group fields using `FieldGroup` for visual structure

### Form Submission

- Wrap form in `form.AppForm`
- Use `<form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }}>`
- Use `form.SubmitButton` for automatic loading state

### Dynamic Fields & State

- Use `form.Subscribe` to listen to field changes for conditional rendering
- Use `field.pushValue`/`field.removeValue` for array fields (e.g., subsidiaries)
- Use `useStore(form.store, (state) => ...)` for custom state access

## References

- `references/Form-System-Conventions.md` - Complete form system conventions
