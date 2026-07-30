import { memo, useEffect, useRef, useState } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import LineChart from './LineChart'

// ── Tarjeta de monitoreo de energía (Gralf, medidor trifásico) ──────────────
// Presenta el último mensaje de los 6 subtópicos del medidor. Regla de oro:
// NUNCA recalcular en el front lo que el medidor ya publica (los totales del
// índice 3 no siempre son la suma: S es vectorial, CFi es P/S, VF es promedio).

const PHASE_COLORS = ['#CF0927', '#1e5fd0', '#e5259b']

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

const fmt = (v, dec = 1) => {
    const n = num(v)
    return n === null ? '—' : n.toFixed(dec)
}

const pct = (v, max) => {
    const n = num(v)
    const m = num(max)
    if (n === null || m === null || m <= 0) return 0
    return Math.min(Math.max((n / m) * 100, 0), 100)
}

/** Fila de fase: etiqueta + barra + valor tabular. */
const PhaseRow = ({ label, color, value, max, dec = 2 }) => (
    <div className='grid grid-cols-[26px_1fr_64px] items-center gap-2 text-[12px]'>
        <span className='font-semibold text-slate-400 dark:text-slate-500'>{label}</span>
        <span className='block h-[6px] rounded-full bg-slate-500/15 dark:bg-white/10 overflow-hidden'>
            <span
                className='block h-full rounded-full'
                style={{ width: `${pct(value, max)}%`, backgroundColor: color }}
            />
        </span>
        <span className='text-right font-semibold tabular-nums text-slate-700 dark:text-slate-200'>
            {fmt(value, dec)}
        </span>
    </div>
)

/** Tarjeta de grupo (tensión, corriente, potencia, FP). */
const EnCard = ({ title, tag, big, bigUnit, children, sub }) => (
    <div className='rounded-xl border border-[#1f4e79]/10 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.025] px-3 py-2.5 min-w-0'>
        <div className='text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 truncate'>
            {title}
            {tag && <span className='ml-1 normal-case tracking-normal font-mono text-slate-300 dark:text-slate-600'>· {tag}</span>}
        </div>
        <div className='mt-0.5 text-[21px] font-semibold leading-tight tabular-nums text-slate-800 dark:text-slate-100'>
            {big}
            {bigUnit && <span className='ml-1 text-[11.5px] font-medium text-slate-400 dark:text-slate-500'>{bigUnit}</span>}
        </div>
        <div className='mt-1.5 flex flex-col gap-1'>{children}</div>
        {sub && (
            <div className='mt-1.5 pt-1.5 border-t border-[#1f4e79]/8 dark:border-white/5 text-[11px] text-slate-400 dark:text-slate-500'>
                {sub}
            </div>
        )}
    </div>
)

/** Fila de demanda: label + valores + barra de proporción contra el máximo. */
const DemandRow = ({ label, value, max, unit, dec = 2, color }) => (
    <div>
        <div className='flex items-baseline justify-between gap-2 text-[12px]'>
            <span className='text-slate-500 dark:text-slate-400 truncate'>{label}</span>
            <b className='tabular-nums shrink-0 text-slate-700 dark:text-slate-200'>
                {fmt(value, dec)}
                {max !== undefined && ` / ${fmt(max, dec)}`} {unit}
            </b>
        </div>
        <span className='mt-0.5 block h-[7px] rounded-full bg-slate-500/15 dark:bg-white/10 overflow-hidden'>
            <span
                className='block h-full rounded-full'
                style={{ width: `${max !== undefined ? pct(value, max) : num(value) !== null ? 100 : 0}%`, backgroundColor: color }}
            />
        </span>
    </div>
)

/** Vista presentacional: recibe { ts, groups } ya consultado y, opcionalmente,
 * la serie histórica de potencia { xSeries, P, Q } para la curva P/Q. */
