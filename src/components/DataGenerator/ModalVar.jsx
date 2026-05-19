import { useEffect, useState } from 'react'
import DataGenerator from './DataGenerator'
import VarsProvider from './ProviderVars'
import ModalShell from '../ModalShell'

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
		<ModalShell
			open={open}
			onClose={handleClose}
			eyebrow={data ? 'Editar variable' : 'Nueva variable'}
			title='Configuración de variable'
			subtitle='Define los parámetros de lectura, cálculo o descomposición binaria'
			maxWidth='96vw'
		>
			<VarsProvider>
				<DataGenerator handleClose={handleClose} data={data} onSaved={onSaved} />
			</VarsProvider>
		</ModalShell>
	)
}
