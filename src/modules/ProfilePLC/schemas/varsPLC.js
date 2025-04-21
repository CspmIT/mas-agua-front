import { z } from 'zod'

const points = z.object({
    startPoint: z.coerce
        .number({ message: 'El valor debe ser numérico' })
        .positive({ message: 'El valor debe ser positivo' })
        .int({ message: 'El valor debe ser un entero' }),
    endPoint: z.coerce
        .number({ message: 'El valor debe ser numérico' })
        .positive({ message: 'El valor debe ser positivo' })
        .int({ message: 'El valor debe ser un entero' }),
})

const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}$/

export const varPLCSchema = z.object({
    topic: z
        .string({ message: 'El topico debe ser un string' })
        .trim()
        .min(3, { message: 'El topico debe tener al menos 3 caracteres' }),
    influx: z.enum(
        ['Sensors_Morteros_Interna', 'Sensors_Externos', 'externos'],
        { message: 'El influx seleccionado no es valido' }
    ),
    PLCModel: z.enum(['LOGO_7', 'LOGO_8', 'S7_1200'], {
        message: 'El valor enviado no es valido',
    }),
    ip: z
        .string({ message: 'La ip debe ser string' })
        .refine((val) => ipv4Regex.test(val), {
            message: 'La IP no es válida',
        }),
    serviceName: z
        .string({ message: 'El nombre debe ser un string' })
        .trim()
        .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
        .regex(/^[^\s]+$/, {
            message: 'El nombre debe ser una sola palabra sin espacios',
        }),
    rack: z.coerce
        .number({ message: 'El valor debe ser numérico' })
        .positive({ message: 'El valor debe ser positivo' })
        .int({ message: 'El valor debe ser un entero' }),

    slot: z.coerce
        .number({ message: 'El valor debe ser numérico' })
        .positive({ message: 'El valor debe ser positivo' })
        .int({ message: 'El valor debe ser un entero' }),
    points: z.array(points),
})
