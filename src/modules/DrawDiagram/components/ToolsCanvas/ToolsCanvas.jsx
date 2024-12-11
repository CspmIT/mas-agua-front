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

function ToolsCanvas({
	selectedObject,
	AddTextImg,
	AddTextImgInflux,
	newText,
	convertToImagenTopic,
	changeCursor,
	onToolSelected,
	showValueInflux,
}) {
	const [alignment, setAlignment] = useState('web')

	const handleChange = (event, newAlignment) => {
		setAlignment(newAlignment)
		if (newAlignment === 'Text') {
			changeCursor('text')
		} else {
			changeCursor('default')
		}
	}

	useEffect(() => {
		let tool = null
		switch (getInstanceType(selectedObject)) {
			case 'TextDiagram':
				setAlignment(selectedObject ? 'Text' : null)
				tool = 'Text'
				break
			case 'ImageDiagram':
			case 'ImageTopic':
				setAlignment(selectedObject ? 'Property' : null)
				tool = 'Property'
				break
			default:
				setAlignment(null)
				break
		}
	}, [selectedObject])

	const handleComponentClick = (componentName) => {
		if (['DrawText', 'MenuObject', 'PropertiesSelect'].includes(componentName)) {
			onToolSelected(componentName)
		} else {
			onToolSelected(null)
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
				<ToggleButton value='PoliLine'>
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
