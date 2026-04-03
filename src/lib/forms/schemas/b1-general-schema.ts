import { z } from 'zod'

export const propertyLocationSchema = z.object({
	id: z.string(),
	/** Full formatted address from Google Places */
	formattedAddress: z.string().min(1, 'Adresse er påkrevd'),
	/** Street + number */
	streetAddress: z.string().min(1, 'Gateadresse er påkrevd'),
	/** City / locality */
	city: z.string().min(1, 'By er påkrevd'),
	/** Postal / zip code */
	postalCode: z.string().min(1, 'Postnummer er påkrevd'),
	/** Country name */
	country: z.string().min(1, 'Land er påkrevd'),
	/** ISO 3166-1 alpha-2 country code */
	countryCode: z.string(),
	/** Google Place ID for deduplication / future lookups */
	placeId: z.string(),
	/** WGS-84 latitude */
	lat: z.number(),
	/** WGS-84 longitude */
	lng: z.number(),
})

export type PropertyLocation = z.infer<typeof propertyLocationSchema>

export const certificationSchema = z.object({
	id: z.string(),
	name: z.string().min(1, 'Navn på sertifisering er påkrevd'),
	issuer: z.string().min(1, 'Utsteder er påkrevd'),
	date: z.string().optional(),
	assessment: z.string().optional(),
})

export type Certification = z.infer<typeof certificationSchema>

export const EMPLOYEE_COUNTING_METHODOLOGIES = [
	'vsme:AtTheEndOfTheReportingPeriodMember',
	'vsme:AverageDuringTheReportingPeriodMember',
] as const

export const TYPE_OF_NUMBER_OF_EMPLOYEES = [
	'vsme:HeadcountMember',
	'vsme:Full-TimeEquivalentFTEMember',
] as const

export const b1GeneralSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	organizationName: z.string().min(1, 'Organization name is required'),
	organizationNumber: z.string().min(1, 'Organization number is required'),
	naceCode: z.string().min(1, 'NACE code is required'),
	revenue: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	balanceSheetTotal: z
		.number({ message: 'Dette feltet er påkrevd' })
		.min(0, 'Må være 0 eller mer'),
	employees: z
		.number({ message: 'Dette feltet er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
	EmployeeCountingMethodology: z.enum(EMPLOYEE_COUNTING_METHODOLOGIES),
	TypeOfNumberOfEmployees: z.enum(TYPE_OF_NUMBER_OF_EMPLOYEES),
	country: z.string().min(1, 'Country is required'),
	reportType: z.boolean(),
	subsidiaries: z
		.array(
			z.object({
				id: z.string(),
				name: z.string().min(1, 'Navn er påkrevd'),
				address: z.string().min(1, 'Adresse er påkrevd'),
			}),
		)
		.optional(),
	contactPersonName: z.string().min(1, 'Contact name is required'),
	// Allow empty string (field not filled) OR a valid email address.
	// z.email() rejects '' which would silently block form submission.
	// contactPersonEmail: z
	// 	.string()
	// 	.refine(
	// 		(val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
	// 		'Ugyldig e-postadresse',
	// 	)
	// 	.optional(),
	contactPersonEmail: z.email('Invalid email address').optional(),
	contactPersonPhone: z.string().optional(),
	/** Owned/operated properties with geocoordinates */
	properties: z.array(propertyLocationSchema).optional(),
	certifications: z.array(certificationSchema).optional(),
})

export type B1GeneralFormValues = z.infer<typeof b1GeneralSchema>
