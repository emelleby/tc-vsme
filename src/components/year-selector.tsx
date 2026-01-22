'use client'

import { useStore } from '@tanstack/react-store'
import { Calendar, ChevronDown } from 'lucide-react'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar'
import { AVAILABLE_YEARS, yearStore } from '@/lib/year-store'

export function YearSelector() {
	const { isMobile, state } = useSidebar()
	const selectedYear = useStore(yearStore, (state) => state.selectedYear)

	const isCollapsed = state === 'collapsed'

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
								<Calendar className="size-4 text-sky-600" />
							</div>
							{!isCollapsed && (
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">Reporing Year</span>
									<span className="truncate text-xs">{selectedYear}</span>
								</div>
							)}
							{!isCollapsed && <ChevronDown className="ml-auto size-4" />}
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? 'bottom' : 'right'}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Select Year
						</DropdownMenuLabel>
						{AVAILABLE_YEARS.map((year) => (
							<DropdownMenuItem
								key={year}
								onClick={() =>
									yearStore.setState((state) => ({
										...state,
										selectedYear: year,
									}))
								}
								className="gap-2 p-2"
							>
								<div className="flex size-6 items-center justify-center rounded-md border">
									<Calendar className="size-3.5 shrink-0" />
								</div>
								{year}
								{year === selectedYear && (
									<span className="ml-auto text-xs text-muted-foreground">
										✓
									</span>
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
