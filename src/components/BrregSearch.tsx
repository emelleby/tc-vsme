import { Loader2, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDebounce } from '@/hooks/use-debounce'

// Types for Brreg response
export interface BrregUnit {
	organisasjonsnummer: string
	navn: string
	organisasjonsform: {
		kode: string
		beskrivelse: string
	}
	forretningsadresse?: {
		adresse: string[]
		postnummer: string
		poststed: string
		kommunenummer: string
		kommune: string
		landkode: string
		land: string
	}
	hjemmeside?: string
}

interface BrregSearchProps {
	onSelect: (unit: BrregUnit) => void
}

export function BrregSearch({ onSelect }: BrregSearchProps) {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<BrregUnit[]>([])
	const [loading, setLoading] = useState(false)
	const debouncedQuery = useDebounce(query, 500)
	const wrapperRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event.target as Node)
			) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [wrapperRef])

	useEffect(() => {
		async function search(searchTerm: string) {
			if (!searchTerm || searchTerm.length < 3) {
				setResults([])
				return
			}

			setLoading(true)
			try {
				let url = ''
				const isDigits = /^\d+$/.test(searchTerm)

				if (isDigits && searchTerm.length === 9) {
					// Direct lookup
					url = `https://data.brreg.no/enhetsregisteret/api/enheter/${searchTerm}`
				} else if (!isDigits && searchTerm.length >= 3) {
					// Name search
					url = `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(
						searchTerm,
					)}&navnMetodeForSoek=FORTLOEPENDE&size=20`
				} else {
					if (isDigits) {
						setLoading(false)
						return
					}
					url = `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(
						searchTerm,
					)}&navnMetodeForSoek=FORTLOEPENDE&size=20`
				}

				const res = await fetch(url)
				if (!res.ok) {
					setResults([])
				} else {
					const data = await res.json()
					if (data.organisasjonsnummer) {
						setResults([data])
					} else if (data._embedded?.enheter) {
						setResults(data._embedded.enheter)
					} else {
						setResults([])
					}
				}
				setOpen(true)
			} catch (err) {
				console.error('Failed to search Brreg:', err)
				setResults([])
			} finally {
				setLoading(false)
			}
		}

		if (open || debouncedQuery.length >= 3) {
			search(debouncedQuery)
		}
	}, [debouncedQuery])

	const handleSelect = (org: BrregUnit) => {
		setQuery(org.navn)
		setOpen(false)
		onSelect(org)
	}

	return (
		<div className="space-y-2 relative" ref={wrapperRef}>
			<Label>Search Organization</Label>
			<div className="relative">
				<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Search by name or Org. Number..."
					className="pl-9"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value)
						if (e.target.value.length >= 3) setOpen(true)
					}}
					onFocus={() => {
						if (results.length > 0) setOpen(true)
					}}
				/>
				{loading && (
					<div className="absolute right-3 top-3">
						<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
					</div>
				)}
			</div>

			{open && results.length > 0 && (
				<Card className="absolute z-50 w-full mt-1 max-h-[300px] overflow-auto shadow-lg">
					<CardContent className="p-0">
						<ul className="py-1">
							{results.map((org) => (
								<li
									key={org.organisasjonsnummer}
									className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center justify-between text-sm"
									onClick={() => handleSelect(org)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											handleSelect(org)
										}
									}}
									tabIndex={0}
									role="button"
								>
									<div className="flex flex-col">
										<span className="font-medium">{org.navn}</span>
										<span className="text-xs text-muted-foreground">
											{org.organisasjonsnummer} •{' '}
											{org.organisasjonsform?.beskrivelse}
										</span>
										{org.forretningsadresse && (
											<span className="text-xs text-muted-foreground">
												{org.forretningsadresse.adresse?.join(', ')},{' '}
												{org.forretningsadresse.poststed}
											</span>
										)}
									</div>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}

			{open &&
				!loading &&
				results.length === 0 &&
				debouncedQuery.length >= 3 && (
					<div className="absolute z-50 w-full mt-1 p-4 text-center text-sm text-muted-foreground bg-background border rounded-md shadow-lg">
						No organization found.
					</div>
				)}
		</div>
	)
}
