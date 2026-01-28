import React from 'react'
import { Card, Typography } from '@mui/material'

/**
 * LED compacto con misma semántica que BooleanChart
 */
const LedIndicator = ({
    label,
    value,
    textOn = 'Encendido',
    textOff = 'Apagado',
    colorOn = '#00ff00',
    colorOff = '#444444',
}) => {
    const hasValue = value !== 'Sin datos'
    const isOn = hasValue && Boolean(value)

    const color = !hasValue
        ? '#9ca3af'
        : isOn
            ? colorOn
            : colorOff

    const text = !hasValue
        ? 'Sin datos'
        : isOn
            ? textOn
            : textOff

    return (
        <div className="flex flex-col px-2 py-2 bg-white rounded-xl border border-slate-200 shadow-sm ">
            <span className="text-md font-medium text-slate-700">
                {label}
            </span>

            <div className="flex items-center gap-3">
                <span
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: color,

                        // BORDE
                        border: `2px solid ${!hasValue
                            ? '#9ca3af'
                            : isOn
                                ? colorOn
                                : '#6b7280'
                            }`,

                        // SOMBRA / GLOW
                        boxShadow: !hasValue
                            ? '0 0 4px rgba(156,163,175,0.6)'
                            : isOn
                                ? `
                                0 0 4px ${colorOn},
                              `
                                : '0 0 4px rgba(0,0,0,0.25)',

                        transition: 'all 0.25s ease-in-out',
                    }}
                />

                <div className="flex flex-col leading-tight">
                    <span
                        className="text-lg font-bold"
                        style={{
                            color: !hasValue
                                ? '#6b7280'
                                : isOn
                                    ? '#065f46'
                                    : '#374151',
                        }}
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
                <div className="p-3 bg-slate-100/75 border-b-2 border-b-[#e5e7eb] shrink-0">
                    <h1 className='text-xl leading-tight line-clamp-2'>{title}</h1>
                </div>
            )}

            <div className="pt-1 grid grid-cols-2 h-[80%] m-2 gap-2 justify-center align-middle overflow-auto">
                {items.map(item => (
                    <LedIndicator
                        key={item.key}
                        label={item.title}
                        value={item.value}
                        textOn={item.textOn}
                        textOff={item.textOff}
                        colorOn={item.colorOn}
                        colorOff={item.colorOff}
                    />
                ))}
            </div>
        </Card>
    )
}

export default MultipleBooleanChart
