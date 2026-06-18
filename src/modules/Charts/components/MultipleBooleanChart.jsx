import React from 'react'
import { Card, Typography } from '@mui/material'

/**
 * Mapa de estado para variables calc_binary.
 * El back devuelve un `image` (default | success | error | warning) por cada
 * combinación de bits; acá lo traducimos a color de LED, borde, glow y color
 * de texto. Debe quedar alineado con IMAGE_OPTIONS de BitCalcVarModal.
 */
const CALC_BINARY_STATE = {
    default: { color: '#444444', border: '#6b7280', glow: '0 0 4px rgba(0,0,0,0.25)', textColor: '#374151' },
    success: { color: '#00ff00', border: '#00ff00', glow: '0 0 4px #00ff00', textColor: '#065f46' },
    error: { color: '#ef4444', border: '#ef4444', glow: '0 0 4px #ef4444', textColor: '#991b1b' },
    warning: { color: '#f59e0b', border: '#f59e0b', glow: '0 0 4px #f59e0b', textColor: '#92400e' },
}

// Estado "sin datos" compartido por ambos modos
const NO_DATA_STATE = { color: '#9ca3af', border: '#9ca3af', glow: '0 0 4px rgba(156,163,175,0.6)', textColor: '#6b7280' }

/**
 * LED compacto con misma semántica que BooleanChart.
 * Soporta dos modos por item:
 *  - booleano: `value` es boolean o array de bits + id_bit.
 *  - calc_binary: `value` es { index, bitValues, image, label }; el color sale
 *    del `image` y el texto del `label` (estado calculado en el back).
 */
const LedIndicator = ({
    label,
    value,
    id_bit,
    textOn = 'Encendido',
    textOff = 'Apagado',
    colorOn = '#00ff00',
    colorOff = '#444444',
    isCalcBinary = false,
}) => {
    // Detección del modo calc_binary: por flag explícito o por la forma del value
    const looksCalcBinary =
        value && typeof value === 'object' && !Array.isArray(value) &&
        'image' in value && 'label' in value

    const calcMode = isCalcBinary || looksCalcBinary

    let color, borderColor, glow, text, textColor

    if (calcMode) {
        const state = looksCalcBinary
            ? (CALC_BINARY_STATE[value.image] ?? CALC_BINARY_STATE.default)
            : NO_DATA_STATE

        color = state.color
        borderColor = state.border
        glow = state.glow
        textColor = state.textColor
        text = looksCalcBinary ? (value.label || 'Sin definir') : 'Sin datos'
    } else {
        const resolvedValue = Array.isArray(value)
            ? (value.find(b => b.id_bit === id_bit)?.value ?? 'Sin datos')
            : value

        const hasValue = resolvedValue !== 'Sin datos'
        const isOn = hasValue && Boolean(resolvedValue)

        color = !hasValue ? NO_DATA_STATE.color : isOn ? colorOn : colorOff
        borderColor = !hasValue ? NO_DATA_STATE.border : isOn ? colorOn : '#6b7280'
        glow = !hasValue ? NO_DATA_STATE.glow : isOn ? `0 0 4px ${colorOn}` : '0 0 4px rgba(0,0,0,0.25)'
        textColor = !hasValue ? NO_DATA_STATE.textColor : isOn ? '#065f46' : '#374151'
        text = !hasValue ? 'Sin datos' : isOn ? textOn : textOff
    }

    return (
        <div className="flex flex-col justify-center w-fit flex-none px-2 py-1 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                {label}
            </span>

            <div className="flex items-center gap-2 whitespace-nowrap">
                <span
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: `2px solid ${borderColor}`,
                        boxShadow: glow,
                        transition: 'all 0.25s ease-in-out',
                    }}
                />

                <div className="flex flex-col leading-tight">
                    <span
                        className="text-lg font-bold"
                        style={{ color: textColor }}
                    >
                        {text}
                    </span>
                </div>
            </div>
        </div>
    )
}

/**
 * Grupo de LEDs
 */
const MultipleBooleanChart = ({
    title,
    items = [],
    columns = 2,
}) => {
    if (!items.length) {
        return (
            <Card className="p-4">
                <Typography
                    variant="body2"
                    align="center"
                    color="text.secondary"
                >
                    Sin indicadores configurados
                </Typography>
            </Card>
        )
    }

    // Ordenamos las cards alfabéticamente por label (numeric: "Bomba 9" antes de "Bomba 10")
    const sortedItems = [...items].sort((a, b) =>
        String(a.title ?? '').localeCompare(String(b.title ?? ''), 'es', {
            numeric: true,
            sensitivity: 'base',
        })
    )

    return (
        <Card
            sx={{
                borderRadius: 2,
                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                height: '100%',
                width: '100%',
            }}
            className="flex flex-col"
        >
            {title && (
                <div className="p-1 bg-slate-100/75 border-b-2 border-b-[#e5e7eb] shrink-0">
                    <h1 className='text-xl leading-tight line-clamp-2'>{title}</h1>
                </div>
            )}

            <div className="flex-1 min-h-0 overflow-auto flex flex-wrap content-stretch justify-center items-stretch gap-2 p-1">
                {sortedItems.map(item => (
                    <LedIndicator
                        key={item.key}
                        label={item.title}
                        value={item.value}
                        id_bit={item.id_bit}
                        textOn={item.textOn}
                        textOff={item.textOff}
                        colorOn={item.colorOn}
                        colorOff={item.colorOff}
                        isCalcBinary={item.isCalcBinary}
                    />
                ))}
            </div>
        </Card>
    )
}

export default MultipleBooleanChart
