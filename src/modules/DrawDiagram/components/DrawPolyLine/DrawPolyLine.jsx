import PropertyLineBase from '../DrawLine/PropertyLineBase'
import { Typography } from '@mui/material'
import { animationDoblePolyline, updatePropertyPolyline } from './utils/js/polyline'
function DrawPolyLine({ selectedObject, fabricCanvasRef }) {
	return (
		<div className={`w-full flex flex-col gap-3 px-5 py-4 bg-gray-100 `}>
			<div className='flex w-full justify-center items-center border-b-2 mb-4'>
				<Typography className='text-center uppercase !font-bold ' typography={'h6'}>
					Polilinea
				</Typography>
			</div>
			<PropertyLineBase
				data={selectedObject}
				fabricCanvasRef={fabricCanvasRef}
				animationDobleLine={animationDoblePolyline}
				updateProperty={updatePropertyPolyline}
			/>
		</div>
	)
}

export default DrawPolyLine
