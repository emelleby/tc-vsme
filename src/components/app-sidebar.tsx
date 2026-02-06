'use client'
import { OrganizationSwitcher } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'

import {
	BookOpen,
	Bot,
	Frame,
	// biome-ignore lint/suspicious/noShadowRestrictedNames: <false positive>
	Map,
	PieChart,
	Settings2,
	SquareTerminal,
} from 'lucide-react'
// import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
// import { TeamSwitcher } from '@/components/team-switcher'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '@/components/ui/sidebar'
import { YearSelector } from '@/components/year-selector'

// This is sample data.
const data = {
	// teams: [
	// 	{
	// 		name: 'Acme Inc',
	// 		logo: GalleryVerticalEnd,
	// 		plan: 'Enterprise',
	// 	},
	// 	{
	// 		name: 'Acme Corp.',
	// 		logo: AudioWaveform,
	// 		plan: 'Startup',
	// 	},
	// 	{
	// 		name: 'Evil Corp.',
	// 		logo: Command,
	// 		plan: 'Free',
	// 	},
	// ],
	navMain: [
		{
			title: 'Links',
			url: '/app',
			icon: SquareTerminal,
			isActive: true,
			items: [
				{
					title: 'Dashboard',
					url: '/app',
				},
				{
					title: 'General Information',
					url: '/app/general',
				},
				{
					title: 'Demo',
					url: '/demo',
				},
				{
					title: 'Order',
					url: '/app/order',
				},
				{
					title: 'Emissions',
					url: '/app/emissions',
				},
				{
					title: 'Settings',
					url: '/app/settings',
				},
			],
		},
		{
			title: 'Models',
			url: '#',
			icon: Bot,
			items: [
				{
					title: 'Genesis',
					url: '#',
				},
				{
					title: 'Explorer',
					url: '#',
				},
				{
					title: 'Quantum',
					url: '#',
				},
			],
		},
		{
			title: 'Documentation',
			url: '#',
			icon: BookOpen,
			items: [
				{
					title: 'Introduction',
					url: '#',
				},
				{
					title: 'Get Started',
					url: '#',
				},
				{
					title: 'Tutorials',
					url: '#',
				},
				{
					title: 'Changelog',
					url: '#',
				},
			],
		},
		{
			title: 'Settings',
			url: '/app/settings',
			icon: Settings2,
			items: [
				{
					title: 'General',
					url: '#',
				},
				{
					title: 'Team',
					url: '#',
				},
				{
					title: 'Billing',
					url: '#',
				},
				{
					title: 'Limits',
					url: '#',
				},
			],
		},
	],
	projects: [
		{
			name: 'Design Engineering',
			url: '#',
			icon: Frame,
		},
		{
			name: 'Sales & Marketing',
			url: '#',
			icon: PieChart,
		},
		{
			name: 'Travel',
			url: '#',
			icon: Map,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<OrganizationSwitcher
					hidePersonal
					skipInvitationScreen
					afterSelectOrganizationUrl="/app"
					appearance={{
						baseTheme: undefined,
						elements: {
							rootBox: {
								width: '100%',
								borderBottom: '1px solid #eee',
								paddingBottom: '4px',
							},
							organizationSwitcherTrigger: {
								width: '100%',
								justifyContent: 'flex-start',
							},
							organizationSwitcherTriggerIcon: {
								flexShrink: '0',
								width: '1.3rem',
								height: '1.3rem',
								marginLeft: 'auto',
							},
						},
					}}
				/>

				<YearSelector />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavProjects projects={data.projects} />
			</SidebarContent>
			<SidebarFooter>
				<Link to="/demo">Demo</Link>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
