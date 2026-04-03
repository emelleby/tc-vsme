import type { VariantProps } from 'class-variance-authority'
import { AlertTriangle, Loader2 } from 'lucide-react'
import type * as React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button, type buttonVariants } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useFormContext } from '@/hooks/form-context'

export function SubmitButton({
	label,
	className,
	size,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		label: string
	}) {
	const form = useFormContext()
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					className={className}
					size={size}
					type="submit"
					disabled={isSubmitting}
					{...props}
				>
					{isSubmitting && <Spinner />}
					{label}
				</Button>
			)}
		</form.Subscribe>
	)
}

export function StepButton({
	label,
	handleMovement,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		label: React.ReactNode | string
		handleMovement: () => void
	}) {
	return (
		<Button
			size="sm"
			variant="ghost"
			type="button"
			onClick={handleMovement}
			{...props}
		>
			{label}
		</Button>
	)
}

interface FormButtonsProps {
	status: 'draft' | 'submitted'
	isSaving: boolean
	onSaveDraft: () => void
	onSubmit: () => void
	onReopen: () => void
	disableSubmit?: boolean
	submitDisabledReasons?: string[]
}

export function FormButtons({
	status,
	isSaving,
	onSaveDraft,
	onSubmit,
	onReopen,
	disableSubmit = false,
	submitDisabledReasons = [],
}: FormButtonsProps) {
	if (status === 'submitted') {
		return (
			<div className="flex justify-end pt-6">
				<Button
					type="button"
					variant="outline"
					onClick={onReopen}
					disabled={isSaving}
				>
					{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Reopen Form
				</Button>
			</div>
		)
	}

	return (
		<div className="flex flex-col items-end gap-2 pt-6">
			{disableSubmit && submitDisabledReasons.length > 0 && (
				<Alert variant="destructive" className="w-full border-l-4">
					<AlertTriangle />
					<AlertTitle>Cannot submit</AlertTitle>
					<AlertDescription>
						<ul className="list-disc pl-4 space-y-1">
							{submitDisabledReasons.map((reason) => (
								<li key={reason}>{reason}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}
			<div className="flex justify-end gap-4">
				<Button
					type="button"
					variant="outline"
					onClick={onSaveDraft}
					disabled={isSaving}
				>
					{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Save Draft
				</Button>
				<Button
					type="button"
					onClick={onSubmit}
					disabled={isSaving || disableSubmit}
				>
					{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Submit
				</Button>
			</div>
		</div>
	)
}
