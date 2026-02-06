import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet'

interface HelpSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function HelpSheet({ open, onOpenChange }: HelpSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent showClose={true}>
				<SheetHeader>
					<SheetTitle>Edit profile</SheetTitle>
					<SheetDescription>
						Make changes to your profile here.
					</SheetDescription>
				</SheetHeader>
				<div className="grid flex-1 auto-rows-min gap-6 px-4">
					<div className="grid gap-3">
						<Label htmlFor="sheet-demo-name">Name</Label>
						<Input id="sheet-demo-name" defaultValue="Shaban" />
					</div>
					<div className="grid gap-3">
						<Label htmlFor="sheet-demo-username">Username</Label>
						<Input id="sheet-demo-username" defaultValue="@shaban" />
					</div>
				</div>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Cancel</Button>
					</SheetClose>
					<SheetClose asChild>
						<Button onClick={() => onOpenChange(false)}>Save changes</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
