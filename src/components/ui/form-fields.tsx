import { useStore } from '@tanstack/react-form'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Field as DefaultField,
	FieldError as DefaultFieldError,
	FieldContent,
	FieldDescription,
	FieldLabel,
	FieldSet,
} from '@/components/ui/field'
import { useFieldContext } from '@/components/ui/form-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

// Error type from TanStack Form
type FieldError = { message?: string } | string

// Helper to check if field has visible errors
function useFieldValidation(field: ReturnType<typeof useFieldContext>) {
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form store has complex generic types
	const store = field.store as any
	const errors = useStore(store, (state: unknown) => {
		const s = state as { meta: { errors: FieldError[] } }
		return s.meta.errors
	})
	const isTouched = useStore(store, (state: unknown) => {
		const s = state as { meta: { isTouched: boolean } }
		return s.meta.isTouched
	})
	const hasVisibleErrors = !!errors.length && isTouched
	return { errors, isTouched, hasVisibleErrors }
}

// =============================================================================
// TextField
// =============================================================================
export interface TextFieldProps {
	label: string
	placeholder?: string
	description?: string
	type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number'
	required?: boolean
	disabled?: boolean
	className?: string
}

export function TextField({
	label,
	placeholder,
	description,
	type = 'text',
	required,
	disabled,
	className,
}: TextFieldProps) {
	const field = useFieldContext()
	const { errors, hasVisibleErrors } = useFieldValidation(field)

	return (
		<FieldSet className={className}>
			<DefaultField data-invalid={hasVisibleErrors}>
				<FieldLabel htmlFor={field.name}>
					{label}
					{required && ' *'}
				</FieldLabel>
				<Input
					id={field.name}
					name={field.name}
					type={type}
					placeholder={placeholder}
					value={(field.state.value as string) ?? ''}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					aria-invalid={hasVisibleErrors}
					disabled={disabled}
				/>
			</DefaultField>
			{description && <FieldDescription>{description}</FieldDescription>}
			{hasVisibleErrors && (
				<DefaultFieldError
					errors={errors.map((e) =>
						typeof e === 'string' ? { message: e } : e,
					)}
				/>
			)}
		</FieldSet>
	)
}

// =============================================================================
// TextareaField
// =============================================================================
export interface TextareaFieldProps {
	label: string
	placeholder?: string
	description?: string
	rows?: number
	required?: boolean
	disabled?: boolean
	className?: string
}

export function TextareaField({
	label,
	placeholder,
	description,
	rows = 4,
	required,
	disabled,
	className,
}: TextareaFieldProps) {
	const field = useFieldContext()
	const { errors, hasVisibleErrors } = useFieldValidation(field)

	return (
		<FieldSet className={className}>
			<DefaultField data-invalid={hasVisibleErrors}>
				<FieldLabel htmlFor={field.name}>
					{label}
					{required && ' *'}
				</FieldLabel>
				<Textarea
					id={field.name}
					name={field.name}
					placeholder={placeholder}
					rows={rows}
					value={(field.state.value as string) ?? ''}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					aria-invalid={hasVisibleErrors}
					disabled={disabled}
				/>
			</DefaultField>
			{description && <FieldDescription>{description}</FieldDescription>}
			{hasVisibleErrors && (
				<DefaultFieldError
					errors={errors.map((e) =>
						typeof e === 'string' ? { message: e } : e,
					)}
				/>
			)}
		</FieldSet>
	)
}

// =============================================================================
// SelectField
// =============================================================================
export interface SelectOption {
	label: string
	value: string
}

export interface SelectFieldProps {
	label: string
	options: SelectOption[]
	placeholder?: string
	description?: string
	required?: boolean
	disabled?: boolean
	className?: string
}

