# Form System Conventions

## Overview

The project uses a custom form system built on TanStack Form with integrated field components, focus management, and accessibility features. Forms integrate with server actions via the `useServerAction` hook.

## Architecture

```
src/hooks/
├── tanstack-form.tsx                   # Main useAppForm hook, AppField, and provided components
├── use-form.tsx                        # focusFirstError utility and focus management
└── form-context.ts                     # Form and Field contexts
src/components/form-fields/             # Bound field components
│   ├── TextField.tsx
│   ├── SelectField.tsx
│   ├── SwitchField.tsx
│   ├── TextareaField.tsx
│   └── CountryField.tsx
src/components/ui/field/                # Layout and semantic field components
│   └── index.tsx                       # FieldGroup, FieldLabel, FieldError, etc.
```

## Core Imports

```typescript
import { revalidateLogic, useStore } from '@tanstack/react-form';
import { useAppForm } from '@/hooks/tanstack-form';
import { focusFirstError } from '@/hooks/use-form';
// Optional: If using FieldGroup directly from UI
import { FieldGroup } from '@/components/ui/field';
```

## Complete Form Pattern

```typescript
'use client';

import { revalidateLogic, useStore } from '@tanstack/react-form';
import { useAppForm } from '@/hooks/tanstack-form';
import { focusFirstError } from '@/hooks/use-form';
import { FieldGroup } from '@/components/ui/field';
import { entitySchema, type EntityValues } from '@/lib/forms/schemas/entity-schema';

export function EntityForm() {
  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      isPublic: true,
      tags: [],
    } as EntityValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: entitySchema, // or onSubmit: entitySchema
    },
    onSubmitInvalid: ({ formApi }) => {
      focusFirstError(formApi);
    },
    onSubmit: ({ value }) => {
      console.log('Submitted:', value);
    },
  });

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.AppField name="name">
            {(field) => <field.TextField label="Entity Name" placeholder="Enter name" />}
          </form.AppField>

          <form.AppField name="description">
            {(field) => <field.TextField label="Short Description" />}
          </form.AppField>
        </div>

        <FieldGroup>
          <form.AppField name="isPublic">
            {(field) => (
              <field.SwitchField
                label="Public Access"
                description="Make this visible to everyone"
              />
            )}
          </form.AppField>
        </FieldGroup>

        <div className="flex justify-end">
          <form.SubmitButton label="Save Entity" />
        </div>
      </form>
    </form.AppForm>
  );
}
```

## useAppForm Configuration

### Common Options

```typescript
const form = useAppForm({
  defaultValues: {
    fieldName: 'default value',
  } as FormValues,
  
  onSubmit: async ({ value }) => {
    // Handling submission
  },

  onSubmitInvalid: ({ formApi }) => {
    focusFirstError(formApi); // Focus first error for UX
  },

  validationLogic: revalidateLogic(), // Default revalidation logic

  validators: {
    onDynamic: zodSchema, // Validate as you type/change
    onSubmit: zodSchema,  // Validate on submit
  },
});
```

## Form Components

### AppForm Wrapper

Every form must be wrapped in `form.AppForm` to provide context for sub-components like `SubmitButton`.

```typescript
<form.AppForm>
  <form>...</form>
</form.AppForm>
```

### SubmitButton

The `form.SubmitButton` automatically handles the `isSubmitting` state (showing a spinner and disabling the button).

```typescript
<div className="flex justify-end pt-6">
  <form.SubmitButton label="Submit Changes" />
</div>
```

## Field Components

Field components are accessed via the `field` object provided by `form.AppField`'s render prop.

### Common Field Props

All provided field components support:
- `label`: String, required.
- `description`: String, optional help text.
- `hidden`: Boolean, hides the field (useful for internal IDs).
- `type`: String, input type for `TextField` (text, number, email, etc.).

### TextField
```typescript
<form.AppField name="email">
  {(field) => <field.TextField label="Email Address" type="email" />}
</form.AppField>
```

### SelectField
```typescript
<form.AppField name="category">
  {(field) => (
    <field.SelectField
      label="Category"
      options={[
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ]}
    />
  )}
</form.AppField>
```

### SwitchField
```typescript
<form.AppField name="isActive">
  {(field) => <field.SwitchField label="Is Active?" />}
</form.AppField>
```

### RadioGroupField
```typescript
<form.AppField name="preference">
  {(field) => (
    <field.RadioGroupField
      label="Your Preference"
      options={[
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ]}
    />
  )}
</form.AppField>
```

### ImageField
Used for image selection/upload.
```typescript
<form.AppField name="avatar">
  {(field) => <field.ImageField label="Avatar Image" />}
</form.AppField>
```

### TextareaField
```typescript
<form.AppField name="bio">
  {(field) => <field.TextareaField label="Biography" />}
</form.AppField>
```

### CountryField
Used for country selection, typically using ISO Alpha-3 codes.
```typescript
<form.AppField name="countryCode">
  {(field) => <field.CountryField label="Country" />}
</form.AppField>
```

## Dynamic Rendering & Subscriptions

### form.Subscribe

Use `form.Subscribe` to reactively render parts of the form based on field values.

