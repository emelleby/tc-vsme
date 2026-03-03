import { Checkbox } from '@/components/ui/checkbox'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field'
import { useFieldContext } from '@/hooks/form-context'

interface CheckboxFieldProps {
	label: string
	description?: string
	disabled?: boolean
}

export function CheckboxField({
	label,
	description,
	disabled,
}: CheckboxFieldProps) {
	const field = useFieldContext<boolean>()
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

	return (
		<Field
			orientation="horizontal"
			data-invalid={isInvalid}
			className="items-center"
		>
			<Checkbox
				id={field.name}
				checked={field.state.value}
				onCheckedChange={(checked) => {
					if (typeof checked === 'boolean') {
						field.handleChange(checked)
					}
				}}
				onBlur={field.handleBlur}
				disabled={disabled}
			/>
			<div className="flex flex-col gap-1">
				<FieldLabel htmlFor={field.name} className="font-normal cursor-pointer">
					{label}
				</FieldLabel>
				{description && <FieldDescription>{description}</FieldDescription>}
			</div>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	)
}
