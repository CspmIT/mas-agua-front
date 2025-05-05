import { Delete, Info } from '@mui/icons-material'
import { useEffect, useState } from 'react'

function ChipCustom({ onClick = null, onDelete = null, onInfo = null, label = '', color = 'default' }) {
	const [colors, setColors] = useState('bg-gray-500 text-white')
	const [colorHover, setColorHover] = useState('hover:!bg-gray-500 ')
	useEffect(() => {
		switch (color) {
			case 'default':
				setColors('bg-gray-500 text-white')
				setColorHover('hover:!bg-gray-500')
				break
			case 'success':
				setColors('bg-green-700 text-white')
				setColorHover('hover:!bg-green-800')
				break
			case 'error':
				setColors('bg-red-700 text-white')
				setColorHover('hover:!bg-red-800')
				break
			default:
				break
		}
	}, [])

	return (
		<div
			className={`${colors} flex gap-1 p-1 rounded-full ${
				onClick ? 'cursor-pointer ' : ' cursor-default'
			} px-3  ${colorHover}`}
		>
			<div className=' flex items-center' onClick={onClick}>
				<p className='text-sm '>{label}</p>
			</div>
			{onDelete && (
				<Delete
					fontSize='small'
					className={`text-gray-300 ${onDelete ? 'cursor-pointer ' : ''} hover:text-gray-100`}
					onClick={onDelete}
				/>
			)}
			{onInfo && (
				<Info
					fontSize='small'
					className={` text-gray-300 ${onInfo ? 'cursor-pointer ' : ''} hover:text-gray-100`}
					onClick={onInfo}
				/>
			)}
		</div>
	)
}

export default ChipCustom
