import { Box, IconButton, Modal } from '@mui/material'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import DataGenerator from '../../../../components/DataGenerator/DataGenerator'
import VarsProvider from '../../../../components/DataGenerator/ProviderVars'
import { Add, Close } from '@mui/icons-material'

export default function ModalField() {
	const [open, setOpen] = useState(false)
	const handleClose = () => setOpen(false)

	return (
		<div>
			<IconButton color='primary' className='!bg-blue-200 !absolute top-0 right-5' onClick={() => setOpen(true)}>
				<Add />
			</IconButton>
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
			<Box className='relative flex justify-center items-center  bg-white'>
				<IconButton onClick={handleClose} className='!absolute top-3 right-3'>
					<Close color='error' />
				</IconButton>
				<VarsProvider>
					<DataGenerator />
				</VarsProvider>
			</Box>
		</Modal>
	)
}
