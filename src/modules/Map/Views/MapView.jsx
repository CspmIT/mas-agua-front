import { Button, TextField, Typography } from '@mui/material'
import MapBase from '../Components/MapBase'
import SelectVars from '../../Charts/components/SelectVars'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import { useState } from 'react'

const MapView = () => {
    const {
        register,
        getValues,
        setValue,
        trigger,
        formState: { errors },
    } = useForm()
    const [markers, setMarkers] = useState([])
    const generateMarker = (name, lat, lng, idVar) => {
        return {
            name,
            latitude: lat,
            longitude: lng,
            popupInfo: {
                lat: lat,
                lng: lng,
                name: idVar,
                data: null
            }
        }
    }
    const saveMap = async () => {
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

    return (
        <div className="w-full h-[85vh] flex flex-col gap-3">
            <Typography variant="h4" align="center">
                Presion de red
            </Typography>
            <div className="flex gap-3 max-sm:flex-col justify-center items-center">
                <TextField
                    className="w-1/5 max-sm:w-full"
                    {...register('markerName', {
                        required: 'Debe dar un nombre al marcador',
                        validate: (value) => !markers.some(marker => marker.name === value) || "El marcador ya existe"
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
                <Button onClick={saveMap} className="w-[10%]" variant="contained">
                    Agregar
                </Button>
                <Button onClick={()=> console.log('guarda mapa')} className="w-[10%]" color='success' variant="contained">
                   Guardar Mapa 
                </Button>
            </div>

            <MapBase height={'100%'} markers={markers} setMarkers={setMarkers} />
        </div>
    )
}

export default MapView
