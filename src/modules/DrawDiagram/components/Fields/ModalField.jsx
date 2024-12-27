import { Box, Modal, Typography } from '@mui/material'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import DataGenerator from '../../../../components/DataGenerator/DataGenerator'
import VarsProvider from '../../../../components/DataGenerator/ProviderVars'

export default function ModalField() {
	const [open, setOpen] = useState(false)
	const handleClose = () => setOpen(false)

	return (
		<div className='clipping-container'>
			<button onClick={() => setOpen(true)}>Show modal using a portal</button>
			{open && createPortal(<ModalContent open={open} handleClose={handleClose} />, document.body)}
		</div>
	)
}

function ModalContent({ open, handleClose }) {
	return (
		<Modal
			className='flex justify-center items-center'
			open={open}
			onClose={handleClose}
			aria-labelledby='modal-modal-title'
			aria-describedby='modal-modal-description'
		>
			<Box className='flex justify-center items-center  bg-white'>
				<VarsProvider>
					<DataGenerator />
				</VarsProvider>
			</Box>
		</Modal>
	)
}
