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
		<div className="min-h-screen bg-mesh">
			{/* Hero Section */}
			<section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
						{/* Left Content */}
						<div className="flex-1 text-center lg:text-left z-10">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
							>
								<Badge
									variant="outline"
									className="mb-6 border-sky/50 p-2 text-sky-600 bg-sky-200/40 backdrop-blur-sm"
								>
									EU-standardisert Bærekraftsrapportering
								</Badge>
								<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
									Eu-standardisert{' '}
									<span className="font-nunito text-transparent bg-clip-text bg-gradient-to-r from-[var(--sky)] to-[var(--teal)]">
										VSME-rapportering
									</span>
									<br />
									for Små og Mellomstore Bedrifter
								</h1>
								<p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 font-extralight">
									Vår AI-baserte plattform gjør EU-standardisert
									bærekraftsrapportering tilgjengelig og enkelt for SMBer. Spar
									tid, reduser kostnader og sikre full overholdelse av de nyeste
									forskriftene.
								</p>

								<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
									<Button
										size="lg"
										className="bg-gradient-to-r from-[var(--sky)] to-[var(--teal)] hover:opacity-90 text-white border-0"
									>
										Kom i gang i dag
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
									<Button
										size="lg"
										variant="outline"
										className="border-sky/20 hover:bg-sky/5"
									>
										Book et møte
									</Button>
								</div>

								<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
									<Button asChild size="lg" variant="outline">
										<Link to="/pricing">Pricing</Link>
									</Button>
									<Button asChild size="lg" variant="outline">
										<Link to="http://localhost:3001" target="_blank">
											Scope321 <ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
								</div>
							</motion.div>
						</div>

						{/* Right - Hero Image with Floating Cards */}
						<div className="flex-1 w-full max-w-[600px] lg:max-w-none relative">
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
							>
								{/* Hero Image */}
								<img
									src="/images/hero-workspace.jpg"
									alt="Collaborative workspace"
									className="w-full h-full object-cover"
								/>

								{/* Floating Status Card - Top Right */}
								<motion.div
									initial={{ opacity: 0, x: 20 }}
									animate={{
										opacity: 1,
										x: 0,
										y: [0, -10, 0],
									}}
									transition={{
										opacity: { duration: 0.5, delay: 0.8 },
										x: { duration: 0.5, delay: 0.8 },
										y: {
											duration: 3,
											repeat: Infinity,
											ease: 'easeInOut',
											delay: 0.8,
										},
									}}
									className="absolute top-4 right-4 md:top-6 md:right-6"
								>
									<GlowingCard
										glowColor="sky"
										className="bg-white/75 backdrop-blur-md border-green-200 shadow-lg min-w-[200px]"
									>
										<CardContent className="pt-0">
											<div className="flex items-center gap-2">
												<div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
													<Check className="h-3 w-3 text-teal-600" />
												</div>
												<p className="">Samsvarsstatus</p>
											</div>
											<p className="text-lg font-semibold text-teal-700">
												100% Fullført
											</p>
										</CardContent>
									</GlowingCard>
								</motion.div>

								{/* Floating Time Saved Card - Middle Left */}
								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{
										opacity: 1,
										x: 5,
										y: [0, 10, 0],
									}}
									transition={{
										opacity: { duration: 0.5, delay: 1 },
										x: { duration: 0.5, delay: 1 },
										y: {
											duration: 3.5,
											repeat: Infinity,
											ease: 'easeInOut',
											delay: 1,
										},
									}}
									className="absolute top-1/2 left-4 md:left-6 -translate-y-1/2"
								>
									<GlowingCard
										glowColor="teal"
										className="bg-white/75 backdrop-blur-md border-sky/20 shadow-lg min-w-[200px]"
									>
										<CardContent className="pt-0">
											<div className="flex items-center gap-2">
												<div className="h-5 w-5 rounded-full bg-sky/10 flex items-center justify-center">
													<svg
														className="h-5 w-5 text-(--sky)]"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
												</div>
												Spart Tid
											</div>
											<p className="text-lg font-semibold text-[var(--sky)]">
												24 timer denne måneden
											</p>
										</CardContent>
									</GlowingCard>
								</motion.div>
							</motion.div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="py-20 bg-gray-50">
				<div className="container px-4 md:px-6">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--sky)]">
							Enkel bærekraftsrapportering
						</h2>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
							Vår plattform effektiviserer hele VSME-rapporteringsprosessen med
							kraftige, brukervennlige verktøy spesielt designet for små og
							mellomstore bedrifter.
						</p>
					</div>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
						{/* Card 1 - Steg for steg */}
						<GlowingCard glowColor="sky" className="bg-white">
							<CardContent className="p-6">
								<CheckCircle2 className="w-8 h-8 mb-2 text-sky-600" />

								<h3 className="text-lg font-semibold mb-2">Steg for steg</h3>
								<p className="text-muted-foreground">
									Trinnvise arbeidsflyter guider deg gjennom alle aspekter av
									EU-krav til bærekraftsrapportering, og sikrer at ingenting
									blir oversett.
								</p>
							</CardContent>
						</GlowingCard>

						{/* Card 2 - Tidsbesparende maler */}
						<GlowingCard glowColor="rose" className="bg-white">
							<CardContent className="p-6">
								<Clock className="w-8 h-8 mb-2 text-rose-600" />
								<h3 className="text-lg font-semibold mb-2">
									Tidsbesparende maler
								</h3>
								<p className=" text-muted-foreground">
									Ferdigbygde maler og automatisert datainnsamling reduserer
									rapporteringstiden med opptil 70%, slik at du kan fokusere på
									kjernevirksomheten.
								</p>
							</CardContent>
						</GlowingCard>

						{/* Card 3 - AI-basert */}
						<GlowingCard glowColor="teal" className="bg-white">
							<CardContent className="p-6">
								<Zap className="w-8 h-8 mb-2 text-teal-600" />
								<h3 className="text-lg font-semibold mb-2">AI-basert</h3>
								<p className=" text-muted-foreground">
									Importer dine eksisterende bærekraftdata, så ordner vår
									VSME-AI rapporteringen automatisk basert på dette. Du fyller
									kun inn eventuelle mangler.
								</p>
							</CardContent>
						</GlowingCard>

						{/* Card 4 - Sikker datalagring */}
						<GlowingCard glowColor="amber" className="bg-white">
							<CardContent className="p-6">
								<Lock className="w-8 h-8 mb-2 text-amber-600" />
								<h3 className="text-lg font-semibold mb-2">
									Sikker datalagring
								</h3>
								<p className=" text-muted-foreground">
									Alle dine bærekraftdata lagres sikkert med kryptering og
									regelmessige sikkerhetskopier.
								</p>
							</CardContent>
						</GlowingCard>

						{/* Card 5 - Ekspertstøtte */}
						<GlowingCard glowColor="teal" className="bg-white">
							<CardContent className="p-6">
								<Users className="w-8 h-8 mb-2 text-teal-600" />
								<h3 className="text-lg font-semibold mb-2">Ekspertstøtte</h3>
								<p className=" text-muted-foreground">
									Tilgang til bærekraftseksperter som kan guide deg gjennom
									rapporteringskrav og svare på dine spørsmål.
								</p>
							</CardContent>
						</GlowingCard>

						{/* Card 6 - Tilpassbare rapporter */}
						<GlowingCard glowColor="pink" className="bg-white">
							<CardContent className="p-6">
								<FileBarChart className="w-8 h-8 mb-2 text-pink-700" />
								<h3 className="text-lg font-semibold mb-2">
									Tilpassbare rapporter
								</h3>
								<p className=" text-muted-foreground">
									Generer profesjonelle rapporter skreddersydd for din bransje
									og spesifikke interessentkrav med bare noen få klikk.
								</p>
							</CardContent>
						</GlowingCard>
					</div>
				</div>
			</section>

			{/* Why Choose Section */}
			<section className="py-20">
				<div className="container px-4 md:px-6">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						{/* Left Content */}
						<div>
							<Badge
								variant="outline"
								className="mb-4 border-teal/50 text-teal bg-teal/10 backdrop-blur-sm"
							>
								Hvorfor Velge VSME Guru
							</Badge>
							<h2 className="text-3xl md:text-4xl font-bold mb-4">
								Bærekraftsrapportering som gir{' '}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--sky)] to-[var(--teal)]">
									forretningsmessig mening
								</span>
							</h2>
							<p className="text-muted-foreground mb-8">
								EU-standardisert bærekraftsrapportering blir stadig mer
								forventet av SMBer. Vår plattform forvandler et komplekst
								regulatorisk krav til en strategisk mulighet for din virksomhet.
							</p>

							<div className="space-y-6">
								{/* Feature 1 */}
								<div className="flex gap-4">
									<div className="flex-shrink-0">
										<div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center">
											<CheckCircle className="w-6 h-6 text-slate-600" />
										</div>
									</div>
									<div>
										<h3 className="font-semibold mb-1">
											Sikre juridisk samsvar
										</h3>
										<p className=" text-muted-foreground">
											Oppfylle EU-krav til bærekraftsrapportering.
										</p>
									</div>
								</div>

								{/* Feature 2 */}
								<div className="flex gap-4">
									<div className="flex-shrink-0">
										<div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center">
											<DollarSign className="w-6 h-6 text-slate-600" />
										</div>
									</div>
									<div>
										<h3 className="font-semibold mb-1">
											Reduser rapporteringskostnader
										</h3>
										<p className=" text-muted-foreground">
											Kutt kostnadene ved bærekraftsrapportering sammenlignet
											med tradisjonelle konsulenttjenester.
										</p>
									</div>
								</div>

								{/* Feature 3 */}
								<div className="flex gap-4">
									<div className="flex-shrink-0">
										<div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center">
											<TrendingUp className="w-6 h-6 text-slate-600" />
										</div>
									</div>
									<div>
										<h3 className="font-semibold mb-1">Bygg investortillit</h3>
										<p className=" text-muted-foreground">
											Tiltrekk investorer og partnere som i økende grad krever
											transparent bærekraftdata.
										</p>
									</div>
								</div>

								{/* Feature 4 */}
								<div className="flex gap-4">
									<div className="flex-shrink-0">
										<div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center">
											<ThumbsUp className="w-6 h-6 text-slate-600" />
										</div>
									</div>
									<div>
										<h3 className="font-semibold mb-1">Styrk merkevaren</h3>
										<p className=" text-muted-foreground">
											Vis ditt engasjement for bærekraft til kunder, partnere og
											ansatte.
										</p>
									</div>
								</div>
							</div>

							<div className="mt-8">
								<Button
									size="lg"
									className="bg-gradient-to-r from-[var(--sky)] to-[var(--teal)] hover:opacity-90 text-white border-0"
								>
									Les vår VSME Guide
								</Button>
							</div>
						</div>

						{/* Right Image */}
						<div className="relative">
							<div className="relative rounded-2xl overflow-hidden shadow-2xl">
								<img
									src="https://images.pexels.com/photos/6476254/pexels-photo-6476254.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
									alt="Team collaborating on sustainability reporting"
									className="w-full h-auto"
								/>
								{/* Overlay Card with Animation */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{
										opacity: 1,
										y: [0, -8, 0],
									}}
									transition={{
										opacity: { duration: 0.5, delay: 0.3 },
										y: {
											duration: 3,
											repeat: Infinity,
											ease: 'easeInOut',
											delay: 0.3,
										},
									}}
									className="absolute bottom-6 left-6"
								>
									<div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-100">
										<div className="flex items-center gap-2 mb-3">
											<BarChart3 className="w-5 h-5 text-[var(--sky)]" />
											<p className="font-semibold text-gray-900">
												Utslippssporing
											</p>
										</div>
										<p className=" text-gray-600 mb-4">Scope 1, 2 & 3</p>
										<div className="flex items-end gap-8">
											<div>
												<div className="text-4xl font-bold text-(--teal)">
													68%
												</div>
												<div className="text-xs text-gray-600 mt-1">
													Reduksjonspotensial
												</div>
											</div>
											<div>
												<div className="text-4xl font-bold text-(--teal)">
													2026
												</div>
												<div className="text-xs text-gray-600 mt-1">
													Mål satt
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Section */}
			<section className="py-20">
				<div className="container px-4 md:px-6">
					<div className="text-center mb-16">
						<Badge
							variant="outline"
							className="mb-4 border-sky/50 text-sky bg-sky/10 backdrop-blur-sm"
						>
							Enkel Prising
						</Badge>
						<div className="text-3xl md:text-4xl font-bold pb-1 text-transparent bg-clip-text bg-linear-to-r from-(--sky) to-(--teal)">
							Velg riktig plan for din bedrift
						</div>
						<p className="text-muted-foreground">
							Alle planer inkluderer våre kjernefunksjoner med fleksible
							alternativer som passer dine behov
						</p>
					</div>
					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						<GlowingCard className="border-muted">
							<CardHeader>
								<CardTitle>Basic</CardTitle>
								<CardDescription>
									Perfekt for små bedrifter som nettopp har begynt med
									bærekraftsrapportering
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold mb-4">
									Kontakt oss{' '}
									<span className=" font-normal text-muted-foreground">
										/mnd
									</span>
								</div>
								<ul className="space-y-2 ">
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" />{' '}
										Grunnleggende bærekraftsmålinger
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" /> 1
										brukerkonto
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" /> Standard
										rapportmaler
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" /> Eksport av
										rapporter
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" />{' '}
										Grunnleggende dataanalyse
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" /> Måling av
										utvikling
									</li>
								</ul>
							</CardContent>
							<CardFooter>
								<Button className="w-full" variant="outline">
									Be om demo
								</Button>
							</CardFooter>
						</GlowingCard>

						<GlowingCard
							glowColor="teal"
							className="border-[var(--teal)] relative overflow-hidden"
						>
							<div className="absolute top-0 right-0 bg-[var(--teal)] text-white text-xs px-3 py-1 rounded-bl-lg">
								Mest Populær
							</div>
							<CardHeader>
								<CardTitle>Basic + Klimaregnskap</CardTitle>
								<CardDescription>
									Ideelt for bedrifter som trenger omfattende klimaregnskap
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold mb-4">Kontakt oss</div>
								<ul className="space-y-2 ">
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-(--teal)" /> Alle
										Basic-funksjoner
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-(--teal)" /> Fullstendig
										klimaregnskap
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-(--teal)" /> Opptil 3
										brukerkontoer
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-(--teal)" /> Tilpassede
										rapportmaler
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-(--teal)" /> Prioritert
										støtte
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-(--teal)" /> Avansert
										analyse
									</li>
								</ul>
							</CardContent>
							<CardFooter>
								<Button className="w-full bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white">
									Be om demo
								</Button>
							</CardFooter>
						</GlowingCard>

						<GlowingCard className="border-muted">
							<CardHeader>
								<CardTitle>Enterprise</CardTitle>
								<CardDescription>
									For store organisasjoner som krever maksimal fleksibilitet og
									støtte
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold mb-4">Kontakt oss</div>
								<ul className="space-y-2 ">
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" /> Alle
										funksjoner
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" />{' '}
										Ubegrensede brukerkontoer
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" /> Tilpassede
										integrasjoner
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" /> Dedikert
										support
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" /> Tilpasset
										analyse
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" />{' '}
										Sanntidsoppdateringer
									</li>
								</ul>
							</CardContent>
							<CardFooter>
								<Button className="w-full" variant="outline">
									Kontakt oss
								</Button>
							</CardFooter>
						</GlowingCard>
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section id="contact" className="py-20 bg-gray-50">
				<div className="container px-4 md:px-6">
					<div className="text-center mb-12">
						<Badge
							variant="outline"
							className="mb-4 border-teal/50 text-teal bg-teal/10 backdrop-blur-sm"
						>
							Kontakt Oss
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							La oss hjelpe deg med{' '}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--sky)] to-[var(--teal)]">
								bærekraftsrapportering
							</span>
						</h2>
						<p className="text-muted-foreground max-w-2xl mx-auto">
							Ta kontakt med oss i dag for å lære mer om hvordan VSME Guru kan
							forenkle din bærekraftsrapportering
						</p>
					</div>
					<div className="max-w-2xl mx-auto">
						<GlowingCard glowColor="teal" className="bg-card">
							<CardContent className="p-8">
								<ContactForm />
							</CardContent>
						</GlowingCard>
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
							Ofte Stilte Spørsmål
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Alt du trenger å vite om VSME Guru
						</h2>
						<p className="text-muted-foreground">
							Har du spørsmål om VSME-rapportering eller vår plattform? Finn
							raske svar nedenfor.
						</p>
					</div>
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="item-1">
							<AccordionTrigger>Hva er VSME-rapportering?</AccordionTrigger>
							<AccordionContent>
								VSME (Voluntary Sustainability for Micro and Small Enterprises)
								rapportering er et rammeverk utviklet av EU for å hjelpe små og
								mellomstore bedrifter med å rapportere om deres
								bærekraftspraksis og ytelse. Det følger forenklede standarder
								sammenlignet med den mer omfattende CSRD (Corporate
								Sustainability Reporting Directive) som kreves for større
								selskaper.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-2">
							<AccordionTrigger>
								Hvor lang tid tar det å implementere plattformen deres?
							</AccordionTrigger>
							<AccordionContent>
								De fleste SMB-er kan komme i gang med vår plattform på bare 1-2
								dager. Vår veiledede oppsettsprosess tar deg gjennom hvert
								trinn, og vårt supportteam er tilgjengelig for å hjelpe med
								eventuelle spørsmål. Selve rapporteringsprosessen blir betydelig
								raskere når du er satt opp i systemet.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-3">
							<AccordionTrigger>
								Hva hvis jeg ikke har erfaring med bærekraftsrapportering?
							</AccordionTrigger>
							<AccordionContent>
								Vår plattform er spesielt designet for bedrifter uten tidligere
								erfaring med bærekraftsrapportering. Systemet gir trinnvis
								veiledning, forklaringer av nøkkelbegreper og maler tilpasset
								din bransje. Vårt supportteam inkluderer bærekraftseksperter som
								kan svare på spørsmålene dine.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-4">
							<AccordionTrigger>
								Hvordan fungerer prisingen deres?
							</AccordionTrigger>
							<AccordionContent>
								Vi tilbyr fleksible prisplaner basert på bedriftsstørrelse og
								rapporteringsbehov. Tilpassede enterprise-planer er
								tilgjengelige for bedrifter med mer komplekse krav. Alle planer
								inkluderer regelmessige oppdateringer for å holde seg i samsvar
								med endrede forskrifter.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-5">
							<AccordionTrigger>
								Kan jeg eksportere rapporter for å dele med interessenter?
							</AccordionTrigger>
							<AccordionContent>
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
