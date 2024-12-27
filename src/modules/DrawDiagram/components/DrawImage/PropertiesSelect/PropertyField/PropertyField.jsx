import { Checkbox, MenuItem, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

function PropertyField({ field, dataField }) {
	const [idVariable, setIdVariable] = useState(dataField.id_variable)
	const [show, setShow] = useState(dataField.show)
	const [listVariable, setListVariable] = useState([])
	useEffect(() => {
		setListVariable([{ name: 'variable 1', id: 1 }])
	}, [])

	return (
		<>
			{/* <Typography variant='body1' className='uppercase w-full text-center'>
				{field}
			</Typography> */}
			<div className='flex w-full'>
				<TextField
					select
					label={`Variable para ${field.toLocaleUpperCase()}`}
					onChange={(e) => {
						const value = e.target.value
						setIdVariable(value)
					}}
					className='w-full'
					value={idVariable}
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
				<div className='flex justify-start items-center border w-1/2' onClick={() => setShow(!show)}>
					<Checkbox key={'text'} checked={show} onChange={(e) => setShow(e.target.checked)} />
					Visualizar
				</div>
			</div>
		</>
	)
}

export default PropertyField
