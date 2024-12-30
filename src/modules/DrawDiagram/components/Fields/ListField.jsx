// import { Add, Close } from '@mui/icons-material'
// import { Badge, IconButton, List, TextField, Typography } from '@mui/material'
// import { useEffect, useState } from 'react'
// import Swal from 'sweetalert2'
// import { addTextToCanvas } from '../../utils/js/actionImage'
// function ListField({ data, setShowValueTopic, fabricCanvasRef }) {
// 	const [info, setInfo] = useState(data || [])
// 	const [listFields, setListFields] = useState(info?.field || [])
// 	const [field, setField] = useState([])
// 	const [uni, setUni] = useState('')
// 	const [errorFields, setErrorFields] = useState(false)

// 	useEffect(() => {
// 		setInfo(data)
// 		setShowValueTopic(data.showValue)
// 	}, [data])
// 	useEffect(() => {
// 		!info?.field?.length && info.topic ? setErrorFields(true) : setErrorFields(false)
// 	}, [])
// 	const addField = async () => {
// 		try {
// 			if (!field || !uni) {
// 				await Swal.fire({
// 					title: 'Atención!',
// 					text: 'Debe escribir una variable y su unidad.',
// 					icon: 'warning',
// 				})
// 				return
// 			}

// 			const isDuplicate = listFields.some((item) => item.field === field)
// 			if (isDuplicate) {
// 				const result = await Swal.fire({
// 					title: 'Atención!',
// 					text: 'Estás duplicando la variable, ¿quieres actualizarla?',
// 					icon: 'question',
// 					allowOutsideClick: false,
// 					showDenyButton: true,
// 					confirmButtonText: 'Sí',
// 					denyButtonText: 'No',
// 				})

// 				if (result.isDenied) {
// 					return
// 				}
// 			}

// 			const updatedList = [...listFields.filter((item) => item.field !== field), { field, uni }]
// 			data.setField(updatedList)
// 			setListFields(updatedList)
// 			setField(null)
// 			setUni(null)
// 			addTextToCanvas(data, fabricCanvasRef, 'influx')
// 			setErrorFields(false)
// 		} catch (error) {
// 			console.error('Error al agregar el campo:', error)
// 		}
// 	}

// 	const deleteField = async (variable) => {
// 		try {
// 			const result = await Swal.fire({
// 				title: 'Atención!',
// 				text: `Estás eliminando la variable ${variable}, ¿Seguro que queres hacerlo?`,
// 				icon: 'question',
// 				allowOutsideClick: false,
// 				showDenyButton: true,
// 				confirmButtonText: 'Sí',
// 				denyButtonText: 'No',
// 			})
// 			if (result.isDenied) {
// 				return
// 			}

// 			const updatedList = [...listFields.filter((item) => item.field !== variable)]
// 			if (!updatedList.length) {
// 				setErrorFields(true)
// 			}
// 			data.setField(updatedList)
// 			setListFields(updatedList)
// 			addTextToCanvas(data, fabricCanvasRef, 'influx')
// 		} catch (error) {
// 			await Swal.fire({
// 				title: 'Atención!',
// 				text: error,
// 				icon: 'warning',
// 			})
// 		}
// 	}
// 	return (
// 		<>
// 			<div className='flex justify-center items-center w-full'>
// 				<TextField
// 					type='text'
// 					label='Variable'
// 					id='field'
// 					name='field'
// 					onChange={(e) => setField(e.target.value.trim())}
// 					className='w-4/6'
// 					value={field || ''}
// 					error={errorFields}
// 				/>
// 				<TextField
// 					type='text'
// 					label='Unidad'
// 					id='uni'
// 					name='uni'
// 					onChange={(e) => setUni(e.target.value)}
// 					className='w-2/6'
// 					value={uni || ''}
// 					error={errorFields}
// 				/>

// 				<IconButton aria-label={'Agregar nueva variable'} onClick={addField}>
// 					<Add />
// 				</IconButton>
// 			</div>

// 			{listFields.length ? (
// 				<>
// 					<Typography className=' pl-2 !w-full text-center !font-semibold' typography={'p'}>
// 						Listado de Variables
// 					</Typography>
// 					<List className='border !border-slate-300 !py-2 rounded-md  !mx-1'>
// 						{listFields.map((item, index) => (
// 							<div key={index} className='flex items-center border-b last:border-b-0'>
// 								<div className='w-11/12 flex gap-2 items-center py-1 px-3'>
// 									<p className='font-semibold text-Base w-full'>{item.field}</p>
// 									<Badge className='bg-slate-300 px-2 end-0 !text-sm rounded-lg'>{item.uni}</Badge>
// 								</div>
// 								<IconButton
// 									variant='ghost'
// 									className='w-1/12'
// 									size='small'
// 									onClick={() => deleteField(item.field)}
// 								>
// 									<Close fontSize='small' />
// 								</IconButton>
// 							</div>
// 						))}
// 					</List>
// 				</>
// 			) : null}
// 		</>
// 	)
// }

import { Add, Edit, Search } from '@mui/icons-material'
import { Divider, IconButton, InputAdornment, List, ListItem, ListItemText, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import ModalField from './ModalField'

function ListField() {
	const [listVariable, setListVariable] = useState([])
	const [listfilter, setListfilter] = useState([])
	useEffect(() => {
		setListVariable([{ name: 'variable 1', id: 1 }])
		setListfilter([{ name: 'variable 1', id: 1 }])
	}, [])
	const filter = (text) => {
		setListfilter(listVariable.filter((variable) => variable.name.includes(`${text}`)))
	}
	return (
		<div className={`w-full h-full pt-4 bg-white `}>
			<div className='flex w-full justify-center items-center mb-4 relative'>
				<ModalField isOpen={true} />

				<Typography className='text-center uppercase !font-bold ' typography={'h6'}>
					variables
				</Typography>
			</div>
			<Divider />
			<div className={`w-full p-3 flex flex-col gap-3 h-full overflow-y-auto `}>
				<TextField
					onChange={(e) => filter(e.target.value)}
					label='Buscar'
					variant='outlined'
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<Search />
							</InputAdornment>
						),
					}}
				/>
				{listVariable.length ? (
					<List dense={false}>
						{listfilter.map((variable, index) => (
							<ListItem key={index}>
								<ListItemText primary={variable.name} />
								<IconButton
									color='warning'
									className='!bg-yellow-200'
									onClick={() => console.log('hola')}
								>
									<Edit />
								</IconButton>
							</ListItem>
						))}
					</List>
				) : null}
			</div>
		</div>
	)
}
export default ListField