export function SelectField({
	label,
	options,
	placeholder = 'Select an option',
	description,
	required,
	disabled,
	className,
}: SelectFieldProps) {
	const field = useFieldContext()
	const { errors, hasVisibleErrors } = useFieldValidation(field)

	return (
		<FieldSet className={className}>
			<DefaultField data-invalid={hasVisibleErrors}>
				<FieldLabel htmlFor={field.name}>
					{label}
					{required && ' *'}
				</FieldLabel>
				<Select
					name={field.name}
					value={(field.state.value as string) ?? ''}
					onValueChange={field.handleChange}
					disabled={disabled}
				>
					<SelectTrigger
						id={field.name}
						className="w-full"
						aria-invalid={hasVisibleErrors}
					>
						<SelectValue placeholder={placeholder} />
					</SelectTrigger>
					<SelectContent>
						{options.map(({ label, value }) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</DefaultField>
			{description && <FieldDescription>{description}</FieldDescription>}
			{hasVisibleErrors && (
				<DefaultFieldError
					errors={errors.map((e) =>
						typeof e === 'string' ? { message: e } : e,
					)}
				/>
			)}
		</FieldSet>
	)
}

// =============================================================================
// CheckboxField
// =============================================================================
export interface CheckboxFieldProps {
	label: string
	description?: string
	required?: boolean
	disabled?: boolean
	className?: string
}

export function CheckboxField({
	label,
	description,
	required,
	disabled,
	className,
}: CheckboxFieldProps) {
	const field = useFieldContext()
	const { errors, hasVisibleErrors } = useFieldValidation(field)

	return (
		<FieldSet className={className}>
			<DefaultField orientation="horizontal" data-invalid={hasVisibleErrors}>
				<Checkbox
					id={field.name}
					checked={Boolean(field.state.value)}
					onCheckedChange={(checked) => field.handleChange(checked as boolean)}
					onBlur={field.handleBlur}
					disabled={disabled}
					aria-invalid={hasVisibleErrors}
				/>
				<FieldContent>
					<FieldLabel htmlFor={field.name} className="space-y-1 leading-none">
						{label}
						{required && ' *'}
					</FieldLabel>
					{description && <FieldDescription>{description}</FieldDescription>}
					{hasVisibleErrors && (
						<DefaultFieldError
							errors={errors.map((e) =>
								typeof e === 'string' ? { message: e } : e,
							)}
						/>
					)}
				</FieldContent>
			</DefaultField>
		</FieldSet>
	)
}

// =============================================================================
// RadioGroupField
// =============================================================================
export interface RadioGroupFieldProps {
	label: string
	options: SelectOption[]
	description?: string
	required?: boolean
	disabled?: boolean
	className?: string
}

export function RadioGroupField({
	label,
	options,
	description,
	required,
	disabled,
	className,
}: RadioGroupFieldProps) {
	const field = useFieldContext()
	const { errors, hasVisibleErrors } = useFieldValidation(field)

	return (
		<FieldSet className={className}>
			<FieldLabel>
				{label}
				{required && ' *'}
			</FieldLabel>
			{description && <FieldDescription>{description}</FieldDescription>}
			<DefaultField data-invalid={hasVisibleErrors}>
				<RadioGroup
					name={field.name}
					value={(field.state.value as string) ?? ''}
					onValueChange={field.handleChange}
					disabled={disabled}
					aria-invalid={hasVisibleErrors}
				>
					{options.map(({ label, value }) => (
						<div key={value} className="flex items-center gap-x-2">
							<RadioGroupItem value={value} id={`${field.name}-${value}`} />
							<Label htmlFor={`${field.name}-${value}`}>{label}</Label>
						</div>
					))}
				</RadioGroup>
			</DefaultField>
			{hasVisibleErrors && (
				<DefaultFieldError
					errors={errors.map((e) =>
						typeof e === 'string' ? { message: e } : e,
					)}
				/>
			)}
		</FieldSet>
	)
}

// =============================================================================
// SwitchField
// =============================================================================
export interface SwitchFieldProps {
	label: string
	description?: string
	required?: boolean
	disabled?: boolean
	className?: string
}

export function SwitchField({
	label,
	description,
	required,
	disabled,
	className,
}: SwitchFieldProps) {
	const field = useFieldContext()
	const { errors, hasVisibleErrors } = useFieldValidation(field)

	return (
		<FieldSet className={className}>
			<DefaultField orientation="horizontal" data-invalid={hasVisibleErrors}>
				<FieldContent>
					<FieldLabel htmlFor={field.name}>
						{label}
						{required && ' *'}
					</FieldLabel>
					{description && <FieldDescription>{description}</FieldDescription>}
					{hasVisibleErrors && (
						<DefaultFieldError
							errors={errors.map((e) =>
								typeof e === 'string' ? { message: e } : e,
							)}
						/>
					)}
				</FieldContent>
				<Switch
					id={field.name}
					checked={Boolean(field.state.value)}
					onCheckedChange={(checked) => field.handleChange(checked)}
					disabled={disabled}
					aria-invalid={hasVisibleErrors}
				/>
			</DefaultField>
		</FieldSet>
	)
}
