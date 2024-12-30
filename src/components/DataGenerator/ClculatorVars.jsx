import { Button, IconButton, MenuItem, TextField, Typography } from '@mui/material'
import React from 'react'
import { useVars } from './ProviderVars'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import { Add } from '@mui/icons-material'

const CalculatorVars = () => {
	const [state, dispatch] = useVars()
	const {
		getValues,
		trigger,
		register,
		formState: { errors },
		clearErrors,
	} = useForm()

	const isValidData = async () => {
		const validation = await trigger(['calc_name_var', 'calc_topic', 'calc_field', 'calc_time', 'calc_unit'])
		return validation
	}

	const isValidName = (value) => state.calcVars.some((variable) => variable.calc_name_var === value)

	const addCalcVar = async () => {
		const { calcVars } = state
		const { calc_name_var, calc_topic, calc_field, calc_time, calc_unit } = getValues()
		const userCalcVar = {
			calc_name_var,
			calc_topic,
			calc_field,
			calc_time,
			calc_unit,
		}

		if (!(await isValidData())) {
			return false
		}

		const existDataVar = calcVars.find(
			(variable) =>
				variable.calc_topic === userCalcVar.calc_topic &&
				variable.calc_field === userCalcVar.calc_field &&
				variable.calc_time === userCalcVar.calc_time &&
				variable.calc_unit === userCalcVar.calc_unit
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
			<div className='flex w-full flex-wrap justify-center items-start gap-3 p-3'>
				<TextField
					type='text'
					label='Nombre '
					{...register('calc_name_var', {
						required: 'Este campo es requerido',
						validate: (value) => !isValidName(value) || 'Ya existe esta variable',
					})}
					error={errors.calc_name_var}
					helperText={errors.calc_name_var && errors.calc_name_var.message}
				/>
				<TextField
					type='text'
					className='w-1/3'
					label='Topico'
					{...register('calc_topic', {
						required: 'Este campo es requerido',
					})}
					error={errors.calc_topic}
					helperText={errors.calc_topic && errors.calc_topic.message}
					onChange={() => clearErrors('calc_topic')}
				/>
				<TextField
					type='text'
					label='Field'
					{...register('calc_field', {
						required: 'Este campo es requerido',
					})}
					error={errors.calc_field}
					helperText={errors.calc_field && errors.calc_field.message}
					onChange={() => clearErrors('calc_field')}
				/>
				<TextField
					type='number'
					className='w-1/12'
					label='Tiempo'
					{...register('calc_time', {
						required: 'Este campo es requerido',
						pattern: {
							value: /^[0-9]+$/,
							message: 'Solo se permiten números',
						},
					})}
					error={errors.calc_time}
					helperText={errors.calc_time && errors.calc_time.message}
					onChange={() => clearErrors('calc_time')}
				/>
				<TextField
					select
					label='Unidad.'
					name='startUniRange'
					{...register('calc_unit', {
						required: 'Este campo es requerido',
					})}
					className='w-2/12'
					defaultValue={'ms'}
				>
					<MenuItem value='ms'>Milisegundos</MenuItem>
					<MenuItem value='s'>Segundos</MenuItem>
					<MenuItem value='m'>Minutos</MenuItem>
					<MenuItem value='h'>Horas</MenuItem>
					<MenuItem value='d'>Días</MenuItem>
					<MenuItem value='mo'>Mes</MenuItem>
					<MenuItem value='y'>Año</MenuItem>
				</TextField>
				<div className='flex items-center justify-center min-h-14'>
					<IconButton className='!bg-blue-300' color='primary' onClick={addCalcVar}>
						<Add />
					</IconButton>
				</div>
			</div>
		</>
	)
}

export default CalculatorVars
