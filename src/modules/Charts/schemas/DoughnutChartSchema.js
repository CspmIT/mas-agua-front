import { z } from 'zod'

export const DoughnutChartschema = z
    .object({
        title: z
            .string({ message: 'El título no es válido' })
            .min(1, { message: 'El título es obligatorio' }),
        categoryName: z.string().min(1, 'La categoría es obligatoria'),
        colorCategory: z.string().min(1, 'El color es obligatorio'),
        idVar: z.number().min(1),
        lastValue: z.boolean(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (!data.lastValue) {
            if (!data.startDate || data.startDate.trim() === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'La fecha de inicio es obligatoria',
                    path: ['startDate'],
                })
            }
            if (!data.endDate || data.endDate.trim() === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'La fecha de fin es obligatoria',
                    path: ['endDate'],
                })
            }
        }
    })
