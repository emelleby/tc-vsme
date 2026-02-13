import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from '@/components/ui/input-group'
import { useFieldContext } from '@/hooks/form-context'

interface NumberFieldProps {
	hidden?: boolean
	label: string
	unit?: string
	description?: string
	placeholder?: string
	disabled?: boolean
	step?: string | number
	min?: string | number
	max?: string | number
}

export function NumberField({
	hidden,
	label,
	unit,
	description,
	placeholder,
	disabled,
	step,
	min,
	max,
}: NumberFieldProps) {
	const field = useFieldContext<number>()
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

	return (
		<Field data-invalid={isInvalid} hidden={hidden}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			{unit ? (
				<InputGroup>
					<InputGroupInput
						id={field.name}
						name={field.name}
						type="number"
						step={step}
						min={min}
						max={max}
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => {
							const rawValue = e.target.value
							const value = rawValue !== '' ? Number(rawValue) : rawValue
							field.handleChange(value as any)
						}}
						aria-invalid={isInvalid}
						placeholder={placeholder}
						disabled={disabled}
					/>
					<InputGroupAddon
						align="inline-end"
						className="bg-secondary/10 pl-2 pr-2 py-2 rounded-r-md"
					>
						{unit}
					</InputGroupAddon>
				</InputGroup>
			) : (
				<InputGroupInput
					id={field.name}
					name={field.name}
					type="number"
					step={step}
					min={min}
					max={max}
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) => {
						const rawValue = e.target.value
						const value = rawValue !== '' ? Number(rawValue) : rawValue
						field.handleChange(value as any)
					}}
					aria-invalid={isInvalid}
					placeholder={placeholder}
					disabled={disabled}
				/>
			)}
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	)
}
