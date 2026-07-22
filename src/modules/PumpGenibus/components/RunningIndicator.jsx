import { StatusChip } from '../../PumpsTable/components/PumpPrimitives'
import { formatTime, formatWallDateTime } from '../utils/constants'

// Detalle corto de por que esta corriendo la programacion
const describe = (automation) => {
    if (automation.programming === 1) {
        return `Diaria ${formatTime(automation.time_start)}–${formatTime(automation.time_finish)} hs → ${Number(
            automation.starting_pressure
        ).toFixed(1)} bar`
    }
    if (automation.programming === 2) {
        return `Hasta ${formatWallDateTime(automation.date_finish)} → ${Number(
            automation.starting_pressure
        ).toFixed(1)} bar`
    }
    return `Nivel de cisterna ${automation.cistern_level_current ?? '?'}% < ${automation.cistern_level}% → ${Number(
        automation.starting_pressure
    ).toFixed(1)} bar`
}

// Indicador de automatizaciones dentro de su ventana de ejecucion ahora.
// Se muestra entre la card de estado y la tabla de programaciones.
const RunningIndicator = ({ running }) => {
    if (!running || running.length === 0) {
        return <StatusChip label="Sin automatizaciones en curso" tone="neutral" />
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <StatusChip
                label={running.length === 1 ? 'Automatización en curso' : `${running.length} automatizaciones en curso`}
                tone="warning"
                pulse
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
                {running.map(describe).join(' · ')}
            </span>
        </div>
    )
}

export default RunningIndicator
