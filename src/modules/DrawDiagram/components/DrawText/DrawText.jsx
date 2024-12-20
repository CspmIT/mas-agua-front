import { Typography } from '@mui/material'
import PropertyText from './PropertyText'
import { editText } from './utils/js'

function DrawText({ selectedObject, fabricCanvasRef }) {
	return (
		<div className={`w-full px-5 py-4 bg-gray-100 `}>
			<div className='flex w-full justify-center items-center border-b-2 mb-4'>
				<Typography className='text-center uppercase !font-bold ' typography={'h6'}>
					Texto
				</Typography>
			</div>
			<PropertyText AddText={editText} data={selectedObject} fabricCanvasRef={fabricCanvasRef} />
		</div>
	)
}

export default DrawText
