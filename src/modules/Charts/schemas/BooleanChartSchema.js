import { z } from 'zod'

const validColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export const BooleanChartSchema = z
    .object({
        title: z
            .string({ message: 'Debe pasar un string como titulo' })
            .min(1, { message: 'El titulo es requerido' })
            .trim(),
        textOn: z
            .string({ message: 'Debe pasar un string como texto ON' })
            .min(1, { message: 'El texto ON es requerido' })
            .trim(),
        textOff: z
            .string({ message: 'Debe pasar un string como texto OFF' })
            .min(1, { message: 'El texto OFF es requerido' })
            .trim(),
        colorOn: z
            .string({ message: 'Debe pasar un string como color ON' })
            .min(1, { message: 'El color ON es requerido' })
            .regex(validColor, {
                message: 'El color no es valido. Debe estar en hexadecimal',
            })
            .trim(),
        colorOff: z
            .string({ message: 'Debe pasar un string como color OFF' })
            .min(1, { message: 'El color OFF es requerido' })
            .regex(validColor, {
                message: 'El color no es valido. Debe estar en hexadecimal',
            })
            .trim(),
        order: z
            .string()
            .transform((val) => parseInt(val, 10))
            .pipe(z.number({ message: 'Debe ser un numero' }).min(1, { message: 'Debe asignar un orden' }))
    })
    .superRefine((data, ctx) => {
        // Verificar que colorOn y colorOff no sean iguales
        if (data.colorOn === data.colorOff) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Los colores para ON y OFF deben ser diferentes',
                path: ['colorOn'],
            })
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Los colores para ON y OFF deben ser diferentes',
                path: ['colorOff'],
            })
        }
    })
