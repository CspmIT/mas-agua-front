import { Box, IconButton, Modal } from '@mui/material'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import DataGenerator from './DataGenerator'
import VarsProvider from './ProviderVars'
import { Close } from '@mui/icons-material'

export default function ModalVar({ openModal, setOpenModal, data = null, onSaved }) {
	const [open, setOpen] = useState(openModal)
	const handleClose = () => {
		setOpen(false)
		setOpenModal(false)
	}
	useEffect(() => {
		setOpen(openModal)
	}, [openModal])

	return (
		<>
			{open &&
				createPortal(
					<Modal
						className='flex justify-center items-center'
						open={open}
						aria-labelledby='modal-modal-title'
						aria-describedby='modal-modal-description'
					>
						<Box className='relative flex justify-center items-center  bg-white !rounded-lg'>
							<IconButton onClick={handleClose} className='!absolute top-3 right-3'>
								<Close color='error' />
							</IconButton>
							<VarsProvider>
								<DataGenerator handleClose={handleClose} data={data} onSaved={onSaved} />
							</VarsProvider>
						</Box>
					</Modal>,
					document.body
				)}
		</>
	)
}
