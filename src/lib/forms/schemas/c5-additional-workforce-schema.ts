import { z } from 'zod'

export const c5AdditionalWorkforceSchema = z.object({
  reportingYear: z.string().regex(/^\d{4}$/, 'År må være 4 siffer'),
  selfEmployedWorkers: z
    .number({ message: 'Dette feltet er påkrevd' })
    .int('Må være et heltall')
    .min(0, 'Må være 0 eller mer')
    .default(0),
  contractWorkers: z
    .number({ message: 'Dette feltet er påkrevd' })
    .int('Må være et heltall')
    .min(0, 'Må være 0 eller mer')
    .default(0),
})

export type C5AdditionalWorkforceValues = z.infer<typeof c5AdditionalWorkforceSchema>
