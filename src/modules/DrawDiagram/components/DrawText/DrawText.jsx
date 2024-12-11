import { Typography } from '@mui/material'
import React from 'react'
import PropertyText from './PropertyText'

function DrawText({ AddText, selectedObject }) {
	return (
		<div className={`w-full px-5 py-4 bg-gray-100 `}>
			<div className='flex w-full justify-center items-center border-b-2 mb-4'>
				<Typography className='text-center uppercase !font-bold ' typography={'h6'}>
					Texto
				</Typography>
			</div>
			<PropertyText AddText={AddText} data={selectedObject} />
		</div>
	)
}

export default DrawText
