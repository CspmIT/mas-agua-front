import { MenuItem, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

function RangeConsult({ data }) {
	const [info, setInfo] = useState(data || [])
	useEffect(() => {
		setInfo(data)
	}, [data])
	const handleChangeValue = (value) => {
		const newInfo = { ...info, startValueRange: value }
		setInfo(newInfo)
		data.setStartValueRange(value)
	}
	const handleChangeUni = (value) => {
		const newInfo = { ...info, startUniRange: value }
		setInfo(newInfo)
		data.setStartUniRange(value)
	}
	return (
		<>
			<p>Inicio de consulta</p>
			<div className='flex gap-3'>
				<TextField
					type='number'
					label='Tiempo'
					id='startValueRange'
					name='startValueRange'
					onChange={(e) => handleChangeValue(e.target.value)}
					className='w-1/2'
					value={info?.startValueRange || ''}
				/>
				<TextField
					select
					label='Uni.'
					id='startUniRange'
					name='startUniRange'
					onChange={(e) => handleChangeUni(e.target.value)}
					className='w-1/2'
					value={info?.startUniRange || 'm'}
				>
					<MenuItem value='ms'>Milisegundos</MenuItem>
					<MenuItem value='s'>Segundos</MenuItem>
					<MenuItem value='m'>Minutos</MenuItem>
					<MenuItem value='h'>Horas</MenuItem>
					<MenuItem value='d'>Días</MenuItem>
					<MenuItem value='mo'>Mes</MenuItem>
					<MenuItem value='y'>Año</MenuItem>
				</TextField>
			</div>
		</>
	)
}

export default RangeConsult
