import {
	Calculator,
	ExternalLink,
	Flame,
	Fuel,
	Info,
	Wind,
	Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function EnergyHelp() {
	return (
		<div className="space-y-10 max-w-4xl mx-auto py-4 font-sans">
			{/* Klimaregnskap Section */}
			<section className="space-y-4">
				<Card className="border-l-4 border-l-primary/30 bg-muted/10">
					<CardHeader>
						<div className="flex items-center gap-2">
							<Calculator className="w-5 h-5 text-muted-foreground" />
							<CardTitle className="text-lg font-bold">Klimaregnskap</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground leading-relaxed text-sm">
							Informasjon om energiforbruk og utslipp beregnes vanligvis i et
							klimaregnskap. Dersom din virksomhet har et klimaregnskap kan dere
							enkelt finne nødvendig data der.
						</p>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-primary/20 bg-muted/5">
					<CardHeader>
						<div className="flex items-center gap-2">
							<Info className="w-5 h-5 text-muted-foreground" />
							<CardTitle className="text-lg font-bold">
								Klimaregnskapsmodul
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground leading-relaxed text-sm">
							Dersom dere ikke har et klimaregnskap har vi en egen modul for
							dette, som enkelt beregner deres utslipp og energiforbruk basert
							på regnskapsdata.
						</p>
					</CardContent>
				</Card>
			</section>

			{/* NVE Declaration Section */}
			<section className="space-y-4">
				<div className="space-y-4">
					<h3 className="text-lg font-bold flex items-center gap-2">
						Fordeling mellom Fornybar og Ikke-fornybar energi
					</h3>
					<p className="text-muted-foreground leading-relaxed text-sm">
						Fordeling mellom Fornybar og Ikke-fornybar energi beregnes i Norge
						av NVE hvert år. Årets tall finner du her:
					</p>
					<a
						href="https://www.nve.no/energi/energisystem/energibruk/stroemdeklarasjoner/"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-sm"
					>
						NVE Strømdeklarasjon <ExternalLink className="w-4 h-4" />
					</a>
					<p className="text-muted-foreground leading-relaxed text-sm italic">
						Dersom dere ikke benytter opprinnelsesgarantier skal du se på
						"Varedeklarasjon for strømkjøp uten opprinnelsesgarantier" og
						beregne etter denne fordelingen.
					</p>
				</div>
			</section>

			{/* Energy Sources Breakdown */}
			<section className="space-y-6">
				<h3 className="text-lg font-bold border-b pb-2">
					Energikilder i B3-seksjonen
				</h3>
				<div className="grid gap-4">
					<div className="flex gap-4 items-start">
						<div className="p-2 rounded-md bg-muted border shrink-0">
							<Zap className="w-5 h-5 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="font-bold text-sm">Innkjøpt elektrisitet</p>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Totalt innkjøpt elektrisitet fordelt på fornybar og
								ikke-fornybar. Fordelingen beregnes basert på NVEs
								strømdeklarasjon eller opprinnelsesgarantier.
							</p>
						</div>
					</div>

					<div className="flex gap-4 items-start">
						<div className="p-2 rounded-md bg-muted border shrink-0">
							<Flame className="w-5 h-5 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="font-bold text-sm">Fjernvarme</p>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Energi fra fjernvarme- eller fjernkjølingsanlegg. Oppgi forbruk
								i kWh som vist på faktura.
							</p>
						</div>
					</div>

					<div className="flex gap-4 items-start">
						<div className="p-2 rounded-md bg-muted border shrink-0">
							<Wind className="w-5 h-5 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="font-bold text-sm">Egenprodusert elektrisitet</p>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Elektrisitet produsert av egne anlegg, for eksempel
								solcellepaneler eller vindturbiner. Oppgi nettoproduksjon i kWh.
							</p>
						</div>
					</div>

					<div className="flex gap-4 items-start">
						<div className="p-2 rounded-md bg-muted border shrink-0">
							<Fuel className="w-5 h-5 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="font-bold text-sm">Drivstoff</p>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Forbruk av fossilt og fornybart drivstoff. Velg drivstofftype
								fra listen og oppgi mengde. Konvertering til kWh beregnes
								automatisk basert på standard konverteringsfaktorer fra DEFRA,
								IEA og IPCC.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Total Consumption Footer */}
			<section className="bg-accent/10 border border-border rounded-lg p-6">
				<h3 className="text-lg font-bold text-foreground mb-4">
					Totalt energiforbruk
				</h3>
				<p className="text-muted-foreground text-sm leading-relaxed">
					Totalt energiforbruk beregnes automatisk som summen av alle
					energikilder (elektrisitet + fjernvarme + egenprodusert + drivstoff)
					og rapporteres i XBRL-taksonomien som{' '}
					<code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono border">
						vsme:TotalEnergyConsumption
					</code>{' '}
					i MWh.
				</p>
			</section>
		</div>
	)
}
