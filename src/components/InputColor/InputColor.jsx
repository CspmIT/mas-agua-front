import { Slider, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { hexToRgb, parseRgba } from './utils'

function InputColor({ updateBackground, backgroundText }) {
	const initialParsed = parseRgba(backgroundText)
	const [color, setColor] = useState(initialParsed.color || '#000000') // Color en formato HEX
	const [opacity, setOpacity] = useState(initialParsed.opacity || 1) // Opacidad inicial
	const changeColorBackground = (newColor) => {
		const rgbaColor = `rgba(${hexToRgb(newColor).join(', ')}, ${opacity})`
		setColor(newColor)
		updateBackground(rgbaColor)
	}
	const changeOpacity = (newOpacity) => {
		const rgbaColor = `rgba(${hexToRgb(color).join(', ')}, ${newOpacity})`
		setOpacity(newOpacity)
		updateBackground(rgbaColor)
	}
	return (
		<div className='flex w-full gap-3'>
			<TextField
				type='color'
				label='Color de fondo'
				id='backgroundcolor'
				name='backgroundcolor'
				onChange={(e) => changeColorBackground(e.target.value)}
				className='w-1/2'
				value={color || ''}
			/>
			<div className='w-1/2 flex flex-col'>
				<Typography typography={'p'}>Trasparencia</Typography>
				<Slider
					value={opacity}
					min={0}
					max={1}
					step={0.01}
					onChange={(e, value) => changeOpacity(value)}
					aria-labelledby='opacity-slider'
					className='w-1/2'
				/>
			</div>
		</div>
	)
}

export default InputColor
