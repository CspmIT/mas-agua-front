import { useEffect, useState } from 'react'
import { Card, FormLabel } from '@mui/material'
import Accordion from '../components/Accordion'
import { FaArrowRight } from 'react-icons/fa6'
import { formatterConfig, getConfigNotify } from '../utils/js'
import LoaderComponent from '../../../components/Loader'
import { io } from 'socket.io-client'
import { backend, front } from '../../../utils/routes/app.routes'
import { storage } from '../../../storage/storage'

function ConfigNotifications() {
	const [devices, setDevices] = useState([])
	const [hasAccess, setHasAccess] = useState(false)
	const [loading, setLoading] = useState(true)
	const user = storage.get('usuario').sub
	const getConfig = async () => {
		const config = await getConfigNotify()
		const configFormatter = await formatterConfig(config)
		setDevices(configFormatter)
		setLoading(false)
	}

	if (loading)
		return (
			<Card className='w-full h-full flex flex-col items-center justify-center text-black dark:text-white relative p-3 rounded-md'>
				<LoaderComponent />
			</Card>
		)

	return (
		<Card className='w-full h-full flex flex-col items-center justify-center text-black dark:text-white relative p-3 rounded-md'>
			<div className='w-full md:p-5'>
				<h1 className='text-2xl mb-3'>Configuración de eventos y notificaciones</h1>
				<div className='flex flex-col gap-3'>
					{!devices ? (
						<LoaderComponent />
					) : (
						devices.map((item, index) => (
							<Accordion
								key={index}
								title={
									<>
										<FormLabel>{item.router.device}</FormLabel>
										<FaArrowRight className='mt-1 mx-2' />
										<FormLabel>{item.router.brand}</FormLabel>
										<FaArrowRight className='mt-1 mx-2' />
										<FormLabel>{item.router.version}</FormLabel>
									</>
								}
								dataTable={item.objets}
								access={hasAccess}
							/>
						))
					)}
				</div>
			</div>
		</Card>
	)
}

export default ConfigNotifications
