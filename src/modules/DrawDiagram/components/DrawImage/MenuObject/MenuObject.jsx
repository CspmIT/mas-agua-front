import { Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import styles from '../../../utils/css/style.module.css'
import { ListImg } from '../../../utils/js/ListImg'

function MenuObject() {
	const [images, setImages] = useState([])
	const [selectedImageId, setSelectedImageId] = useState(null) // Estado para la imagen seleccionada

	const handleDragStart = (e, img) => {
		setSelectedImageId(img.id)
		e.dataTransfer.setData('text/plain', img.src)
		e.dataTransfer.setData('name', img.name)
		e.dataTransfer.setData('variables', JSON.stringify(img.variables))
	}

	useEffect(() => {
		setImages(ListImg())
	}, [])

	return (
		<div className={`w-full py-4 bg-gray-100 `}>
			<div className='flex w-full justify-center items-center border-b-2 mb-4'>
				<Typography className='text-center uppercase !font-bold ' typography={'h5'}>
					Imagenes
				</Typography>
			</div>

			<div
				className={`grid grid-cols-3 gap-4 px-4 justify-center items-center ${styles.hMaxListImg} overflow-y-auto`}
			>
				{images.map((img) => (
					<div
						key={img.id}
						className={`w-full flex justify-center items-center ${
							selectedImageId === img.id ? 'border-blue-400 border-2' : '' // Aplica borde solo a la imagen seleccionada
						}`}
						onClick={() => setSelectedImageId(img.id)} // Actualiza el estado al hacer clic en una imagen
					>
						<img
							src={img.src}
							alt={img.name}
							width={img.width}
							height={img.height}
							className='max-h-20 max-w-20 cursor-move'
							draggable
							onDragStart={(e) => handleDragStart(e, img)} // Asignar evento de drag
						/>
					</div>
				))}
			</div>
		</div>
	)
}

export default MenuObject
