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
import ListField from '../Fields/ListField'
import { HiOutlineVariable } from 'react-icons/hi2'

function ToolsCanvas({ selectedObject, fabricCanvasRef, onPropertySelected }) {
	const [alignment, setAlignment] = useState('Primary')

	const handleChange = async (event, newAlignment) => {
		const canvas = fabricCanvasRef?.current
		setAlignment(newAlignment)
		onPropertySelected(newAlignment)
		cleanSelectionCanvas(fabricCanvasRef)
		canvas.getObjects().forEach((obj) => (obj.selectable = true))
		selectedObject = ''
		switch (newAlignment) {
			case 'Text':
				canvas?.set({ defaultCursor: 'text' })
				break
			case 'Property':
				setAlignment('PropertyCanvas')
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
				setAlignment(selectedObject ? 'PropertyText' : null)
				break
			case 'ImageDiagram':
				setAlignment(selectedObject ? 'PropertyImg' : null)
				break
			case 'LineDiagram':
				setAlignment(selectedObject ? 'PropertyLine' : null)
				break
			case 'PolylineDiagram':
				setAlignment(selectedObject ? 'PropertyPolyline' : null)
				break
			default:
				if (alignment == 'Primary') {
					setTimeout(() => {
						setAlignment('PropertyCanvas')
					}, 500)
				} else {
					setAlignment(null)
				}
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
				<ToggleButton value='Variable'>
					<HiOutlineVariable size={20} />
				</ToggleButton>
				<ToggleButton
					value='Property'
					selected={alignment?.includes('Property')}
					onClick={() =>
						handleChange([
							'PropertyImg',
							'PropertyCanvas',
							'PropertyText',
							'PropertyPolyline',
							'PropertyLine',
						])
					}
				>
					<FaTools />
				</ToggleButton>
			</ToggleButtonGroup>
			{alignment === 'PropertyLine' && getInstanceType(selectedObject) == 'LineDiagram' ? (
				<div onClick={() => handleComponentClick('DrawLine')}>
					<DrawLine selectedObject={selectedObject} fabricCanvasRef={fabricCanvasRef} />
				</div>
			) : null}
			{alignment === 'PropertyPolyline' && getInstanceType(selectedObject) == 'PolylineDiagram' ? (
				<div onClick={() => handleComponentClick('DrawPolyLine')}>
					<DrawPolyLine selectedObject={selectedObject} fabricCanvasRef={fabricCanvasRef} />
				</div>
			) : null}
			{alignment === 'PropertyText' && getInstanceType(selectedObject) == 'TextDiagram' ? (
				<div onClick={() => handleComponentClick('DrawText')}>
					<DrawText selectedObject={selectedObject} fabricCanvasRef={fabricCanvasRef} />
				</div>
			) : null}
			{alignment === 'Image' ? (
				<div onClick={() => handleComponentClick('MenuObject')}>
					<MenuObject />
				</div>
			) : null}
			{alignment === 'Variable' ? (
				<div onClick={() => handleComponentClick('Variable')}>
					<ListField />
				</div>
			) : null}
			{alignment === 'PropertyImg' && getInstanceType(selectedObject) == 'ImageDiagram' ? (
				<div onClick={() => handleComponentClick('PropertiesSelect')}>
					<PropertiesSelect data={selectedObject} fabricCanvasRef={fabricCanvasRef} />
				</div>
			) : null}
			{alignment === 'PropertyCanvas' ? (
				<div onClick={() => handleComponentClick('PropertiesSelect')}>
					<PropertyCanva data={selectedObject} fabricCanvasRef={fabricCanvasRef} />
				</div>
			) : null}
		</>
	)
}

export default ToolsCanvas
