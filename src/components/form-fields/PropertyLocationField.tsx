/**
 * PropertyLocationField
 *
 * A TanStack Form field component that wraps GooglePlacesSearch and renders
 * a read-only summary card once an address has been resolved.
 *
 * Designed to be used as a field component inside a form.AppField for a
 * PropertyLocation array item.
 */

import { Building2, MapPin, Navigation } from 'lucide-react'
import { GooglePlacesSearch } from '@/components/GooglePlacesSearch'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field'
import { useFieldContext } from '@/hooks/form-context'
import type { PropertyLocation } from '@/lib/forms/schemas/b1-general-schema'

interface PropertyLocationFieldProps {
	label?: string
	description?: string
	disabled?: boolean
}

export function PropertyLocationField({
	label = 'Eiendomsadresse',
	description,
	disabled = false,
}: PropertyLocationFieldProps) {
	const field = useFieldContext<PropertyLocation>()
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
	const current = field.state.value

	const hasAddress =
		current?.formattedAddress && current.formattedAddress.length > 0

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>

			{/* Address search input — hidden once an address is confirmed */}
			{!hasAddress && (
				<GooglePlacesSearch
					disabled={disabled}
					onSelect={(location) => {
						field.handleChange({
							...current,
							...location,
						} as PropertyLocation)
						field.handleBlur()
					}}
				/>
			)}

			{/* Resolved address summary card */}
			{hasAddress && (
				<div className="rounded-md border border-border bg-muted/30 p-3 space-y-1.5">
					<div className="flex items-start gap-2">
						<MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium leading-snug">
								{current.formattedAddress}
							</p>
						</div>
					</div>

					{(current.lat !== 0 || current.lng !== 0) && (
						<div className="flex items-center gap-2 pl-6">
							<Navigation className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
							<p className="text-xs text-muted-foreground font-mono">
								{current.lat.toFixed(6)}, {current.lng.toFixed(6)}
							</p>
						</div>
					)}

					{current.city && (
						<div className="flex items-center gap-2 pl-6">
							<Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
							<p className="text-xs text-muted-foreground">
								{[current.postalCode, current.city, current.countryCode]
									.filter(Boolean)
									.join(' · ')}
							</p>
						</div>
					)}

					{/* Allow re-searching */}
					{!disabled && (
						<button
							type="button"
							className="pl-6 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
							onClick={() => {
								field.handleChange({
									...current,
									formattedAddress: '',
									streetAddress: '',
									city: '',
									postalCode: '',
									country: '',
									countryCode: '',
									placeId: '',
									lat: 0,
									lng: 0,
								})
							}}
						>
							Endre adresse
						</button>
					)}
				</div>
			)}

			{description && <FieldDescription>{description}</FieldDescription>}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	)
}
