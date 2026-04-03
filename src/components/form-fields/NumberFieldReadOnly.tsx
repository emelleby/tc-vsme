import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

interface NumberFieldReadOnlyProps {
	hidden?: boolean
	hideLabel?: boolean
	label?: string
	unit?: string
	description?: string
	value?: number | string
	placeholder?: string
	className?: string
}

export function NumberFieldReadOnly({
	hidden,
	hideLabel,
	disabled,
	label,
	unit,
	description,
	value,
	placeholder,
	className,
}: NumberFieldReadOnlyProps) {
	const displayValue = value != null && value !== '' ? String(value) : ''

	return (
		<Field hidden={hidden}>
			{!hideLabel && label && <FieldLabel>{label}</FieldLabel>}
			{unit ? (
				<InputGroup className="pointer-events-none opacity-70">
					<InputGroupInput
						tabIndex={-1}
						readOnly
						disabled
						value={displayValue}
						placeholder={placeholder}
						className={cn(className)}
					/>
					<InputGroupAddon
						align="inline-end"
						className={cn('bg-secondary/10 pl-2 pr-2 py-2 rounded-r-md')}
					>
						{unit}
					</InputGroupAddon>
				</InputGroup>
			) : (
				<Input
					tabIndex={-1}
					readOnly
					value={displayValue}
					placeholder={placeholder}
					className={cn(className)}
					disabled
				/>
			)}
			{description && <FieldDescription>{description}</FieldDescription>}
		</Field>
	)
}