export const GralfChartView = memo(({ title, data, series = null }) => {
    const g = data?.groups || {}
    const inst = g.instantaneos || {}
    const pot = g.insPotencia || {}
    const dem = g.demanda || {}
    const ener = g.energia || {}
    const max = g.maximos || {}
    const min = g.minimos || {}

    const hasData = Object.values(g).some((group) => Object.keys(group || {}).length > 0)

    const VF = inst.VF || []
    const VL = inst.VL || []
    const I = inst.I || []
    const CFi = inst.CFi || []
    const F = inst.F || []
    const P = pot.P || []
    const Q = pot.Q || []
    const S = pot.S || []

    const maxI = Math.max(...[I[0], I[1], I[2]].map((v) => num(v) ?? 0), 1)

    // Desbalance de fases: (max - min) / promedio de las 3 corrientes
    const phases = [I[0], I[1], I[2]].map(num)
    const desbalance = phases.every((v) => v !== null) && (phases[0] + phases[1] + phases[2]) > 0
        ? (((Math.max(...phases) - Math.min(...phases)) / ((phases[0] + phases[1] + phases[2]) / 3)) * 100)
        : null

    const tsText = data?.ts
        ? new Date(data.ts).toLocaleString('es-AR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: false,
          }).replace(',', '')
        : null

    return (
        <div className='rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-white/[0.02] shadow-[0_1px_3px_rgba(15,42,68,0.04),0_12px_30px_-22px_rgba(15,42,68,0.30)] overflow-hidden'>
            <div className='flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-[#1f4e79]/8 dark:border-white/5'>
                <span className='inline-flex items-center rounded-full bg-gradient-to-r from-[#12456f] to-[#1f5f95] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.11em] text-white truncate'>
                    {title || 'Monitoreo de energía'}
                </span>
                {tsText && (
                    <span className='shrink-0 text-[11px] text-slate-400 dark:text-slate-500'>
                        Última lectura <b className='font-semibold tabular-nums text-slate-600 dark:text-slate-300'>{tsText}</b>
                    </span>
                )}
            </div>

            {!hasData ? (
                <div className='p-6 text-center text-[13px] text-slate-400 dark:text-slate-500'>
                    Sin datos del medidor
                </div>
            ) : (
                <div className='p-2 flex flex-col gap-2'>
                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2'>
                        <EnCard title='Tensión de fase' tag='VF' big={fmt(VF[3], 1)} bigUnit='V prom.'
                            sub={<>Línea · <b>VL</b>: {fmt(VL[0], 1)} / {fmt(VL[1], 1)} / {fmt(VL[2], 1)} V</>}>
                            {[0, 1, 2].map((i) => (
                                <PhaseRow key={i} label={`L${i + 1}`} color='#283080' value={VF[i]} max={245} dec={1} />
                            ))}
                        </EnCard>

                        <EnCard title='Corriente' tag='I' big={fmt(I[3], 2)} bigUnit='A total'
                            sub={<>Desbalance entre fases <b className='text-slate-600 dark:text-slate-300'>{desbalance === null ? '—' : `${desbalance.toFixed(1)} %`}</b></>}>
                            {[0, 1, 2].map((i) => (
                                <PhaseRow key={i} label={`L${i + 1}`} color={PHASE_COLORS[i]} value={I[i]} max={maxI} dec={2} />
                            ))}
                        </EnCard>

                        <EnCard title='Potencia' tag='P / Q / S' big={fmt(P[3], 2)} bigUnit='kW'
                            sub={<>P por fase: {fmt(P[0], 2)} / {fmt(P[1], 2)} / {fmt(P[2], 2)} kW</>}>
                            <PhaseRow label='P' color='#00933B' value={P[3]} max={S[3]} dec={2} />
                            <PhaseRow label='Q' color='#DA5224' value={Q[3]} max={S[3]} dec={2} />
                            <PhaseRow label='S' color='#0076B2' value={S[3]} max={S[3]} dec={2} />
                        </EnCard>

                        <EnCard title='Factor de potencia' tag='CFi' big={fmt(CFi[3], 3)}
                            sub={<>Frecuencia · <b>F</b>: <b className='text-slate-600 dark:text-slate-300'>{fmt(F[0], 2)} Hz</b></>}>
                            {[0, 1, 2].map((i) => (
                                <PhaseRow key={i} label={`L${i + 1}`} color='#B8BA0C' value={CFi[i]} max={1} dec={3} />
                            ))}
                        </EnCard>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                        <div className='rounded-xl border border-[#1f4e79]/10 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.025] px-3 py-2.5 flex flex-col gap-2'>
                            <div className='text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500'>
                                Demanda y energía acumulada
                            </div>
                            <DemandRow label='Demanda de corriente · IDmd / IDmdMax' value={dem.IDmd?.[3]} max={dem.IDmdMax?.[3]} unit='A' color='#0076B2' />
                            <DemandRow label='Demanda de potencia activa · PoDmd' value={dem.PoDmd?.[0]} max={dem.PoDmdMax?.[0]} unit='kW' color='#00933B' />
                            <DemandRow label='Demanda aparente · PoDmd' value={dem.PoDmd?.[2]} max={dem.PoDmdMax?.[2]} unit='kVA' color='#0076B2' />
                            <DemandRow label='Energía activa · EnerP' value={ener.EnerP?.[0]} unit='kWh' dec={1} color='#283080' />
                            <DemandRow label='Energía reactiva · EnerQ' value={ener.EnerQ?.[0]} unit='kvarh' dec={1} color='#DA5224' />
                        </div>

                        <div className='rounded-xl border border-[#1f4e79]/10 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.025] px-3 py-2.5 min-w-0'>
                            <div className='text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 mb-1'>
                                Máximos y mínimos del período
                            </div>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-[12px] tabular-nums'>
                                    <thead>
                                        <tr className='text-[10px] uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500'>
                                            <th className='text-left font-semibold py-1'>Variable</th>
                                            <th className='text-right font-semibold py-1'>L1</th>
                                            <th className='text-right font-semibold py-1'>L2</th>
                                            <th className='text-right font-semibold py-1'>L3</th>
                                            <th className='text-right font-semibold py-1'>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-slate-700 dark:text-slate-200'>
                                        {[
                                            { label: 'Tensión máx. (V)', arr: max.VFMax, dec: 1 },
                                            { label: 'Tensión mín. (V)', arr: min.VFMin, dec: 1 },
                                            { label: 'Corriente máx. (A)', arr: max.IMax, dec: 2 },
                                            { label: 'Corriente mín. (A)', arr: min.IMin, dec: 2 },
                                        ].map(({ label, arr, dec }) => (
                                            <tr key={label} className='border-t border-[#1f4e79]/8 dark:border-white/5'>
                                                <td className='py-1 text-slate-500 dark:text-slate-400 font-medium'>{label}</td>
                                                {[0, 1, 2, 3].map((i) => (
                                                    <td key={i} className='py-1 text-right'>{fmt(arr?.[i], dec)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className='mt-1 text-[11px] text-slate-400 dark:text-slate-500'>
                                Los mínimos en 0 corresponden a bomba parada, no a falla de tensión.
                            </p>
                        </div>
                    </div>

                    {/* Curva P/Q — últimas 24 h */}
                    {series?.xSeries?.length > 0 && (
                        <div className='rounded-xl border border-[#1f4e79]/10 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.025] px-3 py-2.5 min-w-0'>
                            <div className='flex items-center justify-between gap-2'>
                                <div className='text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500'>
                                    Potencia — últimas 24 h
                                </div>
                                <span className='text-[10.5px] text-slate-400 dark:text-slate-500'>
                                    Muestreo 5 m
                                </span>
                            </div>
                            <div className='h-[240px]'>
                                <LineChart
                                    yType='value'
                                    hideXLabels
                                    xSeries={series.xSeries}
                                    ySeries={[
                                        {
                                            name: 'P activa (kW)',
                                            color: '#00933B',
                                            areaStyle: true,
                                            data: series.P || [],
                                        },
                                        {
                                            name: 'Q reactiva (kvar)',
                                            color: '#DA5224',
                                            data: series.Q || [],
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
})

/** Wrapper con datos en vivo: snapshot cada 30 s y curva P/Q cada 5 min. */
const GralfChart = memo(({ varId, title, refreshMs = 30000, active = true }) => {
    const [data, setData] = useState(null)
    const [series, setSeries] = useState(null)
    const [loader, setLoader] = useState(true)
    const intervalRef = useRef(null)
    const seriesIntervalRef = useRef(null)

    useEffect(() => {
        if (!varId || !active) {
            setData(null)
            setLoader(!varId ? false : true)
            return undefined
        }

        const fetchData = async () => {
            try {
                const { data: res } = await request(
                    `${backend[import.meta.env.VITE_APP_NAME]}/gralfDataInflux`,
                    'POST',
                    { ids: [varId] }
                )
                setData(res?.[varId] ?? null)
            } catch (error) {
                console.error('Error consultando datos Gralf:', error)
                setData(null)
            } finally {
                setLoader(false)
            }
        }

        setLoader(true)
        fetchData()
        intervalRef.current = setInterval(fetchData, refreshMs)
        return () => clearInterval(intervalRef.current)
    }, [varId, active, refreshMs])

    // Curva P/Q: muestreo 5 m, refresco cada 5 min (más liviano que el snapshot)
    useEffect(() => {
        if (!varId || !active) {
            setSeries(null)
            return undefined
        }

        const fetchSeries = async () => {
            try {
                const { data: res } = await request(
                    `${backend[import.meta.env.VITE_APP_NAME]}/gralfSeriesInflux`,
                    'POST',
                    { id: varId, range: '-1d', every: '5m' }
                )
                setSeries(res ?? null)
            } catch (error) {
                console.error('Error consultando serie Gralf:', error)
                setSeries(null)
            }
        }

        fetchSeries()
        seriesIntervalRef.current = setInterval(fetchSeries, 5 * 60 * 1000)
        return () => clearInterval(seriesIntervalRef.current)
    }, [varId, active])

    if (loader) {
        return (
            <div className='rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-white/[0.02] p-6 text-center text-[13px] text-slate-400 dark:text-slate-500'>
                Cargando datos del medidor...
            </div>
        )
    }

    return <GralfChartView title={title} data={data} series={series} />
})

export default GralfChart
