import { Autocomplete, IconButton, MenuItem, TextField, Tooltip, Button } from '@mui/material'
import { DeleteOutline, HelpOutline } from '@mui/icons-material'
import Swal from 'sweetalert2'
import CardCustom from '../../../components/CardCustom'
import { NODE_TOOLS, LINK_TOOLS } from '../lib/editorDefaults'
import { ElementIcon } from './elementIcons'
import SparkChart from './SparkChart'

const TYPE_LABELS = Object.fromEntries([...NODE_TOOLS, ...LINK_TOOLS].map((t) => [t.tool, t.label]))

const fieldProps = {
    size: 'small',
    fullWidth: true,
    margin: 'dense',
}

const NumberField = ({ label, value, onChange, ...rest }) => (
    <TextField
        {...fieldProps}
        {...rest}
        label={label}
        type='number'
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
    />
)

const dangerPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.25,
    py: 0.5,
    minHeight: 0,
    color: '#b91c1c',
    borderColor: 'rgba(185, 28, 28, 0.4)',
    '&:hover': {
        borderColor: '#b91c1c',
        backgroundColor: 'rgba(185, 28, 28, 0.06)',
    },
}

const EmptyHint = () => (
    <div className='text-sm text-slate-500 dark:text-gray-400 flex flex-col gap-3'>
        <p>Seleccioná un elemento del mapa para ver y editar sus propiedades.</p>
        <div>
            <div className='text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-1.5'>
                Nodos
            </div>
            {NODE_TOOLS.map((t) => (
                <div key={t.tool} className='flex items-center gap-2 py-0.5'>
                    <ElementIcon kind='node' type={t.tool} size={17} color={t.color} />
                    {t.label}
                </div>
            ))}
        </div>
        <div>
            <div className='text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-1.5'>
                Tramos — clic en nodo de origen y luego destino
            </div>
            {LINK_TOOLS.map((t) => (
                <div key={t.tool} className='flex items-center gap-2 py-0.5'>
                    <ElementIcon kind='link' type={t.tool} size={17} color={t.color} />
                    {t.label}
                </div>
            ))}
        </div>
    </div>
)

// Qué dato real trae el vínculo, según el tipo de elemento
const VAR_HELPERS = {
    junction: 'Trae la demanda medida por el caudalímetro con "Datos actuales"',
    tank: 'Trae el nivel actual del sensor con "Datos actuales"',
    reservoir: 'Trae la carga medida con "Datos actuales"',
    pump: 'Trae el estado real de marcha (0/1) con "Datos actuales"',
    valve: 'Trae el estado real (0/1) con "Datos actuales"',
    pipe: 'Trae el estado real (0/1) con "Datos actuales"',
}

const InfluxVarSelect = ({ type, value, influxVars, disabled, onChange, field = 'idInfluxVar', label = 'Asociar a variable', helper }) => (
    <Autocomplete
        size='small'
        options={influxVars}
        getOptionLabel={(v) => (v.unit ? `${v.name} (${v.unit})` : v.name ?? '')}
        value={influxVars.find((v) => v.id === value) ?? null}
        onChange={(_, v) => onChange({ [field]: v?.id ?? null })}
        disabled={disabled}
        noOptionsText='Sin variables'
        renderInput={(params) => (
            <TextField {...params} {...fieldProps} label={label} helperText={helper ?? VAR_HELPERS[type]} />
        )}
    />
)

// Explica la diferencia entre la variable de entrada y el sensor de control
const showVarLinksHelp = () =>
    Swal.fire({
        title: 'Datos reales: entrada y control',
        html: `<div style="text-align:left;font-size:0.9rem;line-height:1.55;color:#334155">
            <p style="margin:0 0 10px"><b>📥 Asociar a variable — dato de entrada</b><br/>
            Alimenta el modelo: al usar <b>“Datos actuales”</b>, esa medición se escribe dentro
            del modelo antes de simular. Qué corresponde según el elemento:</p>
            <ul style="padding-left:20px;margin:0 0 12px">
                <li>Nodo de consumo → <b>caudalímetro</b> (demanda medida)</li>
                <li>Tanque → <b>sensor de nivel</b> (nivel inicial real)</li>
                <li>Reservorio → carga medida</li>
                <li>Bomba / válvula → señal de <b>marcha</b> (0/1)</li>
            </ul>
            <p style="margin:0 0 10px"><b>🔍 Sensor de comparación — dato de control</b><br/>
            No toca el modelo: el <b>monitoreo</b> simula la red y compara lo calculado contra
            lo que este sensor mide de verdad. Si la diferencia supera el umbral, avisa
            (posible fuga o anomalía). En nodos va el <b>sensor de presión</b> del lugar;
            si mide en bar, usá el factor de conversión 10,2.</p>
            <p style="margin:0;background:#fef3c7;border-radius:10px;padding:8px 12px;color:#92400e;font-size:0.8rem">
            ⚠ No pongas la misma variable en los dos campos: estarías alimentando el modelo
            con el dato y “verificándolo” contra sí mismo.</p>
        </div>`,
        width: 560,
        confirmButtonText: 'Entendido',
    })

