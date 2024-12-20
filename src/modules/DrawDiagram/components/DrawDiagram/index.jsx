import * as fabric from 'fabric'
import { useEffect, useRef, useState } from 'react'
import CardCustom from '../../../../components/CardCustom'
import styles from '../../utils/css/style.module.css'
import ToolsCanvas from '../ToolsCanvas/ToolsCanvas'
import { drawLine } from '../DrawLine/utils/js/line'
import { newText } from '../DrawText/utils/js'
import { handleConvertToImagenTopic, handleDrop } from '../DrawImage/utils/js/actionImage'
import { drawPolyline } from '../DrawPolyLine/utils/js/polyline'

function DrawDiagram() {
	const canvasRef = useRef(null)
	const fabricCanvasRef = useRef(null)
	const activeToolRef = useRef(null)
	const [selectedObject, setSelectedObject] = useState(null)
	const [pointer, setPointer] = useState([])

	// Cambiar herramienta activa
	const changeTool = (tool) => {
		activeToolRef.current = tool
	}

	// Evento principal: Maneja clics y herramientas
	const handleCanvasClick = async (e) => {
		const canvas = fabricCanvasRef.current
		if (!canvas) return

		const { defaultCursor } = canvas
		const selected = canvas.getActiveObject()

		if (defaultCursor === 'default') {
			setSelectedObject(selected?.metadata || null)
		} else if (defaultCursor === 'text') {
			const { offsetX: left, offsetY: top } = e.e
			await newText(fabricCanvasRef, left, top, changeTool, setSelectedObject)
			canvas?.set({ defaultCursor: 'default' })
		} else if (defaultCursor === 'crosshair') {
			await handleLineTool(e)
		}
	}

	// Manejar la herramienta de líneas
	const handleLineTool = async (event) => {
		if (activeToolRef.current === 'Polyline') {
			drawPolyline(event.pointer, fabricCanvasRef, setSelectedObject, changeTool)
		} else {
			drawLine(event.pointer, fabricCanvasRef, setPointer, changeTool, setSelectedObject)
		}
	}

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

		// Manejar eventos
		canvas.on('mouse:down', handleCanvasClick)

		return () => canvas.dispose()
	}, [])

	// Eliminar objetos con tecla Delete
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key !== 'Delete' || activeToolRef.current) return
			const canvas = fabricCanvasRef.current
			const activeObject = canvas?.getActiveObject()
			if (!activeObject) return
			const text = canvas
				.getObjects()
				.filter(
					(obj) =>
						obj.type === 'textbox' &&
						(obj.id == activeObject.metadata?.id + '_text' ||
							obj.id == activeObject.metadata?.id + '_text_influx' ||
							obj.id == activeObject.metadata?.id + '_text_line')
				)
			if (text) {
				text.forEach((element) => {
					canvas.remove(element)
				})
			}
			canvas.remove(activeObject)
			setSelectedObject(null)
			// canvas.discardActiveObject().renderAll()
			e.preventDefault()
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [activeToolRef.current])

	const handleChangeTypeImg = (id, status) => {
		handleConvertToImagenTopic(id, status, fabricCanvasRef, setSelectedObject, changeTool)
	}

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
				onDrop={(e) => handleDrop(e, fabricCanvasRef, setSelectedObject, changeTool)} // Manejar el evento de soltar
				onDragOver={(e) => e.preventDefault()} // Permitir que las imágenes sean soltadas
			>
				<div className={`flex w-full ${styles.hscreenCustom} `}>
					<canvas ref={canvasRef} width={1000} height={600} style={{ border: '1px solid black' }} />
				</div>
				<div className='absolute top-2 left-2 w-1/4 '>
					<ToolsCanvas
						selectedObject={selectedObject}
						handleChangeTypeImg={handleChangeTypeImg}
						fabricCanvasRef={fabricCanvasRef}
						onPropertySelected={changeTool}
					/>
				</div>
			</div>
		</CardCustom>
	)
}

export default DrawDiagram
