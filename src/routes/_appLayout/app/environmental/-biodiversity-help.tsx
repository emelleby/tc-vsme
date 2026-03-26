import { Ban, ExternalLink, Leaf, Map as MapIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function BiodiversityHelp() {
	return (
		<div className="space-y-12 max-w-4xl mx-auto py-4">
			{/* Land Use Section */}
			<section className="space-y-6">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-bold border">
							1
						</span>
						Hva er arealbeslag?
					</h2>
					<p className="text-muted-foreground leading-relaxed text-sm">
						Arealbeslag handler om hvor mye land virksomheten din bruker, og i
						hvilken grad dette arealet er forseglet eller naturlig.
						VSME-standarden krever at du rapporterer totalt areal, forseglet
						areal og naturlig (ikke-forseglet) areal.
					</p>
				</div>

				<Card className="border-l-4 border-l-primary/30 bg-muted/20">
					<CardHeader>
						<div className="flex items-center gap-2 text-foreground/80">
							<MapIcon className="w-5 h-5 text-muted-foreground" />
							<CardTitle className="text-base font-bold">
								Du skal rapportere:
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2">
							{[
								'Totalt areal virksomheten disponerer (i hektar).',
								'Hvor mye av arealet som er forseglet (bygninger, asfalt, betong) versus naturlig mark.',
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

			{/* Sealed vs. Unsealed Section */}
			<section className="space-y-6">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-bold border">
							2
						</span>
						Forseglet vs. ikke-forseglet areal
					</h2>
					<p className="text-muted-foreground leading-relaxed text-sm">
						Skillet mellom forseglet og ikke-forseglet areal er sentralt for
						rapporteringen.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="border-l-4 border-l-primary/30 bg-muted/10">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Ban className="w-4 h-4 text-muted-foreground" />
								<CardTitle className="text-base font-bold">
									Forseglet areal
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Areal dekket av materialer som hindrer naturlig vanninntrenging
								og luftutveksling - for eksempel bygninger, asfalt, betong og
								andre harde overflater. Forsegling reduserer vannabsorpsjon,
								endrer dreneringsmønstre og påvirker lokalt økosystem.
							</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-primary/30 bg-muted/20">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Leaf className="w-4 h-4 text-muted-foreground" />
								<CardTitle className="text-base font-bold">
									Ikke-forseglet areal
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Naturlig mark som gressdekke, jord, skog eller annen vegetasjon.
								Disse arealene bidrar til vannabsorpsjon, biologisk mangfold og
								naturlige økosystemtjenester.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Resources Section */}
			<section className="bg-accent/10 border border-border rounded-lg p-6">
				<div className="flex items-center gap-2 mb-4 text-muted-foreground">
					<ExternalLink className="w-5 h-5" />
					<h3 className="text-lg font-bold text-foreground">
						Nyttige ressurser
					</h3>
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm leading-relaxed">
							Kart over nøkkelområder for biologisk mangfold:
						</p>
						<a
							href="https://www.keybiodiversityareas.org/sites"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-sm"
						>
							Key Biodiversity Areas <ExternalLink className="w-4 h-4" />
						</a>
					</div>

					<div className="space-y-2">
						<p className="text-muted-foreground text-sm leading-relaxed">
							Verdensdatabasen over beskyttede områder:
						</p>
						<a
							href="https://www.protectedplanet.net/country/NOR"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-sm"
						>
							Protected Planet - Norge <ExternalLink className="w-4 h-4" />
						</a>
					</div>
				</div>
			</section>
		</div>
	)
}
