import { createFileRoute } from '@tanstack/react-router'
import {
	ArrowRight,
	BarChart3,
	Check,
	FileBarChart,
	Shield,
	Users,
	Zap,
} from 'lucide-react'
import { useState } from 'react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { m } from '@/paraglide/messages'

export const Route = createFileRoute('/pricing')({
	component: PricingPage,
})

function PricingPage() {
	const [isAnnual, setIsAnnual] = useState(false)

	const toggleBilling = () => {
		setIsAnnual(!isAnnual)
	}

	return (
		<div className="min-h-screen bg-mesh">
			{/* Header Section */}
			<section className="pt-20 pb-16 md:pt-32 md:pb-24">
				<div className="container px-4 md:px-6">
					<div className="text-center mb-12">
						<Badge
							variant="outline"
							className="mb-4 border-sky/50 text-sky bg-sky/10 backdrop-blur-sm"
						>
							{m.pricing_page_title()}
						</Badge>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
							{m.pricing_page_title()}
						</h1>
						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
							{m.pricing_page_subtitle()}
						</p>
					</div>

					{/* Billing Toggle */}
					<div className="flex items-center justify-center gap-4 mb-16">
						<span
							className={`text-sm font-medium transition-colors ${
								!isAnnual ? 'text-foreground' : 'text-muted-foreground'
							}`}
						>
							{m.pricing_billing_monthly()}
						</span>
						<Switch
							checked={isAnnual}
							onCheckedChange={toggleBilling}
							aria-label={
								isAnnual
									? m.pricing_billing_annual()
									: m.pricing_billing_monthly()
							}
						/>
						<span
							className={`text-sm font-medium transition-colors ${
								isAnnual ? 'text-foreground' : 'text-muted-foreground'
							}`}
						>
							{m.pricing_billing_annual()}
						</span>
						{isAnnual && (
							<Badge className="bg-teal-600 text-white border-0">
								{m.pricing_save_annual()}
							</Badge>
						)}
					</div>

					{/* Pricing Cards */}
					<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
						{/* Starter Plan */}
						<PricingCard
							planName={m.pricing_plan_starter_name()}
							planDescription={m.pricing_plan_starter_description()}
							price={
								isAnnual
									? m.pricing_plan_starter_annual()
									: m.pricing_plan_starter_monthly()
							}
							perMonth={m.pricing_plan_starter_per_month()}
							ctaText={m.pricing_plan_starter_cta()}
							features={[
								{
									icon: <BarChart3 className="h-4 w-4" />,
									text: m.pricing_feature_basic_measurements(),
								},
								{
									icon: <Users className="h-4 w-4" />,
									text: m.pricing_feature_one_user(),
								},
								{
									icon: <FileBarChart className="h-4 w-4" />,
									text: m.pricing_feature_standard_templates(),
								},
								{
									icon: <Check className="h-4 w-4" />,
									text: m.pricing_feature_export_reports(),
								},
								{
									icon: <Zap className="h-4 w-4" />,
									text: m.pricing_feature_basic_analytics(),
								},
								{
									icon: <Shield className="h-4 w-4" />,
									text: m.pricing_feature_progress_tracking(),
								},
							]}
							isRecommended={false}
							variant="outline"
						/>

						{/* Professional Plan - Recommended */}
						<PricingCard
							planName={m.pricing_plan_professional_name()}
							planDescription={m.pricing_plan_professional_description()}
							price={
								isAnnual
									? m.pricing_plan_professional_annual()
									: m.pricing_plan_professional_monthly()
							}
							perMonth={m.pricing_plan_professional_per_month()}
							ctaText={m.pricing_plan_professional_cta()}
							features={[
								{
									icon: <Check className="h-4 w-4" />,
									text: m.pricing_feature_all_basic(),
								},
								{
									icon: <BarChart3 className="h-4 w-4" />,
									text: m.pricing_feature_full_climate(),
								},
								{
									icon: <Users className="h-4 w-4" />,
									text: m.pricing_feature_three_users(),
								},
								{
									icon: <FileBarChart className="h-4 w-4" />,
									text: m.pricing_feature_custom_templates(),
								},
								{
									icon: <Shield className="h-4 w-4" />,
									text: m.pricing_feature_priority_support(),
								},
								{
									icon: <Zap className="h-4 w-4" />,
									text: m.pricing_feature_advanced_analytics(),
								},
							]}
							isRecommended={true}
							recommendedLabel={m.pricing_plan_recommended()}
							variant="default"
						/>

						{/* Enterprise Plan */}
						<PricingCard
							planName={m.pricing_plan_enterprise_name()}
							planDescription={m.pricing_plan_enterprise_description()}
							price={
								isAnnual
									? m.pricing_plan_enterprise_annual()
									: m.pricing_plan_enterprise_monthly()
							}
							perMonth=""
							ctaText={m.pricing_plan_enterprise_cta()}
							features={[
								{
									icon: <Check className="h-4 w-4" />,
									text: m.pricing_feature_all_features(),
								},
								{
									icon: <Users className="h-4 w-4" />,
									text: m.pricing_feature_unlimited_users(),
								},
								{
									icon: <Zap className="h-4 w-4" />,
									text: m.pricing_feature_custom_integrations(),
								},
								{
									icon: <Shield className="h-4 w-4" />,
									text: m.pricing_feature_dedicated_support(),
								},
								{
									icon: <BarChart3 className="h-4 w-4" />,
									text: m.pricing_feature_custom_analytics(),
								},
								{
									icon: <FileBarChart className="h-4 w-4" />,
									text: m.pricing_feature_realtime_updates(),
								},
							]}
							isRecommended={false}
							variant="outline"
						/>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-20 bg-muted/30">
				<div className="container px-4 md:px-6 max-w-3xl">
					<div className="text-center mb-16">
						<Badge
							variant="outline"
							className="mb-4 border-sky/50 text-sky bg-sky/10 backdrop-blur-sm"
						>
							FAQ
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							{m.pricing_faq_title()}
						</h2>
						<p className="text-muted-foreground">{m.pricing_faq_subtitle()}</p>
					</div>
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="item-1">
							<AccordionTrigger>{m.pricing_faq_q1()}</AccordionTrigger>
							<AccordionContent>{m.pricing_faq_a1()}</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-2">
							<AccordionTrigger>{m.pricing_faq_q2()}</AccordionTrigger>
							<AccordionContent>{m.pricing_faq_a2()}</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-3">
							<AccordionTrigger>{m.pricing_faq_q3()}</AccordionTrigger>
							<AccordionContent>{m.pricing_faq_a3()}</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-4">
							<AccordionTrigger>{m.pricing_faq_q4()}</AccordionTrigger>
							<AccordionContent>{m.pricing_faq_a4()}</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-5">
							<AccordionTrigger>{m.pricing_faq_q5()}</AccordionTrigger>
							<AccordionContent>{m.pricing_faq_a5()}</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</section>
		</div>
	)
}

