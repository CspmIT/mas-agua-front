import { Button, FormControlLabel, Switch, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import Calculadora from './Calculator'
import CalculatorVars from './ClculatorVars'
import { useForm } from 'react-hook-form'
import { useVars } from './ProviderVars'
import Swal from 'sweetalert2'
const DataGenerator = () => {
	const [requireCalc, setRequireCalc] = useState(false)
	const [display, setDisplay] = useState([])
	const {
		register,
		formState: { errors },
		handleSubmit,
		setValue,
	} = useForm()

	const handleRquiredCalc = () => {
		setRequireCalc(!requireCalc)
	}

	useEffect(() => {
		if (requireCalc) {
			setValue('topic', '')
			setValue('field', '')
			setValue('time', '')
			setValue('unit_topic', '')
		}
	}, [requireCalc, setValue])
	const [state, dispatch] = useVars()
	const isValidFormula = display.length
	const onSubmit = (data) => {
		if (requireCalc) {
			if (state.calcVars.length === 0) {
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'Debe generar la formula de la variable para poder guardarla',
				})
				return false
			}
			// Valido que display tenga la variable del calculo
			if (!isValidFormula) {
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'Debe existir al menos una variable en la formula',
				})
				return false
			}
		}

		const dataConsult = state.calcVars.length
			? { ...state }
			: {
					calcVars: [
						{
							calc_name_var: '',
							calc_topic: data.topic,
							calc_field: data.field,
							calc_time: data.time,
							calc_unit: data.unit_topic,
						},
					],
			  }
		const dataReturn = { name_var: data.name_var, unit: data.unit, data_consult: dataConsult }

		console.log(dataReturn)
		// guardar
	}
	return (
		<div className='p-5 flex flex-col justify-start items-center min-w-[97vw]  '>
			<Typography variant='h5' className='text-center'>
				Configuracion de variables
			</Typography>
			<div className='flex w-full justify-center gap-3'>
				<TextField
					type='text'
					className='w-1/3'
					label='Nombre de variable'
					{...register('name_var', {
						required: 'Este campo es requerido',
					})}
					error={!!errors.name_var}
					helperText={errors.name_var && errors.name_var.message}
				/>
				<TextField
					type='text'
					className='w-1/8'
					label='Unidad de medida'
					{...register('unit', {
						required: 'Este campo es requerido',
					})}
					error={!!errors.unit}
					helperText={errors.unit && errors.unit.message}
				/>
			</div>
			<div className='flex w-full justify-center gap-3'>
				<FormControlLabel
					control={<Switch />}
					label='¿La variable requiere un calculo?'
					onChange={handleRquiredCalc}
				/>
			</div>

			{!requireCalc ? (
				<div className='flex w-full justify-center gap-3'>
					<TextField
						type='text'
						className='w-1/3'
						label='Topico'
						{...register('topic', {
							required: 'Este campo es requerido',
						})}
						error={!!errors.topic}
						helperText={errors.topic && errors.topic.message}
					/>
					<TextField
						type='text'
						className='w-1/5'
						label='Field'
						{...register('field', {
							required: 'Este campo es requerido',
						})}
						error={!!errors.field}
						helperText={errors.field && errors.field.message}
					/>
					<TextField
						type='number'
						className='w-1/12'
						label='Tiempo'
						{...register('time', {
							required: 'Este campo es requerido',
							pattern: {
								value: /^[0-9]+$/,
								message: 'Solo se permiten números',
							},
						})}
						error={!!errors.time}
						helperText={errors.time && errors.time.message}
					/>
					<TextField
						type='text'
						className='w-2/12'
						label='Unidad'
						{...register('unit_topic', {
							required: 'Este campo es requerido',
						})}
						error={!!errors.unit_topic}
						helperText={errors.unit_topic && errors.unit_topic.message}
					/>
				</div>
			) : null}

			<div
				className={`transition-all duration-500 ease-in-out overflow-hidden ${
					requireCalc ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
				}`}
			>
				{requireCalc ? (
					<div className={`flex flex-col gap-4 items-center justify-center `}>
						<CalculatorVars />
						<Calculadora setDisplay={setDisplay} display={display} showNumbers={true} />
					</div>
				) : null}
			</div>
			<div className='flex flex-col gap-4 items-center mt-3'>
				<Button variant='contained' color='secondary' onClick={handleSubmit(onSubmit)}>
					Guardar variable
				</Button>
			</div>
		</div>
	)
}

export default DataGenerator
