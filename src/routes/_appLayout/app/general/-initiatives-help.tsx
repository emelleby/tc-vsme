import {
	Building2,
	Droplets,
	Leaf,
	RefreshCw,
	ShieldCheck,
	Users,
	Users2,
} from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

const initiatives = [
	{
		title: 'Klimaendringer',
		icon: Leaf,
		description:
			'Tiltak for å redusere klimagassutslipp og tilpasse seg klimaendringer.',
		examples: [
			'Energieffektivisering',
			'Overgang til fornybar energi',
			'Klimarisikovurderinger',
			'Utslippsreduksjonsplaner',
		],
	},
	{
		title: 'Marine ressurser',
		icon: Droplets,
		description: 'Bærekraftig forvaltning av marine økosystemer og ressurser.',
		examples: [
			'Bærekraftig fiskeri',
			'Reduksjon av marin forurensning',
			'Beskyttelse av marine habitater',
			'Ansvarlig havbruk',
		],
	},
	{
		title: 'Biologisk mangfold',
		icon: Leaf,
		description: 'Beskyttelse og bevaring av naturens mangfold.',
		examples: [
			'Habitatrestaurering',
			'Artsbeskyttelse',
			'Økologisk korridorer',
			'Naturvennlig arealbruk',
		],
	},
	{
		title: 'Sirkulær økonomi',
		icon: RefreshCw,
		description: 'Redusere avfall og maksimere ressursutnyttelse.',
		examples: [
			'Gjenbruk og gjenvinning',
			'Produktdesign for sirkularitet',
			'Avfallsreduksjon',
			'Deleøkonomi',
		],
	},
	{
		title: 'Arbeidsstyrke',
		icon: Users,
		description: 'Utvikling og velferd av ansatte.',
		examples: [
			'Kompetanseutvikling',
			'Mangfold og inkludering',
			'Helse og sikkerhet',
			'Arbeidsglede',
		],
	},
	{
		title: 'Samfunnspåvirkning',
		icon: Building2,
		description: 'Positive bidrag til lokalsamfunn og samfunn generelt.',
		examples: [
			'Lokale innkjøp',
			'Samfunnsprosjekter',
			'Utdanning og kompetanse',
			'Infrastrukturutvikling',
		],
	},
	{
		title: 'Interessentengasjement',
		icon: Users2,
		description: 'Aktiv dialog og samarbeid med interessenter.',
		examples: [
			'Kundedialog',
			'Leverandørsamarbeid',
			'Samfunnsengasjement',
			'Investorkommunikasjon',
		],
	},
	{
		title: 'Forretningsetikk',
		icon: ShieldCheck,
		description: 'Etisk forretningsførsel og integritet.',
		examples: [
			'Anti-korrupsjon',
			'Transparens',
			'Ansvarlig markedsføring',
			'Etiske retningslinjer',
		],
	},
]

export function GeneralHelp() {
	return (
		<div className="space-y-8 max-w-7xl mx-auto p-4">
			{/* Header Section */}

			{/* Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{initiatives.map((item) => {
					const Icon = item.icon
					return (
						<Card
							key={item.title}
							className="border transition-shadow hover:shadow-md"
						>
							<CardHeader className="pb-3">
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-full bg-muted">
										<Icon className="w-5 h-5 text-foreground" />
									</div>
									<CardTitle className="text-lg">{item.title}</CardTitle>
								</div>
								<CardDescription className="text-sm text-muted-foreground">
									{item.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
										Eksempler på tiltak:
									</p>
									<ul className="space-y-1">
										{item.examples.map((example) => (
											<li
												key={example}
												className="text-sm text-muted-foreground flex items-center gap-2"
											>
												<div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
												{example}
											</li>
										))}
									</ul>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>

			{/* Footer Guidance Section */}
			<section className="bg-muted/30 border border-border rounded-lg p-6">
				<h3 className="text-xl font-bold text-foreground mb-4">
					Hvordan velge?
				</h3>
				<ul className="space-y-3 text-muted-foreground">
					<li>
						<strong className="text-foreground">
							Velg kun de initiativene
						</strong>{' '}
						som virksomheten aktivt jobber med eller planlegger å implementere.
					</li>
					<li>
						<strong className="text-foreground">Vær realistisk:</strong> Det er
						bedre å velge færre initiativ som dere faktisk gjennomfører enn
						mange som bare er ønsker.
					</li>
					<li>
						<strong className="text-foreground">Dokumentasjon:</strong> For
						hvert valgt initiativ må dere fylle ut detaljer i neste seksjon.
					</li>
				</ul>
			</section>
		</div>
	)
}
