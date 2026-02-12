import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FormButtonsProps {
	status: 'draft' | 'submitted'
	isSaving: boolean
	onSaveDraft: () => void
	onSubmit: () => void
	onReopen: () => void
}

export function FormButtons({
	status,
	isSaving,
	onSaveDraft,
	onSubmit,
	onReopen,
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
		<div className="flex justify-end gap-4 pt-6">
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
				type="button" // This triggers the form submit if it's inside a form? No, type="button" prevents default submit.
				// Wait, regular submit button should be type="submit".
				// But if we have two buttons, we need to handle them differently.
				// The hook might expose a handleSubmit that takes an event or just a function.
				// If we use onClick={onSubmit}, we should probably use type="button" to avoid native form submission double-triggering if logic is separate.
				// However, usually "Submit" button is type="submit".
				// Let's assume onSaveDraft and onSubmit are manual handlers.
				// But for accessibility, the primary action should probably be type="submit".
				// If onSubmit is passed, we can use it on onClick.
				onClick={onSubmit}
				disabled={isSaving}
			>
				{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				Submit
			</Button>
		</div>
	)
}
