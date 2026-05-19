import { useState } from 'react'
import { Tune, ExpandLess } from '@mui/icons-material'
import { STATUS_COLORS, STATUS_LABELS } from '../utils/sensorDefaults'

const STATUSES = ['ok', 'warn', 'crit', 'stale', 'off']
const MONO_STACK =
    'ui-monospace, "JetBrains Mono", "IBM Plex Mono", Menlo, Consolas, monospace'

const StatusFilterBar = ({
    title = 'Presión de red urbana',
    counts,
    activeFilters,
    setActiveFilters,
    lastUpdate,
}) => {
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleClick = (status) => {
        const all = new Set(STATUSES)
        if (activeFilters.has(status) && activeFilters.size === STATUSES.length) {
            setActiveFilters(new Set([status]))
        } else if (activeFilters.has(status) && activeFilters.size === 1) {
            setActiveFilters(all)
        } else {
            setActiveFilters(new Set([status]))
        }
    }

    const minutesAgo = lastUpdate
        ? Math.max(0, Math.round((Date.now() - lastUpdate.getTime()) / 60000))
        : null
    const isLive = minutesAgo === 0

    const activeStatus =
        activeFilters.size === 1 ? [...activeFilters][0] : null

    return (
        <div className='bg-white border-b border-slate-200/80 select-none'>
            {/* Top row: title + filters (desktop) / title + toggle (mobile) */}
            <div className='flex items-stretch'>
                <div className='relative flex items-center px-3 py-1.5 border-r border-slate-200/80 min-w-0 flex-1 sm:flex-initial'>
                    <span
                        aria-hidden
                        className='absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full'
                        style={{ background: '#368bed' }}
                    />
                    <div className='flex flex-col leading-none min-w-0'>
                        <h1 className='text-[14px] font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-[260px]'>
                            {title}
                        </h1>
                        {activeStatus && (
                            <span
                                className='sm:hidden text-[9px] uppercase font-bold mt-0.5'
                                style={{
                                    color: STATUS_COLORS[activeStatus],
                                    letterSpacing: '0.14em',
                                }}
                            >
                                Filtro: {STATUS_LABELS[activeStatus]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Mobile toggle button */}
                <button
                    type='button'
                    onClick={() => setMobileOpen((v) => !v)}
                    className='sm:hidden flex items-center gap-1 px-3 border-l border-slate-200/80 text-slate-600 active:bg-slate-100'
                    aria-label={mobileOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
                >
                    {mobileOpen ? (
                        <ExpandLess sx={{ fontSize: 18 }} />
                    ) : (
                        <Tune sx={{ fontSize: 18 }} />
                    )}
                    <span
                        className='text-[10px] font-bold uppercase'
                        style={{ letterSpacing: '0.12em' }}
                    >
                        {mobileOpen ? 'Cerrar' : 'Filtros'}
                    </span>
                </button>

                {/* Desktop inline filter pills */}
                <div className='hidden sm:flex items-center flex-1 gap-1.5 px-2 my-2 overflow-x-auto'>
                    {STATUSES.map((s) => {
                        const isActive =
                            activeFilters.has(s) && activeFilters.size === 1
                        const count = counts?.[s] ?? 0
                        const color = STATUS_COLORS[s]
                        const barOpacity = isActive ? 1 : count > 0 ? 0.6 : 0.22
                        return (
                            <button
                                key={s}
                                onClick={() => handleClick(s)}
                                className='group relative flex items-center gap-2 flex-1 min-w-[72px] px-2.5 py-1 rounded-[5px] border transition-all duration-150 overflow-hidden'
                                style={{
                                    background: isActive
                                        ? 'linear-gradient(180deg, rgba(54,139,237,0.10) 0%, rgba(54,139,237,0.18) 100%)'
                                        : 'linear-gradient(180deg, #ffffff 0%, #e9eef5 100%)',
                                    borderColor: isActive
                                        ? 'rgba(54,139,237,0.55)'
                                        : 'rgba(54,139,237,0.22)',
                                    boxShadow: isActive
                                        ? 'inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(54,139,237,0.18)'
                                        : 'inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(15,23,42,0.06)',
                                }}
                            >
                                <span
                                    aria-hidden
                                    className='block w-[2px] h-5 rounded-[1px] flex-shrink-0 transition-opacity duration-150'
                                    style={{ background: color, opacity: barOpacity }}
                                />
                                <div className='flex flex-col items-start leading-none gap-0.5'>
                                    <span
                                        className='text-[14px] font-semibold text-slate-900'
                                        style={{
                                            fontFamily: MONO_STACK,
                                            fontVariantNumeric: 'tabular-nums',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {String(count).padStart(2, '0')}
                                    </span>
                                    <span
                                        className='text-[10px] uppercase text-slate-500 font-bold'
                                        style={{ letterSpacing: '0.14em' }}
                                    >
                                        {STATUS_LABELS[s]}
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Desktop live indicator — hidden on mobile */}
                <div className='hidden sm:flex items-center pl-2.5 pr-2.5 border-l border-slate-200/80'>
                    <div
                        className='flex items-center gap-1.5 px-2 py-1 rounded-[3px] border transition-colors'
                        style={{
                            borderColor: isLive
                                ? 'rgba(54,139,237,0.4)'
                                : 'rgba(148,163,184,0.4)',
                            background: isLive
                                ? 'rgba(54,139,237,0.08)'
                                : 'rgba(241,245,249,0.6)',
                        }}
                    >
                        <span className='relative inline-flex w-1.5 h-1.5'>
                            {isLive && (
                                <span
                                    aria-hidden
                                    className='absolute inset-0 rounded-full animate-ping'
                                    style={{ background: '#368bed', opacity: 0.55 }}
                                />
                            )}
                            <span
                                className='relative rounded-full w-1.5 h-1.5'
                                style={{ background: isLive ? '#368bed' : '#94a3b8' }}
                            />
                        </span>
                        <span
                            className='text-[9.5px] font-semibold uppercase'
                            style={{
                                fontFamily: MONO_STACK,
                                color: isLive ? '#1d4ed8' : '#475569',
                                letterSpacing: '0.1em',
                            }}
                        >
                            {lastUpdate ? (isLive ? 'En vivo' : `T−${minutesAgo}m`) : '···'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Mobile drawer: filter pills (animated reveal) */}
            <div
                className='sm:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out'
                style={{
                    maxHeight: mobileOpen ? '320px' : '0px',
                    opacity: mobileOpen ? 1 : 0,
                }}
            >
                <div className='grid grid-cols-2 gap-1.5 p-2 border-t border-slate-200/80 bg-slate-50/60'>
                    {STATUSES.map((s) => {
                        const isActive =
                            activeFilters.has(s) && activeFilters.size === 1
                        const count = counts?.[s] ?? 0
                        const color = STATUS_COLORS[s]
                        const barOpacity = isActive ? 1 : count > 0 ? 0.6 : 0.22
                        return (
                            <button
                                key={s}
                                onClick={() => handleClick(s)}
                                className='relative flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] border transition-all duration-150'
                                style={{
                                    background: isActive
                                        ? 'linear-gradient(180deg, rgba(54,139,237,0.10) 0%, rgba(54,139,237,0.18) 100%)'
                                        : 'linear-gradient(180deg, #ffffff 0%, #e9eef5 100%)',
                                    borderColor: isActive
                                        ? 'rgba(54,139,237,0.55)'
                                        : 'rgba(54,139,237,0.22)',
                                    boxShadow: isActive
                                        ? 'inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(54,139,237,0.18)'
                                        : 'inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(15,23,42,0.06)',
                                }}
                            >
                                <span
                                    aria-hidden
                                    className='block w-[2px] h-6 rounded-[1px] flex-shrink-0'
                                    style={{ background: color, opacity: barOpacity }}
                                />
                                <div className='flex flex-col items-start leading-none gap-0.5'>
                                    <span
                                        className='text-[14px] font-semibold text-slate-900'
                                        style={{
                                            fontFamily: MONO_STACK,
                                            fontVariantNumeric: 'tabular-nums',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {String(count).padStart(2, '0')}
                                    </span>
                                    <span
                                        className='text-[10px] uppercase text-slate-500 font-bold'
                                        style={{ letterSpacing: '0.14em' }}
                                    >
                                        {STATUS_LABELS[s]}
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default StatusFilterBar
