import { Accordion, AccordionDetails, AccordionSummary, Checkbox, Divider, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PropertyTextImg from './PropertyTextImg/PropertyTextImg'
import { addTextToCanvas } from '../utils/js/actionImage'
import PropertyField from './PropertyField/PropertyField'
import { getVarsInflux } from '../../Fields/actions'
function FormPropImg({ data, fabricCanvasRef }) {
	const [info, setInfo] = useState(data)
	const [checkBoxText, setCheckBoxText] = useState(Boolean(info?.text?.statusText))
	const [listVariable, setListVariable] = useState([])
	const activeText = (status) => {
		setCheckBoxText(status)
		const newInfo = { ...info }
		newInfo.text.statusText = status
		setInfo(newInfo)
		addTextToCanvas(newInfo, fabricCanvasRef)
		data.setStatusText(status)
	}

	useEffect(() => {
		setInfo(data) // Actualiza el estado `info` cuando `data` cambia
		setCheckBoxText(Boolean(data.text.statusText))
	}, [data])

	const changeName = (string) => {
		data.rename(string)
		const newInfo = { ...info }
		newInfo.image.name = string
		setInfo({ ...newInfo })
	}
	const setVariables = async () => {
		const variables = await getVarsInflux()
		setListVariable(variables)
	}

	useEffect(() => {
		if (listVariable.length === 0) {
			setVariables()
		}
	}, [])
	return (
		<>
			<TextField
				type='text'
				label='Nombre'
				id='name'
				name='name'
				onChange={(e) => changeName(e.target.value)}
				className='w-full'
				value={info.image.name}
			/>
			<Accordion className='!mb-0' expanded={checkBoxText} onChange={() => activeText(!checkBoxText)}>
				<AccordionSummary aria-controls='panel1-content' id='panel1-header'>
					<div className='flex justify-start items-center'>
						<Checkbox key={'text'} checked={checkBoxText} onChange={(e) => activeText(e.target.checked)} />
						Titulo
					</div>
				</AccordionSummary>
				<AccordionDetails>
					<PropertyTextImg fabricCanvasRef={fabricCanvasRef} data={data} />
				</AccordionDetails>
			</Accordion>

			{info?.variables ? (
				<div className='flex flex-col justify-center items-center gap-4'>
					<Typography variant='h6' className='text-center uppercase !m-0'>
						Variables
					</Typography>
					{Object.keys(info.variables.variables).map((name, index) => (
						<PropertyField key={index} field={name} data={data} listVariable={listVariable} />
					))}
				</div>
			) : null}
		</>
	)
}

export default FormPropImg
