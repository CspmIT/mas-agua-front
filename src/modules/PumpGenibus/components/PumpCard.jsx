import { Box } from '@mui/material'
import CyclonePropIcon from '@mui/icons-material/Cyclone'
import { StatusChip } from '../../PumpsTable/components/PumpPrimitives'

// Velocidad de giro del "ventilador" segun el % de marcha (como el legacy,
// que cambiaba la clase velocidad_0_25 ... velocidad_75_100)
const spinDuration = (pct) => {
    if (pct === null || pct === undefined || pct <= 0) return null
    if (pct <= 25) return '3s'
    if (pct <= 50) return '2s'
    if (pct <= 75) return '1.2s'
    return '0.7s'
}

const DataRow = ({ label, value, unit }) => (
    <div className="flex items-baseline justify-between py-1 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {value}
            {unit && <span className="ml-1 text-xs font-normal text-gray-400">{unit}</span>}
        </span>
    </div>
)

// Card de una bomba con toda la informacion que trae Genibus:
// % de marcha, corriente, energia acumulada, horas de uso y alarma
const PumpCard = ({ pump }) => {
    const pct = pump.porcentaje_marcha
    const duration = spinDuration(pct)
    const running = pump.en_marcha === 1

    return (
        <Box
            className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col gap-2"
        >
            <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700 dark:text-gray-200">
                    Bomba {pump.numero}
                </span>
                {pump.alarma > 0 ? (
                    <StatusChip label={`Alarma ${pump.alarma}`} tone="error" pulse />
                ) : (
                    <StatusChip label="Sin alarma" tone="success" />
                )}
            </div>

            <div className="flex items-center gap-3 my-1">
                <CyclonePropIcon
                    sx={{
                        fontSize: 44,
                        color: running ? '#368bed' : '#94a3b8',
                        ...(duration && {
                            animation: `pumpSpin ${duration} linear infinite`,
                            '@keyframes pumpSpin': {
                                from: { transform: 'rotate(0deg)' },
                                to: { transform: 'rotate(360deg)' },
                            },
                        }),
                    }}
                />
                <div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-none">
                        {pct === null ? 'N/D' : `${pct}%`}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {running ? 'En marcha' : 'Detenida'}
                    </div>
                </div>
            </div>

            <div>
                <DataRow label="Corriente" value={pump.corriente} unit="A" />
                <DataRow
                    label="Energía acumulada"
                    value={pump.energia_total?.toLocaleString('es-AR')}
                    unit="kWh"
                />
                <DataRow
                    label="Horas de uso"
                    value={pump.horas_uso?.toLocaleString('es-AR')}
                    unit="h"
                />
            </div>
        </Box>
    )
}

export default PumpCard
