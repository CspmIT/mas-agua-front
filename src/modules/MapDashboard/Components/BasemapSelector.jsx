import { useState } from 'react'
import { Close, Layers } from '@mui/icons-material'
import { MAP_STYLE_OPTIONS, thumbTileUrl } from '../utils/mapStyles'

// Selector de mapa base estilo Google Earth: botón flotante que abre una grilla
// de miniaturas (tiles reales centrados en el mapa actual). La elección se aplica
// al instante; el panel queda abierto para comparar hasta que el usuario lo cierre.
// Se ancla dentro del contenedor de botones flotantes del mapa (no se posiciona solo).
const BasemapSelector = ({ value, onChange, center }) => {
    const [open, setOpen] = useState(false)

    const lon = Number(center?.longitude ?? -62.005196)
    const lat = Number(center?.latitude ?? -30.716256)

    return (
        <div className='relative flex flex-col items-start'>
            {open && (
                <div
                    className='absolute bottom-full mb-2 left-0 rounded-xl bg-white border overflow-hidden'
                    style={{
                        width: 316,
                        maxWidth: 'calc(100vw - 32px)',
                        borderColor: 'rgba(15, 42, 68, 0.12)',
                        boxShadow:
                            '0 12px 32px rgba(15, 42, 68, 0.22), 0 2px 6px rgba(15, 42, 68, 0.08)',
                    }}
                >
                    <div
                        className='flex items-center justify-between px-3 py-2'
                        style={{
                            background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                        }}
                    >
                        <span className='text-[10px] font-bold uppercase tracking-[0.18em] text-white'>
                            Tipo de mapa
                        </span>
                        <button
                            type='button'
                            onClick={() => setOpen(false)}
                            className='inline-flex items-center justify-center rounded-full bg-transparent border-0 p-0 transition-colors'
                            style={{
                                width: 24,
                                height: 24,
                                background: 'rgba(255, 255, 255, 0.18)',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                cursor: 'pointer',
                            }}
                            aria-label='Cerrar selector de mapa'
                        >
                            <Close sx={{ fontSize: 15, color: '#ffffff' }} />
                        </button>
                    </div>

                    <div
                        className='grid grid-cols-3 gap-2 p-2.5 overflow-y-auto'
                        style={{ maxHeight: '52vh' }}
                    >
                        {MAP_STYLE_OPTIONS.map((o) => {
                            const active = o.id === value
                            return (
                                <button
                                    key={o.id}
                                    type='button'
                                    onClick={() => onChange(o.id)}
                                    className='flex flex-col items-center gap-1 bg-transparent border-0 p-0 cursor-pointer group'
                                >
                                    <img
                                        src={thumbTileUrl(o.id, lon, lat)}
                                        alt={o.label}
                                        loading='lazy'
                                        draggable={false}
                                        className='w-full aspect-square object-cover rounded-lg transition-transform group-hover:scale-[1.04]'
                                        style={{
                                            border: active
                                                ? '2px solid #368bed'
                                                : '1px solid rgba(15, 42, 68, 0.14)',
                                            boxShadow: active
                                                ? '0 0 0 2px rgba(54, 139, 237, 0.25)'
                                                : 'none',
                                        }}
                                    />
                                    <span
                                        className='text-[9.5px] font-semibold leading-tight text-center'
                                        style={{ color: active ? '#2c6aa0' : '#475569' }}
                                    >
                                        {o.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <button
                type='button'
                onClick={() => setOpen((v) => !v)}
                className='inline-flex items-center gap-1.5 rounded-full text-white transition-transform hover:scale-[1.03] active:scale-[0.98] border-0'
                style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                    boxShadow:
                        '0 6px 18px rgba(44, 106, 160, 0.4), 0 2px 4px rgba(15, 42, 68, 0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    cursor: 'pointer',
                }}
                aria-label='Cambiar tipo de mapa'
            >
                <Layers sx={{ fontSize: 16 }} />
                <span className='text-[11px] font-semibold uppercase tracking-[0.14em]'>
                    {open ? 'Cerrar' : 'Mapa'}
                </span>
            </button>
        </div>
    )
}

export default BasemapSelector
