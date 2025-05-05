import { Checkbox, Divider, MenuItem, TextField, Typography } from '@mui/material'
import PropertyText from './PropertyText'
import { editText } from './utils/js'
import { useEffect, useState } from 'react'
import { getVarsInflux } from '../Fields/actions'

function DrawText({ selectedObject, fabricCanvasRef }) {
	const [listVariable, setListVariable] = useState([])
	const [info, setInfo] = useState(selectedObject)
	const [showVariable, setShowVariable] = useState(info?.variable ? true : false)
	useEffect(() => {
		setInfo(selectedObject)
	}, [selectedObject])
	const setVariables = async () => {
		const variables = await getVarsInflux()
		setListVariable(variables)
	}
	useEffect(() => {
		if (info?.variable) {
			setVariables()
		}
	}, [])
	const activeVariable = (status) => {
		if (status) {
			setVariables()
		}
		setShowVariable(status)
	}
	const setVariable = (variable) => {
		const string = listVariable.find((item) => item.id === variable)?.name
		const infoUpdate = {
			...info,
			variable: variable,
			text: string,
		}
		setInfo(infoUpdate)
		selectedObject.setVariable(variable)
		selectedObject.setText(string)
		editText(infoUpdate, fabricCanvasRef)
	}
	return (
		<div className={`w-full px-5 py-4 bg-white `}>
			<div
				className='flex justify-start items-center cursor-pointer border border-zinc-300 rounded-md my-3 p-2 pl-4 hover:border-gray-500'
				onClick={() => activeVariable(!showVariable)}
			>
				<Checkbox key={'animation'} checked={showVariable} onChange={() => activeVariable(!showVariable)} />
				Dato
			</div>
			{showVariable ? (
				<div className='flex flex-col justify-center items-center gap-2 mb-4'>
					<Typography variant='body1' className='text-center uppercase'>
						Variable
					</Typography>
					<TextField
						select
						label={`Variable para la linea`}
						onChange={(e) => {
							const value = e.target.value
							setVariable(value)
						}}
						className='w-full'
						value={info?.variable || 0}
					>
						<MenuItem value={0}>
							<em>Selecciona una variable</em>
						</MenuItem>
						{listVariable.map((variable, index) => (
							<MenuItem key={index} value={variable.id}>
								{variable.name}
							</MenuItem>
						))}
					</TextField>
				</div>
			) : null}
			<PropertyText
				AddText={editText}
				data={selectedObject}
				fabricCanvasRef={fabricCanvasRef}
				variableActive={showVariable}
			/>
		</div>
	)
}

export default DrawText
