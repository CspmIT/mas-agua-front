import { useEffect, useRef, useState } from 'react'
import { AccessTime } from '@mui/icons-material'

/**
 * Panel de información (ex "Bombas: estado y porcentaje").
 * Mini tablero genérico: estados destacados (filas) + valores (tiles en grilla),
 * cada uno con su label y el último valor traído de Influx.
 *
 * Resuelve todas las formas que puede devolver /multipleDataInflux:
 *  - number  → valor + unidad
 *  - string  → texto (con tono según palabras clave de estado)
 *  - boolean → LED encendido/apagado
 *  - array   → bits de variable binaria comprimida (se elige por id_bit)
 *  - objeto {image, label} → variable calc_binary (color según estado)
 */

// Alineado con IMAGE_OPTIONS de BitCalcVarModal / MultipleBooleanChart
const CALC_BINARY_STATE = {
    default: { color: '#94a3b8', active: false },
    success: { color: '#10B981', active: true },
    error: { color: '#ef4444', active: true },
    warning: { color: '#f59e0b', active: true },
}

const TONE = {
    on: { color: '#10B981', text: 'text-[#047857] dark:text-[#34d399]' },
    off: { color: '#f43f5e', text: 'text-rose-600 dark:text-rose-300' },
    neutral: { color: '#368bed', text: 'text-slate-800 dark:text-slate-100' },
    empty: { color: '#94a3b8', text: 'text-slate-300 dark:text-slate-600' },
}

const normalize = (s) =>
    String(s)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')

// Tono para strings de estado ("Bomba apagada", "En marcha", etc.)
const resolveStringTone = (text) => {
    const t = normalize(text)
    if (/apagad|parad|paro|detenid|falla|error|alarma|desconectad|sin dato/.test(t)) return 'off'
    if (/encendid|marcha|activ|bombeando|conectad|normal|\bok\b/.test(t)) return 'on'
    return 'neutral'
}

const cleanUnit = (unit) => {
    if (!unit) return ''
    const clean = String(unit).trim().toLowerCase()
    if (clean === 'bool' || clean === '-' || clean === '') return ''
    return String(unit).trim()
}

/** Display booleano con labels personalizables por item (as_bool / bits / boolean). */
const boolDisplay = (on, item) => {
    const tone = on ? 'on' : 'off'
    const custom = on ? item?.text_on : item?.text_off
    return {
        text: custom || (on ? 'Encendido' : 'Apagado'),
        unit: '',
        tone,
        color: TONE[tone].color,
        dot: true,
        active: on,
    }
}

/**
 * Normaliza el valor crudo de un item a { text, unit, tone, color, dot, active }.
 * `dot` indica si se muestra el LED junto al valor.
 */
const resolveDisplay = (item) => {
    let raw = item?.value

    // Bits de variable binaria comprimida: elegir el bit configurado
    if (Array.isArray(raw)) {
        const bit = raw.find((b) => b.id_bit === item.id_bit)
        raw = bit ? Boolean(bit.value) : null
    }

    if (raw === null || raw === undefined || raw === 'Sin datos') {
        return { text: 'Sin datos', unit: '', tone: 'empty', color: TONE.empty.color, dot: false, active: false }
    }

    // Item marcado como booleano: traducir 0/1 (o true/false) a los labels
    if (item?.as_bool && (typeof raw === 'boolean' || typeof raw === 'number' || !isNaN(Number(raw)))) {
        return boolDisplay(Boolean(Number(raw)), item)
    }

    // calc_binary: { index, bitValues, image, label }
    if (typeof raw === 'object' && 'image' in raw && 'label' in raw) {
        const st = CALC_BINARY_STATE[raw.image] ?? CALC_BINARY_STATE.default
        return {
            text: raw.label || 'Sin definir',
            unit: '',
            tone: 'custom',
            color: st.color,
            dot: true,
            active: st.active,
        }
    }

    if (typeof raw === 'boolean') {
        return boolDisplay(raw, item)
    }

    if (typeof raw === 'number') {
        return {
            text: Number.isFinite(raw) ? String(raw) : '-',
            unit: cleanUnit(item?.unit),
            tone: 'neutral',
            color: TONE.neutral.color,
            dot: false,
            active: false,
        }
    }

    // string
    const tone = resolveStringTone(raw)
    return {
        text: String(raw),
        unit: '',
        tone,
        color: TONE[tone].color,
        dot: tone !== 'neutral',
        active: tone === 'on',
    }
}

const valueTextClass = (display) =>
    display.tone === 'custom' ? '' : TONE[display.tone]?.text ?? TONE.neutral.text

// Tarjeta con dato: fondo blanco y borde celeste sutil
const CARD_3D_CLASSES =
    'bg-white dark:bg-white/[0.025] border-2 border-[#bfdbfe]/50 dark:border-[#368bed]/20'

// Tarjeta sin dato: borde punteado
const CARD_EMPTY_CLASSES =
    'bg-white dark:bg-white/[0.025] border-2 border-dashed border-[#1f4e79]/15 dark:border-white/15'

/** LED con anillo de "ping" cuando el estado está activo. */
const Led = ({ color, active }) => (
    <span className='relative flex w-2 h-2 shrink-0 self-center'>
        {active && (
            <span
                className='absolute inline-flex w-full h-full rounded-full animate-ping opacity-40'
                style={{ backgroundColor: color }}
            />
        )}
        <span
            className='relative inline-flex w-2 h-2 rounded-full'
            style={{ backgroundColor: color }}
        />
    </span>
)

