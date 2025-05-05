import * as fabric from 'fabric'
import { useEffect, useRef, useState } from 'react'
import CardCustom from '../../../components/CardCustom'
import styles from '../utils/css/style.module.css'
import { handleDrop } from '../components/DrawImage/utils/js/actionImage'
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, TextField } from '@mui/material'
import { drawLine } from '../components/DrawLine/utils/js/line'
import { newText } from '../components/DrawText/utils/js'
import { drawPolyline } from '../components/DrawPolyLine/utils/js/polyline'
import ToolsCanvas from '../components/ToolsCanvas/ToolsCanvas'
import { saveDiagram, uploadCanvaDb } from '../utils/js/drawActions'
import { useParams } from 'react-router-dom'
import { ExpandMore, Save } from '@mui/icons-material'

function DrawDiagram() {
	const { id } = useParams()
	const canvasRef = useRef(null)
	const fabricCanvasRef = useRef(null)
	const activeToolRef = useRef(null)
	const [selectedObject, setSelectedObject] = useState(null)

	// Cambiar herramienta activa
	const changeTool = (tool) => {
		updateSelectionObject()
		activeToolRef.current = tool
	}

	// actualizo si hay algun objeto seleccionado
	const updateSelectionObject = () => {
		const canvas = fabricCanvasRef.current
		const selected = canvas.getActiveObject()
		setSelectedObject(selected?.metadata || null)
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
			await newText(fabricCanvasRef, { left, top }, changeTool, setSelectedObject)
			canvas?.set({ defaultCursor: 'default' })
		} else if (defaultCursor === 'crosshair') {
			await handleLineTool(e)
		}
	}

	// Manejar la herramienta de líneas
	const handleLineTool = async (event) => {
		if (activeToolRef.current !== 'Polyline' && activeToolRef.current !== 'Line') {
			fabricCanvasRef?.current?.set({ defaultCursor: 'default' })
		} else {
			if (activeToolRef.current === 'Polyline') {
				drawPolyline(event.pointer, fabricCanvasRef, setSelectedObject, changeTool)
			}
			if (activeToolRef.current === 'Line') {
				drawLine(event.pointer, fabricCanvasRef, changeTool, setSelectedObject)
			}
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

	// Configuración inicial del canvas
	useEffect(() => {
		if (id && fabricCanvasRef) {
			uploadCanvaDb(id, fabricCanvasRef, setSelectedObject, changeTool)
		}
	}, [id, fabricCanvasRef])

	// Eliminar objetos con tecla Delete
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key !== 'Delete' || activeToolRef.current) return
			const canvas = fabricCanvasRef.current
			const activeObject = canvas?.getActiveObject()
			if (!activeObject) return
			if (activeObject.type == 'line' || activeObject.type == 'polyline') {
				const back = canvas
					.getObjects(activeObject.type)
					.filter((obj) => obj.id == activeObject.metadata?.[activeObject.type]?.id + '_back')
				if (back) {
					back.forEach((element) => {
						element.visible = false
					})
				}
			}
			if (activeObject.type == 'text' || activeObject.type == 'line' || activeObject.type == 'image') {
				const text = canvas
					.getObjects('textbox')
					.filter(
						(obj) => obj.id == `${activeObject.metadata?.[activeObject.type]?.id}_text_${activeObject.type}`
					)
				if (text) {
					text.forEach((element) => {
						element.visible = false
					})
				}
			}
			activeObject.metadata.delete()
			activeObject.visible = false
			canvas.discardActiveObject()
			canvas.requestRenderAll()
			setSelectedObject(null)
			e.preventDefault()
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [activeToolRef.current])

	return (
		<CardCustom
			className={
				'w-full  h-full flex flex-col items-center justify-center text-black dark:text-white relative p-3 rounded-md'
			}
		>
			<Button
				variant='contained'
				className='!absolute bottom-5 right-5 z-50'
				onClick={() => saveDiagram(fabricCanvasRef)}
			>
				<Save />
			</Button>

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
				<div className='absolute top-1 left-2 w-1/4 '>
					<ToolsCanvas
						selectedObject={selectedObject}
						fabricCanvasRef={fabricCanvasRef}
						onPropertySelected={changeTool}
					/>
				</div>
			</div>
		</CardCustom>
	)
}

export default DrawDiagram