```typescript
<form.Subscribe selector={(state) => state.values.showDetails}>
  {(showDetails) => showDetails && (
    <FieldGroup>
      {/* Additional fields here */}
    </FieldGroup>
  )}
</form.Subscribe>
```

### Array Fields (Field Arrays)

Handle lists of items using `field.pushValue` and `field.removeValue`.

```typescript
<form.AppField name="items">
  {(field) => (
    <div className="space-y-4">
      {field.state.value.map((item, index) => (
        <div key={item.id} className="flex items-end gap-4">
          <form.AppField name={`items[${index}].name`}>
            {(f) => <f.TextField label="Item Name" />}
          </form.AppField>
          <Button onClick={() => field.removeValue(index)}>Delete</Button>
        </div>
      ))}
      <Button onClick={() => field.pushValue({ id: crypto.randomUUID(), name: '' })}>
        Add Item
      </Button>
    </div>
  )}
</form.AppField>
```

## Extracting Reusable Form Options

For complex forms, extract default values and options to a separate file:

```typescript
// entity-form-options.ts
import type { z } from 'zod';
import { formOptions } from '@tanstack/form-core';
import type { insertEntitySchema } from '@/lib/validations/entity.validation';
import { DEFAULTS } from '@/lib/constants';

export const entityFormOptions = formOptions({
  defaultValues: {
    name: '',
    description: '',
    priority: DEFAULTS.ENTITY.PRIORITY.toString(),
    isActive: DEFAULTS.ENTITY.IS_ACTIVE,
  } as z.input<typeof insertEntitySchema>,
});

// entity-form.tsx
import { entityFormOptions } from './entity-form-options';

const form = useAppForm({
  ...entityFormOptions,
  onSubmit: async ({ value }) => {
    /* ... */
  },
  onSubmitInvalid: ({ formApi }) => {
    /* ... */
  },
  validators: { onSubmit: insertEntitySchema },
});
```

## Field Listeners

Use `listeners` prop on `form.AppField` for field-level side effects:

```typescript
<form.AppField
  listeners={{
    onChange: ({ value }) => {
      // Reset dependent field when this field changes
      form.setFieldValue('dependentField', '');
    },
    onBlur: ({ value }) => {
      // Trigger validation or API call on blur
    },
  }}
  name={'contentType'}
>
  {(field) => (
    <field.SelectField
      label={'Content Type'}
      options={options}
    />
  )}
</form.AppField>
```

## Programmatic Field Operations

```typescript
// Set field value programmatically
form.setFieldValue('fieldName', newValue);

// Validate a specific field
await form.validateField('fieldName', 'change');

// Example: Update multiple fields after API response
const handleContentSelect = async (contentId: string, contentName: string, imageUrl?: string) => {
  form.setFieldValue('contentId', contentId);
  await form.validateField('contentId', 'change');

  if (!currentTitle) {
    form.setFieldValue('title', `Featured: ${contentName}`);
    await form.validateField('title', 'change');
  }

  form.setFieldValue('imageUrl', imageUrl || '/placeholder.jpg');
  await form.validateField('imageUrl', 'change');
};
```

## Field Components

### Common Props (all field components)

```typescript
interface CommonFieldProps {
  description?: string; // Help text below the field
  focusRef?: FocusRef; // Custom ref for focus management
  isRequired?: boolean; // Shows required indicator on label
  label: string; // Required: label text
  testId?: string; // Override auto-generated test ID
}
```

### TextField
## Server Action Integration

Use the `useServerAction` hook to handle the submission lifecycle including loading states and toasts.

```typescript
const { executeAsync, isExecuting } = useServerAction(submitAction, {
  onSuccess: ({ data }) => {
    toast.success('Saved!');
  },
  toastMessages: {
    loading: 'Saving...',
    error: 'Failed to save',
  }
});

const form = useAppForm({
  onSubmit: async ({ value }) => {
    await executeAsync(value);
  },
  // ...
});
```

## Form Layout & Spacing

Consistent spacing is key to the form system's "good design":

- **Grid**: Use `grid grid-cols-1 md:grid-cols-2 gap-6` for two-column layouts.
- **Grouping**: Use `FieldGroup` to wrap related fields with a top/bottom border if they form a logical section.
- **Alignment**: Align the `SubmitButton` to the right using `flex justify-end pt-6`.

## Focus Management

Focus management is handled by `focusFirstError` utility.

1.  Each field component uses `id={name}`.
2.  `onSubmitInvalid` calls `focusFirstError(formApi)`.
3.  `focusFirstError` finds the field name, finds the element by ID, and scrolls/focuses.

**Note**: You no longer need `withFocusManagement` HOC if you use the `focusFirstError` from `@/hooks/use-form`.

## Anti-Patterns

1.  **Direct DOM Manipulation**: Don't try to focus elements manually; use `focusFirstError`.
2.  **Hardcoded Options**: Move reusable field options to `schemas` or `constants`.
3.  **Complex Inline Logic**: Use `form.Subscribe` for complex conditional field logic rather than nested ternaries in the main render.
4.  **Implicit Submission**: Always wrap `form.handleSubmit()` in an explicit handler that prevents default events.
5.  **Missing Field Names**: Ensure `name` on `AppField` matches the Zod schema exactly.
6.  **Neglecting Mobile**: Always test forms with `grid-cols-1` for mobile responsiveness.
