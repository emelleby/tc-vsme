# Address Form Implementation Guide

This guide provides a complete, standalone reference for replicating the Address Form implementation. It includes all necessary code for the backend, shared components, hooks, and the form itself.

## 1. Prerequisites

Ensure your project has the following dependencies:

```bash
npm install @tanstack/react-form zod @tanstack/react-router convex
npm install lucide-react clsx tailwind-merge
# Plus your UI library (e.g., shadcn/ui components: button, input, label, select, etc.)
```

## 2. Backend Setup (Convex)

### `convex/schema.ts` (Implied)
Ensure your Convex schema supports the storage ID and address object structure.

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
    picture: v.optional(v.id("_storage")),
  }),
});
```

### `convex/contacts.ts`
The backend logic for CRUD operations and file upload generation.

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getContacts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contacts").order("desc").collect();
  },
});

export const addContact = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
    phone: v.string(),
    picture: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contacts", args);
  },
});

export const updateContact = mutation({
  args: {
    id: v.id("contacts"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
    phone: v.string(),
    picture: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const deleteContact = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

## 3. Shared Types (Zod Schema)

Create a single source of truth for validation and TypeScript types.

### `src/lib/schemas/contacts.ts`

```typescript
import { z } from 'zod'

export const contactSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	email: z.email('Invalid email address'),
	address: z.object({
		street: z.string().min(1, 'Street address is required'),
		city: z.string().min(1, 'City is required'),
		state: z.string().min(1, 'State is required'),
		zipCode: z.string().min(4, 'Invalid zip code format'),
		country: z.string().min(1, 'Country is required')
	}),
	phone: z
		.string()
		.min(8, 'Invalid phone number format')
		.max(15, 'Invalid phone number format'),
	picture: z.string().optional()
})

export type Contact = z.infer<typeof contactSchema>
```

## 4. Form Infrastructure

Setting up TanStack Form with a custom context allows you to build reusable, type-safe components.

### `src/hooks/demo.form-context.ts`
Defines the context to be used by the components.

```typescript
import { createFormHookContexts } from '@tanstack/react-form'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()
```

### `src/components/demo.FormComponents.tsx`
These are wrappers around your UI library (e.g., Shadcn) that connect to the form state.

```tsx
import { useStore } from "@tanstack/react-form";
// Types and other component imports (Button, Input, Label, etc from your UI lib)
import { useFieldContext, useFormContext } from "@/hooks/demo.form-context";
import { ImagePlus, Trash2, Upload, X } from "lucide-react";
// ... imports

// 1. HELPER: Error Display
function ErrorMessages({ errors }: { errors: Array<string | { message: string }> }) {
	if (errors.length === 0) return null;
	const error = errors[0];
	const message = typeof error === "string" ? error : error.message;
	return <div className="text-red-500 mt-1 font-bold">{message}</div>;
}

// 2. COMPONENT: TextField
export function TextField({ label, placeholder, disabled }: { label: string; placeholder?: string; disabled?: boolean }) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div>
			<Label htmlFor={label} className="mb-2 text-xl font-bold">{label}</Label>
			<Input
				value={field.state.value}
				placeholder={placeholder}
				onBlur={field.handleBlur}
				disabled={disabled}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}

// 3. COMPONENT: Select
// (Similar pattern, wrapping your Select component)
// See source files for full implementation of Select, TextArea, etc.

// 4. COMPONENT: Submit Button
export function SubscribeButton({ label }: { label: string }) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" disabled={isSubmitting}>
					{label}
				</Button>
			)}
		</form.Subscribe>
	);
}
```

### `src/hooks/demo.form.ts`
The factory that creates the `useAppForm` hook with your components injected.

```typescript
import { createFormHook } from "@tanstack/react-form";
import { ImageField, Select, SubscribeButton, TextArea, TextField } from "../components/demo.FormComponents";
import { fieldContext, formContext } from "./demo.form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		Select,
		TextArea,
		ImageField,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
```

## 5. Helper Hooks

### `src/hooks/use-image-upload.tsx`
Handles the client-side logic for file selection and preview generation before upload.

```typescript
import { useCallback, useEffect, useRef, useState } from "react";

interface UseImageUploadProps {
	onUpload?: (url: string) => void;
}

export function useImageUpload({ onUpload }: UseImageUploadProps = {}) {
	const previewRef = useRef<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);

	const handleThumbnailClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (file) {
				setFileName(file.name);
				if (previewUrl) {
					URL.revokeObjectURL(previewUrl);
				}
				const url = URL.createObjectURL(file);
				setPreviewUrl(url);
				previewRef.current = url;
				onUpload?.(url);
			}
		},
		[onUpload, previewUrl],
	);

	const handleRemove = useCallback(() => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		setPreviewUrl(null);
		setFileName(null);
		previewRef.current = null;
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, [previewUrl]);

	useEffect(() => {
		return () => {
			if (previewRef.current) URL.revokeObjectURL(previewRef.current);
		};
	}, []);

	return {
		previewUrl,
		setPreviewUrl,
		fileName,
		setFileName,
		fileInputRef,
		handleThumbnailClick,
		handleFileChange,
		handleRemove,
	};
}
```

## 6. Main Implementation

The final form component that ties everything together.

### `src/routes/demo/form.address.tsx`

Key Patterns:
1.  **Form Initialization**: `useAppForm` with default values typed to `Contact`.
2.  **Validators**: Passing the Zod `contactSchema` to `validators.onBlur` and `validators.onChange`.
3.  **Image Upload Flow**: 
    - `useImageUpload` manages local state.
    - `onSubmit` generates an upload URL -> Uploads file -> Gets `storageId`.
    - Updates form data with `storageId` before sending to `addContact`/`updateContact`.
4.  **Edit vs Create**: Uses `editingId` state to toggle between `addContact` and `updateContact` mutations.
5.  **View Only Mode**: A flag passed to component `disabled` props to lock the UI.

```tsx
// ... imports
import { useAppForm } from '@/hooks/demo.form'
import { contactSchema, type Contact } from '@/lib/schemas/contacts'

function AddressForm() {
    // 1. Setup Data Mutations
    const addContact = useMutation(api.contacts.addContact)
    // ... other mutations

    const imageUpload = useImageUpload()

    // 2. Initialize Form
    const form = useAppForm({
        defaultValues: { /* ... empty defaults ... */ } as Contact,
        validators: {
            onBlur: contactSchema,
            onChange: contactSchema
        },
        onSubmit: async ({ value }) => {
             // ... Submission Logic (See section 5 of this guide for logic)
        }
    })
    
    // 3. Render
    return (
        <form onSubmit={...}>
            <form.AppField name="firstName">
                {(field) => <field.TextField label="First Name" />}
            </form.AppField>
            
            {/* Nested Field Example */}
             <form.AppField name="address.city">
                {(field) => <field.TextField label="City" />}
            </form.AppField>

            <form.AppForm>
                <form.SubscribeButton label="Submit" />
            </form.AppForm>
        </form>
    )
}
```