const PatternSelect = ({ value, patterns, disabled, onChange }) => (
    <TextField
        {...fieldProps}
        select
        label='Patrón de demanda'
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange({ demandPattern: e.target.value || null })}
    >
        <MenuItem value=''>Constante (sin patrón)</MenuItem>
        {patterns.map((p) => (
            <MenuItem key={p.tag} value={p.tag}>
                {p.tag}
            </MenuItem>
        ))}
    </TextField>
)

// Campos editables en masa según el tipo común de la selección
const BulkFields = ({ type, common, flowUnits, patterns, onChange }) => (
    <>
        {['junction', 'reservoir', 'tank'].includes(type) && (
            <NumberField
                label={type === 'reservoir' ? 'Carga hidráulica (m)' : 'Cota de terreno (m)'}
                value={common('elevation')}
                onChange={(v) => onChange({ elevation: v ?? 0 })}
            />
        )}
        {type === 'junction' && (
            <>
                <NumberField label={`Demanda base (${flowUnits})`} value={common('baseDemand')} onChange={(v) => onChange({ baseDemand: v ?? 0 })} />
                <PatternSelect value={common('demandPattern')} patterns={patterns} onChange={onChange} />
            </>
        )}
        {type === 'pipe' && (
            <>
                <NumberField label='Diámetro (mm)' value={common('diameter')} onChange={(v) => onChange({ diameter: v })} />
                <NumberField label='Rugosidad (C Hazen-Williams)' value={common('roughness')} onChange={(v) => onChange({ roughness: v })} />
            </>
        )}
        {type === 'pump' && <NumberField label='Potencia (kW)' value={common('power')} onChange={(v) => onChange({ power: v })} />}
        {type === 'valve' && (
            <>
                <NumberField label='Consigna (m ó caudal)' value={common('setting')} onChange={(v) => onChange({ setting: v })} />
                <NumberField label='Diámetro (mm)' value={common('diameter')} onChange={(v) => onChange({ diameter: v })} />
            </>
        )}
        {['pipe', 'pump', 'valve'].includes(type) && (
            <TextField
                {...fieldProps}
                select
                label='Estado inicial'
                value={common('initialStatus') ?? ''}
                onChange={(e) => onChange({ initialStatus: e.target.value })}
            >
                <MenuItem value='OPEN'>Abierto</MenuItem>
                <MenuItem value='CLOSED'>Cerrado</MenuItem>
            </TextField>
        )}
    </>
)

/**
 * Panel lateral de propiedades, con el estilo del ControlPanel del módulo de
 * mapas. Modos: vacío (leyenda), un elemento (formulario + serie temporal en
 * resultados) o selección múltiple (edición masiva).
 */
