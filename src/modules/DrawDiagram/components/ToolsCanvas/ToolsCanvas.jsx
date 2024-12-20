import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useEffect, useState } from 'react'
import { IoImagesOutline, IoRemoveOutline } from 'react-icons/io5'
import { MdOutlinePolyline } from 'react-icons/md'
import { RiText } from 'react-icons/ri'
import { FaTools } from 'react-icons/fa'
import DrawText from '../DrawText/DrawText'
import { getInstanceType } from '../DrawDiagram/utils/js/actions'
import DrawLine from '../DrawLine/DrawLine'
import DrawPolyLine from '../DrawPolyLine/DrawPolyLine'
import PropertiesSelect from '../DrawImage/PropertiesSelect/PropertiesSelect'
import MenuObject from '../DrawImage/MenuObject/MenuObject'
import { cleanSelectionCanvas } from './utils/js'

function ToolsCanvas({ selectedObject, handleChangeTypeImg, fabricCanvasRef, onPropertySelected }) {
	const [alignment, setAlignment] = useState('web')

	const handleChange = async (event, newAlignment) => {
		setAlignment(newAlignment)
		onPropertySelected(newAlignment)
		cleanSelectionCanvas(fabricCanvasRef)
		switch (newAlignment) {
			case 'Text':
				fabricCanvasRef.current?.set({ defaultCursor: 'text' })
				break
			case 'Line':
			case 'Polyline':
				if (!selectedObject) fabricCanvasRef.current?.set({ defaultCursor: 'crosshair' })
				break
			default:
				fabricCanvasRef.current?.set({ defaultCursor: 'default' })
				break
		}
	}

	useEffect(() => {
		switch (getInstanceType(selectedObject)) {
			case 'TextDiagram':
				setAlignment(selectedObject ? 'Text' : null)
				break
			case 'ImageDiagram':
			case 'ImageTopic':
				setAlignment(selectedObject ? 'Property' : null)
				break
			case 'LineDiagram':
				setAlignment(selectedObject ? 'Line' : null)
				break
			case 'PolylineDiagram':
				setAlignment(selectedObject ? 'Polyline' : null)
				break
			default:
				setAlignment(null)
				break
		}
	}, [selectedObject])
	const handleComponentClick = (componentName) => {
		if (['DrawLine', 'DrawPolyLine', 'DrawText', 'MenuObject', 'PropertiesSelect'].includes(componentName)) {
			onPropertySelected(componentName)
		} else {
			onPropertySelected(false)
		}
	}
	return (
		<>
			<ToggleButtonGroup
				className='bg-white'
				color='primary'
				value={alignment}
				exclusive
				onChange={handleChange}
				aria-label='Platform'
			>
				<ToggleButton value='Line'>
					<IoRemoveOutline />
				</ToggleButton>
				<ToggleButton value='Polyline'>
					<MdOutlinePolyline />
				</ToggleButton>
				<ToggleButton value='Text'>
					<RiText />
				</ToggleButton>
				<ToggleButton value='Image'>
					<IoImagesOutline />
				</ToggleButton>
				<ToggleButton value='Property' className={`${alignment === 'Property' ? '' : '!hidden'}`}>
					<FaTools className={`${alignment === 'Property' ? 'text-blue-500' : ''}`} />
				</ToggleButton>
			</ToggleButtonGroup>
			{alignment === 'Line' && selectedObject ? (
				<div onClick={() => handleComponentClick('DrawLine')}>
					<DrawLine selectedObject={selectedObject} fabricCanvasRef={fabricCanvasRef} />
				</div>
			) : null}
			{alignment === 'Polyline' && selectedObject ? (
				<div onClick={() => handleComponentClick('DrawPolyLine')}>
					<DrawPolyLine selectedObject={selectedObject} fabricCanvasRef={fabricCanvasRef} />
				</div>
			) : null}
			{alignment === 'Text' && selectedObject ? (
				<div onClick={() => handleComponentClick('DrawText')}>
					<DrawText selectedObject={selectedObject} fabricCanvasRef={fabricCanvasRef} />
				</div>
			) : null}
			{alignment === 'Image' ? (
				<div onClick={() => handleComponentClick('MenuObject')}>
					<MenuObject />
				</div>
			) : null}
			{alignment === 'Property' && selectedObject ? (
				<div onClick={() => handleComponentClick('PropertiesSelect')}>
					<PropertiesSelect
						data={selectedObject}
						fabricCanvasRef={fabricCanvasRef}
						handleChangeTypeImg={handleChangeTypeImg}
					/>
				</div>
			) : null}
		</>
	)
}

export default ToolsCanvas
