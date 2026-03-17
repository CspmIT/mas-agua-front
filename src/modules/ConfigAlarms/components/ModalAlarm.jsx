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
    Switch,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { getVarsInflux } from '../../DrawDiagram/components/Fields/actions'

const emptyForm = {
    name: '',
    id_influxvars: '',
    id_bit: null,
    condition: '',
    value: '',
    value2: '',
    repeatInterval: 0,
    type: 'single',
    logicOperator: 'AND',
    secondaryVariableId: '',
    secondary_id_bit: null,
    secondaryCondition: '',
    secondaryValue: '',
    hasTimeRange: false,
    startime: '',
    endtime: '',
}

const ModalAlarm = ({ openModal, setOpenModal, onSuccess, alarmData }) => {
    const [loading, setLoading] = useState(false)
    const [variables, setVariables] = useState([])
    const [form, setForm] = useState(emptyForm)

    // Variable principal seleccionada (para acceder a sus bits)
    const primaryVar    = variables.find(v => v.id === Number(form.id_influxvars)) ?? null
    const secondaryVar  = variables.find(v => v.id === Number(form.secondaryVariableId)) ?? null

    const primaryIsBinary   = primaryVar?.binary_compressed   ?? false
    const secondaryIsBinary = secondaryVar?.binary_compressed ?? false

    /* ── Cargar form al editar ─────────────────────────────────────────── */
    useEffect(() => {
        if (alarmData) {
            setForm({
                name:                alarmData.name              || '',
                id_influxvars:       alarmData.id_influxvars     || '',
                id_bit:              alarmData.id_bit            ?? null,
                condition:           alarmData.condition         || '',
                value:               alarmData.value             ?? '',
                value2:              alarmData.value2            ?? '',
                repeatInterval:      alarmData.repeatInterval    ?? 0,
                type:                alarmData.type              || 'single',
                logicOperator:       alarmData.logicOperator     || 'AND',
                secondaryVariableId: alarmData.secondaryVariableId || '',
                secondary_id_bit:    alarmData.secondary_id_bit  ?? null,
                secondaryCondition:  alarmData.secondaryCondition || '',
                secondaryValue:      alarmData.secondaryValue    || '',
                hasTimeRange:        !!(alarmData.startime && alarmData.endtime),
                startime:            alarmData.startime          || '',
                endtime:             alarmData.endtime           || '',
            })
        } else {
            setForm(emptyForm)
        }
    }, [alarmData, openModal])

    /* ── Cargar variables ──────────────────────────────────────────────── */
    useEffect(() => {
        if (openModal) {
            getVarsInflux().then(setVariables)
        }
    }, [openModal])

    /* ── Helpers ───────────────────────────────────────────────────────── */
    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    // Al cambiar variable principal → resetear su bit
    const handlePrimaryVarChange = (id) => {
        setForm(prev => ({ ...prev, id_influxvars: id, id_bit: null }))
    }

    // Al cambiar variable secundaria → resetear su bit
    const handleSecondaryVarChange = (id) => {
        setForm(prev => ({ ...prev, secondaryVariableId: id, secondary_id_bit: null }))
    }

    const handleClose = () => {
        setForm(emptyForm)
        setOpenModal(false)
    }

    /* ── Submit ────────────────────────────────────────────────────────── */
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validar bit obligatorio si la variable es binaria comprimida
        if (primaryIsBinary && !form.id_bit) {
            Swal.fire('Error', 'Debe seleccionar un bit para la variable principal', 'error')
            return
        }
        if (form.type === 'combined' && secondaryIsBinary && !form.secondary_id_bit) {
            Swal.fire('Error', 'Debe seleccionar un bit para la variable secundaria', 'error')
            return
        }

        setLoading(true)
        try {
            const url     = backend[import.meta.env.VITE_APP_NAME]
            const payload = { ...form }

            if (form.condition !== 'entre') delete payload.value2

            if (form.type === 'single') {
                delete payload.secondaryVariableId
                delete payload.secondaryCondition
                delete payload.secondaryValue
                delete payload.logicOperator
                delete payload.secondary_id_bit
            }

            if (!form.hasTimeRange) {
                delete payload.startime
                delete payload.endtime
                delete payload.hasTimeRange
            }

            // Limpiar id_bit si la variable no es binaria comprimida
            if (!primaryIsBinary)   payload.id_bit           = null
            if (!secondaryIsBinary) payload.secondary_id_bit = null

            if (alarmData?.id) {
                await request(`${url}/updateAlarm/${alarmData.id}`, 'PUT', payload)
                await Swal.fire({ showConfirmButton: false, timer: 1500, icon: 'success', text: 'Alarma editada correctamente' })
            } else {
                await request(`${url}/createAlarm`, 'POST', payload)
                await Swal.fire({ showConfirmButton: false, timer: 1500, icon: 'success', text: 'Alarma creada correctamente' })
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

    /* ── Render ────────────────────────────────────────────────────────── */
    return (
        <Modal open={openModal} onClose={handleClose} className="flex justify-center items-center">
            <Box className="relative bg-white p-6 rounded-lg shadow-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <IconButton onClick={handleClose} className="!absolute top-3 right-3">
                    <Close color="error" />
                </IconButton>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3 items-center">
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

                    <div className="flex flex-wrap w-full gap-3 justify-center mb-4">

                        {/* Nombre */}
                        <TextField
                            label="Nombre"
                            className="w-64"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            size="small"
                        />

                        {/* Variable principal */}
                        <TextField
                            label="Variable"
                            className="w-64"
                            select
                            value={form.id_influxvars}
                            onChange={(e) => handlePrimaryVarChange(e.target.value)}
                            required
                            size="small"
                        >
                            <MenuItem value="">Seleccioná una variable</MenuItem>
                            {variables.map((v) => (
                                <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                            ))}
                        </TextField>

                        {/* Bit principal — solo si es binaria comprimida */}
                        {primaryIsBinary && (
                            <FormControl className="w-64" size="small" required>
                                <InputLabel>Bit de la variable</InputLabel>
                                <Select
                                    value={form.id_bit ?? ''}
                                    label="Bit de la variable"
                                    onChange={(e) => handleChange('id_bit', e.target.value)}
                                >
                                    <MenuItem value="" disabled>Seleccioná un bit</MenuItem>
                                    {(primaryVar?.bits ?? []).map((b) => (
                                        <MenuItem key={b.id} value={b.id}>
                                            {b.name} (bit {b.bit})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Condición principal */}
                        <TextField
                            label="Condición"
                            className="w-64"
                            select
                            value={form.condition}
                            onChange={(e) => handleChange('condition', e.target.value)}
                            required
                            size="small"
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
                            size="small"
                        />

                        {form.condition === 'entre' && (
                            <TextField
                                type="number"
                                className="w-64"
                                label="Valor 2"
                                value={form.value2}
                                onChange={(e) => handleChange('value2', e.target.value)}
                                required
                                size="small"
                            />
                        )}

                        {/* ── Combinada ───────────────────────────────── */}
                        {form.type === 'combined' && (
                            <>
                                <TextField
                                    label="Operador lógico"
                                    className="w-64"
                                    select
                                    value={form.logicOperator}
                                    onChange={(e) => handleChange('logicOperator', e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="AND">AND (y)</MenuItem>
                                    <MenuItem value="OR">OR (o)</MenuItem>
                                </TextField>

                                {/* Variable secundaria */}
                                <TextField
                                    label="Variable secundaria"
                                    className="w-64"
                                    select
                                    value={form.secondaryVariableId}
                                    onChange={(e) => handleSecondaryVarChange(e.target.value)}
                                    required
                                    size="small"
                                >
                                    <MenuItem value="">Seleccioná una variable</MenuItem>
                                    {variables.map((v) => (
                                        <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                                    ))}
                                </TextField>

                                {/* Bit secundario — solo si es binaria comprimida */}
                                {secondaryIsBinary && (
                                    <FormControl className="w-64" size="small" required>
                                        <InputLabel>Bit de la variable secundaria</InputLabel>
                                        <Select
                                            value={form.secondary_id_bit ?? ''}
                                            label="Bit de la variable secundaria"
                                            onChange={(e) => handleChange('secondary_id_bit', e.target.value)}
                                        >
                                            <MenuItem value="" disabled>Seleccioná un bit</MenuItem>
                                            {(secondaryVar?.bits ?? []).map((b) => (
                                                <MenuItem key={b.id} value={b.id}>
                                                    {b.name} (bit {b.bit})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}

                                <TextField
                                    label="Condición secundaria"
                                    className="w-64"
                                    select
                                    value={form.secondaryCondition}
                                    onChange={(e) => handleChange('secondaryCondition', e.target.value)}
                                    required
                                    size="small"
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
                                    size="small"
                                />
                            </>
                        )}

                        {/* Intervalo de repetición */}
                        <TextField
                            type="number"
                            className="w-64"
                            label="Intervalo de repetición (minutos)"
                            value={form.repeatInterval || ''}
                            onChange={(e) => handleChange('repeatInterval', e.target.value)}
                            required
                            inputProps={{ min: 0 }}
                            size="small"
                        />

                        {/* Rango horario */}
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.hasTimeRange}
                                    onChange={(e) => {
                                        const checked = e.target.checked
                                        setForm(prev => ({
                                            ...prev,
                                            hasTimeRange: checked,
                                            startime: checked ? (prev.startime || '00:00') : '',
                                            endtime:  checked ? (prev.endtime  || '23:59') : '',
                                        }))
                                    }}
                                />
                            }
                            label="Restringir alarma a un rango horario"
                            className="w-full justify-center"
                        />

                        {form.hasTimeRange && (
                            <>
                                <TextField
                                    type="time"
                                    className="w-40"
                                    label="Hora de inicio"
                                    value={form.startime}
                                    onChange={(e) => handleChange('startime', e.target.value)}
                                    required
                                    size="small"
                                />
                                <TextField
                                    type="time"
                                    className="w-40"
                                    label="Hora de fin"
                                    value={form.endtime}
                                    onChange={(e) => handleChange('endtime', e.target.value)}
                                    required
                                    size="small"
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
                        {loading ? 'Guardando...' : alarmData?.id ? 'Guardar cambios' : 'Crear alarma'}
                    </Button>
                </form>
            </Box>
        </Modal>
    )
}

export default ModalAlarm