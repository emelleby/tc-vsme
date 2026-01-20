import { Link } from '@tanstack/react-router'
import {
	ArrowRight,
	BarChart3,
	Check,
	CheckCircle,
	CheckCircle2,
	Clock,
	DollarSign,
	FileBarChart,
	FileText,
	Globe,
	LayoutTemplate,
	Lock,
	Shield,
	ThumbsUp,
	TrendingUp,
	Users,
	Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
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
	GlowingCard,
} from '@/components/ui/GlowingCard'
import { ContactForm } from '@/lib/forms/forms/ContactForm'

export default function Home() {
	return (
		<div className="min-h-screen bg-background text-foreground overflow-x-hidden">
			{/* Decorative Background Elements */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--sky)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
				<div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--teal)]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
			</div>

			{/* Hero Section */}
			<section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden items-center justify-center flex">
				<div className="container px-4 md:px-6 relative z-10">
					<div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
						{/* Left Content */}
						<div className="flex-1 text-center lg:text-left">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6 }}
							>
								<div className="inline-flex items-center rounded-full border border-[var(--sky)]/30 bg-[var(--sky)]/10 px-3 py-1 text-sm text-[var(--sky)] mb-6 backdrop-blur-md">
									<span className="flex h-2 w-2 rounded-full bg-[var(--sky)] mr-2 animate-pulse"></span>
									EU-standardisert Bærekraftsrapportering
								</div>

								<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
									Forenklet{' '}
									<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--teal)] via-[var(--sky)] to-[var(--copper)]">
										VSME-rapportering
									</span>
									<br />
									for Fremtidens Bedrifter
								</h1>

								<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
									Vår AI-drevne plattform gjør kompleks bærekraftsrapportering
									enkelt for SMBer. Spar tid, reduser kostnader og bygg tillit
									med automatiserte løsninger.
								</p>

								<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
									<Button
										size="lg"
										className="bg-gradient-to-r from-[var(--teal)] to-[var(--sky)] hover:opacity-90 text-white border-0 shadow-lg shadow-[var(--teal)]/20 transition-transform hover:scale-105"
									>
										Start din reise
										<ArrowRight className="ml-2 h-5 w-5" />
									</Button>
									<Button
										size="lg"
										variant="outline"
										className="border-[var(--sky)]/30 hover:bg-[var(--sky)]/5 hover:border-[var(--sky)] text-foreground min-w-[160px]"
									>
										Book demo
									</Button>
								</div>

								<div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-[var(--teal)]" />
										<span>Ingen bindingstid</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-[var(--teal)]" />
										<span>Gratis oppstartsmøte</span>
									</div>
								</div>
							</motion.div>
						</div>

						{/* Right - Hero Visual */}
						<div className="flex-1 w-full max-w-[600px] lg:max-w-none relative perspective-1000">
							<motion.div
								initial={{ opacity: 0, rotateY: -5, scale: 0.95 }}
								animate={{ opacity: 1, rotateY: 0, scale: 1 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="relative z-10"
							>
								<div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-background/50 backdrop-blur-sm group">
									<div className="absolute inset-0 bg-gradient-to-tr from-[var(--teal)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
									<img
										src="/images/hero-workspace.jpg"
										alt="Sustainability Dashboard"
										className="w-full h-auto object-cover rounded-2xl"
									/>

									{/* Floating Card: Score */}
									<motion.div
										className="absolute -top-6 right-6 md:top-8 md:right-8 z-20"
										animate={{ y: [0, -10, 0] }}
										transition={{
											duration: 4,
											repeat: Infinity,
											ease: 'easeInOut',
										}}
									>
										<GlowingCard
											glowColor="teal"
											className="w-auto min-w-[180px] bg-card/20 backdrop-blur-xl border border-[var(--teal)]/20"
										>
											<CardContent className="px-4 flex flex-col gap-1 items-center text-center">
												<div className="h-10 w-10 rounded-full bg-[var(--teal)]/10 flex items-center justify-center mb-1">
													<Shield className="h-5 w-5 text-[var(--teal)]" />
												</div>
												<span className="text-sm font-medium text-muted-foreground">
													VSME Score
												</span>
												<span className="text-2xl font-bold text-[var(--teal)]">
													A+
												</span>
											</CardContent>
										</GlowingCard>
									</motion.div>

									{/* Floating Card: Savings */}
									<motion.div
										className="absolute -bottom-6 -left-6 md:bottom-8 md:left-8 z-20"
										animate={{ y: [0, 10, 0] }}
										transition={{
											duration: 5,
											repeat: Infinity,
											ease: 'easeInOut',
											delay: 1,
										}}
									>
										<GlowingCard
											glowColor="copper"
											className="w-auto min-w-[200px] bg-card/20 backdrop-blur-xl border border-[var(--copper)]/20"
										>
											<CardContent className="px-4 flex items-center gap-4">
												<div className="h-10 w-10 rounded-full bg-[var(--copper)]/10 flex items-center justify-center">
													<Clock className="h-5 w-5 text-[var(--copper)]" />
												</div>
												<div>
													<p className="text-sm text-muted-foreground">
														Tid spart
													</p>
													<p className="text-lg font-bold text-[var(--copper)]">
														-70%
													</p>
												</div>
											</CardContent>
										</GlowingCard>
									</motion.div>
								</div>
							</motion.div>

							{/* Background Blob behind image */}
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[var(--sky)]/20 blur-3xl -z-10 rounded-full opacity-60" />
						</div>
					</div>
				</div>
			</section>

			{/* Trusted By Section */}
			<section className="py-10 border-y border-border/50 bg-muted/30">
				<div className="container px-4 text-center">
					<p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-6">
						Stolt samarbeidspartner for fremtidsrettede bedrifter
					</p>
					<div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
						{/* Placeholder Logos - In production use real SVGs */}
						{[
							'Acme Corp',
							'Nordic Green',
							'EcoSolutions',
							'FutureTech',
							'SustainAB',
						].map((name) => (
							<div
								key={name}
								className="text-xl font-bold font-title text-muted-foreground/80 hover:text-[var(--teal)] cursor-default"
							>
								{name}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Value Props / Features Grid */}
			<section id="features" className="py-24 relative overflow-hidden">
				<div className="container px-4 md:px-6 relative z-10">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<h2 className="text-3xl md:text-5xl font-bold mb-6">
							Bærekraft gjort <span className="text-[var(--teal)]">enkelt</span>
						</h2>
						<p className="text-lg text-muted-foreground leading-relaxed">
							Vår plattform effektiviserer hele VSME-rapporteringsprosessen med
							verktøy skreddersydd for din bedriftshverdag.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
						{[
							{
								title: 'Steg-for-steg Guide',
								desc: 'Intuitiv arbeidsflyt som leder deg trygt gjennom alle EU-krav uten unødvendig kompleksitet.',
								icon: CheckCircle2,
								color: 'sky',
							},
							{
								title: 'Smarte Maler',
								desc: 'Ferdigutfylte maler basert på din bransje reduserer manuelt arbeid betraktelig.',
								icon: LayoutTemplate,
								color: 'teal',
							},
							{
								title: 'AI-Assistent',
								desc: 'Vår AI analyserer dine data og foreslår formuleringer til rapportene dine.',
								icon: Zap,
								color: 'copper', // Using copper for AI/Spark
							},
							{
								title: 'Datasikkerhet',
								desc: 'Bank-grade kryptering sørger for at sensitive selskapsdata alltid er trygge.',
								icon: Lock,
								color: 'amber',
							},
							{
								title: 'Eksperthjelp',
								desc: 'Få tilgang til sertifiserte bærekraftskonsulenter direkte i plattformen.',
								icon: Users,
								color: 'rose',
							},
							{
								title: 'Rapportgenerering',
								desc: 'Eksporter profesjonelle PDF-rapporter klare for styringsmøter og banker.',
								icon: FileText,
								color: 'pink',
							},
						].map((feature, idx) => (
							<GlowingCard
								key={idx}
								glowColor={feature.color as any}
								className="bg-card h-full"
							>
								<CardHeader>
									<div
										className={`w-12 h-12 rounded-lg bg-[var(--${feature.color})]/10 flex items-center justify-center mb-4`}
									>
										<feature.icon
											className={`h-6 w-6 text-[var(--${feature.color})]`}
										/>
									</div>
									<CardTitle className="text-xl">{feature.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-base">
										{feature.desc}
									</CardDescription>
								</CardContent>
							</GlowingCard>
						))}
					</div>
				</div>
			</section>

			{/* Why Choose Section (Visual Hierarchy Improved) */}
			<section className="py-24 bg-[var(--sky)]/5">
				<div className="container px-4 md:px-6">
					<div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
						<div className="order-2 lg:order-1 relative">
							<div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/50">
								<img
									src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
									alt="Meeting"
									className="w-full h-auto"
								/>
								<div className="absolute inset-0 bg-[var(--teal)]/10 mix-blend-multiply" />
							</div>
							{/* Decorative elements around image */}
							<div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-[var(--copper)]/20 rounded-full blur-2xl" />
							<div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-[var(--teal)]/20 rounded-full blur-2xl" />
						</div>

						<div className="order-1 lg:order-2">
							<Badge
								variant="outline"
								className="mb-6 border-[var(--copper)]/50 text-[var(--copper)] bg-[var(--copper)]/10"
							>
								Strategisk Fordel
							</Badge>
							<h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
								Mer enn bare <br />
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--teal)] to-[var(--sky)]">
									Compliance
								</span>
							</h2>
							<p className="text-lg text-muted-foreground mb-8">
								Bærekraftsrapportering handler om å fremtidssikre din bedrift.
								Vi hjelper deg å snu krav til konkurransefortrinn.
							</p>

							<div className="grid gap-6">
								{[
									{
										title: 'Bankfinansiering',
										desc: 'Grønne lån krever god dokumentasjon.',
										icon: DollarSign,
									},
									{
										title: 'Kunderelasjoner',
										desc: 'Store kunder krever bærekraftig leverandørkjede.',
										icon: Users,
									},
									{
										title: 'Risikostyring',
										desc: 'Identifiser og reduser klimarisiko tidlig.',
										icon: BarChart3,
									},
									{
										title: 'Omdømme',
										desc: 'Tiltrekk talenter som bryr seg om framtiden.',
										icon: Globe,
									},
								].map((item, i) => (
									<div key={i} className="flex gap-4 items-start">
										<div className="mt-1 bg-white dark:bg-slate-800 p-2 rounded-full shadow-xs text-[var(--teal)]">
											<item.icon className="h-5 w-5" />
										</div>
										<div>
											<h3 className="font-bold text-lg">{item.title}</h3>
											<p className="text-muted-foreground">{item.desc}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing - Cleaner Design */}
			<section className="py-24" id="pricing">
				<div className="container px-4 text-center max-w-5xl mx-auto">
					<Badge
						variant="outline"
						className="mb-4 border-[var(--teal)]/50 text-[var(--teal)]"
					>
						Priser
					</Badge>
					<h2 className="text-3xl md:text-5xl font-bold mb-4">
						Investér i framtiden
					</h2>
					<p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
						Gjennomsiktige priser tilpasset din bedrifts størrelse. Ingen
						skjulte kostnader.
					</p>

					<div className="grid md:grid-cols-3 gap-8 items-start">
						{/* Starter */}
						<GlowingCard glowColor="sky" className="relative group">
							<CardHeader>
								<CardTitle className="text-2xl">Start</CardTitle>
								<CardDescription>For de minste bedriftene</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-4xl font-bold mb-6">
									Kr 1.990{' '}
									<span className="text-base font-normal text-muted-foreground">
										/mnd
									</span>
								</div>
								<ul className="text-left space-y-3 mb-6">
									{[
										'1 Bruker',
										'Standard VSME rapport',
										'E-post support',
										'Årlig oppdatering',
									].map((feat, i) => (
										<li key={i} className="flex items-center gap-2">
											<Check className="h-4 w-4 text-green-500" /> {feat}
										</li>
									))}
								</ul>
								<Button className="w-full" variant="outline">
									Start nå
								</Button>
							</CardContent>
						</GlowingCard>

						{/* Growth (Highlighted) */}
						<GlowingCard
							glowColor="teal"
							className="relative border-[var(--teal)] shadow-2xl scale-105 z-10"
						>
							<div className="absolute top-0 inset-x-0 h-1 bg-[var(--teal)]" />
							<CardHeader>
								<div className="text-[var(--teal)] font-bold text-sm uppercase tracking-wide mb-2">
									Anbefalt
								</div>
								<CardTitle className="text-3xl">Vekst</CardTitle>
								<CardDescription>For etablerte SMBer</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-4xl font-bold mb-6">
									Kr 3.990{' '}
									<span className="text-base font-normal text-muted-foreground">
										/mnd
									</span>
								</div>
								<ul className="text-left space-y-3 mb-6">
									{[
										'3 Brukere',
										'Utvidet rapportering',
										'Klimaregnskap (Scope 1-3)',
										'Prioritert support',
										'API tilgang',
									].map((feat, i) => (
										<li key={i} className="flex items-center gap-2">
											<Check className="h-4 w-4 text-[var(--teal)]" />
											<span className="font-medium">{feat}</span>
										</li>
									))}
								</ul>
								<Button className="w-full bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white shadow-lg shadow-[var(--teal)]/25">
									Get Started
								</Button>
							</CardContent>
						</GlowingCard>

						{/* Enterprise */}
						<GlowingCard glowColor="copper" className="relative group">
							<CardHeader>
								<CardTitle className="text-2xl">Enterprise</CardTitle>
								<CardDescription>For større organisasjoner</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-4xl font-bold mb-6">Ta kontakt</div>
								<ul className="text-left space-y-3 mb-6">
									{[
										'Ubegrenset brukere',
										'Skreddersydd oppsett',
										'Dedikert rådgiver',
										'SSO & Sikkerhet',
										'Custom integrasjoner',
									].map((feat, i) => (
										<li key={i} className="flex items-center gap-2">
											<Check className="h-4 w-4 text-[var(--copper)]" /> {feat}
										</li>
									))}
								</ul>
								<Button className="w-full" variant="outline">
									Kontakt salg
								</Button>
							</CardContent>
						</GlowingCard>
					</div>
				</div>
			</section>

			{/* Contact / CTA Section */}
			<section className="py-24 bg-muted/50">
				<div className="container px-4 text-center max-w-4xl mx-auto">
					<h2 className="text-3xl md:text-5xl font-bold mb-8">
						Klar for å komme i gang?
					</h2>
					<p className="text-xl text-muted-foreground mb-8">
						Book et uforpliktende møte med en av våre bærekraftseksperter og se
						hvordan vi kan hjelpe deg.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							size="lg"
							className="bg-foreground text-background hover:opacity-90 px-8 text-lg h-12"
						>
							Book Demo
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="px-8 text-lg h-12 bg-background"
						>
							Kontakt Oss
						</Button>
					</div>

					<div className="mt-16 text-left max-w-2xl mx-auto bg-card p-8 rounded-2xl border shadow-sm">
						<h3 className="text-2xl font-bold mb-6 text-center">
							Eller send oss en melding
						</h3>
						<ContactForm />
					</div>
				</div>
			</section>

			{/* FAQ Layout Improved */}
			<section className="py-24">
				<div className="container px-4 md:px-6 max-w-3xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold mb-4">Ofte stilte spørsmål</h2>
					</div>
					<Accordion type="single" collapsible className="w-full space-y-4">
						<AccordionItem
							value="item-1"
							className="border rounded-lg px-4 bg-card shadow-xs"
						>
							<AccordionTrigger className="text-lg font-medium hover:no-underline hover:text-[var(--teal)]">
								Hvem må rapportere etter VSME?
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground pb-4">
								VSME er frivillig for de fleste SMBer, men blir ofte et krav fra
								banker og større kunder. Det er en forenklet standard designet
								for å være overkommelig for mindre selskaper.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem
							value="item-2"
							className="border rounded-lg px-4 bg-card shadow-xs"
						>
							<AccordionTrigger className="text-lg font-medium hover:no-underline hover:text-[var(--teal)]">
								Trenger jeg en konsulent?
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground pb-4">
								Med vår plattform trenger du i utgangspunktet ikke ekstern
								konsulent. Systemet guider deg gjennom prosessen. For komplekse
								spørsmål har vi eksperter tilgjengelig via chat.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem
							value="item-3"
							className="border rounded-lg px-4 bg-card shadow-xs"
						>
							<AccordionTrigger className="text-lg font-medium hover:no-underline hover:text-[var(--teal)]">
								Er dataene mine trygge?
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground pb-4">
								Ja, vi bruker industristandard kryptering og følger GDPR
								strengt. Dine data tilhører deg og deles aldri med tredjeparter
								uten ditt samtykke.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem
							value="item-4"
							className="border rounded-lg px-4 bg-card shadow-xs"
						>
							<AccordionTrigger className="text-lg font-medium hover:no-underline hover:text-[var(--teal)]">
								Hvordan fungerer prisingen deres?
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground pb-4">
								Vi tilbyr fleksible prisplaner basert på bedriftsstørrelse og
								rapporteringsbehov. Tilpassede enterprise-planer er
								tilgjengelige for bedrifter med mer komplekse krav. Alle planer
								inkluderer regelmessige oppdateringer for å holde seg i samsvar
								med endrede forskrifter.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem
							value="item-5"
							className="border rounded-lg px-4 bg-card shadow-xs"
						>
							<AccordionTrigger className="text-lg font-medium hover:no-underline hover:text-[var(--teal)]">
								Kan jeg eksportere rapporter for å dele med interessenter?
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground pb-4">
								Ja, du kan enkelt eksportere dine fullstendige
								bærekraftsrapporter i flere formater inkludert PDF og Excel.
								Dette gjør det enkelt å dele med interessenter, investorer,
								banker eller kunder som krever dokumentasjon av dine
								bærekraftsinitiativer.
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</section>
		</div>
	)
}
