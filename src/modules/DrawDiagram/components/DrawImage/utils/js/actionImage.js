import * as fabric from 'fabric'
import { ImageDiagram, ImageTopic } from '../../../../class/ImageClass'
import { editTextImg, getInstanceType, newTextImg } from '../../../DrawDiagram/utils/js/actions'
import { createTextInflux, updateTextInflux } from '../../../DrawDiagram/utils/js/actionsTopic'
import Swal from 'sweetalert2'

/**
 * Agrega o actualiza un texto en el canvas asociado a un objeto específico.
 *
 * @param {Object} propsImg - Propiedades del objeto que requiere el texto.
 * @param {React.MutableRefObject<fabric.Canvas>} fabricCanvasRef - Referencia al canvas de Fabric.js.
 * @param {string} type - Tipo de texto: 'default' para texto regular o 'influx' para valores InfluxDB.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const addTextToCanvas = async (propsImg, fabricCanvasRef, type = 'default') => {
	const fabricCanvas = fabricCanvasRef.current
	if (!fabricCanvas) return

	// Identificación del texto basado en su tipo
	const textId = type === 'influx' ? `${propsImg.id}_text_influx` : `${propsImg.id}_text`
	let textObject = fabricCanvas.getObjects().find((obj) => obj.type === 'textbox' && obj.id === textId)

	// Lógica para eliminar texto si no se requiere
	const shouldRemoveText = type === 'influx' ? !propsImg?.showValue : !propsImg?.statusText
	if (shouldRemoveText) {
		fabricCanvas.remove(textObject)
		return false
	}
	let object = propsImg
	if (!getInstanceType(propsImg)) {
		object = fabricCanvas.getObjects('image').find((obj) => obj.id === propsImg.id).metadata
	}
	// Actualizar o crear el texto
	if (textObject) {
		type === 'influx'
			? updateTextInflux(object, fabricCanvas, textObject)
			: editTextImg(object, fabricCanvas, textObject)
	} else {
		type === 'influx' ? createTextInflux(object, fabricCanvas) : newTextImg(object, fabricCanvas)
	}

	fabricCanvas.requestRenderAll() // Optimización de renderizado
}

/**
 * Crea y agrega una imagen al canvas a partir de un evento de arrastrar y soltar.
 *
 * @param {DragEvent} e - Evento de arrastrar y soltar.
 * @param {React.MutableRefObject<fabric.Canvas>} fabricCanvasRef - Referencia al canvas.
 * @param {Function} setSelectedObject - Función para actualizar el objeto seleccionado.
 * @param {Function} changeTool - Función para cambiar la herramienta activa.
 * @returns {ImageDiagram|undefined} - Instancia del objeto ImageDiagram creado.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const createImage = (e, fabricCanvasRef, setSelectedObject, changeTool) => {
	const imageSrc = e.dataTransfer.getData('text/plain') // URL de la imagen
	const imageName = e.dataTransfer.getData('name') // URL de la imagen
	const imageAnimation = JSON.parse(e.dataTransfer.getData('animation')) // URL de la imagen
	const fabricCanvas = fabricCanvasRef.current
	if (!fabricCanvas || !imageSrc) return

	const imgNode = new Image()
	imgNode.src = imageSrc

	const left = e.nativeEvent.offsetX - 50
	const top = e.nativeEvent.offsetY - 50
	const id = Math.random().toString(36).substring(2, 9)
	const imgnueva = new ImageDiagram({
		id,
		name: imageName,
		statusAnimation: imageAnimation,
		src: imageSrc,
		left: left,
		top: top,
		width: imgNode.width * 0.25,
		height: imgNode.height * 0.25,
	})

	imgNode.onload = () => {
		// Crear una imagen de Fabric.js con las dimensiones correctas
		const img = new fabric.FabricImage(imgNode, {
			left, // Coordenadas iniciales
			top,
			scaleX: 0.25, // Escala predeterminada
			scaleY: 0.25,
			opacity: 1,
			id,
		})

		// Asocia el ImageDiagram al objeto de Fabric.js
		img.metadata = imgnueva
		attachImageEvents(img, fabricCanvasRef, setSelectedObject, changeTool)
		// Añadir la imagen al lienzo
		fabricCanvas.add(img)
	}

	return imgnueva
}

/**
 * Convierte un objeto en el canvas a ImageTopic o ImageDiagram según su estado.
 *
 * @param {string} id - ID del objeto en el canvas.
 * @param {boolean} status - Estado que determina el tipo de objeto (ImageTopic o ImageDiagram).
 * @param {React.MutableRefObject<fabric.Canvas>} fabricCanvasRef - Referencia al canvas.
 * @param {Function} setSelectedObject - Función para actualizar el objeto seleccionado.
 * @param {Function} changeTool - Función para cambiar la herramienta activa.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const handleConvertToImagenTopic = (id, status, fabricCanvasRef, setSelectedObject, changeTool) => {
	const fabricCanvas = fabricCanvasRef.current
	if (!fabricCanvas) return
	const object = fabricCanvas.getObjects().find((obj) => obj.metadata.id === id)
	if (object) {
		let newImagen
		if (status) {
			newImagen = new ImageTopic(object.metadata, {})
			newImagen.setStatusTopic(1)
			attachImageEvents(object, fabricCanvasRef, setSelectedObject, changeTool, status)
		} else {
			newImagen = new ImageDiagram(object.metadata)
			attachImageEvents(object, fabricCanvasRef, setSelectedObject, changeTool)
		}
		setSelectedObject(newImagen)
		object.metadata = newImagen
	}
}

/**
 * Asigna eventos comunes (seleccionar, mover, escalar, rotar) a un objeto Fabric.js.
 *
 * @param {fabric.Object} object - Objeto de Fabric.js al que se asignarán eventos.
 * @param {React.MutableRefObject<fabric.Canvas>} fabricCanvasRef - Referencia al canvas.
 * @param {Function} setSelectedObject - Función para actualizar el objeto seleccionado.
 * @param {Function} changeTool - Función para cambiar la herramienta activa.
 * @param {boolean} withInflux - Indica si se debe actualizar también el texto de InfluxDB.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const attachImageEvents = (object, fabricCanvasRef, setSelectedObject, changeTool, withInflux = false) => {
	object.on('selected', () => {
		setSelectedObject(object.metadata)
		changeTool(null)
		addTextToCanvas(object.metadata, fabricCanvasRef)
		if (withInflux) addTextToCanvas(object.metadata, fabricCanvasRef, 'influx')
	})
	object.on('moving', () => {
		object.metadata.move(object.top, object.left)
		addTextToCanvas(object.metadata, fabricCanvasRef)
		if (withInflux) addTextToCanvas(object.metadata, fabricCanvasRef, 'influx')
	})
	object.on('scaling', () => {
		object.metadata.resize(object.width * object.scaleX, object.height * object.scaleY)
		addTextToCanvas(object.metadata, fabricCanvasRef)
		if (withInflux) addTextToCanvas(object.metadata, fabricCanvasRef, 'influx')
	})
	object.on('rotating', () => {
		object.metadata.rotate(object.angle)
		addTextToCanvas(object.metadata, fabricCanvasRef)
		if (withInflux) addTextToCanvas(object.metadata, fabricCanvasRef, 'influx')
	})
}

// Manejo del evento drop
export const handleDrop = (e, fabricCanvasRef, setSelectedObject, changeTool) => {
	e.preventDefault()
	try {
		createImage(e, fabricCanvasRef, setSelectedObject, changeTool)
	} catch (error) {
		Swal.fire({ title: 'Atención!', text: error.message, icon: 'warning' })
	}
}
