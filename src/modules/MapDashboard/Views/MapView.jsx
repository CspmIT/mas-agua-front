import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material'
import { AddLocation } from '@mui/icons-material'
import MapBase from '../Components/MapBase'
import ControlPanel from '../Components/ControlPanel'
import SelectVars from '../../Charts/components/SelectVars'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import { useEffect, useState } from 'react'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CardCustom from '../../../components/CardCustom'
import LoaderComponent from '../../../components/Loader'
import PageHeader from '../../../components/PageHeader'
import ModalShell from '../../../components/ModalShell'
import { SENSOR_TYPE_OPTIONS, ANCHOR_OPTIONS } from '../utils/sensorDefaults'

const primaryPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.5,
    py: 0.85,
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

const outlinePillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 600,
    letterSpacing: '0.01em',
    px: 2.5,
    py: 0.85,
    minHeight: 0,
    color: '#1f4e79',
    background: 'linear-gradient(180deg, #ffffff 0%, #d9e1ec 100%)',
    border: '1px solid rgba(44, 106, 160, 0.28)',
    boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(15,42,68,0.08), 0 4px 10px rgba(15,42,68,0.10)',
    transition:
        'box-shadow 0.2s ease, transform 0.15s ease, background 0.2s ease',
    '&:hover': {
        background: 'linear-gradient(180deg, #ffffff 0%, #c8d4e3 100%)',
        borderColor: 'rgba(44, 106, 160, 0.45)',
        boxShadow:
            'inset 0 1px 0 rgba(255,255,255,1), 0 2px 4px rgba(15,42,68,0.12), 0 8px 18px rgba(15,42,68,0.14)',
        transform: 'translateY(-1px)',
    },
    '&:active': {
        transform: 'translateY(1px)',
        boxShadow:
            'inset 0 2px 4px rgba(15,42,68,0.18), 0 1px 1px rgba(15,42,68,0.06)',
        background: 'linear-gradient(180deg, #e9eef5 0%, #d0dae7 100%)',
    },
    'body.dark &': {
        color: '#cfe1f7',
        background:
            'linear-gradient(180deg, rgba(94,165,240,0.12) 0%, rgba(31,78,121,0.35) 100%)',
        borderColor: 'rgba(94, 165, 240, 0.35)',
        boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.4), 0 4px 10px rgba(0,0,0,0.35)',
    },
}

const ghostCancelSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.25,
    py: 0.75,
    minHeight: 0,
    borderColor: 'rgba(15, 42, 68, 0.14)',
    color: '#475569',
}

const dangerPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.25,
    py: 0.75,
    minHeight: 0,
    color: '#b91c1c',
    borderColor: 'rgba(185, 28, 28, 0.4)',
    '&:hover': {
        borderColor: '#b91c1c',
        backgroundColor: 'rgba(185, 28, 28, 0.06)',
    },
    mr: 'auto',
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

const SectionTitle = ({ children, hint }) => (
    <div className='flex items-baseline justify-between px-1 -mt-0.5'>
        <span className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400'>
            {children}
        </span>
        {hint && (
            <span className='text-[10px] text-slate-400 dark:text-gray-500'>
                {hint}
            </span>
        )}
    </div>
)

const toNumberOrNull = (v) =>
    v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v)

