import { Button, FormControlLabel, IconButton, MenuItem, Paper, Switch, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import Calculadora from './Calculator'
import CalculatorVars from './ClculatorVars'
import { useForm } from 'react-hook-form'
import { useVars } from './ProviderVars'
import Swal from 'sweetalert2'
import { request } from '../../utils/js/request'
import { backend } from '../../utils/routes/app.routes'
import LoaderComponent from '../Loader'
import { Close } from '@mui/icons-material'
const DataGenerator = ({ handleClose, data = null }) => {
	const [requireCalc, setRequireCalc] = useState(false)
	const [binaryCompressed, setBinaryCompressed] = useState(data?.binary_compressed || false);
	const [bits, setBits] = useState(data?.binary_compressed ? data.bits ?? [] : []);

	const [display, setDisplay] = useState([])
	const {
		register,
		formState: { errors },
		handleSubmit,
		setValue,
	} = useForm()

	const handleRquiredCalc = () => {
		setRequireCalc(prev => !prev);
		setBinaryCompressed(false);
		setBits([]);
		dispatch({ type: "SET_EQUATION", payload: [] });
		dispatch({ type: "SET_CALC_VAR", payload: [] });
	};


	const handleBinaryCompressed = () => {
		setBinaryCompressed(prev => !prev);
		// Limpiamos fórmula si estaba prendida
		if (requireCalc) {
			setRequireCalc(false);
			setDisplay([]);
			dispatch({ type: "SET_EQUATION", payload: null });
			dispatch({ type: "SET_CALC_VAR", payload: [] });
		}
	};


	useEffect(() => {
		if (requireCalc) {
			setValue('topic', '')
			setValue('field', '')
			setValue('time', '')
			setValue('unit_topic', '')
			setValue('period', '')
			setValue('unit_period', '')
			setValue('type_period', '')
		}
	}, [requireCalc])
	const [state, dispatch] = useVars()
	const isValidFormula = display.length
	const onSubmit = async (data) => {
		try {
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
			LoaderComponent({ image: false })

			const dataConsult = requireCalc
				? state.calcVars.reduce((acc, val) => {
					if (!acc?.[val.calc_name_var]) acc[val.calc_name_var] = {}
					acc[val.calc_name_var] = {
						calc_topic: val.calc_topic,
						calc_field: val.calc_field,
						calc_time: val.calc_time,
						calc_unit_topic: val.calc_unit_topic,
						calc_period: val.calc_period,
						calc_unit_period: val.calc_unit_period,
						calc_type_period: val.calc_type_period,
					}
					return acc
				}, {})
				: {
					[data.name_var]: {
						calc_topic: data.topic,
						calc_field: data.field,
						calc_time: data.time,
						calc_unit: data.unit_topic,
						calc_period: data.period,
						calc_unit_period: data.unit_period,
						calc_type_period: data.type_period,
					},
				}
			const dataReturn = {
				id: data.id || 0,
				name: data.name_var,
				unit: data.unit,
				type: data.type_var,
				calc: requireCalc,
				varsInflux: dataConsult,
				equation: state?.equation || null,
				binary_compressed: binaryCompressed,
				bits: binaryCompressed ? bits.map(b => ({ id: b.id, name: b.name, bit: b.bit })) : [],
			}

			await request(`${backend[import.meta.env.VITE_APP_NAME]}/saveVariable`, 'POST', dataReturn)

			if (handleClose) {
				handleClose()
			}

			Swal.fire({
				icon: 'success',
				title: 'Perfecto!',
				text: 'La variable se guardo correctamente',
			})
		} catch (error) {
			console.error(error)
			Swal.fire({
				icon: 'warning',
				title: 'Atención!',
				text: `Hubo un problema al guardar.`,
			})
		}
	}
	const setData = async () => {
		setValue('id', data?.id || 0)
		setValue('name_var', data?.name)
		setValue('unit', data?.unit)
		setValue('type_var', data?.type)
		if (data?.calc) {
			setDisplay(data?.equation)
			handleRquiredCalc()
		}
		if (!data.calc) {
			setValue('topic', data?.varsInflux?.[data.name]?.calc_topic)
			setValue('field', data?.varsInflux?.[data.name]?.calc_field)
			setValue('time', data?.varsInflux?.[data.name]?.calc_time)
			setValue('unit_topic', data?.varsInflux?.[data.name]?.calc_unit)
			setValue('period', data?.varsInflux?.[data.name]?.calc_period)
			setValue('unit_period', data?.varsInflux?.[data.name]?.calc_unit_period)
			setValue('type_period', data?.varsInflux?.[data.name]?.calc_type_period)
		} else {
			const vars = Object.keys(data?.varsInflux).reduce((acc, val) => {
				acc.push({
					calc_name_var: val,
					calc_topic: data?.varsInflux[val].calc_topic,
					calc_field: data?.varsInflux[val].calc_field,
					calc_time: data?.varsInflux[val].calc_time,
					calc_unit_topic: data?.varsInflux[val].calc_unit_topic,
					calc_period: data?.varsInflux[val].calc_period,
					calc_unit_period: data?.varsInflux[val].calc_unit_period,
					calc_type_period: data?.varsInflux[val].calc_type_period,
				})
				return acc
			}, [])
			dispatch({ type: 'SET_CALC_VAR', payload: vars })
			dispatch({ type: 'SET_EQUATION', payload: data?.equation })
		}
	}
	useEffect(() => {
		if (data) {
			setData()
		}
	}, [data])
	return (
		<div className='p-5 flex flex-col h-full gap-2 justify-start items-center min-w-[90vw] max-w-[94vw]'>
			<Typography variant='h5' className='text-center'>
				Configuracion de variables
			</Typography>

			<div className='flex w-full justify-center gap-3'>
				<TextField type='hidden' className='!hidden' {...register('id')} />
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
				<TextField
					select
					label='tipo de variable'
					{...register('type_var', {
						required: 'Este campo es requerido',
					})}
					className='w-2/12'
					error={!!errors.type_var}
					helperText={errors.type_var && errors.type_var.message}
					defaultValue={data?.type || 'last'}
				>
					<MenuItem value='last'>Instantánea</MenuItem>
					<MenuItem value='history'>Histórico</MenuItem>
				</TextField>
			</div>
			<div className='flex w-full justify-center gap-3'>
				<FormControlLabel
					control={<Switch checked={requireCalc} />}
					label='¿La variable requiere un calculo?'
					onChange={handleRquiredCalc}
				/>

				<FormControlLabel
					control={<Switch checked={binaryCompressed} />}
					label='¿Variable binaria comprimida?'
					onChange={handleBinaryCompressed}
				/>
			</div>
			{!requireCalc ? (
				<div className='flex w-full flex-wrap justify-center gap-3 '>
					<TextField
						type='text'
						className='w-2/4'
						label='Topico'
						{...register('topic', {
							required: 'Este campo es requerido',
						})}
						error={!!errors.topic}
						helperText={errors.topic && errors.topic.message}
					/>
					<TextField
						type='text'
						className='w-1/4'
						label='Field'
						{...register('field', {
							required: 'Este campo es requerido',
						})}
						error={!!errors.field}
						helperText={errors.field && errors.field.message}
					/>

					<div className='flex w-full justify-center gap-3'>
						<TextField
							type='number'
							className='w-2/12'
							label='Tiempo de Consulta'
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
							select
							label='Unidad'
							{...register('unit_topic', {
								required: 'Este campo es requerido',
							})}
							className='w-2/12'
							error={!!errors.unit_topic}
							helperText={errors.unit_topic && errors.unit_topic.message}
							defaultValue={data?.varsInflux?.[data.name]?.calc_unit || 'ms'}
						>
							<MenuItem value='ms'>Milisegundos</MenuItem>
							<MenuItem value='s'>Segundos</MenuItem>
							<MenuItem value='m'>Minutos</MenuItem>
							<MenuItem value='h'>Horas</MenuItem>
							<MenuItem value='d'>Días</MenuItem>
							<MenuItem value='mo'>Mes</MenuItem>
							<MenuItem value='y'>Año</MenuItem>
						</TextField>

						<TextField
							type='number'
							className='w-2/12'
							label='Periodo de muestreo'
							{...register('period', {
								required: 'Este campo es requerido',
								pattern: {
									value: /^[0-9]+$/,
									message: 'Solo se permiten números',
								},
							})}
							error={!!errors.period}
							helperText={errors.period && errors.period.message}
						/>
						<TextField
							select
							label='Unidad'
							{...register('unit_period', {
								required: 'Este campo es requerido',
							})}
							className='w-2/12'
							error={!!errors.unit_period}
							helperText={errors.unit_period && errors.unit_period.message}
							defaultValue={data?.varsInflux?.[data.name]?.calc_unit_period || 'ms'}
						>
							<MenuItem value='ms'>Milisegundos</MenuItem>
							<MenuItem value='s'>Segundos</MenuItem>
							<MenuItem value='m'>Minutos</MenuItem>
							<MenuItem value='h'>Horas</MenuItem>
							<MenuItem value='d'>Días</MenuItem>
							<MenuItem value='mo'>Mes</MenuItem>
							<MenuItem value='y'>Año</MenuItem>
						</TextField>
						<TextField
							select
							label='Tipo de periodo'
							{...register('type_period', {
								required: 'Este campo es requerido',
							})}
							className='w-2/12'
							error={!!errors.type_period}
							helperText={errors.type_period && errors.type_period.message}
							defaultValue={data?.varsInflux?.[data.name]?.calc_type_period || 'last'}
						>
							<MenuItem value='last'>Ultimo</MenuItem>
							<MenuItem value='mean'>Promedio</MenuItem>
						</TextField>
					</div>
				</div>
			) : null}

			{binaryCompressed && (
				<Paper className="w-[80%] p-4 mt-2 !bg-slate-50 rounded-lg">
					<Typography variant="h6" align="center" className="!mb-4">
						Asignar bits
					</Typography>

					<div className="grid grid-cols-2 gap-6">
						{Array.from({ length: Math.min(bits.length, 8) }).map((_, i) => {
							const b = bits[i];
							return (
								<div key={i} className="flex gap-2 items-center">
									<TextField
										type="text"
										label="Nombre"
										value={b?.name || ""}
										onChange={(e) =>
											setBits(prev => prev.map((x, idx) =>
												idx === i ? { ...x, name: e.target.value } : x
											))
										}
										fullWidth
										size="small"
										className="bg-white"
									/>
									<TextField
										type="number"
										label="Posición"
										value={b?.bit ?? 1}
										onChange={(e) => {
											let val = Number(e.target.value);
											if (val < 0) val = 0;
											if (val > 7) val = 7;
											setBits(prev => prev.map((x, idx) =>
												idx === i ? { ...x, bit: val } : x
											))
										}}
										size="small"
										className="w-20 bg-white"
										inputProps={{ min: 0, max: 7 }}
									/>
									<IconButton
										color="error"
										disabled={!b}
										onClick={() => setBits(p => p.filter((_, idx) => idx !== i))}
									>
										<Close />
									</IconButton>
								</div>
							);
						})}
					</div>

					<div className="flex justify-center mt-4">
						<Button
							variant="contained"
							onClick={() => {
								if (bits.length < 8) setBits(prev => [...prev, { name: "", bit: 0 }]);
							}}
							disabled={bits.length >= 8}
						>
							{bits.length >= 8 ? "Máximo 8 bits" : "Agregar bit"}
						</Button>
					</div>
				</Paper>
			)}


			<div
				className={`flex flex-col gap-4 items-center justify-center transition-all duration-500 ease-in-out overflow-hidden ${requireCalc ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
					}`}
			>
				{requireCalc ? (
					<>
						<CalculatorVars />
						<Calculadora setDisplay={setDisplay} display={display} showNumbers={true} />
					</>
				) : null}

			</div>
			<div className='flex flex-col gap-4 items-center'>
				<Button variant='contained' color='info' onClick={handleSubmit(onSubmit)}>
					Guardar variable
				</Button>
			</div>
		</div>
	)
}

export default DataGenerator
