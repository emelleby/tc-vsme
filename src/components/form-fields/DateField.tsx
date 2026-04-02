import { format } from 'date-fns'
import { enUS, nb } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { useFieldContext } from '@/hooks/form-context'
import { cn } from '@/lib/utils'
import { getLocale } from '@/paraglide/runtime'

interface DateFieldProps {
	label: string
	description?: string
	placeholder?: string
	disabled?: boolean
	hidden?: boolean
}

const localeMap = {
	en: enUS,
	no: nb,
} as const

export function DateField({
	label,
	description,
	placeholder = 'Velg dato',
	disabled,
	hidden,
}: DateFieldProps) {
	const field = useFieldContext<string | undefined>()
	const [open, setOpen] = React.useState(false)

	const currentLocale = getLocale() as keyof typeof localeMap
	const dateLocale = localeMap[currentLocale] || enUS

	const date = field.state.value ? new Date(field.state.value) : undefined

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

	return (
		<Field data-invalid={isInvalid} hidden={hidden}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={field.name}
						variant="outline"
						className={cn(
							'w-full justify-start text-left font-normal',
							!date && 'text-muted-foreground',
						)}
						disabled={disabled}
						aria-invalid={isInvalid}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? (
							format(date, 'PPP', { locale: dateLocale })
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						captionLayout="dropdown"
						onSelect={(newDate) => {
							field.handleChange(newDate?.toISOString())
							setOpen(false)
						}}
						initialFocus
						locale={dateLocale}
					/>
				</PopoverContent>
			</Popover>
			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	)
}
