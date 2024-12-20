import { Checkbox, MenuItem, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

function PropertyAnimation({ data }) {
	const [info, setInfo] = useState(data || [])
	const [showAnimation, setShowAnimation] = useState(info.animation || false)
	useEffect(() => {
		setInfo(data)
	}, [data])

	const activeAnimation = (status) => {
		setShowAnimation(status)
		const newInfo = { ...info, animation: status }
		setInfo(newInfo)
		data.setAnimated(status)
	}

	return (
		<div className='flex flex-col gap-4'>
			<div
				className='flex justify-start items-center cursor-pointer border border-zinc-300 rounded-md p-2 pl-4 hover:border-gray-500'
				onClick={() => activeAnimation(!showAnimation)}
			>
				<Checkbox
					key={'animation'}
					checked={!!showAnimation}
					onChange={() => activeAnimation(!showAnimation)}
				/>
				Animación
			</div>
			{/* <TextField
				select
				label='Tipo de animación'
				onChange={(e) => changeType(e.target.value)}
				className='w-full'
				error={errorTopic}
				value={info.topic || ''}
			>
				<MenuItem>Analogico</MenuItem>
				<MenuItem>Binario</MenuItem>
			</TextField> */}
		</div>
	)
}

export default PropertyAnimation
