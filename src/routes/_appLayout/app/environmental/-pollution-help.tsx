import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PollutionHelp() {
	return (
		<div className="space-y-8 max-w-4xl mx-auto py-4">
			{/* Reporting Obligation Section */}
			<section className="space-y-4">
				<Card className="border-l-4 border-l-primary/30 bg-muted/20">
					<CardHeader>
						<CardTitle className="text-lg font-bold text-foreground">
							Rapporteringsplikt
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground leading-relaxed text-sm">
							Hvis virksomheten allerede er pålagt ved lov eller andre nasjonale
							forskrifter å rapportere til myndighetene om sine utslipp av
							forurensende stoffer, eller hvis det frivillig rapporterer om dem
							i henhold til et miljøstyringssystem, skal det oppgi de
							forurensende stoffene det slipper ut til luft, vann og jord i sin
							egen virksomhet, med den respektive mengden for hvert forurensende
							stoff.
						</p>
						<p className="text-muted-foreground leading-relaxed text-sm mt-2">
							Alternativt kan man oppgi en link til hvor man kan finne
							informasjonen hvis den er offentlig tilgjengelig.
						</p>
					</CardContent>
				</Card>
			</section>
		</div>
	)
}
