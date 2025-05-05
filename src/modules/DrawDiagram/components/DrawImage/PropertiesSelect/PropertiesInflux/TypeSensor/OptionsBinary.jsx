import { Add, Close } from '@mui/icons-material'
import { Badge, IconButton, List, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

function OptionsBinary({ data }) {
	const [info, setInfo] = useState(data || [])
	const [params, setParams] = useState([])
	const [options, setOptions] = useState('')
	const [listOptions, setListOptions] = useState([])
	useEffect(() => {
		setInfo(data)
	}, [data])
	useEffect(() => {
		setParams(info?.optionValue)
	}, [info])
	const addOpttion = async () => {
		try {
			if (!options) {
				await Swal.fire({
					title: 'Atención!',
					text: 'Debe escribir una Opción para agregarla.',
					icon: 'warning',
				})
				return
			}

			const isDuplicate = listOptions.some((item) => item === options)
			if (isDuplicate) {
				const result = await Swal.fire({
					title: 'Atención!',
					text: 'Estás duplicando la variable, ¿quieres actualizarla?',
					icon: 'question',
					allowOutsideClick: false,
					showDenyButton: true,
					confirmButtonText: 'Sí',
					denyButtonText: 'No',
				})

				if (result.isDenied) {
					return
				}
			}

			const updatedList = [...listFields.filter((item) => item.field !== field), { field, uni }]
			data.setField(updatedList)
			setListFields(updatedList)
			setField(null)
			setUni(null)
			AddText(data)
			setErrorFields(false)
		} catch (error) {
			console.error('Error al agregar el campo:', error)
		}
	}

	const deleteField = async (variable) => {
		try {
			const result = await Swal.fire({
				title: 'Atención!',
				text: `Estás eliminando la variable ${variable}, ¿Seguro que queres hacerlo?`,
				icon: 'question',
				allowOutsideClick: false,
				showDenyButton: true,
				confirmButtonText: 'Sí',
				denyButtonText: 'No',
			})
			if (result.isDenied) {
				return
			}

			const updatedList = [...listFields.filter((item) => item.field !== variable)]
			if (!updatedList.length) {
				setErrorFields(true)
			}
			data.setField(updatedList)
			setListFields(updatedList)
		} catch (error) {
			await Swal.fire({
				title: 'Atención!',
				text: error,
				icon: 'warning',
			})
		}
	}
	return (
		<>
			<div className='flex justify-center items-center w-full'>
				<TextField
					type='text'
					label='Opciones'
					id='options'
					name='options'
					onChange={(e) => setOptions(e.target.value)}
					className='w-4/6'
					value={options || ''}
					// error={errorFields}
				/>
				<IconButton aria-label={'Agregar nueva variable'} onClick={addOpttion}>
					<Add />
				</IconButton>
			</div>

			{/* {listOptions.length ? (
				<>
					<Typography className=' pl-2 !w-full text-center !font-semibold' typography={'p'}>
						Listado de Opciones
					</Typography>
					<List className='border !border-slate-300 !py-2 rounded-md  !mx-1'>
						{listOptions.map((item, index) => (
							<div key={index} className='flex items-center border-b last:border-b-0'>
								<div className='w-11/12 flex gap-2 items-center py-1 px-3'>
									<p className='font-semibold text-Base w-full'>{item.field}</p>
								</div>
								<IconButton
									variant='ghost'
									className='w-1/12'
									size='small'
									onClick={() => deleteField(item.field)}
								>
									<Close fontSize='small' />
								</IconButton>
							</div>
						))}
					</List>
				</>
			) : null} */}
		</>
	)
}

export default OptionsBinary
