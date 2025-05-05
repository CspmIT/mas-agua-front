import { Button, TextField, Typography } from '@mui/material'
import MapBase from '../Components/MapBase'
import SelectVars from '../../Charts/components/SelectVars'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import { useEffect, useState } from 'react'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import { useNavigate, useSearchParams } from 'react-router-dom'

const MapView = ({ create = false, search = false }) => {
    const {
        register,
        getValues,
        setValue,
        trigger,
        formState: { errors },
    } = useForm()

    const navigate = useNavigate()
    const [searchParam] = useSearchParams()

    const [markers, setMarkers] = useState([])
    const [loading, setLoading] = useState(true)
    const [viewState, setViewState] = useState({
        longitude: -62.005196197872266,
        latitude: -30.716256365145455,
        zoom: 14,
        bearing: 0,
        pitch: 0,
    })

    const generateMarker = (name, lat, lng, idVar, data) => {
        return {
            name,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            popupInfo: {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                idVar: idVar,
                data: data || null,
            },
        }
    }

    const saveMarker = async () => {
        const { markerName, markerLat, markerLng, idVar = false } = getValues()
        if (!idVar) {
            await Swal.fire({
                icon: 'error',
                title: 'Atencion!',
                html: '<h3>Debe seleccionar una variable.</h3>',
            })
            return
        }
        const isValid = await trigger()
        if (!isValid) {
            return false
        }
        const marker = generateMarker(markerName, markerLat, markerLng, idVar)
        setMarkers([...markers, marker])
    }

    const editMap = async (map) => {
        const id = searchParam.get('id')
        if (!id) {
            await Swal.fire({
                title: 'Error',
                icon: 'error',
                html: '<h3>No se puede editar el mapa sin el ID</h3>',
            })
        }
        const url = `${backend[import.meta.env.VITE_APP_NAME]}/map/${id}`
        const updated = await request(url, 'POST', map)
        return updated
    }

    const saveMap = async (map) => {
        const url = `${backend[import.meta.env.VITE_APP_NAME]}/map`
        const result = await request(url, 'POST', map)
        return result
    }

    const handleSubmit = async () => {
        const map = {
            viewState,
            markers,
        }
        if (!markers || markers.length === 0) {
            await Swal.fire({
                icon: 'error',
                title: 'Atencion!',
                html: '<h3>Debe haber al menos un marcador para guardar el mapa.</h3>',
            })
            return false
        }
        try {
            let result = false
            if (create && search) {
                result = await editMap(map)
            }

            if (create && !search) {
                result = await saveMap(map)
            }

            if (result) {
                await Swal.fire({
                    title: 'Exito:',
                    icon: 'success',
                    html: '<h3>El mapa se guardo con exito</h3>',
                })
                navigate('/')
            }
        } catch (error) {
            console.error(error.message)
            Swal.fire({
                title: 'Atencion',
                icon: 'error',
                html: '<h3>Ocurrio un error al guardar los datos del mapa</h3>',
            })
        }
    }

    const searchMap = async (id) => {
        if (!id) {
            Swal.fire({
                icon: 'error',
                title: 'Atencion!',
                html: '<h3>No se pueden cargar los datos.</h3>',
            })
            return
        }

        try {
            const url = `${backend[import.meta.env.VITE_APP_NAME]}/map?id=${id}`
            const { data } = await request(url, 'GET')
            const viewStateObject = {
                longitude: data[0].longitude,
                latitude: data[0].latitude,
                zoom: data[0].zoom,
                bearing: data[0].bearing,
                pitch: data[0].pitch,
            }
            setViewState(viewStateObject)
            const markers = data[0].MarkersMaps.map((markerMap) => {
                const marker = generateMarker(
                    markerMap.name,
                    markerMap.latitude,
                    markerMap.longitude,
                    markerMap.PopUpsMarkers.idVar,
                    markerMap.PopUpsMarkers.InfluxVar
                )
                return marker
            })

            setMarkers(markers)
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Atencion!',
                html: '<h3>Ocurrio un error al generar el mapa.</h3>',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!create) {
            const id = searchParam.get('id')
            searchMap(id)
        }

        if (create && search) {
            const id = searchParam.get('id')
            searchMap(id)
        }
    }, [])

    return (
        <div className="w-full h-[85vh] flex flex-col gap-3">
            <Typography variant="h4" align="center">
                Presion de red
            </Typography>

            {create && (
                <div className="flex gap-3 max-sm:flex-col justify-center items-center">
                    <TextField
                        className="w-1/5 max-sm:w-full"
                        {...register('markerName', {
                            required: 'Debe dar un nombre al marcador',
                            validate: (value) =>
                                !markers.some(
                                    (marker) => marker.name === value
                                ) || 'El marcador ya existe',
                        })}
                        label={'Nombre'}
                        error={errors?.markerName}
                        helperText={errors?.markerName?.message}
                    />
                    <TextField
                        className="w-1/5 max-sm:w-full"
                        {...register('markerLat', {
                            required: 'Debe asignar una latitud',
                        })}
                        label={'Latitud'}
                        error={errors?.markerLat}
                        helperText={errors?.markerLat?.message}
                    />
                    <TextField
                        className="w-1/5 max-sm:w-full"
                        {...register('markerLng', {
                            required: 'Debe asignar una longitud',
                        })}
                        label={'Longitud'}
                        error={errors?.markerLng}
                        helperText={errors?.markerLng?.message}
                    />
                    <SelectVars
                        className="!w-1/5 !max-sm:w-full"
                        setValue={setValue}
                        label={'Seleccione una variable'}
                    />
                    <Button
                        onClick={saveMarker}
                        className="w-[10%]"
                        variant="contained"
                    >
                        Agregar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="w-[10%]"
                        color="success"
                        variant="contained"
                    >
                        {create && search ? 'Editar mapa' : 'Guardar mapa'}
                    </Button>
                </div>
            )}

            {loading && !create ? (
                <Typography align="center">Cargando mapa...</Typography>
            ) : (
                <MapBase
                    height={'100%'}
                    markers={markers}
                    setMarkers={setMarkers}
                    viewState={viewState}
                    setViewState={setViewState}
                    controlPanel={create}
                    draggable={create}
                    withInfo={!create}
                />
            )}
        </div>
    )
}

export default MapView
