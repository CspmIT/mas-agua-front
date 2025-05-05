import { Typography, IconButton, TextField } from '@mui/material'
import InputColor from '../../../../components/InputColor/InputColor'
import { useEffect, useState } from 'react'
import { parseRgba } from '../../../../components/InputColor/utils'
import { handlechangeBackground } from './utils/js/propertyCanvas'
import InputFile from '../../../../components/InputFile/InputFile'
import { Close } from '@mui/icons-material'

function PropertyCanva({ data, fabricCanvasRef }) {
	const [background, setBackground] = useState(fabricCanvasRef?.current?.backgroundColor || '#ffffff')
	const [fileSelected, setFileSelected] = useState(false)
	const [canvas, setCanvas] = useState(null)
	const [titleDiagram, setTitleDiagram] = useState(fabricCanvasRef?.current?.title || '')

	const updateBackground = (rgbaColor) => {
		canvas.backgroundColor = rgbaColor
		canvas.renderAll()
		setBackground(rgbaColor)
	}

	const handleFileChange = (event) => {
		const file = event.target.files[0]
		setFileSelected(file)
		if (file) {
			const reader = new FileReader()

			reader.onload = () => {
				handlechangeBackground(reader.result, canvas)
			}
			canvas.metadata = file
			reader.readAsDataURL(file)
		}
	}
	const deleteImg = () => {
		setFileSelected(false)
		handlechangeBackground('', canvas)
		canvas.backgroundImage = null
		canvas.renderAll()
	}
	useEffect(() => {
		const rgba = parseRgba(fabricCanvasRef?.current?.backgroundColor)
		setBackground(rgba.color)
		setCanvas(fabricCanvasRef?.current)
	}, [data, fabricCanvasRef])

	useEffect(() => {
		if (canvas) {
			canvas.metadata = fileSelected
		}
	}, [fileSelected])

	return (
		<div className={`w-full pt-4 bg-white`}>
			<div className='flex w-full justify-center items-center border-b-2 mb-4'>
				<Typography className='text-center uppercase !font-bold' typography={'h6'}>
					propiedades de Diagrama
				</Typography>
			</div>
			<div className='w-full px-6 py-3'>
				<TextField
					type='text'
					name='titleDiagram'
					label='Titulo de Diagrama'
					className='w-full'
					onChange={(e) => {
						fabricCanvasRef.current.title = e.target.value
						setTitleDiagram(e.target.value)
					}}
					value={titleDiagram}
				/>
			</div>
			<div className={`w-full px-6 py-3 flex flex-col gap-3 overflow-y-auto`}>
				<InputColor updateBackground={updateBackground} backgroundText={background} />
			</div>
			<div className={`w-full px-6 py-3 flex gap-3 items-center`}>
				<InputFile title='Subir Fondo' fnc={handleFileChange} fileSelected={fileSelected} />
				{fileSelected && (
					<IconButton onClick={deleteImg} color='default' className='!bg-red-500'>
						<Close className='text-white' />
					</IconButton>
				)}
			</div>
		</div>
	)
}

export default PropertyCanva
