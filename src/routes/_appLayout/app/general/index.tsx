import { createFileRoute } from '@tanstack/react-router'
import { FormCard } from '@/components/ui/expandable-card-simple'

export const Route = createFileRoute('/_appLayout/app/general/')({
	component: GeneralPage,
})

function GeneralPage() {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<FormCard
				title="Design System"
				progress={100}
				dueDate="Dec 31, 2023"
				contributors={[
					{ name: 'Emma' },
					{ name: 'John' },
					{ name: 'Lisa' },
					{ name: 'David' },
				]}
				tasks={[
					{ title: 'Create Component Library', completed: true },
					{ title: 'Implement Design Tokens', completed: true },
					{ title: 'Write Style Guide', completed: true },
					{ title: 'Set up Documentation', completed: true },
				]}
				githubStars={256}
				openIssues={0}
			/>

			<FormCard
				title="Analytics Dashboard"
				progress={45}
				dueDate="Mar 1, 2024"
				contributors={[
					{ name: 'Michael' },
					{ name: 'Sophie' },
					{ name: 'James' },
				]}
				tasks={[
					{ title: 'Design Dashboard Layout', completed: true },
					{ title: 'Implement Data Fetching', completed: true },
					{ title: 'Create Visualization Components', completed: false },
					{ title: 'Add Export Features', completed: false },
					{ title: 'User Testing', completed: false },
				]}
				githubStars={89}
				openIssues={8}
			/>
		</div>
	)
}
