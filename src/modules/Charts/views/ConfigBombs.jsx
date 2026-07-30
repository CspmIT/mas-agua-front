import { useEffect, useRef, useState } from 'react'
import { AddCircleOutline, DeleteOutline } from '@mui/icons-material'
import {
    Box,
    Button,
    Container,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import SelectVars from '../components/SelectVars'
import PumpInfoPanel from '../components/PumpInfoPanel'
import HeaderForms from '../components/HeaderForms'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'

const shellSx = {
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(15, 42, 68, 0.06)',
    boxShadow:
        '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.12)',
    p: { xs: 2, sm: 2.5 },
    'body.dark &': {
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
    },
}

const sectionSx = {
    borderRadius: '14px',
    border: '1px solid rgba(15, 42, 68, 0.06)',
    backgroundColor: 'transparent',
    p: { xs: 1.75, sm: 2 },
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
    'body.dark &': { border: '1px solid rgba(255, 255, 255, 0.06)' },
}

const itemCardSx = (index = 0) => ({
    position: 'relative',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(15, 42, 68, 0.08)',
    borderLeft: '3px solid #2c6aa0',
    p: 1.75,
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
    opacity: 0,
    transform: 'translateY(6px)',
    animation: `bombItemIn 0.3s ${index * 0.03}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
    '@keyframes bombItemIn': {
        '0%': { opacity: 0, transform: 'translateY(6px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    '&:hover': {
        boxShadow: '0 4px 14px -4px rgba(15, 42, 68, 0.14)',
        borderColor: 'rgba(44, 106, 160, 0.3)',
        borderLeftColor: '#2c6aa0',
    },
    'body.dark &': {
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderLeft: '3px solid #2c6aa0',
    },
})

const previewCardSx = {
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(15, 42, 68, 0.08)',
    boxShadow:
        '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.14)',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 16,
    'body.dark &': {
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
    },
}

const submitPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 3,
    py: 1,
    minHeight: 0,
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
        boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
        transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
}

const addPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.5,
    py: 0.75,
    minHeight: 0,
    borderColor: 'rgba(44, 106, 160, 0.4)',
    color: '#2c6aa0',
    backgroundColor: 'rgba(44, 106, 160, 0.04)',
    '&:hover': {
        borderColor: '#2c6aa0',
        backgroundColor: 'rgba(44, 106, 160, 0.1)',
    },
}

const SectionTitle = ({ children, right }) => (
    <div className='flex items-center justify-between px-1 -mt-0.5'>
        <div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400'>
            {children}
        </div>
        {right}
    </div>
)

let uidCounter = 0
const newUid = () => `item_${Date.now()}_${uidCounter++}`

const emptyItem = () => ({
    uid: newUid(),
    name: '',
    varObj: null,
    initialVar: false,
    id_bit: null,
    asBool: false,
    textOn: '',
    textOff: '',
})

/**
 * Config del "Panel de información" (type PumpControl).
 * Crea y edita el mini tablero: estados destacados (filas) y valores (tiles),
 * cada item con label + variable de Influx (y bit si es binaria comprimida).
 */
export default function ConfigBombs() {
    const { id = false } = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [states, setStates] = useState([])
    const [pumps, setPumps] = useState([])
    const [loader, setLoader] = useState(!!id)
    const [previewValues, setPreviewValues] = useState({})
    const previewTimer = useRef(null)

    // ── Carga para edición ────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return
        const fetchChart = async () => {
            try {
                const { data } = await request(
                    `${backend[import.meta.env.VITE_APP_NAME]}/charts/${id}`,
                    'GET'
                )
                setTitle(data.name || '')
                const rows = (data.BombsData || []).map((row) => ({
                    uid: newUid(),
                    name: row.name || '',
                    varObj: row.InfluxVars || null,
                    initialVar: row.InfluxVars || false,
                    id_bit: row.id_bit ?? null,
                    asBool: Boolean(row.as_bool),
                    textOn: row.text_on || '',
                    textOff: row.text_off || '',
                }))
                setStates(rows.filter((_, i) => data.BombsData[i].type === 'status'))
                setPumps(rows.filter((_, i) => data.BombsData[i].type === 'pump'))
            } catch (error) {
                Swal.fire('Error', 'Error al cargar el gráfico', 'error')
            } finally {
                setLoader(false)
            }
        }
        fetchChart()
    }, [id])

    // ── Preview con valores reales de Influx (debounced) ─────────────────
    const allItems = [...states, ...pumps]
    const varIdsKey = allItems
        .map((item) => `${item.varObj?.id ?? ''}`)
        .join(',')

    useEffect(() => {
        const varsToFetch = allItems
            .map((item) => item.varObj)
            .filter((v) => v?.id)
        // Sin repetidos
        const seen = new Set()
        const uniqueVars = varsToFetch.filter((v) => {
            if (seen.has(v.id)) return false
            seen.add(v.id)
            return true
        })
        if (!uniqueVars.length) {
            setPreviewValues({})
            return
        }

        clearTimeout(previewTimer.current)
        previewTimer.current = setTimeout(async () => {
            try {
                const { data } = await request(
                    `${backend['Mas Agua']}/multipleDataInflux`,
                    'POST',
                    uniqueVars.map((v) => ({ dataInflux: v }))
                )
                setPreviewValues(data)
            } catch (error) {
                console.error('Error preview multipleDataInflux:', error)
            }
        }, 600)

        return () => clearTimeout(previewTimer.current)
    }, [varIdsKey])

    // ── Helpers de listas ─────────────────────────────────────────────────
    const listActions = (list, setList) => ({
        add: () => setList([...list, emptyItem()]),
        remove: (uid) => setList(list.filter((item) => item.uid !== uid)),
        update: (uid, patch) =>
            setList(list.map((item) => (item.uid === uid ? { ...item, ...patch } : item))),
        setVar: (uid, varObj) =>
            setList(
                list.map((item) =>
                    item.uid === uid
                        ? {
                              ...item,
                              varObj,
                              // Si cambió la variable, el bit anterior deja de valer
                              id_bit:
                                  varObj?.id === item.varObj?.id ? item.id_bit : null,
                          }
                        : item
                )
            ),
    })

    const statesActions = listActions(states, setStates)
    const pumpsActions = listActions(pumps, setPumps)

    // ── Guardado ──────────────────────────────────────────────────────────
    const buildPayloadItems = (list, type) =>
        list.map((item) => ({
            name: item.name.trim(),
            varId: item.varObj?.id,
            type,
            id_bit: item.id_bit ?? null,
            as_bool: Boolean(item.asBool),
            text_on: item.asBool ? item.textOn.trim() || null : null,
            text_off: item.asBool ? item.textOff.trim() || null : null,
        }))

    const validate = async () => {
        if (!title.trim()) {
            await Swal.fire('Atención', 'Debe indicar un título para el gráfico', 'error')
            return false
        }
        if (!states.length && !pumps.length) {
            await Swal.fire('Atención', 'Debe agregar al menos un estado o un valor', 'error')
            return false
        }
        for (const item of allItems) {
            if (!item.name.trim()) {
                await Swal.fire('Atención', 'Todos los items deben tener un nombre', 'error')
                return false
            }
            if (!item.varObj?.id) {
                await Swal.fire('Atención', `El item "${item.name}" no tiene variable asignada`, 'error')
                return false
            }
            const needsBit =
                item.varObj.binary_compressed && !item.varObj.calc_binary_compressed
            if (needsBit && !item.id_bit) {
                await Swal.fire(
                    'Atención',
                    `El item "${item.name}" usa una variable binaria comprimida: debe elegir un bit`,
                    'error'
                )
                return false
            }
        }
        return true
    }

    const handleSave = async () => {
        if (!(await validate())) return

        const payload = {
            title: title.trim(),
            states: buildPayloadItems(states, 'status'),
            pumps: buildPayloadItems(pumps, 'pump'),
        }

        const base = `${backend[import.meta.env.VITE_APP_NAME]}/bombs`
        try {
            if (id) {
                await request(`${base}/${id}`, 'PUT', payload)
                await Swal.fire('Editado', 'Gráfico editado correctamente', 'success')
            } else {
                await request(base, 'POST', payload)
                await Swal.fire('Guardado', 'Gráfico creado correctamente', 'success')
            }
            navigate('/config/allGraphic')
        } catch (error) {
            Swal.fire(
                'Error',
                `Ocurrió un error al guardar el gráfico. <br> ${error.message}`,
                'error'
            )
        }
    }

    // ── Render de cada item de config ─────────────────────────────────────
    const renderItem = (item, index, actions, chipLabel) => {
        const needsBit =
            item.varObj?.binary_compressed && !item.varObj?.calc_binary_compressed
        const bits = item.varObj?.bits ?? []
        // calc_binary: los textos y colores salen de los resultados de la variable
        const canBeBool = !item.varObj?.calc_binary_compressed
        return (
            <Box key={item.uid} sx={itemCardSx(index)}>
                <div className='flex items-center justify-between gap-2'>
                    <span className='text-[10px] font-bold uppercase tracking-[0.14em] text-white bg-[#2c6aa0] px-2 py-0.5 rounded-full'>
                        {chipLabel} {index + 1}
                    </span>
                    <Button
                        size='small'
                        variant='text'
                        color='error'
                        startIcon={<DeleteOutline sx={{ fontSize: 16 }} />}
                        onClick={() => actions.remove(item.uid)}
                        sx={{ textTransform: 'none', fontWeight: 500, minHeight: 0, px: 1, py: 0.25 }}
                    >
                        Eliminar
                    </Button>
                </div>

                <TextField
                    fullWidth
                    size='small'
                    label='Nombre (label)'
                    value={item.name}
                    onChange={(e) => actions.update(item.uid, { name: e.target.value })}
                />

                <SelectVars
                    setValueState={(v) => actions.setVar(item.uid, v)}
                    initialVar={item.initialVar}
                    label='Seleccione una variable'
                />

                {needsBit && (
                    <FormControl fullWidth size='small'>
                        <InputLabel>Bit de la variable</InputLabel>
                        <Select
                            value={item.id_bit ?? ''}
                            label='Bit de la variable'
                            onChange={(e) => actions.update(item.uid, { id_bit: e.target.value })}
                        >
                            <MenuItem value='' disabled>
                                Seleccioná un bit
                            </MenuItem>
                            {bits.map((b) => (
                                <MenuItem key={b.id} value={b.id}>
                                    {b.name} (bit {b.bit})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {canBeBool && (
                    <>
                        <FormControlLabel
                            sx={{ mx: 0, mt: -0.5 }}
                            control={
                                <Switch
                                    size='small'
                                    checked={item.asBool}
                                    onChange={(e) =>
                                        actions.update(item.uid, { asBool: e.target.checked })
                                    }
                                />
                            }
                            label={
                                <span className='text-[12px] text-slate-500 dark:text-gray-400'>
                                    Valor booleano (0/1 → texto de estado)
                                </span>
                            }
                        />

                        {item.asBool && (
                            <div className='flex flex-wrap gap-2'>
                                <div style={{ flex: '1 1 140px' }}>
                                    <TextField
                                        fullWidth
                                        size='small'
                                        label='Texto ON'
                                        placeholder='Encendido'
                                        value={item.textOn}
                                        onChange={(e) =>
                                            actions.update(item.uid, { textOn: e.target.value })
                                        }
                                    />
                                </div>
                                <div style={{ flex: '1 1 140px' }}>
                                    <TextField
                                        fullWidth
                                        size='small'
                                        label='Texto OFF'
                                        placeholder='Apagado'
                                        value={item.textOff}
                                        onChange={(e) =>
                                            actions.update(item.uid, { textOff: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Box>
        )
    }

    const renderSection = (label, chipLabel, list, actions, emptyText, addText) => (
        <Box sx={sectionSx}>
            <SectionTitle
                right={
                    <span className='text-[11px] font-semibold text-slate-500 dark:text-gray-400'>
                        {list.length} {list.length === 1 ? 'item' : 'items'}
                    </span>
                }
            >
                {label}
            </SectionTitle>
            {list.length === 0 ? (
                <div className='text-center text-xs text-slate-500 dark:text-gray-400 py-3'>
                    {emptyText}
                </div>
            ) : (
                <div className='flex flex-col gap-2.5'>
                    {list.map((item, index) => renderItem(item, index, actions, chipLabel))}
                </div>
            )}
            <Button
                variant='outlined'
                sx={addPillSx}
                startIcon={<AddCircleOutline sx={{ fontSize: 18 }} />}
                onClick={actions.add}
            >
                {addText}
            </Button>
        </Box>
    )

    // ── Items resueltos para el preview ───────────────────────────────────
    const toPreviewItem = (item) => ({
        id: item.uid,
        name: item.name || 'Sin nombre',
        value: item.varObj?.id ? previewValues[item.varObj.id] : undefined,
        unit: item.varObj?.unit ?? null,
        id_bit: item.id_bit,
        as_bool: item.asBool,
        text_on: item.textOn.trim() || null,
        text_off: item.textOff.trim() || null,
    })

    if (loader) {
        return (
            <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
                <Box sx={shellSx}>
                    <Typography variant='body1' align='center' color='textSecondary'>
                        Cargando...
                    </Typography>
                </Box>
            </Container>
        )
    }

    return (
        <VarsProvider>
            <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
                <HeaderForms
                    idChart={id}
                    chart={{ name: title }}
                    backTo='/config/allGraphic'
                />

                <Box sx={shellSx}>
                    <div className='flex flex-col lg:flex-row gap-4 w-full'>
                        <div className='flex flex-col gap-3 w-full lg:w-7/12'>
                            <Box sx={sectionSx}>
                                <SectionTitle>Información</SectionTitle>
                                <TextField
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    label='Título del gráfico'
                                    size='small'
                                    fullWidth
                                />
                            </Box>

                            {renderSection(
                                'Estados destacados',
                                'Estado',
                                states,
                                statesActions,
                                'Aún no agregaste estados. Son filas anchas para la información principal (ej: estado de la bomba).',
                                'Agregar estado'
                            )}

                            {renderSection(
                                'Valores',
                                'Valor',
                                pumps,
                                pumpsActions,
                                'Aún no agregaste valores. Son tarjetas chicas en grilla (ej: caudal, presión, nivel).',
                                'Agregar valor'
                            )}

                            <div className='flex justify-end pt-1'>
                                <Button
                                    variant='contained'
                                    disableElevation
                                    sx={submitPillSx}
                                    onClick={handleSave}
                                >
                                    Guardar
                                </Button>
                            </div>
                        </div>

                        <div className='w-full lg:w-5/12'>
                            <Box sx={previewCardSx}>
                                <div className='px-3 py-1.5 bg-[#2c6aa0] dark:bg-[#1f4e79] border-b border-white/10 shrink-0'>
                                    <h2 className='text-[11px] font-semibold uppercase tracking-[0.08em] text-center text-white line-clamp-2'>
                                        {title || 'Vista previa'}
                                    </h2>
                                </div>
                                <div className='min-h-[220px] flex'>
                                    <PumpInfoPanel
                                        initialStates={states.map(toPreviewItem)}
                                        initialPumps={pumps.map(toPreviewItem)}
                                    />
                                </div>
                            </Box>
                        </div>
                    </div>
                </Box>
            </Container>
        </VarsProvider>
    )
}
