import { z } from 'zod'

export const employeePerCountrySchema = z.object({
	id: z.string(),
	land: z.string().min(1, 'Land er påkrevd'),
	antallAnsatte: z
		.number({ message: 'Antall ansatte er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
})

export const b8WorkforceSchema = z.object({
	reportingYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
	heltidsansatte: z
		.number({ message: 'Dette feltet er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
	deltidsansatte: z
		.number({ message: 'Dette feltet er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
	midlertidigAnsatte: z
		.number({ message: 'Dette feltet er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
	menn: z
		.number({ message: 'Dette feltet er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
	kvinner: z
		.number({ message: 'Dette feltet er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
	annet: z
		.number({ message: 'Dette feltet er påkrevd' })
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer'),
	ansattePerLand: z.array(employeePerCountrySchema),
	employeesLeft: z
		.number()
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer')
		.optional(),
	employeesAtStart: z
		.number()
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer')
		.optional(),
	employeesAtEnd: z
		.number()
		.int('Må være et heltall')
		.min(0, 'Må være 0 eller mer')
		.optional(),
	turnoverRate: z.number().optional(),
	eventuellUtfyllendeInfo: z.string().optional(),
})

export type EmployeePerCountry = z.infer<typeof employeePerCountrySchema>
export type B8WorkforceFormValues = z.infer<typeof b8WorkforceSchema>