const MapView = ({ create = false, search = false }) => {
    const {
        register,
        getValues,
        setValue,
        trigger,
        reset: resetForm,
        formState: { errors },
    } = useForm()

    const navigate = useNavigate()
    const [searchParam] = useSearchParams()
    const [nameMap, setNameMap] = useState('')
    const [markers, setMarkers] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)

    // ── Edición ──────────────────────────────────────────────────────────────
    const [editingIndex, setEditingIndex] = useState(null)
    const [editInitialVar, setEditInitialVar] = useState(null)

    // ── Tipo + anchor (estado del modal) ─────────────────────────────────────
    const [selectedSensorType, setSelectedSensorType] = useState('')
    const [anchor, setAnchor] = useState('')

    // ── Variable Influx ──────────────────────────────────────────────────────
    const [selectedVar, setSelectedVar] = useState(null)
    const [selectedBitId, setSelectedBitId] = useState('')

    const isBinaryCompressed = selectedVar?.binary_compressed ?? false
    const isCalcBinary =
        (selectedVar?.calc_binary_compressed || selectedVar?.unit === 'calc_binary') ?? false
    // La calc binaria puede venir con binary_compressed en true, pero su logica ya vive
    // en el calculo: no se elige bit
    const needsBitSelection = isBinaryCompressed && !isCalcBinary
    const availableBits = selectedVar?.bits ?? []
    const isEditing = editingIndex !== null

    const [viewState, setViewState] = useState({
        longitude: -62.005196197872266,
        latitude: -30.716256365145455,
        zoom: 14,
        bearing: 0,
        pitch: 0,
    })

    // ── Helpers ──────────────────────────────────────────────────────────────
    const generateMarker = (cfg) => ({
        name: cfg.name,
        latitude: parseFloat(cfg.latitude),
        longitude: parseFloat(cfg.longitude),
        sensor_type: cfg.sensor_type || null,
        unit: cfg.unit || null,
        warn_low: toNumberOrNull(cfg.warn_low),
        crit_low: toNumberOrNull(cfg.crit_low),
        warn_high: toNumberOrNull(cfg.warn_high),
        crit_high: toNumberOrNull(cfg.crit_high),
        stale_after_minutes: toNumberOrNull(cfg.stale_after_minutes),
        popupInfo: {
            lat: parseFloat(cfg.latitude),
            lng: parseFloat(cfg.longitude),
            idVar: cfg.idVar,
            id_bit: cfg.id_bit ?? null,
            anchor: cfg.anchor || '',
            data: cfg.data || null,
        },
    })

    const handleVarSelect = (variable) => {
        setValue('idVar', variable?.id ?? null)
        setSelectedVar(variable ?? null)
        setSelectedBitId('')
        // Variables binarias y calc binarias no llevan umbrales ni unidad — limpio campos previos
        if (
            variable?.binary_compressed ||
            variable?.calc_binary_compressed ||
            variable?.unit === 'calc_binary'
        ) {
            setValue('unit', '')
            setValue('warn_low', '')
            setValue('crit_low', '')
            setValue('warn_high', '')
            setValue('crit_high', '')
            setValue('stale_after_minutes', '')
        }
    }

    const openModal = () => {
        resetForm({
            markerName: '',
            markerLat: '',
            markerLng: '',
            unit: '',
            warn_low: '',
            crit_low: '',
            warn_high: '',
            crit_high: '',
            stale_after_minutes: '',
        })
        setSelectedVar(null)
        setSelectedBitId('')
        setAnchor('')
        setSelectedSensorType('')
        setEditingIndex(null)
        setEditInitialVar(null)
        setModalOpen(true)
    }

    const openEditModal = (marker, index) => {
        resetForm({
            markerName: marker.name,
            markerLat: marker.latitude,
            markerLng: marker.longitude,
            idVar: marker.popupInfo?.idVar,
            unit: marker.unit ?? '',
            warn_low: marker.warn_low ?? '',
            crit_low: marker.crit_low ?? '',
            warn_high: marker.warn_high ?? '',
            crit_high: marker.crit_high ?? '',
            stale_after_minutes: marker.stale_after_minutes ?? '',
        })
        setSelectedVar(marker.popupInfo?.data ?? null)
        setEditInitialVar(marker.popupInfo?.data ?? null)
        setSelectedBitId(marker.popupInfo?.id_bit ?? '')
        setAnchor(marker.popupInfo?.anchor ?? '')
        setSelectedSensorType(marker.sensor_type ?? '')
        setEditingIndex(index)
        setModalOpen(true)
    }

    // Re-aplica el bit luego de que SelectVars resetea
    useEffect(() => {
        if (editingIndex === null) return
        const m = markers[editingIndex]
        if (m) setSelectedBitId(m.popupInfo?.id_bit ?? '')
    }, [editingIndex])

    const closeModal = () => {
        setModalOpen(false)
        setEditingIndex(null)
        setEditInitialVar(null)
    }

    // ── Guardar / actualizar marcador ────────────────────────────────────────
    const saveMarker = async () => {
        const values = getValues()
        const { markerName, markerLat, markerLng, idVar = false } = values

        if (!idVar) {
            await Swal.fire({ icon: 'error', title: 'Atención', html: '<h3>Debe seleccionar una variable.</h3>' })
            return
        }
        if (needsBitSelection && !selectedBitId) {
            await Swal.fire({ icon: 'error', title: 'Atención', html: '<h3>Debe seleccionar un bit para la variable binaria comprimida.</h3>' })
            return
        }

        const isValid = await trigger()
        if (!isValid) return

        // Validar orden de umbrales si se cargaron
        const numCritLow = toNumberOrNull(values.crit_low)
        const numWarnLow = toNumberOrNull(values.warn_low)
        const numWarnHigh = toNumberOrNull(values.warn_high)
        const numCritHigh = toNumberOrNull(values.crit_high)
        const allThresholds = [numCritLow, numWarnLow, numWarnHigh, numCritHigh]
        const hasAny = allThresholds.some((v) => v !== null)
        const hasAll = allThresholds.every((v) => v !== null)

        if (hasAny && !hasAll) {
            await Swal.fire({ icon: 'error', title: 'Atención', html: '<h3>Debe completar los 4 umbrales o ninguno.</h3>' })
            return
        }
        if (hasAll && !(numCritLow <= numWarnLow && numWarnLow <= numWarnHigh && numWarnHigh <= numCritHigh)) {
            await Swal.fire({ icon: 'error', title: 'Atención', html: '<h3>Los umbrales deben cumplir: crítico bajo ≤ alerta baja ≤ alerta alta ≤ crítico alto.</h3>' })
            return
        }

        const marker = generateMarker({
            name: markerName,
            latitude: markerLat,
            longitude: markerLng,
            idVar,
            data: selectedVar,
            id_bit: needsBitSelection ? Number(selectedBitId) : null,
            anchor,
            sensor_type: selectedSensorType || null,
            unit: values.unit,
            warn_low: values.warn_low,
            crit_low: values.crit_low,
            warn_high: values.warn_high,
            crit_high: values.crit_high,
            stale_after_minutes: values.stale_after_minutes,
        })

        if (isEditing) {
            setMarkers((prev) => prev.map((m, i) => (i === editingIndex ? marker : m)))
        } else {
            setMarkers((prev) => [...prev, marker])
        }
        closeModal()
    }

    const deleteCurrentMarker = async () => {
        if (!isEditing) return
        const confirm = await Swal.fire({
            title: '¿Eliminar marcador?',
            html: `<h3>"${markers[editingIndex]?.name ?? ''}" se eliminará del mapa.</h3>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
        })
        if (!confirm.isConfirmed) return
        setMarkers((prev) => prev.filter((_, i) => i !== editingIndex))
        closeModal()
    }

    // ── Persistencia del mapa ────────────────────────────────────────────────
    const editMap = async (map) => {
        const id = searchParam.get('id')
        if (!id) {
            await Swal.fire({ title: 'Error', icon: 'error', html: '<h3>No se puede editar el mapa sin el ID</h3>' })
        }
        return request(`${backend[import.meta.env.VITE_APP_NAME]}/map/${id}`, 'POST', map)
    }

    const saveMap = async (map) =>
        request(`${backend[import.meta.env.VITE_APP_NAME]}/map`, 'POST', map)

    const askMapName = async (initialName = '') => {
        const { value } = await Swal.fire({
            title: 'Guardar',
            input: 'text',
            inputLabel: 'Nombre del mapa',
            inputValue: initialName,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => { if (!value.trim()) return 'Debes ingresar un nombre' },
        })
        return value || null
    }

    const handleSubmit = async () => {
        if (!markers || markers.length === 0) {
            await Swal.fire({ icon: 'error', title: 'Atención', html: '<h3>Debe haber al menos un marcador para guardar el mapa.</h3>' })
            return
        }

        const mapName = await askMapName(search ? nameMap : '')
        if (!mapName) return

        const map = { name: mapName, viewState, markers }
        try {
            let result = false
            if (create && search) result = await editMap(map)
            if (create && !search) result = await saveMap(map)

            if (result) {
                await Swal.fire({ title: 'Éxito', icon: 'success', html: '<h3>El mapa se guardó con éxito</h3>' })
                navigate('/maps')
            }
        } catch (error) {
            console.error(error?.message || error)
            const msg = error?.response?.data?.message || 'Ocurrió un error al guardar los datos del mapa'
            Swal.fire({ title: 'Atención', icon: 'error', html: `<h3>${msg}</h3>` })
        }
    }

    // ── Fetch mapa existente ─────────────────────────────────────────────────
    const searchMap = async (id) => {
        if (!id) {
            Swal.fire({ icon: 'error', title: 'Atención', html: '<h3>No se pueden cargar los datos.</h3>' })
            setLoading(false)
            return
        }

        try {
            const url = `${backend[import.meta.env.VITE_APP_NAME]}/map?id=${id}`
            const { data } = await request(url, 'GET')

            setNameMap(data[0].name)
            setViewState({
                longitude: Number(data[0].longitude),
                latitude: Number(data[0].latitude),
                zoom: Number(data[0].zoom),
                bearing: Number(data[0].bearing),
                pitch: Number(data[0].pitch),
            })

            const loadedMarkers = data[0].MarkersMaps.map((mk) =>
                generateMarker({
                    name: mk.name,
                    latitude: mk.latitude,
                    longitude: mk.longitude,
                    idVar: mk.PopUpsMarkers?.idVar,
                    data: mk.PopUpsMarkers?.InfluxVar,
                    id_bit: mk.PopUpsMarkers?.id_bit ?? null,
                    anchor: mk.PopUpsMarkers?.anchor ?? '',
                    sensor_type: mk.sensor_type ?? null,
                    unit: mk.unit ?? '',
                    warn_low: mk.warn_low,
                    crit_low: mk.crit_low,
                    warn_high: mk.warn_high,
                    crit_high: mk.crit_high,
                    stale_after_minutes: mk.stale_after_minutes,
                })
            )
            setMarkers(loadedMarkers)
        } catch {
            Swal.fire({ icon: 'error', title: 'Atención', html: '<h3>Ocurrió un error al generar el mapa.</h3>' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const id = searchParam.get('id')
        if (!create || (create && search)) {
            setLoading(true)
            setMarkers([])
            setNameMap('')
            searchMap(id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParam])

    const headerTitle = search ? 'Editar Mapa' : 'Crear Mapa'
    const tagEyebrow = create && !search ? 'Nuevo mapa' : 'Mapa'
    const tagName = create && !search ? 'Sin guardar' : (nameMap || 'Mapa sin nombre')

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="w-full h-[88vh] flex flex-col">
            {create && (
                <PageHeader
                    title={headerTitle}
                    action={
                        <div className='flex flex-wrap gap-2 w-full justify-center sm:w-auto sm:justify-end'>
                            <Button
                                onClick={openModal}
                                variant='outlined'
                                startIcon={<AddLocation sx={{ fontSize: 18 }} />}
                                sx={outlinePillSx}
                            >
                                Agregar marcador
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                variant='contained'
                                disableElevation
                                sx={primaryPillSx}
                            >
                                Guardar
                            </Button>
                        </div>
                    }
                />
            )}

            {/* ── Label nombre mapa ── */}
            <div className='flex'>
                <div
                    className='inline-flex items-center gap-2 text-white rounded-t-md shadow-md'
                    style={{
                        padding: '4px 20px',
                        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
                        boxShadow: '0 4px 20px rgba(44, 106, 160, 0.3)',
                    }}
                >
                    <span className='text-[9px] font-semibold uppercase tracking-[0.18em] text-white/75'>
                        {tagEyebrow}
                    </span>
                    <span className='text-white/40'>·</span>
                    <span className='text-sm font-semibold text-white truncate max-w-[50vw]'>
                        {tagName}
                    </span>
                </div>
            </div>

            {/* ── Mapa + Marcadores ── */}
            <div className='flex flex-col lg:flex-row gap-3 flex-1 min-h-0'>
                <CardCustom className='p-3 rounded-xl rounded-tl-none h-auto w-auto flex-1 min-h-[300px]'>
                    {loading && !create ? (
                        <LoaderComponent />
                    ) : (
                        <MapBase
                            key={searchParam.get('id') ?? 'new'}
                            height='100%'
                            markers={markers}
                            setMarkers={setMarkers}
                            viewState={viewState}
                            setViewState={setViewState}
                            draggable={create}
                            withInfo={!create}
                            onEditMarker={create ? openEditModal : null}
                        />
                    )}
                </CardCustom>

                {create && (
                    <div className='w-full lg:w-[300px] flex-shrink-0 h-[260px] lg:h-auto lg:max-h-full'>
                        <ControlPanel
                            markers={markers}
                            setMarkers={setMarkers}
                            onEdit={openEditModal}
                        />
                    </div>
                )}
            </div>

            {/* ── Modal agregar/editar marcador ── */}
            <ModalShell
                open={modalOpen}
                onClose={closeModal}
                eyebrow='Marcador'
                title={isEditing ? 'Editar marcador' : 'Nuevo marcador'}
                maxWidth='760px'
                footer={
                    <>
                        {isEditing && (
                            <Button variant='outlined' sx={dangerPillSx} onClick={deleteCurrentMarker}>
                                Eliminar
                            </Button>
                        )}
                        <Button variant='outlined' sx={ghostCancelSx} onClick={closeModal}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={saveMarker}
                            variant='contained'
                            disableElevation
                            sx={primaryPillSx}
                            startIcon={<AddLocation sx={{ fontSize: 18 }} />}
                        >
                            {isEditing ? 'Guardar' : 'Agregar'}
                        </Button>
                    </>
                }
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

                    {/* — Información — */}
                    <Box sx={sectionSx}>
                        <SectionTitle>Información</SectionTitle>
                        <TextField
                            label='Nombre del marcador'
                            fullWidth
                            size='small'
                            {...register('markerName', {
                                required: 'Debe dar un nombre al marcador',
                                validate: (value) =>
                                    !markers.some((m, i) => m.name === value && i !== editingIndex) ||
                                    'El marcador ya existe',
                            })}
                            error={!!errors?.markerName}
                            helperText={errors?.markerName?.message}
                        />
                        <div className='flex flex-wrap gap-2'>
                            <div style={{ flex: '1 1 150px' }}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label='Latitud'
                                    {...register('markerLat', { required: 'Debe asignar una latitud' })}
                                    error={!!errors?.markerLat}
                                    helperText={errors?.markerLat?.message}
                                />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label='Longitud'
                                    {...register('markerLng', { required: 'Debe asignar una longitud' })}
                                    error={!!errors?.markerLng}
                                    helperText={errors?.markerLng?.message}
                                />
                            </div>
                        </div>
                    </Box>

                    {/* — Variable Influx — */}
                    <Box sx={sectionSx}>
                        <SectionTitle>Variable</SectionTitle>
                        <SelectVars
                            key={editingIndex ?? 'new'}
                            setValueState={handleVarSelect}
                            label='Variable del marcador'
                            initialVar={editInitialVar || false}
                        />
                        {needsBitSelection && (
                            <FormControl fullWidth size='small'>
                                <InputLabel>Bit de la variable</InputLabel>
                                <Select
                                    value={selectedBitId}
                                    label='Bit de la variable'
                                    onChange={(e) => setSelectedBitId(e.target.value)}
                                >
                                    <MenuItem value='' disabled>Seleccioná un bit</MenuItem>
                                    {availableBits.map((b) => (
                                        <MenuItem key={b.id} value={b.id}>
                                            {b.name} (bit {b.bit})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>

                    {/* — Tipo y posición — */}
                    <Box sx={sectionSx}>
                        <SectionTitle>Tipo de sensor y posición</SectionTitle>
                        <FormControl fullWidth size='small'>
                            <InputLabel>Tipo de sensor</InputLabel>
                            <Select
                                value={selectedSensorType}
                                label='Tipo de sensor'
                                onChange={(e) => setSelectedSensorType(e.target.value)}
                            >
                                <MenuItem value=''>— Sin tipo —</MenuItem>
                                {SENSOR_TYPE_OPTIONS.map((o) => (
                                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size='small'>
                            <InputLabel>Posición del label</InputLabel>
                            <Select
                                value={anchor}
                                label='Posición del label'
                                onChange={(e) => setAnchor(e.target.value)}
                            >
                                {ANCHOR_OPTIONS.map((o) => (
                                    <MenuItem key={o.value || 'auto'} value={o.value}>{o.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* — Umbrales — (no aplica a variables binarias ni calc binarias) */}
                    {!isBinaryCompressed && !isCalcBinary && (
                    <Box sx={sectionSx}>
                        <SectionTitle>Umbrales y unidad</SectionTitle>
                        <div className='flex flex-wrap gap-2'>
                            <div style={{ flex: '1 1 150px' }}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label='Unidad'
                                    placeholder='bar / L/s / %'
                                    {...register('unit')}
                                />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    type='number'
                                    label='Stale (min)'
                                    inputProps={{ step: 1, min: 1 }}
                                    {...register('stale_after_minutes')}
                                />
                            </div>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                            <div style={{ flex: '1 1 150px' }}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    type='number'
                                    label='Crítico bajo'
                                    inputProps={{ step: 0.1 }}
                                    {...register('crit_low')}
                                />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    type='number'
                                    label='Alerta baja'
                                    inputProps={{ step: 0.1 }}
                                    {...register('warn_low')}
                                />
                            </div>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                            <div style={{ flex: '1 1 150px' }}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    type='number'
                                    label='Alerta alta'
                                    inputProps={{ step: 0.1 }}
                                    {...register('warn_high')}
                                />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    type='number'
                                    label='Crítico alto'
                                    inputProps={{ step: 0.1 }}
                                    {...register('crit_high')}
                                />
                            </div>
                        </div>
                    </Box>
                    )}
                </Box>
            </ModalShell>
        </div>
    )
}

export default MapView
