import { MenuItem, TextField } from '@mui/material'
import { useState } from 'react'
import PropertyText from '../../DrawText/PropertyText'

function PropertyTextImg({ data, AddText }) {
	const [info, setInfo] = useState(data)

	return (
		<div className='flex flex-col gap-4'>
			<PropertyText data={data} AddText={AddText} />
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
					AddText(data)
				}}
				className='w-full'
				value={info.textPosition || ''}
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
