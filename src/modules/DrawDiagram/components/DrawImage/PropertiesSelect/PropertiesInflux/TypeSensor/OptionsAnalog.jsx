import { TextField } from '@mui/material'
import { useEffect, useState } from 'react'

function OptionsAnalog({ data }) {
	const [info, setInfo] = useState(data || [])
	const [params, setParams] = useState([])
	const [errorParams, setErrorParams] = useState(false)
	useEffect(() => {
		setInfo(data)
	}, [data])
	useEffect(() => {
		setParams(info?.optionValue)
	}, [info])
	const handleChangeParam = (uni, value) => {
		const options = { ...params, [uni]: value }
		setParams(options)
		const newInfo = { ...info, optionValue: options }
		setInfo(newInfo)
		data.setOptionsValue(options)
	}
	return (
		<div className='flex gap-4'>
			<TextField
				type='number'
				label='Valor Mínimo'
				id='minParam'
				name='minParam'
				onBlur={() => {
					!params.min ? setErrorParams(true) : setErrorParams(false)
				}}
				onChange={(e) => handleChangeParam('min', e.target.value)}
				className='w-1/2'
				error={errorParams}
				value={params?.min || ''}
			/>
			<TextField
				type='number'
				label='Valor Maximo'
				id='maxParam'
				name='maxParam'
				onBlur={() => {
					!params.max ? setErrorParams(true) : setErrorParams(false)
				}}
				onChange={(e) => handleChangeParam('max', e.target.value)}
				className='w-1/2'
				error={errorParams}
				value={params?.max || ''}
			/>
		</div>
	)
}

export default OptionsAnalog
