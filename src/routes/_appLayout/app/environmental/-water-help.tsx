import { Droplets, ExternalLink, LogOut, Waves } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WaterHelp() {
	return (
		<div className="space-y-12 max-w-4xl mx-auto py-4">
			{/* Water Withdrawal Section */}
			<section className="space-y-6">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-bold border">
							1
						</span>
						Hva er vannuttak?
					</h2>
					<p className="text-muted-foreground leading-relaxed text-sm">
						Vannuttak er den totale mengden vann som virksomheten henter inn fra
						alle kilder, målt i kubikkmeter (m³). Dette inkluderer vann fra
						kommunalt vannverk, egne brønner, overflatevann (elver, innsjøer),
						regnvann og eventuelt sjøvann.
					</p>
				</div>

				<Card className="border-l-4 border-l-primary/30 bg-muted/20">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2 text-foreground/80">
							<Waves className="w-5 h-5 text-muted-foreground" />
							<CardTitle className="text-base font-semibold">
								Hvor finner du data?
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2">
							{[
								'Kommunale vannregninger - viser fakturert vannforbruk fra kommunalt nett.',
								'Vannmålere - egne målere på inntak fra brønner eller overflatevann.',
								'Leverandørfakturaer - ved kjøp av vann fra private aktører.',
								'Driftslogger - registreringer fra pumpestasjoner eller prosessanlegg.',
							].map((item) => (
								<li
									key={item}
									className="text-sm text-muted-foreground flex items-start gap-2"
								>
									<div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
									{item}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</section>

			{/* Water Discharge Section */}
			<section className="space-y-6">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-bold border">
							2
						</span>
						Hva er vannutslipp?
					</h2>
					<p className="text-muted-foreground leading-relaxed text-sm">
						Vannutslipp er den totale mengden vann som virksomheten sender
						tilbake til miljøet etter bruk, målt i kubikkmeter (m³). Dette
						inkluderer avløpsvann til kommunalt nett, direkte utslipp til
						vassdrag og utslipp til grunn.
					</p>
				</div>

				<Card className="border-l-4 border-l-primary/30 bg-muted/20">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2 text-foreground/80">
							<LogOut className="w-5 h-5 text-muted-foreground" />
							<CardTitle className="text-base font-semibold">
								Hvor finner du data?
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2">
							{[
								'Avløpsregninger - kommunen fakturerer ofte avløp basert på vannforbruk.',
								'Utslippstillatelser - kan inneholde krav om måling og rapportering.',
								'Egne målinger - dersom virksomheten har separate avløpsmålere.',
								'Estimater - dersom direkte måling ikke er tilgjengelig, kan avløp estimeres som en andel av vannuttak.',
							].map((item) => (
								<li
									key={item}
									className="text-sm text-muted-foreground flex items-start gap-2"
								>
									<div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
									{item}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</section>

			{/* Water Consumption Section */}
			<section className="space-y-6">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-bold border">
							3
						</span>
						Hva er vannforbruk?
					</h2>
					<p className="text-muted-foreground leading-relaxed text-sm">
						Vannforbruk beregnes automatisk som vannuttak minus vannutslipp.
						Dette representerer vannet som faktisk forbrukes eller fordamper i
						virksomhetens prosesser og ikke returneres til miljøet.
					</p>
				</div>

				{/* Water Stress Section */}

				<div className="space-y-4">
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-bold border">
							4
						</span>
						Hva er vannstress?
					</h2>
					<p className="text-muted-foreground leading-relaxed text-sm">
						Vannstress oppstår når vannforbruket i et område overstiger 25 % av
						tilgjengelige ferskvannsressurser. Det måles gjerne som en
						prosentandel av tilgjengelig vann som tas ut til jordbruk, industri
						og husholdninger.
					</p>
				</div>

				<Card className="border-l-4 border-l-primary/30 bg-muted/20">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<Droplets className="w-5 h-5 text-muted-foreground" />
							<CardTitle className="text-lg font-bold">
								Vannstress i Norge
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground leading-relaxed text-sm">
							Norge har 0 % vannstress nasjonalt, ifølge globale og europeiske
							indikatorer. Landet har rikelige vannressurser per innbygger, og
							god forvaltning bidrar til at vann ikke er en knapp ressurs – i
							sterk kontrast til mange andre land.
						</p>
						<p className="font-semibold text-foreground flex items-center gap-2 text-sm italic underline decoration-primary/30 underline-offset-4">
							Dersom dere kun opererer i Norge kan dere sette Vannstress til 0.
						</p>
					</CardContent>
				</Card>
			</section>

			{/* International Resources */}
			<section className="bg-accent/10 border border-border rounded-lg p-6">
				<div className="flex items-center gap-2 mb-4 text-muted-foreground">
					<ExternalLink className="w-5 h-5" />
					<h3 className="text-lg font-bold text-foreground">
						Internasjonale ressurser
					</h3>
				</div>
				<p className="text-muted-foreground mb-4 text-sm leading-relaxed">
					For oversikt over vannstress internasjonalt kan dere benytte Water
					Risk Atlas:
				</p>
				<a
					href="https://www.wri.org/aqueduct"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-sm"
				>
					WRI Aqueduct Water Risk Atlas <ExternalLink className="w-4 h-4" />
				</a>
			</section>
		</div>
	)
}
