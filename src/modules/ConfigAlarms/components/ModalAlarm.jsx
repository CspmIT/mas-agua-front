import { useState, useEffect } from 'react'
import {
    Modal,
    Box,
    TextField,
    MenuItem,
    Button,
    Typography,
    IconButton,
    CircularProgress,
    FormControlLabel,
    Switch
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
        value2: '',
        repeatInterval: 0,
        type: 'single',
        logicOperator: 'AND',
        secondaryVariableId: '',
        secondaryCondition: '',
        secondaryValue: '',
    })

    useEffect(() => {
        if (alarmData) {
            setForm({
                name: alarmData.name || '',
                id_influxvars: alarmData.id_influxvars || '',
                condition: alarmData.condition || '',
                value: alarmData.value ?? '',
                value2: alarmData.value2 ?? '',
                repeatInterval: alarmData.repeatInterval ?? 0,
                type: alarmData.type || 'single',
                logicOperator: alarmData.logicOperator || 'AND',
                secondaryVariableId: alarmData.secondaryVariableId || '',
                secondaryCondition: alarmData.secondaryCondition || '',
                secondaryValue: alarmData.secondaryValue || '',
            })
        } else {
            setForm({
                name: '',
                id_influxvars: '',
                condition: '',
                value: '',
                value2: '',
                repeatInterval: 0,
                type: 'single',
                logicOperator: 'AND',
                secondaryVariableId: '',
                secondaryCondition: '',
                secondaryValue: '',
            })
        }
    }, [alarmData, openModal])

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
        setForm({
            name: '',
            id_influxvars: '',
            condition: '',
            value: '',
            value2: '',
            repeatInterval: 0,
            type: 'single',
            logicOperator: 'AND',
            secondaryVariableId: '',
            secondaryCondition: '',
            secondaryValue: '',
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = backend[import.meta.env.VITE_APP_NAME]
            const payload = { ...form }

            // Si no es "entre", limpiamos value2
            if (form.condition !== 'entre') delete payload.value2

            // Si es simple, no mandamos campos de la segunda condición
            if (form.type === 'single') {
                delete payload.secondaryVariableId
                delete payload.secondaryCondition
                delete payload.secondaryValue
                delete payload.logicOperator
            }

            if (alarmData?.id) {
                await request(`${url}/updateAlarm/${alarmData.id}`, 'PUT', payload)
                await Swal.fire({
                    showConfirmButton: false,
                    timer: 1500,
                    icon: 'success',
                    text: 'Alarma editada correctamente',
                })
            } else {
                await request(`${url}/createAlarm`, 'POST', payload)
                await Swal.fire({
                    showConfirmButton: false,
                    timer: 1500,
                    icon: 'success',
                    text: 'Alarma creada correctamente',
                })
            }

            onSuccess?.()
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
            <Box className="relative bg-white p-6 rounded-lg shadow-lg max-w-[95vw]">
                <IconButton onClick={handleClose} className="!absolute top-3 right-3">
                    <Close color="error" />
                </IconButton>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col h-full gap-3 justify-start items-center">
                    <Typography variant="h5">
                        {alarmData?.id ? 'Editar alarma' : 'Crear nueva alarma'}
                    </Typography>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.type === 'combined'}
                                onChange={(e) => handleChange('type', e.target.checked ? 'combined' : 'single')}
                            />
                        }
                        label="Alarma combinada"
                    />

                    <div className="flex flex-wrap w-full gap-3 justify-center my-4">
                        <TextField
                            label="Nombre"
                            className="w-64"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                        />

                        <TextField
                            label="Variable"
                            className="w-64"
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
                            className="w-64"
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
                            className="w-64"
                            label="Valor"
                            value={form.value}
                            onChange={(e) => handleChange('value', e.target.value)}
                            required
                        />

                        {form.condition === 'entre' && (
                            <TextField
                                type="number"
                                className="w-64"
                                label="Valor 2"
                                value={form.value2}
                                onChange={(e) => handleChange('value2', e.target.value)}
                                required
                            />
                        )}

                        <TextField
                            type="number"
                            className="w-64"
                            label="Intervalo de repetición (minutos)"
                            value={form.repeatInterval || ''}
                            onChange={(e) => handleChange('repeatInterval', e.target.value)}
                            required
                            inputProps={{ min: 0 }}
                        />

                        {form.type === 'combined' && (
                            <>
                                <TextField
                                    label="Operador lógico"
                                    className="w-64"
                                    select
                                    value={form.logicOperator}
                                    onChange={(e) => handleChange('logicOperator', e.target.value)}
                                >
                                    <MenuItem value="AND">AND (y)</MenuItem>
                                    <MenuItem value="OR">OR (o)</MenuItem>
                                </TextField>

                                <TextField
                                    label="Variable secundaria"
                                    className="w-64"
                                    select
                                    value={form.secondaryVariableId}
                                    onChange={(e) => handleChange('secondaryVariableId', e.target.value)}
                                    required
                                >
                                    <MenuItem value="">Selecciona una variable</MenuItem>
                                    {variables.map((v) => (
                                        <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    label="Condición secundaria"
                                    className="w-64"
                                    select
                                    value={form.secondaryCondition}
                                    onChange={(e) => handleChange('secondaryCondition', e.target.value)}
                                    required
                                >
                                    <MenuItem value=">">Mayor que</MenuItem>
                                    <MenuItem value="<">Menor que</MenuItem>
                                    <MenuItem value="=">Igual a</MenuItem>
                                    <MenuItem value=">=">Mayor o igual</MenuItem>
                                    <MenuItem value="<=">Menor o igual</MenuItem>
                                </TextField>

                                <TextField
                                    type="number"
                                    className="w-64"
                                    label="Valor secundario"
                                    value={form.secondaryValue}
                                    onChange={(e) => handleChange('secondaryValue', e.target.value)}
                                    required
                                />
                            </>
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
