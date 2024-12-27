import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useEffect, useState } from 'react'
import { IoImagesOutline, IoRemoveOutline } from 'react-icons/io5'
import { MdOutlinePolyline } from 'react-icons/md'
import { RiText } from 'react-icons/ri'
import { FaTools } from 'react-icons/fa'
import DrawText from '../DrawText/DrawText'
import { getInstanceType } from '../../utils/js/drawActions'
import DrawLine from '../DrawLine/DrawLine'
import DrawPolyLine from '../DrawPolyLine/DrawPolyLine'
import PropertiesSelect from '../DrawImage/PropertiesSelect/PropertiesSelect'
import MenuObject from '../DrawImage/MenuObject/MenuObject'
import { cleanSelectionCanvas } from './utils/js'
import PropertyCanva from '../PropertyCanva/PropertyCanva'

function ToolsCanvas({ selectedObject, handleChangeTypeImg, fabricCanvasRef, onPropertySelected }) {
	const [alignment, setAlignment] = useState('web')

	const handleChange = async (event, newAlignment) => {
		const canvas = fabricCanvasRef?.current
		setAlignment(newAlignment)
		onPropertySelected(newAlignment)
		cleanSelectionCanvas(fabricCanvasRef)
		canvas.getObjects().forEach((obj) => (obj.selectable = true))
		const selectObject = canvas?.getActiveObject()

		switch (newAlignment) {
			case 'Text':
				canvas?.set({ defaultCursor: 'text' })
				break
			case 'Property':
				if (selectObject) {
					setAlignment('PropertyImg')
				} else {
					setAlignment('PropertyCanvas')
				}
				break
			case 'Line':
			case 'Polyline':
				canvas?.getObjects().forEach((obj) => (obj.selectable = false))
				if (!selectedObject) canvas?.set({ defaultCursor: 'crosshair' })
				break
			default:
				canvas?.set({ defaultCursor: 'default' })
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
				setAlignment(selectedObject ? 'PropertyImg' : null)
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
				<ToggleButton
					value='Property'
					selected={alignment?.includes('Property')}
					onClick={() => handleChange(['PropertyImg', 'PropertyCanvas'])}
				>
					<FaTools />
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
			{alignment === 'PropertyImg' ? (
				<div onClick={() => handleComponentClick('PropertiesSelect')}>
					<PropertiesSelect
						data={selectedObject}
						fabricCanvasRef={fabricCanvasRef}
						handleChangeTypeImg={handleChangeTypeImg}
					/>
				</div>
			) : null}
			{alignment === 'PropertyCanvas' ? (
				<div onClick={() => handleComponentClick('PropertiesSelect')}>
					<PropertyCanva fabricCanvasRef={fabricCanvasRef} />
				</div>
			) : null}
		</>
	)
}

export default ToolsCanvas
