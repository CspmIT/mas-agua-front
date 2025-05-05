import { useEffect, useState } from 'react'
import { Button, Typography, Box } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const InputFile = ({ title, fnc, fileSelected }) => {
	const [fileName, setFileName] = useState('')

	const handleFileChange = (event) => {
		fnc(event)
		const file = event.target.files[0]
		setFileName(file ? file.name : '')
	}
	useEffect(() => {
		setFileName(fileSelected ? fileSelected.name : '')
	}, [fileSelected])

	return (
		<Box sx={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
			<input
				accept='image/*'
				style={{ display: 'none' }}
				id='raised-button-file'
				multiple
				type='file'
				onChange={handleFileChange}
			/>
			<label htmlFor='raised-button-file'>
				<Button variant='contained' component='span' startIcon={<CloudUploadIcon />}>
					{title || 'Subir Archivo'}
				</Button>
			</label>
			{fileName && <Typography variant='body1'>{fileName}</Typography>}
		</Box>
	)
}

export default InputFile
