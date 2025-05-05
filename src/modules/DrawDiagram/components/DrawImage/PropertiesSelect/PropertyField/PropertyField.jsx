import { Checkbox, MenuItem, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

function PropertyField({ field, data, listVariable, showCheck = true }) {
	const [info, setInfo] = useState(data.variables)

	useEffect(() => {
		setInfo(data.variables)
	}, [data])

	const setVariable = (value) => {
		const newInfo = { ...info }
		newInfo.variables[field].id_variable = value
		data.setVariables(newInfo.variables)
		setInfo(newInfo)
	}

	const setShowVar = (value) => {
		const newInfo = { ...info }
		newInfo.variables[field].show = value
		data.setVariables(newInfo.variables)
		setInfo(newInfo)
	}

	return (
		<div className='flex w-full'>
			<TextField
				select
				label={`Variable para ${field.toLocaleUpperCase()}`}
				onChange={(e) => {
					const value = e.target.value
					setVariable(value)
				}}
				className='w-full'
				value={info?.variables?.[field]?.id_variable}
			>
				<MenuItem value={0}>
					<em>Selecciona una variable</em>
				</MenuItem>
				{listVariable.map((variable, index) => (
					<MenuItem key={index} value={variable.id}>
						{variable.name}
					</MenuItem>
				))}
			</TextField>
			{showCheck ? (
				<div
					className='flex justify-start items-center border w-1/2'
					onClick={() => setShowVar(!info?.variables?.[field]?.show)}
				>
					<Checkbox
						key={'text'}
						checked={info?.variables?.[field]?.show}
						onChange={(e) => setShowVar(e.target.checked)}
					/>
					Visualizar
				</div>
			) : null}
		</div>
	)
}

export default PropertyField
