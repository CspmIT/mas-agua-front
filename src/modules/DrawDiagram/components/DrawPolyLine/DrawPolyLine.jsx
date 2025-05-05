import { Typography } from '@mui/material'
import PropertyPolyLineBase from './PropertyPolyLineBase'
function DrawPolyLine({ selectedObject, fabricCanvasRef }) {
	return (
		<div className={`w-full flex flex-col gap-3 px-5 py-4 bg-white `}>
			<div className='flex w-full justify-center items-center border-b-2 mb-4'>
				<Typography className='text-center uppercase !font-bold ' typography={'h6'}>
					Polilinea
				</Typography>
			</div>
			<PropertyPolyLineBase data={selectedObject} fabricCanvasRef={fabricCanvasRef} />
		</div>
	)
}

export default DrawPolyLine
