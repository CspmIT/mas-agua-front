import { useState, useEffect } from 'react'
import {
    Modal,
    Box,
    TextField,
    MenuItem,
    Button,
    Typography,
    IconButton,
    CircularProgress
} from '@mui/material'
import { Close } from '@mui/icons-material'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { getVarsInflux } from '../../DrawDiagram/components/Fields/actions'

const ModalAlarm = ({ openModal, setOpenModal, onSuccess, alarmData }) => {
    const [loading, setLoading] = useState(false)
    const [variables, setVariables] = useState([])
    const [form, setForm] = useState({
        name: '',
        id_influxvars: '',
        condition: '',
        value: '',
        value2: ''
    })

    // Prellenar datos si viene una alarma para editar
    useEffect(() => {
        if (alarmData) {
            setForm({
                name: alarmData.name || '',
                id_influxvars: alarmData.id_influxvars || '',
                condition: alarmData.condition || '',
                value: alarmData.value ?? '',
                value2: alarmData.value2 ?? ''
            })
        } else {
            setForm({ name: '', id_influxvars: '', condition: '', value: '', value2: '' })
        }
    }, [alarmData, openModal])

    // Obtener variables disponibles (InfluxVars)
    useEffect(() => {
        const fetchVars = async () => {
            const variables = await getVarsInflux()
            setVariables(variables)
        }
        if (openModal) fetchVars()
    }, [openModal])

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleClose = () => {
        setOpenModal(false)
        setForm({ name: '', id_influxvars: '', condition: '', value: '', value2: '' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = backend[import.meta.env.VITE_APP_NAME]
            const payload = { ...form }
            if (form.condition !== 'entre') {
                delete payload.value2
            }

            if (alarmData?.id) {
                // EDITAR
                await request(`${url}/updateAlarm/${alarmData.id}`, 'PUT', payload)
                await Swal.fire('Éxito', 'Alarma editada correctamente', 'success')
            } else {
                // CREAR
                await request(`${url}/createAlarm`, 'POST', payload)
                await Swal.fire('Éxito', 'Alarma creada correctamente', 'success')
            }

            onSuccess?.() // refresca lista en index.jsx
            handleClose()
        } catch (err) {
            console.error(err)
            Swal.fire('Error', 'No se pudo guardar la alarma', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal open={openModal} onClose={handleClose} className="flex justify-center items-center align-middle">
            <Box className="relative bg-white p-6 rounded-lg shadow-lg">
                <IconButton
                    onClick={handleClose}
                    className="!absolute top-3 right-3"
                >
                    <Close color="error" />
                </IconButton>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col h-full gap-3 justify-start items-center min-w-[90vw] max-w-[94vw]">
                    <Typography variant="h5">
                        {alarmData?.id ? 'Editar alarma' : 'Crear nueva alarma'}
                    </Typography>
                    <div className="flex w-full gap-3 justify-center my-5">
                        <TextField
                            label="Nombre"
                            className="w-2/3"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                        />

                        <TextField
                            label="Variable"
                            className="w-2/3"
                            select
                            value={form.id_influxvars}
                            onChange={(e) => handleChange('id_influxvars', e.target.value)}
                            required
                        >
                            <MenuItem value="">Selecciona una variable</MenuItem>
                            {variables.map((v) => (
                                <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Condición"
                            className="w-2/3"
                            select
                            value={form.condition}
                            onChange={(e) => handleChange('condition', e.target.value)}
                            required
                        >
                            <MenuItem value=">">Mayor que</MenuItem>
                            <MenuItem value="<">Menor que</MenuItem>
                            <MenuItem value="=">Igual a</MenuItem>
                            <MenuItem value=">=">Mayor o igual</MenuItem>
                            <MenuItem value="<=">Menor o igual</MenuItem>
                            <MenuItem value="entre">Entre</MenuItem>
                        </TextField>

                        <TextField
                            type="number"
                            className="w-2/3"
                            label="Valor"
                            value={form.value}
                            onChange={(e) => handleChange('value', e.target.value)}
                            required
                        />

                        {form.condition === 'entre' && (
                            <TextField
                                type="number"
                                className="w-2/3"
                                label="Valor 2"
                                value={form.value2}
                                onChange={(e) => handleChange('value2', e.target.value)}
                                required
                            />
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} color="inherit" />}
                    >
                        {loading
                            ? 'Guardando...'
                            : alarmData?.id
                            ? 'Guardar cambios'
                            : 'Crear alarma'}
                    </Button>
                </form>
            </Box>
        </Modal>
    )
}

export default ModalAlarm