interface PricingCardProps {
	planName: string
	planDescription: string
	price: string
	perMonth: string
	ctaText: string
	features: Array<{ icon: React.ReactNode; text: string }>
	isRecommended: boolean
	recommendedLabel?: string
	variant: 'default' | 'outline'
}

function PricingCard({
	planName,
	planDescription,
	price,
	perMonth,
	ctaText,
	features,
	isRecommended,
	recommendedLabel,
	variant,
}: PricingCardProps) {
	return (
		<div
			className={`relative rounded-xl border p-6 flex flex-col ${
				isRecommended
					? 'border-[var(--teal)] bg-gradient-to-b from-teal-50/50 to-white shadow-lg scale-105'
					: 'border-border bg-card shadow-sm hover:shadow-md transition-shadow'
			}`}
		>
			{isRecommended && recommendedLabel && (
				<div className="absolute top-0 right-0 bg-[var(--teal)] text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
					{recommendedLabel}
				</div>
			)}
			<CardHeader className="pb-4">
				<CardTitle className="text-2xl">{planName}</CardTitle>
				<CardDescription className="text-base">
					{planDescription}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex-1">
				<div className="mb-6">
					<span className="text-4xl font-bold">{price}</span>
					{perMonth && (
						<span className="text-muted-foreground ml-1">{perMonth}</span>
					)}
				</div>
				<ul className="space-y-3">
					{features.map((feature) => (
						<li key={feature.text} className="flex items-start gap-3">
							<span
								className={`mt-0.5 flex-shrink-0 ${
									isRecommended ? 'text-[var(--teal)]' : 'text-green-500'
								}`}
							>
								{feature.icon}
							</span>
							<span className="text-sm">{feature.text}</span>
						</li>
					))}
				</ul>
			</CardContent>
			<CardFooter className="pt-4">
				<Button
					className={`w-full ${
						isRecommended
							? 'bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white'
							: ''
					}`}
					variant={variant}
				>
					{ctaText}
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</CardFooter>
		</div>
	)
}
