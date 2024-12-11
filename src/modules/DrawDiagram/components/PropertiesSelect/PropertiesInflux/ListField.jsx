import { Add, Close } from '@mui/icons-material'
import { Badge, IconButton, List, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

function ListField({ data, setShowValueTopic, AddText }) {
	const [info, setInfo] = useState(data || [])
	const [listFields, setListFields] = useState(info?.field || [])
	const [field, setField] = useState([])
	const [uni, setUni] = useState('')
	const [errorFields, setErrorFields] = useState(false)

	useEffect(() => {
		setInfo(data)
		setShowValueTopic(data.showValue)
	}, [data])
	useEffect(() => {
		!info?.field?.length && info.topic ? setErrorFields(true) : setErrorFields(false)
	}, [])
	const addField = async () => {
		try {
			if (!field || !uni) {
				await Swal.fire({
					title: 'Atención!',
					text: 'Debe escribir una variable y su unidad.',
					icon: 'warning',
				})
				return
			}

			const isDuplicate = listFields.some((item) => item.field === field)
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
			AddText(data)
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
					label='Variable'
					id='field'
					name='field'
					onChange={(e) => setField(e.target.value.trim())}
					className='w-4/6'
					value={field || ''}
					error={errorFields}
				/>
				<TextField
					type='text'
					label='Unidad'
					id='uni'
					name='uni'
					onChange={(e) => setUni(e.target.value)}
					className='w-2/6'
					value={uni || ''}
					error={errorFields}
				/>

				<IconButton aria-label={'Agregar nueva variable'} onClick={addField}>
					<Add />
				</IconButton>
			</div>

			{listFields.length ? (
				<>
					<Typography className=' pl-2 !w-full text-center !font-semibold' typography={'p'}>
						Listado de Variables
					</Typography>
					<List className='border !border-slate-300 !py-2 rounded-md  !mx-1'>
						{listFields.map((item, index) => (
							<div key={index} className='flex items-center border-b last:border-b-0'>
								<div className='w-11/12 flex gap-2 items-center py-1 px-3'>
									<p className='font-semibold text-Base w-full'>{item.field}</p>
									<Badge className='bg-slate-300 px-2 end-0 !text-sm rounded-lg'>{item.uni}</Badge>
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
			) : null}
		</>
	)
}

export default ListField
