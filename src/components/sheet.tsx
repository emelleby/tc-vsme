import { Button } from '@/components/ui/button'
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
	title: string
	description: string
	children?: React.ReactNode
}

export function HelpSheet({
	open,
	onOpenChange,
	title,
	description,
	children,
}: HelpSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				showClose={true}
				className="sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl"
			>
				<SheetHeader>
					<SheetTitle></SheetTitle>
					<SheetDescription></SheetDescription>
					<section className="bg-muted/50 border-l-4 border-primary p-6 rounded-r-lg">
						<h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
						<p className="text-muted-foreground leading-relaxed">
							{description}
						</p>
					</section>
				</SheetHeader>
				<div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
					{children}
				</div>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Close</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
