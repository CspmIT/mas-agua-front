import { MenuItem, TextField } from '@mui/material'
import { useState } from 'react'
import PropertyText from '../../../DrawText/PropertyText'
import { addTextToCanvas } from '../../utils/js/actionImage'

function PropertyTextImg({ data, fabricCanvasRef }) {
	const [info, setInfo] = useState(data)
	const AddText = () => {
		addTextToCanvas(data, fabricCanvasRef)
	}
	return (
		<div className='flex flex-col gap-4'>
			<PropertyText data={data.text} AddText={AddText} fabricCanvasRef={fabricCanvasRef} />
			<TextField
				select
				label='Posición del Texto'
				id='textPosition'
				name='textPosition'
				onChange={(e) => {
					const value = e.target.value
					data.setTextPosition(value)
					const infoUpdate = { ...info, textPosition: value }
					setInfo(infoUpdate)
					AddText(data, fabricCanvasRef)
				}}
				className='w-full'
				value={info.text.textPosition || ''}
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
export default PropertyTextImg
