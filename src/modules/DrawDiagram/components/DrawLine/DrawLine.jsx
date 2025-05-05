import { Accordion, AccordionDetails, AccordionSummary, Checkbox, MenuItem, TextField, Typography } from '@mui/material'
import PropertyText from '../DrawText/PropertyText'
import PropertyLineBase from './PropertyLineBase'
import { useEffect, useState } from 'react'
import { addTextLine, animationDobleLine, updatePropertyLine } from './utils/js/line'

function DrawLine({ selectedObject, fabricCanvasRef }) {
	const [info, setInfo] = useState(selectedObject)
	useEffect(() => {
		setInfo(selectedObject)
	}, [selectedObject])
	const [checkboxText, setCheckboxText] = useState(info.text.showText)
	const activeTextLine = (status) => {
		setCheckboxText(status)
		const infoUpdate = { ...info, showText: status }
		setInfo(infoUpdate)
		selectedObject.setShowText(status)
		addTextLine(infoUpdate, fabricCanvasRef)
	}
	const chageLocation = (ubi) => {
		const infoUpdate = { ...info, locationText: ubi }
		setInfo(infoUpdate)
		selectedObject.setLocationText(ubi)
		addTextLine(infoUpdate, fabricCanvasRef)
	}
	const changeText = (text) => {
		const infoUpdate = { ...info }
		infoUpdate.text = text

		addTextLine(infoUpdate, fabricCanvasRef)
	}
	return (
		<div className={`w-full flex flex-col gap-3 px-5 py-4  bg-white `}>
			<div className='flex w-full justify-center items-center border-b-2 mb-4'>
				<Typography className='text-center uppercase !font-bold ' typography={'h6'}>
					Linea
				</Typography>
			</div>
			<PropertyLineBase
				data={selectedObject}
				fabricCanvasRef={fabricCanvasRef}
				updateProperty={updatePropertyLine}
				animationDobleLine={animationDobleLine}
			/>
			<Accordion className={` !mt-0`} expanded={checkboxText} onChange={() => activeTextLine(!checkboxText)}>
				<AccordionSummary aria-controls='panel1-content' id='panel1-header'>
					<div className='flex justify-start items-center'>
						<Checkbox
							key={'topic'}
							checked={checkboxText}
							onChange={(e) => activeTextLine(e.target.checked)}
						/>
						Agregar Texto en Linea
					</div>
				</AccordionSummary>
				<AccordionDetails>
					<PropertyText AddText={changeText} data={info.text} fabricCanvasRef={fabricCanvasRef} />
					<TextField
						select
						label='Posición del Texto'
						id='locationText'
						name='locationText'
						onChange={(e) => chageLocation(e.target.value)}
						className='w-full '
						value={info?.text.locationText || 'Top'}
					>
						<MenuItem value='Top'>Arriba</MenuItem>
						<MenuItem value='Bottom'>Abajo</MenuItem>
					</TextField>
				</AccordionDetails>
			</Accordion>
		</div>
	)
}

export default DrawLine
