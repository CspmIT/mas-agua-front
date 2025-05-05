import { useEffect, useState } from 'react'
import InputColor from '../../../../components/InputColor/InputColor'
import { TextField } from '@mui/material'
import { parseRgba } from '../../../../components/InputColor/utils'

function PropertyText({ data, AddText, fabricCanvasRef, variableActive = false }) {
	const [info, setInfo] = useState(data)
	const [backgroundText, setBackgroudText] = useState(info?.backgroundText || '#ffffff')

	const changeText = (string) => {
		data.setText(string)
		const infoUpdate = { ...info, text: string }
		setInfo(infoUpdate)
		AddText(infoUpdate, fabricCanvasRef)
	}

	const changeSizeText = (size) => {
		data.setSizeText(size)
		const infoUpdate = { ...info, sizeText: size }
		setInfo(infoUpdate)
		AddText(infoUpdate, fabricCanvasRef)
	}

	const changeColorText = (color) => {
		data.setColorText(color)
		const infoUpdate = { ...info, colorText: color }
		setInfo(infoUpdate)
		AddText(infoUpdate, fabricCanvasRef)
	}

	const updateBackground = (rgbaColor) => {
		data.setBackgroundTextColor(rgbaColor)
		const infoUpdate = { ...info, backgroundText: rgbaColor }
		setInfo(infoUpdate)
		AddText(infoUpdate, fabricCanvasRef)
	}

	useEffect(() => {
		setInfo(data)
		const rgba = parseRgba(data?.backgroundText)
		setBackgroudText(rgba.color)
	}, [data])

	return (
		<div className='flex flex-col gap-4'>
			{!variableActive ? (
				<TextField
					type='text'
					multiline
					label='Texto'
					id='text'
					name='text'
					onChange={(e) => changeText(e.target.value)}
					className='w-full'
					value={info?.text || ''}
				/>
			) : null}

			<div className='w-full flex gap-2 justify-center'>
				<TextField
					type='number'
					label='Tamaño del texto'
					id='sizeText'
					name='sizeText'
					onChange={(e) => changeSizeText(parseInt(e.target.value))}
					className='w-1/2'
					value={info?.sizeText || ''}
				/>
				<TextField
					type='color'
					label='color del texto'
					id='colorText'
					name='colorText'
					onChange={(e) => changeColorText(e.target.value)}
					className='w-1/2'
					value={info?.colorText || '#000000'}
				/>
			</div>

			<InputColor updateBackground={updateBackground} backgroundText={backgroundText} />
		</div>
	)
}

export default PropertyText
