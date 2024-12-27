import { Accordion, AccordionDetails, AccordionSummary, Checkbox, Divider, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PropertyTopic from './PropertiesInflux/PropertyTopic'
import PropertyTextImg from './PropertyTextImg/PropertyTextImg'
import Swal from 'sweetalert2'
import { addTextToCanvas } from '../utils/js/actionImage'
import PropertyField from './PropertyField/PropertyField'

function FormPropImg({ data, fabricCanvasRef, handleChangeTypeImg }) {
	const [info, setInfo] = useState(data)
	const [checkBoxText, setCheckBoxText] = useState(Boolean(info?.statusText))
	const [checkBoxTopic, setCheckBoxTopic] = useState(Boolean(info?.statusTopic))
	const activeText = (status) => {
		setCheckBoxText(status)
		const newInfo = { ...info, statusText: status }
		setInfo(newInfo)
		addTextToCanvas(newInfo, fabricCanvasRef)
		data.setStatusText(status)
	}
	// const activeTopic = async (status) => {
	// 	if (status == false) {
	// 		const result = await Swal.fire({
	// 			title: 'Atención!',
	// 			text: '¿Estas seguro de sacarle la propiedad de conexión con Influx? Se borrara toda la configuración...',
	// 			icon: 'question',
	// 			allowOutsideClick: false,
	// 			showDenyButton: true,
	// 			showCancelButton: false,
	// 			confirmButtonText: 'Sí',
	// 			denyButtonText: `No`,
	// 		})
	// 		if (result.isDenied) return
	// 	}

	// 	setCheckBoxTopic(status)
	// 	const newInfo = { ...info, statusTopic: status }
	// 	setInfo(newInfo)
	// 	if (status == false) {
	// 		data?.setShowValue(status)
	// 		const newInfo2 = { ...newInfo, showValue: status }
	// 		await addTextToCanvas(newInfo2, fabricCanvasRef, 'influx')
	// 		setInfo(newInfo2)
	// 	}
	// 	await handleChangeTypeImg(newInfo.id, status)
	// }

	useEffect(() => {
		setInfo(data) // Actualiza el estado `info` cuando `data` cambia
		setCheckBoxText(Boolean(data.statusText))
		setCheckBoxTopic(Boolean(data.statusTopic))
	}, [data])

	const changeName = (string) => {
		data.setName(string)
		setInfo((prev) => ({ ...prev, name: string }))
	}
	return (
		<>
			<TextField
				type='text'
				label='Nombre'
				id='name'
				name='name'
				onChange={(e) => changeName(e.target.value)}
				className='w-full'
				value={info.name}
			/>
			<Accordion className='!mb-0' expanded={checkBoxText} onChange={() => activeText(!checkBoxText)}>
				<AccordionSummary aria-controls='panel1-content' id='panel1-header'>
					<div className='flex justify-start items-center'>
						<Checkbox key={'text'} checked={checkBoxText} onChange={(e) => activeText(e.target.checked)} />
						Titulo
					</div>
				</AccordionSummary>
				<AccordionDetails>
					<PropertyTextImg AddText={addTextToCanvas} fabricCanvasRef={fabricCanvasRef} data={data} />
				</AccordionDetails>
			</Accordion>

			{info?.variables
				? Object.keys(info.variables).map((name, index) => (
						<>
							<Typography variant='h6' className='text-center uppercase'>
								Variables
							</Typography>
							<Divider />
							<PropertyField key={index} field={name} dataField={info.variables[name]} />
						</>
				  ))
				: null}

			{/* <Accordion
				className={`${checkBoxTopic ? '!bg-gray-200 border border-zinc-300' : ''} !mt-0`}
				expanded={checkBoxTopic}
				onChange={() => activeTopic(!checkBoxTopic)}
			>
				<AccordionSummary aria-controls='panel1-content' id='panel1-header'>
					<div className='flex justify-start items-center'>
						<Checkbox
							key={'topic'}
							checked={checkBoxTopic}
							onChange={(e) => activeTopic(e.target.checked)}
						/>
						Conexion Influx
					</div>
				</AccordionSummary>
				<AccordionDetails>
					<PropertyTopic data={data} fabricCanvasRef={fabricCanvasRef} />
				</AccordionDetails>
			</Accordion> */}
		</>
	)
}

export default FormPropImg
