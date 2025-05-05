import React, { useEffect, useState } from 'react'
import { MenuItem, TextField } from '@mui/material'
import InputColor from '../../../../../../components/InputColor/InputColor'
import { parseRgba } from '../../../../../../components/InputColor/utils'
import { addTextToCanvas } from '../../utils/js/actionImage'

function PropertyTextInflux({ data, fabricCanvasRef }) {
	const [info, setInfo] = useState(data)
	const [backgroundText, setBackgroudText] = useState(info?.backgroundTextValue || '#ffffff')

	const changeSizeText = (size) => {
		data.setSizeTextValue(size)
		const infoUpdate = { ...info, sizeTextValue: size }
		setInfo(infoUpdate)
		addTextToCanvas(data, fabricCanvasRef, 'influx')
	}

	const changeColorText = (color) => {
		data.setColorTextValue(color)
		const infoUpdate = { ...info, colorTextValue: color }
		setInfo(infoUpdate)
		addTextToCanvas(data, fabricCanvasRef, 'influx')
	}

	const updateBackground = (rgbaColor) => {
		data.setBackgroundTextValue(rgbaColor)
		const infoUpdate = { ...info, backgroundTextValue: rgbaColor }
		setInfo(infoUpdate)
		addTextToCanvas(data, fabricCanvasRef, 'influx')
	}

	const changePosition = (e) => {
		const value = e.target.value
		data.setPositionValue(value)
		const infoUpdate = { ...info, valuePosition: value }
		setInfo(infoUpdate)
		addTextToCanvas(data, fabricCanvasRef, 'influx')
	}

	useEffect(() => {
		setInfo(data)
		const rgba = parseRgba(data?.backgroundTextValue)
		setBackgroudText(rgba.color)
	}, [data])

	return (
		<div className='flex flex-col gap-4'>
			<div className='w-full flex gap-2 justify-center'>
				<TextField
					type='number'
					label='Tamaño del texto'
					id='sizeText'
					name='sizeText'
					onChange={(e) => changeSizeText(parseInt(e.target.value))}
					className='w-1/2'
					value={info?.sizeTextValue || ''}
				/>
				<TextField
					type='color'
					label='color del texto'
					id='colorText'
					name='colorText'
					onChange={(e) => changeColorText(e.target.value)}
					className='w-1/2'
					value={info?.colorTextValue || '#000000'}
				/>
			</div>

			<InputColor updateBackground={updateBackground} backgroundText={backgroundText} />
			<TextField
				select
				label='Posición de Variable'
				id='valuePosition'
				name='valuePosition'
				onChange={changePosition}
				className='w-full '
				value={info?.valuePosition || 'Top'}
			>
				<MenuItem value='Top'>Arriba</MenuItem>
				<MenuItem value='Bottom'>Abajo</MenuItem>
				<MenuItem value='Left'>Izquierda</MenuItem>
				<MenuItem value='Right'>Derecha</MenuItem>
				<MenuItem value='Center'>Centro</MenuItem>
			</TextField>
		</div>
	)
}

export default PropertyTextInflux
