import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import RemyAssistant from './RemyAssistant'

const meta = {
	title: 'Components/RemyAssistant',
	component: RemyAssistant,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
} satisfies Meta<typeof RemyAssistant>

export default meta

type Story = StoryObj<typeof meta>

// Wrapper component to control the open state
function RemyAssistantWrapper(
	props: React.ComponentProps<typeof RemyAssistant>,
) {
	const [isOpen, setIsOpen] = useState(true)

	return (
		<div className="bg-charcoal min-h-screen p-8">
			<div className="mb-4 p-4 bg-charcoal-light/50 rounded-lg border border-copper/20">
				<p className="text-cream text-sm mb-3">
					<strong>Note:</strong> This component requires a backend API
					connection. In a real app, it would connect to `/api/remy-chat`.
				</p>
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="px-4 py-2 bg-copper text-charcoal rounded-lg font-medium hover:bg-copper-light transition-colors border"
				>
					{isOpen ? 'Close' : 'Open'} Remy Assistant
				</button>
			</div>
			{/* Container with relative positioning to show the fixed-positioned component */}
			<div className="relative w-full h-150 mt-8 border border-copper/20 rounded-lg overflow-hidden">
				{isOpen && <RemyAssistant {...props} position="absolute" />}
			</div>
		</div>
	)
}

export const Default: Story = {
	args: {
		speakerSlug: 'ertert',
	},
	render: (args) => <RemyAssistantWrapper {...args} />,
}

export const WithContext: Story = {
	args: {
		contextTitle: 'Advanced Croissant Techniques',
		speakerSlug: 'pierre-herme',
	},
	render: (args) => <RemyAssistantWrapper {...args} />,
}

export const WithTalkContext: Story = {
	args: {
        contextTitle: 'Mastering Pâte Feuilletée',
        talkSlug: 'talk-2026-001',
        position: "absolute"
    },
	render: (args) => <RemyAssistantWrapper {...args} />,
}
