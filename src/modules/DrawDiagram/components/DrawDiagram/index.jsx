import * as fabric from 'fabric'
import { useEffect, useRef, useState } from 'react'
import CardCustom from '../../../../components/CardCustom'
import styles from '../../utils/css/style.module.css'
import ToolsCanvas from '../ToolsCanvas/ToolsCanvas'
import { ImageDiagram, ImageTopic } from '../../class/ImageClass'
import Swal from 'sweetalert2'
import { createImage, editTextCanva, getInstanceType, newTextCanva } from './utils/js/actions'
import { createTextInflux, updateTextInflux } from './utils/js/actionsTopic'
import { drawLine, getPiontsLine } from '../DrawLine/utils/js/line'
import { LineDiagram } from '../../class/LineClass'

function DrawDiagram() {
	const canvasRef = useRef(null) // Referencia al elemento canvas
	const fabricCanvasRef = useRef(null) // Referencia al lienzo de Fabric
	const [selectedObject, setSelectedObject] = useState(null) // Estado del objeto seleccionado
	const [activeTool, setActiveTool] = useState(null)
	const [images, setImages] = useState([])
	const [texts, setTexts] = useState([])
	const [pointer, setPointer] = useState([])
	const [lines, setLines] = useState([])
	const changeCursor = (customCursor) => {
		const fabricCanvas = fabricCanvasRef.current
		if (!fabricCanvas) return

		fabricCanvas.defaultCursor = customCursor
	}

	const clickOptions = async (e) => {
		const fabricCanvas = fabricCanvasRef.current
		const currentCursor = fabricCanvas?.defaultCursor
		const selected = fabricCanvas.getActiveObject()
		if (e.target?.type == 'circle') {
		}
		// FALTA PODER IDENTIFICAR CUANDO ES LINE Y CUANDO ES POLYLINE CON EL ACTIVETOOL O VER DE QUE MANERA HACERLO
		if (currentCursor == 'default') {
			if (!selected || !selected?.metadata) {
				setSelectedObject(null)
			}
		}
		if (currentCursor == 'text') {
			changeTool(false)
			textDiagram(e)
			changeCursor('default')
		}
		if (currentCursor == 'pointer') {
			const newLine = await drawLine(e.pointer, fabricCanvasRef, setPointer, changeCursor, lines)
			if (newLine) {
				const dataLine = {
					id: newLine.id,
					points: getPiontsLine(newLine),
				}
				const line = new LineDiagram(dataLine)
				newLine.metadata = line
				const newListLines = [...lines, line]
				setLines(newListLines)
			}
		}
	}

	useEffect(() => {
		const canvasElement = canvasRef.current
		if (canvasElement) {
			const parent = canvasElement.parentNode
			const fabricCanvas = new fabric.Canvas(canvasElement, {
				width: parent.offsetWidth,
				height: parent.offsetHeight,
			})
			fabricCanvasRef.current = fabricCanvas
			fabricCanvas.on('selection:created', (e) => handleSelection(e))
			fabricCanvas.on('selection:updated', (e) => handleSelection(e))
			// Ajustar el tamaño inicial del lienzo
			fabricCanvas.on('mouse:down', (e) => {
				clickOptions(e)
			})

			fabricCanvas.on('object:modified', (e) => {
				const selected = e.target
				if (selected && selected.metadata) {
					handleModify(selected)
				} else {
					setSelectedObject(null)
				}
			})

			fabricCanvas.renderAll() // Renderiza el canvas
		}

		// Cleanup cuando el componente se desmonte
		return () => {
			if (fabricCanvasRef.current) {
				fabricCanvasRef.current.dispose() // Limpia el lienzo
			}
		}
	}, [])

	const handleModify = (selected) => {
		const Object = selected?.metadata ? selected.metadata : selected
		switch (getInstanceType(Object)) {
			case 'TextDiagram':
				Object.move(selected.top, selected.left)
				Object.rotate(selected.angle)
				textDiagram(Object)
				break
			case 'ImageDiagram':
				Object.move(selected.top, selected.left)
				Object.resize(selected.width * selected.scaleX, selected.height * selected.scaleY)
				addTextImg(Object)
				break
			case 'ImageTopic':
				Object.move(selected.top, selected.left)
				Object.resize(selected.width * selected.scaleX, selected.height * selected.scaleY)
				addTextImg(Object)
				addTextImgInflux(Object)
				break

			default:
				break
		}
	}

	const handleSelection = (e) => {
		const selected = fabricCanvasRef.current.getActiveObject()
		if (selected) {
			switch (selected.type) {
				case 'textbox':
					changeTool(null)
					setSelectedObject(selected.metadata)
					textDiagram(selected)
					break
				case 'image':
					if (selected.metadata) {
						setSelectedObject(selected.metadata)
						addTextImg(selected.metadata)
					}
					break
				case 'line':
					if (selected.metadata) {
						setSelectedObject(selected.metadata)
						addTextImg(selected.metadata)
					}
					break
				default:
					changeTool(null)
					console.log('Se seleccionó otro tipo de objeto:', selected)
					break
			}
		} else {
			changeTool(null)
		}
	}

	const handleConvertToImagenTopic = async (id, status) => {
		const fabricCanvas = fabricCanvasRef.current
		if (!fabricCanvas) return
		const object = fabricCanvas.getObjects().find((obj) => obj.metadata.id === id)
		if (object) {
			const imageChange = images.find((img) => img.id == id)
			let newImagen
			if (status) {
				newImagen = new ImageTopic(imageChange, {})
				newImagen.setStatusTopic(1)
			} else {
				newImagen = new ImageDiagram(imageChange)
			}
			setSelectedObject(newImagen)
			object.metadata = newImagen
			setImages((prevImages) => prevImages.map((img) => (img.id === id ? newImagen : img)))
		}
	}

	const handleDrop = (e) => {
		try {
			e.preventDefault()
			const imgnueva = createImage(e, images, fabricCanvasRef)
			setImages((prev) => [...prev, imgnueva])
		} catch (error) {
			Swal.fire({ title: 'Atención!', text: error, icon: 'warning' })
		}
	}

	useEffect(() => {
		const onKeyDownHandler = (e) => {
			if (!fabricCanvasRef.current || activeTool) return
			const fabricCanvas = fabricCanvasRef.current
			const activeObject = fabricCanvas.getActiveObject()
			if (e.key === 'Delete' && activeObject) {
				const text = fabricCanvas
					.getObjects()
					.find((obj) => obj.type === 'textbox' && obj.id == activeObject.metadata?.id + '_text')
				if (text) {
					fabricCanvas.remove(text)
				}
				fabricCanvas.remove(activeObject)
				fabricCanvas.discardActiveObject()
				fabricCanvas.renderAll()

				setImages((prev) => prev.filter((img) => img.id !== activeObject.metadata?.id))
				setSelectedObject(null)
				e.preventDefault()
			}
		}

		window.addEventListener('keydown', onKeyDownHandler)
		return () => {
			window.removeEventListener('keydown', onKeyDownHandler)
		}
	}, [images, activeTool])

	const textDiagram = async (props, type = '') => {
		const fabricCanvas = fabricCanvasRef.current
		if (!fabricCanvas) return

		const left = props?.e?.offsetX || props.left
		const top = props?.e?.offsetY || props.top

		if (!props.id) {
			const text = await newTextCanva(fabricCanvas.getObjects().length + 1, fabricCanvas, left, top, null)
			setSelectedObject(text)
			const updatedTexts = [...texts, text]
			setTexts(updatedTexts)
		} else {
			if (type == 'Influx') {
				let text_influx = fabricCanvas
					.getObjects()
					.find((obj) => obj.type === 'textbox' && obj.id == `${props.id}_text_influx`)
				await updateTextInflux(props, fabricCanvas, text_influx)
			} else {
				let group = fabricCanvas.getObjects().find((obj) => obj.metadata.id === props.id)
				await editTextCanva(props, fabricCanvas, group)
			}
		}
		fabricCanvas.renderAll()
	}
	const showValueInflux = async (img, status) => {
		const fabricCanvas = fabricCanvasRef.current
		if (!fabricCanvas) return
		if (status) {
			await addTextImgInflux(img)
		} else {
			const text = fabricCanvas.getObjects().find((obj) => obj.id == img.id + '_text_influx')
			if (text) {
				fabricCanvas.remove(text)
			}
		}
	}
	const addTextImg = async (props) => {
		const fabricCanvas = fabricCanvasRef.current
		if (!fabricCanvas) return

		let text = fabricCanvas.getObjects().find((obj) => obj.type === 'textbox' && obj.id == `${props.id}_text`)

		if (!props?.statusText) {
			fabricCanvas.remove(text)
			return false
		}
		if (text && props.statusText) {
			await editTextCanva(props, fabricCanvas, text)
		} else {
			await newTextCanva(props.id, fabricCanvas, props.left, props.top, props)
		}

		await fabricCanvas.renderAll()
	}
	const addTextImgInflux = async (props) => {
		const fabricCanvas = fabricCanvasRef.current
		if (!fabricCanvas) return

		let text_influx = fabricCanvas
			.getObjects()
			.find((obj) => obj.type === 'textbox' && obj.id == `${props.id}_text_influx`)
		if (!props?.showValue) {
			fabricCanvas.remove(text_influx)
			return false
		}
		if (text_influx) {
			await updateTextInflux(props, fabricCanvas, text_influx)
		} else {
			await createTextInflux(props, fabricCanvas)
		}
		await fabricCanvas.renderAll()
	}

	const changeTool = async (tool) => {
		setActiveTool(tool)
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
				onDrop={handleDrop} // Manejar el evento de soltar
				onDragOver={(e) => e.preventDefault()} // Permitir que las imágenes sean soltadas
			>
				<div className={`flex w-full ${styles.hscreenCustom} `}>
					<canvas ref={canvasRef} width={1000} height={600} style={{ border: '1px solid black' }} />
				</div>
				<div className='absolute top-2 left-2 w-1/4 '>
					<ToolsCanvas
						selectedObject={selectedObject}
						AddTextImg={addTextImg}
						AddTextImgInflux={addTextImgInflux}
						newText={textDiagram}
						convertToImagenTopic={handleConvertToImagenTopic}
						changeCursor={changeCursor}
						onPropertySelected={changeTool}
						showValueInflux={showValueInflux}
					/>
				</div>
			</div>
		</CardCustom>
	)
}

export default DrawDiagram
