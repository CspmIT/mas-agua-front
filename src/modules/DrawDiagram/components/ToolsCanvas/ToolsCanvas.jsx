import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useEffect, useState } from 'react'
import { IoImagesOutline, IoRemoveOutline } from 'react-icons/io5'
import { MdOutlinePolyline } from 'react-icons/md'
import { RiText } from 'react-icons/ri'
import MenuObject from '../MenuObject/MenuObject'
import PropertiesSelect from '../PropertiesSelect/PropertiesSelect'
import { FaTools } from 'react-icons/fa'
import DrawText from '../DrawText/DrawText'
import { getInstanceType } from '../DrawDiagram/utils/js/actions'
import DrawLine from '../DrawLine/DrawLine'
import DrawPolyLine from '../DrawPolyLine/DrawPolyLine'

function ToolsCanvas({
	selectedObject,
	AddTextImg,
	AddTextImgInflux,
	newText,
	convertToImagenTopic,
	changeCursor,
	onPropertySelected,
	showValueInflux,
}) {
	const [alignment, setAlignment] = useState('web')

	const handleChange = async (event, newAlignment) => {
		setAlignment(newAlignment)
		await onPropertySelected(newAlignment)
		switch (newAlignment) {
			case 'Text':
				changeCursor('text')
				break
			case 'Line':
			case 'PolyLine':
				changeCursor('pointer')
				break
			default:
				changeCursor('default')
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
				<ToggleButton value='PolyLine'>
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
					<DrawLine selectedObject={selectedObject} AddText={newText} />
				</div>
			) : null}
			{alignment === 'PolyLine' && selectedObject ? (
				<div onClick={() => handleComponentClick('PolyLine')}>
					<DrawPolyLine selectedObject={selectedObject} AddText={newText} />
				</div>
			) : null}
			{alignment === 'Text' && selectedObject ? (
				<div onClick={() => handleComponentClick('DrawText')}>
					<DrawText selectedObject={selectedObject} AddText={newText} />
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
						AddText={AddTextImg}
						AddTextInflux={AddTextImgInflux}
						convertToImagenTopic={convertToImagenTopic}
						showValueInflux={showValueInflux}
					/>
				</div>
			) : null}
		</>
	)
}

export default ToolsCanvas
