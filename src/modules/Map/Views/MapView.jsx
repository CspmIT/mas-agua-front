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
    fontWeight: 500,
    px: 2.5,
    py: 0.85,
    minHeight: 0,
    borderColor: 'rgba(44, 106, 160, 0.4)',
    color: '#2c6aa0',
    backgroundColor: 'rgba(44, 106, 160, 0.04)',
    '&:hover': {
        borderColor: '#2c6aa0',
        backgroundColor: 'rgba(44, 106, 160, 0.1)',
    },
    'body.dark &': {
        color: '#5ea5f0',
        borderColor: 'rgba(94, 165, 240, 0.4)',
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

const SectionTitle = ({ children }) => (
    <div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400 px-1 -mt-0.5'>
        {children}
    </div>
)

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

    // ── Binary compressed state ──────────────────────────────────────────────
    const [selectedVar, setSelectedVar] = useState(null)
    const [selectedBitId, setSelectedBitId] = useState('')

    const isBinaryCompressed = selectedVar?.binary_compressed ?? false
    const availableBits = selectedVar?.bits ?? []

    const [viewState, setViewState] = useState({
        longitude: -62.005196197872266,
        latitude: -30.716256365145455,
        zoom: 14,
        bearing: 0,
        pitch: 0,
    })

    // ── Helpers ──────────────────────────────────────────────────────────────
    const generateMarker = (name, lat, lng, idVar, data, id_bit = null) => ({
        name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        popupInfo: {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            idVar,
            id_bit,
            data: data || null,
        },
    })

    const handleVarSelect = (variable) => {
        setValue('idVar', variable?.id ?? null)
        setSelectedVar(variable ?? null)
        setSelectedBitId('')
    }

    const openModal = () => {
        resetForm()
        setSelectedVar(null)
        setSelectedBitId('')
        setModalOpen(true)
    }

    const closeModal = () => setModalOpen(false)

    // ── Guardar marcador ─────────────────────────────────────────────────────
    const saveMarker = async () => {
        const { markerName, markerLat, markerLng, idVar = false } = getValues()

        if (!idVar) {
            await Swal.fire({ icon: 'error', title: 'Atención', html: '<h3>Debe seleccionar una variable.</h3>' })
            return
        }

        if (isBinaryCompressed && !selectedBitId) {
            await Swal.fire({ icon: 'error', title: 'Atención', html: '<h3>Debe seleccionar un bit para la variable binaria comprimida.</h3>' })
            return
        }

        const isValid = await trigger()
        if (!isValid) return

        const marker = generateMarker(
            markerName,
            markerLat,
            markerLng,
            idVar,
            null,
            isBinaryCompressed ? Number(selectedBitId) : null
        )

        setMarkers(prev => [...prev, marker])
        closeModal()
    }

    // ── Guardar / editar mapa ────────────────────────────────────────────────
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
            console.error(error.message)
            Swal.fire({ title: 'Atención', icon: 'error', html: '<h3>Ocurrió un error al guardar los datos del mapa</h3>' })
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

            const loadedMarkers = data[0].MarkersMaps.map((markerMap) =>
                generateMarker(
                    markerMap.name,
                    markerMap.latitude,
                    markerMap.longitude,
                    markerMap.PopUpsMarkers.idVar,
                    markerMap.PopUpsMarkers.InfluxVar,
                    markerMap.PopUpsMarkers.id_bit ?? null
                )
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
            // reset state antes de traer el nuevo mapa
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
                        <div className='flex gap-2'>
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

            {/* ── Mapa ── */}
            <CardCustom className="p-3 rounded-xl rounded-tl-none h-auto w-auto flex-1">
                {loading && !create ? (
                    <LoaderComponent />
                ) : (
                    <MapBase
                        key={searchParam.get('id') ?? 'new'}
                        height="100%"
                        markers={markers}
                        setMarkers={setMarkers}
                        viewState={viewState}
                        setViewState={setViewState}
                        controlPanel={create}
                        draggable={create}
                        withInfo={!create}
                    />
                )}
            </CardCustom>

            {/* ── Modal agregar marcador ── */}
            <ModalShell
                open={modalOpen}
                onClose={closeModal}
                eyebrow='Marcador'
                title='Nuevo marcador'
                maxWidth='480px'
                footer={
                    <>
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
                            Agregar
                        </Button>
                    </>
                }
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={sectionSx}>
                        <SectionTitle>Información</SectionTitle>
                        <TextField
                            label='Nombre del marcador'
                            fullWidth
                            size='small'
                            {...register('markerName', {
                                required: 'Debe dar un nombre al marcador',
                                validate: (value) =>
                                    !markers.some((m) => m.name === value) || 'El marcador ya existe',
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

                    <Box sx={sectionSx}>
                        <SectionTitle>Variable</SectionTitle>
                        <SelectVars
                            setValueState={handleVarSelect}
                            label='Variable del marcador'
                        />
                        {isBinaryCompressed && (
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
                </Box>
            </ModalShell>
        </div>
    )
}

export default MapView
