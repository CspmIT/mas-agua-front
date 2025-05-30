import {
    Button,
    IconButton,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useVars } from './ProviderVars'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import { Add } from '@mui/icons-material'

const CalculatorVars = ({ data }) => {
    const [state, dispatch] = useVars()
    const {
        getValues,
        trigger,
        register,
        formState: { errors },
        setValue,
        clearErrors,
    } = useForm()
    const [calcUnitTopic, setCalcUnitTopic] = useState('ms')
    const [calcUnitPeriod, setCalcUnitPeriod] = useState('ms')

    const isValidData = async () => {
        const validation = await trigger([
            'calc_name_var',
            'calc_topic',
            'calc_field',
            'calc_time',
            'calc_unit_topic',
            'calc_period',
            'calc_unit_period',
            'calc_type_period',
        ])
        return validation
    }
    useEffect(() => {
        if (data) {
            console.log(data)
            setValue('calc_name_var', data.calc_name_var)
            setValue('calc_topic', data.calc_topic)
            setValue('calc_field', data.calc_field)
            setValue('calc_time', data.calc_time)
            setValue('calc_unit_topic', data.calc_unit_topic)
            setCalcUnitTopic(data.calc_unit_topic)
            setValue('calc_period', data.calc_period)
            setValue('calc_unit_period', data.calc_unit_period)
            setCalcUnitPeriod(data.calc_unit_period)
            setValue('calc_type_period', data.calc_type_period)
        }
    }, [data])

    const isValidName = (value) =>
        state.calcVars.some((variable) => variable.calc_name_var === value)

    const addCalcVar = async () => {
        const { calcVars } = state
        const {
            calc_name_var,
            calc_topic,
            calc_field,
            calc_time,
            calc_unit_topic,
            calc_period,
            calc_unit_period,
            calc_type_period,
        } = getValues()
        const userCalcVar = {
            calc_name_var,
            calc_topic,
            calc_field,
            calc_time,
            calc_unit_topic,
            calc_period,
            calc_unit_period,
            calc_type_period,
        }
        if (!(await isValidData())) {
            return false
        }

        const existDataVar = calcVars.find(
            (variable) =>
                variable.calc_topic === userCalcVar.calc_topic &&
                variable.calc_field === userCalcVar.calc_field &&
                variable.calc_time === userCalcVar.calc_time &&
                variable.calc_unit_topic === userCalcVar.calc_unit_topic &&
                variable.calc_period === userCalcVar.calc_period &&
                variable.calc_unit_period === userCalcVar.calc_unit_period &&
                variable.calc_type_period === userCalcVar.calc_type_period
        )

        if (existDataVar) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Ya existe una variable con estos datos. Es posible que este duplicando la variable. La varible es '${existDataVar.calc_name_var}'`,
            })
            return false
        }
        dispatch({ type: 'ADD_CALC_VAR', payload: userCalcVar })
    }

    return (
        <>
            <div className="flex w-full flex-wrap justify-center items-start gap-3 p-2 ">
                <TextField
                    type="text"
                    label="Nombre"
                    disabled={data ? true : false}
                    {...register('calc_name_var', {
                        required: 'Este campo es requerido',
                        validate: (value) =>
                            !isValidName(value) || 'Ya existe esta variable',
                    })}
                    error={!!errors.calc_name_var}
                    helperText={
                        errors.calc_name_var && errors.calc_name_var.message
                    }
                />
                <TextField
                    type="text"
                    className="w-1/3"
                    disabled={data ? true : false}
                    label="Topico"
                    {...register('calc_topic', {
                        required: 'Este campo es requerido',
                    })}
                    error={!!errors.calc_topic}
                    helperText={errors.calc_topic && errors.calc_topic.message}
                    onChange={() => clearErrors('calc_topic')}
                />
                <TextField
                    type="text"
                    label="Field"
                    disabled={data ? true : false}
                    {...register('calc_field', {
                        required: 'Este campo es requerido',
                    })}
                    error={!!errors.calc_field}
                    helperText={errors.calc_field && errors.calc_field.message}
                    onChange={() => clearErrors('calc_field')}
                />

                <div className="flex w-full justify-center gap-3">
                    <TextField
                        type="number"
                        className="w-2/12"
                        label="Tiempo de Consulta"
                        {...register('calc_time', {
                            required: 'Este campo es requerido',
                            pattern: {
                                value: /^[0-9]+$/,
                                message: 'Solo se permiten números',
                            },
                        })}
                        disabled={data ? true : false}
                        error={!!errors.calc_time}
                        helperText={
                            errors.calc_time && errors.calc_time.message
                        }
                    />
                    <TextField
                        select
                        label="Unidad"
                        {...register('calc_unit_topic', {
                            required: 'Este campo es requerido',
                        })}
                        disabled={data ? true : false}
                        className="w-2/12"
                        error={!!errors.calc_unit_topic}
                        helperText={
                            errors.calc_unit_topic &&
                            errors.calc_unit_topic.message
                        }
                        value={calcUnitTopic} // Usá el nombre que corresponda
                        onChange={(e) =>
                            setCalcUnitTopic(e.target.value)
                        }
                    >
                        <MenuItem value="ms">Milisegundos</MenuItem>
                        <MenuItem value="s">Segundos</MenuItem>
                        <MenuItem value="m">Minutos</MenuItem>
                        <MenuItem value="h">Horas</MenuItem>
                        <MenuItem value="d">Días</MenuItem>
                        <MenuItem value="mo">Mes</MenuItem>
                        <MenuItem value="y">Año</MenuItem>
                    </TextField>

                    <TextField
                        type="number"
                        className="w-2/12"
                        label="Periodo de muestreo"
                        {...register('calc_period', {
                            required: 'Este campo es requerido',
                            pattern: {
                                value: /^[0-9]+$/,
                                message: 'Solo se permiten números',
                            },
                        })}
                        disabled={data ? true : false}
                        error={!!errors.calc_period}
                        helperText={
                            errors.calc_period && errors.calc_period.message
                        }
                    />
                    <TextField
                        select
                        label="Unidad"
                        {...register('calc_unit_period', {
                            required: 'Este campo es requerido',
                        })}
                        disabled={data ? true : false}
                        className="w-2/12"
                        error={!!errors.calc_unit_period}
                        helperText={
                            errors.calc_unit_period &&
                            errors.calc_unit_period.message
                        }
                        value={calcUnitPeriod} // Usá el nombre que corresponda
                        onChange={(e) =>
                            setCalcUnitPeriod(e.target.value)
                        }
                    >
                        <MenuItem value="ms">Milisegundos</MenuItem>
                        <MenuItem value="s">Segundos</MenuItem>
                        <MenuItem value="m">Minutos</MenuItem>
                        <MenuItem value="h">Horas</MenuItem>
                        <MenuItem value="d">Días</MenuItem>
                        <MenuItem value="mo">Mes</MenuItem>
                        <MenuItem value="y">Año</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Tipo de periodo"
                        {...register('calc_type_period', {
                            required: 'Este campo es requerido',
                        })}
                        disabled={data ? true : false}
                        className="w-2/12"
                        error={!!errors.calc_type_period}
                        helperText={
                            errors.calc_type_period &&
                            errors.calc_type_period.message
                        }
                        defaultValue={'last'}
                    >
                        <MenuItem value="last">Ultimo</MenuItem>
                        <MenuItem value="mean">Promedio</MenuItem>
                    </TextField>
                </div>
                {!data ? (
                    <div className="flex items-center justify-center">
                        <Button
                            variant="contained"
                            color={'info'}
                            onClick={addCalcVar}
                        >
                            agregar <Add />
                        </Button>
                    </div>
                ) : null}
            </div>
        </>
    )
}

export default CalculatorVars
