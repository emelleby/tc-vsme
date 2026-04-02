/**
 * GooglePlacesSearch
 *
 * A self-contained address autocomplete widget backed by the new Google Places
 * API (AutocompleteSuggestion + Place.fetchFields), recommended as of March 2025.
 *
 * Uses the functional API from @googlemaps/js-api-loader (setOptions +
 * importLibrary) so the Maps SDK is lazy-loaded on first render.
 *
 * Props:
 *   onSelect  – called with a fully-resolved PropertyLocation when the user
 *               picks a suggestion.
 *   disabled  – mirrors the fieldset disabled state.
 *   value     – current formatted address (for display only).
 */

import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { Loader2, MapPin, Search, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { PropertyLocation } from '@/lib/forms/schemas/b1-general-schema'

// ─── One-time SDK initialisation ─────────────────────────────────────────────
// setOptions must be called exactly once AND only in the browser (not during
// SSR where `window` is undefined). We use a module-level flag so that even
// if multiple GooglePlacesSearch instances mount, setOptions is only called
// on the very first mount.
let mapsInitialized = false

function ensureMapsInitialized() {
	if (mapsInitialized) return
	mapsInitialized = true
	setOptions({
		key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
		v: 'weekly',
	})
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Suggestion {
	placeId: string
	fullText: string
	mainText: string
	secondaryText: string
	/** Raw PlacePrediction for calling toPlace() */
	placePrediction: google.maps.places.PlacePrediction
}

interface GooglePlacesSearchProps {
	onSelect: (location: Omit<PropertyLocation, 'id'>) => void
	disabled?: boolean
	/** Pre-filled display value (e.g. when editing an existing entry) */
	value?: string
	placeholder?: string
}

// ─── Address component extractor ─────────────────────────────────────────────

function extractAddressComponents(
	components: google.maps.places.AddressComponent[],
): {
	streetNumber: string
	route: string
	city: string
	postalCode: string
	country: string
	countryCode: string
} {
	const get = (type: string) =>
		components.find((c) => c.types.includes(type))?.longText ?? ''
	const getShort = (type: string) =>
		components.find((c) => c.types.includes(type))?.shortText ?? ''

	return {
		streetNumber: get('street_number'),
		route: get('route'),
		city:
			get('locality') ||
			get('postal_town') ||
			get('administrative_area_level_2'),
		postalCode: get('postal_code'),
		country: get('country'),
		countryCode: getShort('country'),
	}
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GooglePlacesSearch({
	onSelect,
	disabled = false,
	value = '',
	placeholder = 'Søk etter adresse…',
}: GooglePlacesSearchProps) {
	const [query, setQuery] = useState(value)
	const [suggestions, setSuggestions] = useState<Suggestion[]>([])
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [apiReady, setApiReady] = useState(false)
	const [apiError, setApiError] = useState<string | null>(null)

	const sessionToken =
		useRef<google.maps.places.AutocompleteSessionToken | null>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	// ── Load Google Maps SDK ──────────────────────────────────────────────────
	useEffect(() => {
		let cancelled = false

		// Initialize Maps SDK options once, safely in browser context
		ensureMapsInitialized()

		importLibrary('places')
			.then(() => {
				if (cancelled) return
				sessionToken.current = new google.maps.places.AutocompleteSessionToken()
				setApiReady(true)
			})
			.catch((err: unknown) => {
				if (cancelled) return
				console.error('[GooglePlacesSearch] Failed to load Maps SDK:', err)
				setApiError('Kunne ikke laste Google Maps. Sjekk API-nøkkelen.')
			})

		return () => {
			cancelled = true
		}
	}, [])

	// ── Close dropdown on outside click ──────────────────────────────────────
	useEffect(() => {
		function onOutsideClick(e: MouseEvent) {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
				setOpen(false)
		}
		document.addEventListener('mousedown', onOutsideClick)
		return () => document.removeEventListener('mousedown', onOutsideClick)
	}, [])

	// ── Sync external value ───────────────────────────────────────────────────
	useEffect(() => {
		setQuery(value)
	}, [value])

	// ── Autocomplete fetch ────────────────────────────────────────────────────
	const fetchSuggestions = useCallback(
		async (input: string) => {
			if (!apiReady || input.length < 3) {
				setSuggestions([])
				return
			}

			setLoading(true)
			try {
				const { suggestions: raw } =
					await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
						{
							input,
							sessionToken: sessionToken.current ?? undefined,
							includedPrimaryTypes: ['street_address', 'premise'],
						},
					)

				setSuggestions(
					raw
						.filter((s) => s.placePrediction !== null)
						.map((s) => {
							const pp = s.placePrediction!
							return {
								placeId: pp.placeId,
								fullText: pp.text.text,
								mainText: pp.mainText?.text ?? pp.text.text,
								secondaryText: pp.secondaryText?.text ?? '',
								placePrediction: pp,
							}
						}),
				)
				setOpen(true)
			} catch (err) {
				console.error('[GooglePlacesSearch] fetchAutocompleteSuggestions:', err)
				setSuggestions([])
			} finally {
				setLoading(false)
			}
		},
		[apiReady],
	)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		setQuery(val)
		if (debounceTimer.current) clearTimeout(debounceTimer.current)
		debounceTimer.current = setTimeout(() => fetchSuggestions(val), 300)
	}

	// ── Place detail resolution ───────────────────────────────────────────────
	const handleSelect = useCallback(
		async (suggestion: Suggestion) => {
			setQuery(suggestion.fullText)
			setOpen(false)
			setSuggestions([])
			setLoading(true)

			try {
				const place = suggestion.placePrediction.toPlace()

				await place.fetchFields({
					fields: ['addressComponents', 'formattedAddress', 'location', 'id'],
				})

				// Rotate session token after billing unit completes
				sessionToken.current = new google.maps.places.AutocompleteSessionToken()

				const components = place.addressComponents ?? []
				const parts = extractAddressComponents(components)
				const streetAddress = [parts.streetNumber, parts.route]
					.filter(Boolean)
					.join(' ')

				onSelect({
					formattedAddress: place.formattedAddress ?? suggestion.fullText,
					streetAddress,
					city: parts.city,
					postalCode: parts.postalCode,
					country: parts.country,
					countryCode: parts.countryCode,
					placeId: place.id ?? suggestion.placeId,
					lat: place.location?.lat() ?? 0,
					lng: place.location?.lng() ?? 0,
				})
			} catch (err) {
				console.error('[GooglePlacesSearch] fetchFields failed:', err)
			} finally {
				setLoading(false)
			}
		},
		[onSelect],
	)

	const handleClear = () => {
		setQuery('')
		setSuggestions([])
		setOpen(false)
	}

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<div className="relative" ref={wrapperRef}>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
				<Input
					type="text"
					value={query}
					onChange={handleInputChange}
					onFocus={() => suggestions.length > 0 && setOpen(true)}
					placeholder={apiError ?? placeholder}
					disabled={disabled || !apiReady}
					className="pl-9 pr-9"
					autoComplete="off"
					aria-autocomplete="list"
					aria-expanded={open}
					aria-haspopup="listbox"
				/>
				{loading && (
					<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
				)}
				{!loading && query && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
						aria-label="Tøm søk"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			{open && suggestions.length > 0 && (
				<Card className="absolute z-50 w-full mt-1 shadow-lg border-border">
					<CardContent className="p-0">
						<ul className="py-1">
							{suggestions.map((s) => (
								<li key={s.placeId}>
									<button
										type="button"
										className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-muted cursor-pointer transition-colors text-left"
										onClick={() => handleSelect(s)}
									>
										<MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
										<div className="flex flex-col min-w-0">
											<span className="text-sm font-medium truncate">
												{s.mainText}
											</span>
											<span className="text-xs text-muted-foreground truncate">
												{s.secondaryText}
											</span>
										</div>
									</button>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
