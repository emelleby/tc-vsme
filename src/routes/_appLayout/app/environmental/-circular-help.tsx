import { Info, Leaf, PenTool, RefreshCcw, Sprout, Trash2 } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export function CircularHelp() {
	return (
		<div className="space-y-12 max-w-4xl mx-auto py-4">
			{/* Waste Management Section */}
			<section className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="border transition-shadow hover:shadow-md">
						<CardHeader className="pb-3">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-full bg-muted">
									<Info className="w-5 h-5 text-foreground" />
								</div>
								<CardTitle className="text-lg">
									Avfallshåndtering i Norge
								</CardTitle>
							</div>
							<CardDescription className="text-sm text-muted-foreground">
								I Norge går en overveiende andel av restavfallet til forbrenning
								(energigjenvinning), mens deponering er i praksis forbudt for
								biologisk nedbrytbart avfall.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground italic">
								Det som fortsatt deponeres, er hovedsakelig lett forurensede
								masser.
							</p>
						</CardContent>
					</Card>

					<Card className="border transition-shadow hover:shadow-md">
						<CardHeader className="pb-3">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-full bg-muted">
									<Trash2 className="w-5 h-5 text-foreground" />
								</div>
								<CardTitle className="text-lg">Praktisk veiledning</CardTitle>
							</div>
							<CardDescription className="text-sm text-muted-foreground">
								Dersom dere kun har "vanlig" avfall vil 100% av restavfallet gå
								til energigjenvinning.
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</section>

			<hr />

			{/* What is Circular Economy Section */}
			<section className="space-y-6">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<RefreshCcw className="w-6 h-6 text-primary" />
						Hva er sirkulærøkonomi?
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						Sirkulærøkonomi er en økonomisk modell som har som mål å redusere
						avfall, utnytte ressurser bedre og holde materialer i bruk så lenge
						som mulig. I stedet for den lineære modellen «ta – lage – bruke –
						kaste», bygger sirkulærøkonomien på flere sentrale prinsipper:
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6">
					{/* Principle 1 */}
					<Card className="border-l-4 border-l-emerald-500">
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-full">
									<PenTool className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
								</div>
								<CardTitle className="text-lg">
									1. Design bort avfall og forurensning
								</CardTitle>
							</div>
							<CardDescription className="text-sm">
								Produkter og systemer designes slik at avfall og miljøskadelige
								utslipp ikke oppstår i utgangspunktet. Dette kan innebære:
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-1">
								{[
									'Produkter som er enkle å reparere og demontere',
									'Materialvalg som kan resirkuleres eller gjenbrukes',
									'Mindre bruk av giftige stoffer',
								].map((item) => (
									<li
										key={item}
										className="text-sm text-muted-foreground flex items-center gap-2"
									>
										<div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
										{item}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					{/* Principle 2 */}
					<Card className="border-l-4 border-l-sky-500">
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-full ">
									<RefreshCcw className="w-5 h-5 text-sky-600 dark:text-sky-400" />
								</div>
								<CardTitle className="text-lg">
									2. Hold produkter og materialer i bruk
								</CardTitle>
							</div>
							<CardDescription className="text-sm">
								Verdien i produkter, komponenter og materialer skal bevares
								lengst mulig. Det gjøres gjennom:
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-1">
								{[
									'Reparasjon og vedlikehold',
									'Gjenbruk og ombruk',
									'Oppgradering eller remanufacturing',
									'Resirkulering når produktet ikke kan brukes lenger',
								].map((item) => (
									<li
										key={item}
										className="text-sm text-muted-foreground flex items-center gap-2"
									>
										<div className="w-1.5 h-1.5 rounded-full bg-sky-500/60" />
										{item}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					{/* Principle 3 */}
					<Card className="border-l-4 border-l-emerald-500">
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-full ">
									<Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
								</div>
								<CardTitle className="text-lg">3. Regenerer naturen</CardTitle>
							</div>
							<CardDescription className="text-sm">
								Sirkulærøkonomien skal bidra til å styrke naturens egne systemer
								i stedet for å tømme dem. Eksempler:
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-1">
								{[
									'Bruke fornybare ressurser og energi',
									'Tilbakeføre biologiske materialer til naturen på en trygg måte',
									'Forbedre jord, biodiversitet og økosystemer',
								].map((item) => (
									<li
										key={item}
										className="text-sm text-muted-foreground flex items-center gap-2"
									>
										<div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
										{item}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</div>

				{/* Summary Footer */}
				<section className="bg-muted/30 border border-border rounded-lg p-6">
					<h3 className="text-lg font-bold text-foreground mb-4">
						Kort oppsummert
					</h3>
					<p className="text-muted-foreground leading-relaxed">
						Sirkulærøkonomi handler om å redusere ressursbruk, forlenge
						levetiden til produkter og gjenbruke materialer, slik at økonomisk
						aktivitet kan skje med langt mindre belastning på miljø og natur.
					</p>
				</section>
			</section>
		</div>
	)
}
