import { Button, TextField, Typography, FormLabel, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material'
import { AddLocation, Close } from '@mui/icons-material'
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
            id_bit,        // <-- nuevo: bit asignado si es binaria comprimida
            data: data || null,
        },
    })

    const handleVarSelect = (variable) => {
        setValue('idVar', variable?.id ?? null)
        setSelectedVar(variable ?? null)
        setSelectedBitId('')           // reset bit al cambiar variable
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
        console.log('Datos a guardar:', map)  // <-- log para verificar datos antes de enviar
        try {
            let result = false
            if (create && search)  result = await editMap(map)
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
            return
        }

        try {
            const url = `${backend[import.meta.env.VITE_APP_NAME]}/map?id=${id}`
            const { data } = await request(url, 'GET')

            setNameMap(data[0].name)
            setViewState({
                longitude: Number(data[0].longitude),
                latitude:  Number(data[0].latitude),
                zoom:      Number(data[0].zoom),
                bearing:   Number(data[0].bearing),
                pitch:     Number(data[0].pitch),
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
        if (!create)           { const id = searchParam.get('id'); searchMap(id) }
        if (create && search)  { const id = searchParam.get('id'); searchMap(id) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="w-full h-[88vh] flex flex-col gap-1">

            {create && (
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center pb-3">
                    <FormLabel className='w-full text-center !text-3xl md:ms-32'>
                        {create && search ? 'Editar Mapa' : 'Crear Mapa'}
                    </FormLabel>

                    <div className="flex gap-2 mr-3">
                        {/* Botón abrir modal */}
                        <Button
                            onClick={openModal}
                            variant="outlined"
                            startIcon={<AddLocation />}
                        >
                            Agregar Marcador
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            color="success"
                            variant="contained"
                        >
                            Guardar
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Label nombre mapa ── */}
            <div className="w-full">
                <div className="absolute mt-1 px-5 z-30 bg-[#2c6aa0] text-white font-semibold rounded-t-md shadow-md">
                    {create && !search ? 'Nuevo Mapa' : (nameMap || 'Mapa sin nombre')}
                </div>
            </div>

            {/* ── Mapa ── */}
            <CardCustom className="p-3 rounded-xl rounded-tl-none h-auto w-auto flex-1 mt-6 pt-2">
                {loading && !create ? (
                    <LoaderComponent />
                ) : (
                    <MapBase
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
            <Dialog
                open={modalOpen}
                onClose={closeModal}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-semibold text-lg">Nuevo marcador</span>
                    <IconButton onClick={closeModal} size="small">
                        <Close fontSize="small" />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <div className="flex flex-col gap-4 pt-1">

                        <TextField
                            label="Nombre del marcador"
                            fullWidth
                            size="small"
                            {...register('markerName', {
                                required: 'Debe dar un nombre al marcador',
                                validate: (value) =>
                                    !markers.some((m) => m.name === value) || 'El marcador ya existe',
                            })}
                            error={!!errors?.markerName}
                            helperText={errors?.markerName?.message}
                        />

                        <div className="flex gap-3">
                            <TextField
                                label="Latitud"
                                fullWidth
                                size="small"
                                {...register('markerLat', { required: 'Debe asignar una latitud' })}
                                error={!!errors?.markerLat}
                                helperText={errors?.markerLat?.message}
                            />
                            <TextField
                                label="Longitud"
                                fullWidth
                                size="small"
                                {...register('markerLng', { required: 'Debe asignar una longitud' })}
                                error={!!errors?.markerLng}
                                helperText={errors?.markerLng?.message}
                            />
                        </div>

                        {/* Selector variable */}
                        <SelectVars
                            setValueState={handleVarSelect}
                            label="Variable del marcador"
                        />

                        {/* Selector bit — solo si es binaria comprimida */}
                        {isBinaryCompressed && (
                            <FormControl fullWidth size="small">
                                <InputLabel>Bit de la variable</InputLabel>
                                <Select
                                    value={selectedBitId}
                                    label="Bit de la variable"
                                    onChange={(e) => setSelectedBitId(e.target.value)}
                                >
                                    <MenuItem value="" disabled>Seleccioná un bit</MenuItem>
                                    {availableBits.map((b) => (
                                        <MenuItem key={b.id} value={b.id}>
                                            {b.name} (bit {b.bit})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                    </div>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={closeModal} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={saveMarker} variant="contained" startIcon={<AddLocation />}>
                        Agregar
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}

export default MapView