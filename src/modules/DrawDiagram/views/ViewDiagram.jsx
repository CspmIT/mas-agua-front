import * as fabric from 'fabric'
import { useEffect, useRef } from 'react'
import CardCustom from '../../../components/CardCustom'
import styles from '../utils/css/style.module.css'
import { animatedWave, handleDrop } from '../components/DrawImage/utils/js/actionImage'
import { useParams } from 'react-router-dom'
import { uploadDiagramDb } from '../utils/js/viewActionsDiagram'

function ViewDiagram() {
	const { id } = useParams()
	const canvasRef = useRef(null)
	const fabricCanvasRef = useRef(null)

	// Configuración inicial del canvas
	useEffect(() => {
		const canvasElement = canvasRef.current
		if (!canvasElement) return

		const parent = canvasElement.parentNode
		const canvas = new fabric.Canvas(canvasElement, {
			width: parent.offsetWidth,
			height: parent.offsetHeight,
			selection: false,
		})

		fabricCanvasRef.current = canvas
		fabricCanvasRef.current.defaultCursor = 'default'

		return () => canvas.dispose()
	}, [])
	const getData = async () => {
		const canvas = fabricCanvasRef.current
		const objects = await uploadDiagramDb(id, canvas)
		console.log(objects)
		if (objects) {
			setTimeout(() => {
				for (const element of objects.images) {
					// Llama a la función de edición con el ID y el factor de escala deseado

					editWaveMetadata(canvas, element.id, 0.5)
				}
			}, 200)
		}
	}

	const editWaveMetadata = (canvas, groupId, scaleFactor) => {
		const waves = canvas.getObjects('path').filter((item) => item.id.includes(groupId))
		if (waves.length === 2) {
			const wave1 = waves[0]
			const wave2 = waves[1]

			// Reactivar la animación con los nuevos valores
			animatedWave(canvas, wave2, wave1, 100)
		} else {
			console.log(`No se encontraron dos paths asociados al ID: ${groupId}`)
		}
	}
	// Configuración inicial del canvas
	useEffect(() => {
		getData()
	}, [])

	return (
		<CardCustom
			className={
				'w-full  h-full flex flex-col items-center justify-center text-black dark:text-white relative p-3 rounded-md'
			}
		>
			<div
				key={'canvasDiseno'}
				id={'canva'}
				className='flex w-full bg-slate-200 relative'
				onDrop={(e) => handleDrop(e, fabricCanvasRef, setSelectedObject, changeTool)}
				onDragOver={(e) => e.preventDefault()}
			>
				<div className={`flex w-full ${styles.hscreenCustom} `}>
					<canvas ref={canvasRef} width={1000} height={600} style={{ border: '1px solid black' }} />
				</div>
			</div>
		</CardCustom>
	)
}

export default ViewDiagram
