import { createFileRoute } from '@tanstack/react-router'
import { m } from '@/paraglide/messages'

export const Route = createFileRoute('/_demoLayout/about')({
	component: AboutPage,
})

function AboutPage() {
	return (
		<div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="space-y-8">
					{/* Header Section */}
					<div className="space-y-4">
						<h1 className="text-5xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
							{m.about_title()}
						</h1>
						<p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
							{m.about_intro()}
						</p>
					</div>

					{/* What's Included Section */}
					<div className="bg-card border border-border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
						<h2 className="text-3xl font-semibold text-foreground mb-6">
							{m.about_whats_included()}
						</h2>
						<ul className="space-y-4">
							<li className="flex items-start gap-4 group">
								<span className="text-primary font-bold text-xl mt-0.5 group-hover:scale-125 transition-transform">
									✓
								</span>
								<span className="text-muted-foreground group-hover:text-foreground transition-colors">
									{m.about_router()}
								</span>
							</li>
							<li className="flex items-start gap-4 group">
								<span className="text-primary font-bold text-xl mt-0.5 group-hover:scale-125 transition-transform">
									✓
								</span>
								<span className="text-muted-foreground group-hover:text-foreground transition-colors">
									{m.about_query()}
								</span>
							</li>
							<li className="flex items-start gap-4 group">
								<span className="text-primary font-bold text-xl mt-0.5 group-hover:scale-125 transition-transform">
									✓
								</span>
								<span className="text-muted-foreground group-hover:text-foreground transition-colors">
									{m.about_form()}
								</span>
							</li>
							<li className="flex items-start gap-4 group">
								<span className="text-primary font-bold text-xl mt-0.5 group-hover:scale-125 transition-transform">
									✓
								</span>
								<span className="text-muted-foreground group-hover:text-foreground transition-colors">
									{m.about_clerk()}
								</span>
							</li>
							<li className="flex items-start gap-4 group">
								<span className="text-primary font-bold text-xl mt-0.5 group-hover:scale-125 transition-transform">
									✓
								</span>
								<span className="text-muted-foreground group-hover:text-foreground transition-colors">
									{m.about_convex()}
								</span>
							</li>
							<li className="flex items-start gap-4 group">
								<span className="text-primary font-bold text-xl mt-0.5 group-hover:scale-125 transition-transform">
									✓
								</span>
								<span className="text-muted-foreground group-hover:text-foreground transition-colors">
									{m.about_ai()}
								</span>
							</li>
						</ul>
					</div>

					{/* Explore Section */}
					<div className="space-y-4">
						<h2 className="text-3xl font-semibold text-foreground">
							{m.about_explore()}
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							{m.about_explore_desc()}
						</p>
						<p className="text-sm text-muted-foreground italic border-l-4 border-primary/30 pl-4 py-2">
							{m.about_note()}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
