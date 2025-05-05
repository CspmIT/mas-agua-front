import { MenuItem, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import OptionsAnalog from './OptionsAnalog'
import OptionsBinary from './OptionsBinary'

function TypeSensor({ data }) {
	const [info, setInfo] = useState(data || [])
	const [errorTypeSensor, setErrorTypeSensor] = useState(false)
	const [typeSensorSelect, setTypeSensorSelect] = useState(info.typeSensor || false)
	useEffect(() => {
		setInfo(data)
	}, [data])
	const changeTypeSensor = (value) => {
		setTypeSensorSelect(value)
		const newInfo = { ...info, typeSensor: value }
		setInfo(newInfo)
		data.setTypeSensor(value)
	}
	return (
		<>
			<TextField
				select
				label='Tipo de Sensor'
				onBlur={() => {
					!info.typeSensor ? setErrorTypeSensor(true) : setErrorTypeSensor(false)
				}}
				onChange={(e) => {
					if (e.target.value == '') return false
					changeTypeSensor(e.target.value)
				}}
				className='w-full'
				error={errorTypeSensor}
				value={info.typeSensor || ''}
			>
				<MenuItem className='!cursor-default' value=''>
					<em>Selecciona un tipo</em>
				</MenuItem>
				<MenuItem value='Analogico'>Analogico</MenuItem>
				<MenuItem value='Binario'>Binario</MenuItem>
			</TextField>
			{typeSensorSelect == 'Analogico' && <OptionsAnalog data={data} />}
			{typeSensorSelect == 'Binario' && <OptionsBinary data={data} />}
		</>
	)
}

export default TypeSensor