const PropertiesPanel = ({ element, bulk, flowUnits, patterns = [], curves = [], influxVars = [], onChange, onDelete, onBulkChange, onBulkDelete, readOnly, resultSeries }) => {
    const data = element?.data
    const isNode = element?.kind === 'node'

    if (bulk) {
        const common = (field) => {
            const values = bulk.items.map((d) => d[field])
            return values.every((v) => v === values[0]) ? values[0] : null
        }
        return (
            <CardCustom className='rounded-xl overflow-hidden flex flex-col h-full'>
                <div
                    className='flex items-center justify-between shrink-0'
                    style={{
                        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                        boxShadow: '0 4px 14px rgba(44, 106, 160, 0.25)',
                        padding: '10px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <span className='text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70'>Selección múltiple</span>
                    <span
                        className='inline-flex items-center justify-center text-xs font-semibold text-white'
                        style={{ minWidth: 26, height: 22, padding: '0 10px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.18)' }}
                    >
                        {bulk.items.length}
                    </span>
                </div>
                <div className='p-4 overflow-y-auto flex-1'>
                    {bulk.type ? (
                        <>
                            <div className='text-xs text-slate-500 dark:text-gray-400 mb-1'>
                                Los cambios se aplican a los {bulk.items.length} elementos. Los campos vacíos indican valores distintos entre sí.
                            </div>
                            {!readOnly && <BulkFields type={bulk.type} common={common} flowUnits={flowUnits} patterns={patterns} onChange={onBulkChange} />}
                        </>
                    ) : (
                        <div className='text-xs text-slate-500 dark:text-gray-400 mb-1'>
                            Selección de tipos mezclados: sólo se puede eliminar en conjunto.
                        </div>
                    )}
                    {!readOnly && (
                        <Button
                            fullWidth
                            size='small'
                            variant='outlined'
                            startIcon={<DeleteOutline sx={{ fontSize: 17 }} />}
                            onClick={onBulkDelete}
                            sx={{ ...dangerPillSx, mt: 1.5 }}
                        >
                            Eliminar {bulk.items.length} elementos
                        </Button>
                    )}
                </div>
            </CardCustom>
        )
    }

    return (
        <CardCustom className='rounded-xl overflow-hidden flex flex-col h-full'>
            {/* Header con gradiente, igual al panel de marcadores de mapas */}
            <div
                className='flex items-center justify-between shrink-0'
                style={{
                    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.25)',
                    padding: '10px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <span className='text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70'>
                    {data ? TYPE_LABELS[data.type] : 'Propiedades'}
                </span>
                {data && (
                    <span
                        className='inline-flex items-center justify-center text-xs font-semibold text-white'
                        style={{
                            minWidth: 26,
                            height: 22,
                            padding: '0 10px',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(255,255,255,0.18)',
                        }}
                    >
                        {data.tag}
                    </span>
                )}
            </div>

            <div className='p-4 overflow-y-auto flex-1'>
                {!data ? (
                    <EmptyHint />
                ) : (
                    <>
                        <TextField
                            {...fieldProps}
                            label='Identificador'
                            value={data.tag}
                            disabled={readOnly}
                            onChange={(e) => onChange({ tag: e.target.value.trim() })}
                        />

                        {resultSeries && <SparkChart {...resultSeries} />}

                        {isNode && (
                            <>
                                <NumberField
                                    label={data.type === 'reservoir' ? 'Carga hidráulica (m)' : 'Cota de terreno (m)'}
                                    value={data.elevation}
                                    disabled={readOnly}
                                    onChange={(v) => onChange({ elevation: v ?? 0 })}
                                />
                                {data.type === 'junction' && (
                                    <>
                                        <NumberField
                                            label={`Demanda base (${flowUnits})`}
                                            value={data.baseDemand}
                                            disabled={readOnly}
                                            onChange={(v) => onChange({ baseDemand: v ?? 0 })}
                                        />
                                        <PatternSelect value={data.demandPattern} patterns={patterns} disabled={readOnly} onChange={onChange} />
                                    </>
                                )}
                                {data.type === 'tank' && (
                                    <>
                                        <NumberField label='Nivel inicial (m)' value={data.initLevel} disabled={readOnly} onChange={(v) => onChange({ initLevel: v })} />
                                        <NumberField label='Nivel mínimo (m)' value={data.minLevel} disabled={readOnly} onChange={(v) => onChange({ minLevel: v })} />
                                        <NumberField label='Nivel máximo (m)' value={data.maxLevel} disabled={readOnly} onChange={(v) => onChange({ maxLevel: v })} />
                                        <NumberField label='Diámetro del tanque (m)' value={data.tankDiameter} disabled={readOnly} onChange={(v) => onChange({ tankDiameter: v })} />
                                    </>
                                )}
                            </>
                        )}

                        {!isNode && (
                            <>
                                <div className='text-xs text-slate-500 dark:text-gray-400 my-1'>
                                    {data.from} → {data.to}
                                </div>
                                {data.type === 'pipe' && (
                                    <>
                                        <NumberField
                                            label='Largo (m) — vacío: según mapa'
                                            value={data.length}
                                            disabled={readOnly}
                                            onChange={(v) => onChange({ length: v })}
                                        />
                                        <NumberField label='Diámetro (mm)' value={data.diameter} disabled={readOnly} onChange={(v) => onChange({ diameter: v })} />
                                        <NumberField label='Rugosidad (C Hazen-Williams)' value={data.roughness} disabled={readOnly} onChange={(v) => onChange({ roughness: v })} />
                                        {!readOnly && data.vertices?.length > 0 && (
                                            <div className='text-xs text-slate-500 dark:text-gray-400 mt-1 flex items-center justify-between gap-2'>
                                                <span>{data.vertices.length} vértice{data.vertices.length > 1 ? 's' : ''} (arrastralos en el mapa)</span>
                                                <Button size='small' sx={{ textTransform: 'none', minHeight: 0, p: 0.25 }} onClick={() => onChange({ vertices: [] })}>
                                                    Enderezar
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                                {data.type === 'pump' && (
                                    <>
                                        <TextField
                                            {...fieldProps}
                                            select
                                            label='Tipo de bomba'
                                            value={data.headCurve ? 'curve' : 'power'}
                                            disabled={readOnly}
                                            onChange={(e) =>
                                                e.target.value === 'curve'
                                                    ? onChange({ headCurve: curves[0]?.tag ?? null, power: null })
                                                    : onChange({ headCurve: null, power: data.power ?? 5 })
                                            }
                                        >
                                            <MenuItem value='power'>Potencia constante</MenuItem>
                                            <MenuItem value='curve' disabled={curves.length === 0}>
                                                Curva caudal-altura {curves.length === 0 ? '(creá una primero)' : ''}
                                            </MenuItem>
                                        </TextField>
                                        {data.headCurve ? (
                                            <TextField
                                                {...fieldProps}
                                                select
                                                label='Curva'
                                                value={data.headCurve}
                                                disabled={readOnly}
                                                onChange={(e) => onChange({ headCurve: e.target.value })}
                                            >
                                                {curves.map((c) => (
                                                    <MenuItem key={c.tag} value={c.tag}>
                                                        {c.tag}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        ) : (
                                            <NumberField label='Potencia (kW)' value={data.power} disabled={readOnly} onChange={(v) => onChange({ power: v })} />
                                        )}
                                    </>
                                )}
                                {data.type === 'valve' && (
                                    <>
                                        <TextField
                                            {...fieldProps}
                                            select
                                            label='Tipo de válvula'
                                            value={data.valveType ?? 'PRV'}
                                            disabled={readOnly}
                                            onChange={(e) => onChange({ valveType: e.target.value })}
                                        >
                                            <MenuItem value='PRV'>PRV — reductora de presión</MenuItem>
                                            <MenuItem value='PSV'>PSV — sostenedora de presión</MenuItem>
                                            <MenuItem value='PBV'>PBV — de quiebre de presión</MenuItem>
                                            <MenuItem value='FCV'>FCV — control de caudal</MenuItem>
                                            <MenuItem value='TCV'>TCV — de estrangulación</MenuItem>
                                        </TextField>
                                        <NumberField label='Consigna (m ó caudal)' value={data.setting} disabled={readOnly} onChange={(v) => onChange({ setting: v })} />
                                        <NumberField label='Diámetro (mm)' value={data.diameter} disabled={readOnly} onChange={(v) => onChange({ diameter: v })} />
                                    </>
                                )}
                                <TextField
                                    {...fieldProps}
                                    select
                                    label='Estado inicial'
                                    value={data.initialStatus ?? 'OPEN'}
                                    disabled={readOnly}
                                    onChange={(e) => onChange({ initialStatus: e.target.value })}
                                >
                                    <MenuItem value='OPEN'>Abierto</MenuItem>
                                    <MenuItem value='CLOSED'>Cerrado</MenuItem>
                                </TextField>
                            </>
                        )}

                        {/* Vínculos a las mediciones reales del SCADA */}
                        {influxVars.length > 0 && (
                            <div className='flex items-center justify-between mt-3'>
                                <span className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500'>
                                    Datos reales (SCADA)
                                </span>
                                <Tooltip title='¿Qué va en cada campo?'>
                                    <IconButton size='small' onClick={showVarLinksHelp}>
                                        <HelpOutline sx={{ fontSize: 15 }} />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        )}
                        {influxVars.length > 0 && (
                            <InfluxVarSelect
                                type={data.type}
                                value={data.idInfluxVar ?? null}
                                influxVars={influxVars}
                                disabled={readOnly}
                                onChange={onChange}
                            />
                        )}

                        {/* Sensor contra el que el monitoreo compara el valor simulado */}
                        {influxVars.length > 0 && ['junction', 'tank'].includes(data.type) && (
                            <>
                                <InfluxVarSelect
                                    type={data.type}
                                    field='idInfluxVarCheck'
                                    label='Sensor de comparación'
                                    helper={
                                        data.type === 'junction'
                                            ? 'El monitoreo compara esta presión medida contra la simulada'
                                            : 'El monitoreo compara este nivel medido contra el simulado'
                                    }
                                    value={data.idInfluxVarCheck ?? null}
                                    influxVars={influxVars}
                                    disabled={readOnly}
                                    onChange={onChange}
                                />
                                {data.idInfluxVarCheck != null && (
                                    <TextField
                                        {...fieldProps}
                                        type='number'
                                        label='Factor de conversión a metros'
                                        value={data.checkFactor ?? 1}
                                        disabled={readOnly}
                                        inputProps={{ step: 0.1, min: 0 }}
                                        helperText='Multiplica la medición para llevarla a m.c.a. — sensor en bar: 10,2'
                                        onChange={(e) => onChange({ checkFactor: Number(e.target.value) || 1 })}
                                    />
                                )}
                            </>
                        )}

                        {!readOnly && (
                            <Button
                                fullWidth
                                size='small'
                                variant='outlined'
                                startIcon={<DeleteOutline sx={{ fontSize: 17 }} />}
                                onClick={onDelete}
                                sx={{ ...dangerPillSx, mt: 1.5 }}
                            >
                                Eliminar {isNode ? 'nodo' : 'tramo'}
                            </Button>
                        )}
                    </>
                )}
            </div>
        </CardCustom>
    )
}

export default PropertiesPanel