/** Fila destacada de estado: label a la izquierda, valor protagonista a la derecha. */
const StatusRow = ({ item }) => {
    const display = resolveDisplay(item)
    const hasData = display.tone !== 'empty'
    return (
        <div
            className={[
                'flex items-center justify-between gap-2 min-h-[38px] px-3 py-1.5 rounded-xl',
                'shadow-[0_1px_4px_-2px_rgba(31,78,121,0.18)] dark:shadow-[0_1px_4px_-2px_rgba(0,0,0,0.35)]',
                hasData ? CARD_3D_CLASSES : CARD_EMPTY_CLASSES,
            ].join(' ')}
        >
            <span className='text-[10.5px] font-semibold uppercase tracking-[0.09em] text-slate-400 dark:text-slate-500 truncate'>
                {item.name}
            </span>
            <span
                className={`flex items-center gap-1.5 text-[15px] font-bold tracking-tight tabular-nums text-right ${valueTextClass(display)}`}
                style={display.tone === 'custom' ? { color: display.color } : undefined}
            >
                {display.dot && <Led color={display.color} active={display.active} />}
                {display.text}
                {display.unit && (
                    <span className='text-[11px] font-semibold text-slate-400 dark:text-slate-500'>
                        {display.unit}
                    </span>
                )}
            </span>
        </div>
    )
}

/** Tile de valor: label arriba, valor + unidad abajo. Se adapta a la grilla. */
const ValueTile = ({ item }) => {
    const display = resolveDisplay(item)
    const hasData = display.tone !== 'empty'
    const isText = display.tone !== 'neutral' || display.dot
    return (
        <div
            className={[
                'relative overflow-hidden rounded-xl px-2.5 py-2 min-w-0 min-h-[64px]',
                'flex flex-col justify-center items-center text-center gap-1',
                hasData ? CARD_3D_CLASSES : CARD_EMPTY_CLASSES,
            ].join(' ')}
        >
            {/* Lavado de color sutil arriba a la izquierda, como los tiles de Sala */}
            {hasData && (
                <div
                    className='pointer-events-none absolute inset-0'
                    aria-hidden
                    style={{
                        background: `radial-gradient(120% 90% at 0% 0%, ${display.color}10, transparent 60%)`,
                    }}
                />
            )}
            <span className='relative text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400 dark:text-slate-500 truncate'>
                {item.name}
            </span>
            <span
                className={[
                    'relative flex items-baseline gap-1 font-bold tabular-nums leading-none',
                    isText ? 'text-[14px]' : 'text-[18px]',
                    valueTextClass(display),
                ].join(' ')}
                style={display.tone === 'custom' ? { color: display.color } : undefined}
            >
                {display.dot && <Led color={display.color} active={display.active} />}
                <span className='truncate'>{display.text}</span>
                {display.unit && (
                    <span className='text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0'>
                        {display.unit}
                    </span>
                )}
            </span>
        </div>
    )
}

// Ancho mínimo del panel para acomodar los estados de a 2 por fila
const TWO_COL_MIN_WIDTH = 560

const PumpInfoPanel = ({ initialStates = [], initialPumps = [], lastUpdate = null }) => {
    const states = initialStates ?? []
    const pumps = initialPumps ?? []
    const panelRef = useRef(null)
    const [isWide, setIsWide] = useState(false)

    useEffect(() => {
        if (!panelRef.current) return
        const observer = new ResizeObserver(([entry]) => {
            setIsWide(entry.contentRect.width >= TWO_COL_MIN_WIDTH)
        })
        observer.observe(panelRef.current)
        return () => observer.disconnect()
    }, [])

    if (!states.length && !pumps.length) {
        return (
            <div className='flex items-center justify-center h-full w-full text-xs text-slate-400 dark:text-slate-500'>
                Sin indicadores configurados
            </div>
        )
    }

    const timestamp = (lastUpdate ? new Date(lastUpdate) : new Date()).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    })

    return (
        <div ref={panelRef} className='flex flex-col h-full w-full min-h-0 px-2 pt-2 pb-1'>
            <div className='flex-1 min-h-0 overflow-y-auto flex flex-col justify-center gap-1.5'>
                {states.length > 0 && (
                    // Panel ancho: estados de a 2 por fila (el impar final ocupa toda
                    // la fila). Panel angosto: uno debajo del otro.
                    <div
                        className={
                            isWide
                                ? 'grid grid-cols-2 gap-1.5 [&>*:last-child:nth-child(odd)]:col-span-2'
                                : 'flex flex-col gap-1.5'
                        }
                    >
                        {states.map((item) => (
                            <StatusRow key={item.id} item={item} />
                        ))}
                    </div>
                )}

                {pumps.length > 0 && (
                    // Panel ancho: tantos tiles por fila como entren. Panel angosto:
                    // de a 2 por fila (el impar final ocupa toda la fila).
                    <div
                        className={
                            isWide
                                ? 'grid gap-1.5'
                                : 'grid grid-cols-2 gap-1.5 [&>*:last-child:nth-child(odd)]:col-span-2'
                        }
                        style={
                            isWide
                                ? { gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))' }
                                : undefined
                        }
                    >
                        {pumps.map((item) => (
                            <ValueTile key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>

            <div className='flex items-center justify-center gap-1 pt-1 text-slate-400 dark:text-slate-500 shrink-0'>
                <AccessTime sx={{ fontSize: 13 }} />
                <span className='text-[11px] tabular-nums'>{timestamp}</span>
            </div>
        </div>
    )
}

export default PumpInfoPanel
