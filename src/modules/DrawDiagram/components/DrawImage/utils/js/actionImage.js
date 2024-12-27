import * as fabric from 'fabric'
import { ImageDiagram, ImageTopic } from '../../../../class/ImageClass'
import { calcWidthText, getInstanceType } from '../../../../utils/js/drawActions'
import { createTextInflux, updateTextInflux } from './actionsTopic'
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
	let textObject = fabricCanvas.getObjects('textbox').find((obj) => obj.id === textId)

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
	console.log(object.width)
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
export const createImage = (data, fabricCanvasRef, setSelectedObject, changeTool) => {
	const canvas = fabricCanvasRef.current

	if (canvas.getObjects('image').find((obj) => obj.id == data.id)) return false

	const imgNode = new Image()

	imgNode.src = data.src
	if (data.width && data.height) {
		imgNode.width = parseInt(data.width)
		imgNode.height = parseInt(data.height)
	}
	const imgnueva = new ImageDiagram({
		...data,
		statusAnimation: data.animation,
		width: parseFloat(data?.width) || imgNode.width * 0.25,
		height: parseFloat(data?.height) || imgNode.height * 0.25,
	})
	imgNode.onload = () => {
		// Crear una imagen de Fabric.js con las dimensiones correctas
		const img = new fabric.FabricImage(imgNode, {
			left: data.left,
			top: data.top,
			scaleX: 0.25, // Escala inicial (se ajustará después si es necesario)
			scaleY: 0.25,
			opacity: 1,
			id: data.id,
		})

		// Ajustar la escala según las dimensiones deseadas (si es necesario)
		if (data.width && data.height) {
			img.scaleToWidth(parseFloat(data.width))
			img.scaleToHeight(parseFloat(data.height))
		}
		// Asocia el ImageDiagram al objeto de Fabric.js
		img.metadata = imgnueva

		attachImageEvents(img, fabricCanvasRef, setSelectedObject, changeTool)

		// Añadir la imagen al lienzo
		canvas.add(img)
	}
	if (data.statusText) {
		newTextImg(imgnueva, canvas)
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
		object.metadata.move(object.top, object.left)
		addTextToCanvas(object.metadata, fabricCanvasRef)
		if (withInflux) addTextToCanvas(object.metadata, fabricCanvasRef, 'influx')
	})
	object.on('rotating', () => {
		object.metadata.rotate(object.angle)
		object.metadata.move(object.top, object.left)
		addTextToCanvas(object.metadata, fabricCanvasRef)
		if (withInflux) addTextToCanvas(object.metadata, fabricCanvasRef, 'influx')
	})
}

// Manejo del evento drop
export const handleDrop = (e, fabricCanvasRef, setSelectedObject, changeTool) => {
	e.preventDefault()
	try {
		const imageSrc = e.dataTransfer.getData('text/plain') // URL de la imagen
		const imageName = e.dataTransfer.getData('name') // URL de la imagen
		const variables = JSON.parse(e.dataTransfer.getData('variables'))
		const fabricCanvas = fabricCanvasRef.current
		if (!fabricCanvas || !imageSrc) return

		const left = e.nativeEvent.offsetX - 50
		const top = e.nativeEvent.offsetY - 50
		const id = Math.random().toString(36).substring(2, 9)
		const data = {
			src: imageSrc,
			name: imageName,
			variables: variables,
			left,
			top,
			id,
		}
		createImage(data, fabricCanvasRef, setSelectedObject, changeTool)
	} catch (error) {
		Swal.fire({ title: 'Atención!', text: error.message, icon: 'warning' })
	}
}

/**
 * Crea un nuevo textbox en el canvas utilizando Fabric.js.
 *
 * @param {Object} img - Propiedades de la imagen a la que se le va a agregar el texto.
 * @param {fabric.Canvas} fabricCanvas - Canvas de Fabric.js.
 * @returns {Promise<fabric.Textbox>} Objeto textbox de Fabric.js.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const newTextImg = (img, fabricCanvas) => {
	if (!fabricCanvas) return

	const defaultText = 'Escriba en la caja de config'
	const texto = img.text || defaultText
	const maxWidth = calcWidthText(texto, img.sizeText || 20)
	const textbox = new fabric.Textbox(texto, {
		id: `${img.id}_text`,
		left: img.left,
		top: img.top,
		fontSize: img.sizeText || 20,
		width: maxWidth,
		fill: img.colorText || '#000000',
		fontFamily: 'Arial',
		textAlign: 'center',
		backgroundColor: img.backgroundText || 'white',
		hasControls: false,
		hasBorders: false,
		editable: false,
		selectable: false,
	})
	textbox.metadata = img
	const { left, top } = calculateTextPosition(img, textbox)
	textbox.set({ left, top })
	fabricCanvas.add(textbox)
	fabricCanvas.setActiveObject(textbox)

	return textbox
}

/**
 * Edita el textbox existente en la imagen del canvas utilizando Fabric.js.
 *
 * @param {Object} img - Propiedades actualizadas de la imagen.
 * @param {fabric.Canvas} fabricCanvas - Canvas de Fabric.js.
 * @param {fabric.Textbox} textbox - Objeto textbox existente.
 * @returns {Promise<fabric.Textbox>} Objeto de texto actualizado.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const editTextImg = (img, fabricCanvas, textbox) => {
	if (!img || !fabricCanvas || !textbox) return
	// Actualiza propiedades dinámicas
	let angle = img.angle || textbox.angle || 0
	let flipX = false
	let flipY = false

	if (angle > 90 && angle < 270) {
		flipX = true
		flipY = true
	}

	textbox.set({
		text: img.text || textbox.text,
		width: calcWidthText(img.text || textbox.text, img.sizeText || textbox.fontSize),
		fontSize: img.sizeText || textbox.fontSize,
		fill: img.colorText || textbox.fill,
		backgroundColor: img.backgroundText || textbox.backgroundColor,
		angle,
		flipX,
		flipY,
	})
	// Ajusta posición si es necesario
	if (img?.textPosition) {
		const { left, top } = calculateTextPosition(img, textbox)
		textbox.set({ left, top })
	}

	fabricCanvas.requestRenderAll() // Optimización del renderizado
	return textbox
}

/**
 * Calcula la posición del texto en base a la posición y tamaño del elemento asociado.
 *
 * @param {Object} img - Propiedades de la imagen para obtener datos de ubicacion y tamaño.
 * @param {fabric.Textbox} text - Objeto de texto de Fabric.js.
 * @returns {{left: number, top: number}} Coordenadas calculadas.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const calculateTextPosition = (img, text) => {
	const { left: leftImg, top: topImg, width: widthImg, height: heightImg, textPosition, angle } = img
	const positions = {
		Left: () => ({
			left: parseFloat((leftImg - text.width - 20).toFixed(2)),
			top: parseFloat((topImg + heightImg / 2 - text.height / 2).toFixed(2)),
		}),
		Right: () => ({
			left: parseFloat((leftImg + widthImg + 20).toFixed(2)),
			top: parseFloat((topImg + heightImg / 2 - text.height / 2).toFixed(2)),
		}),
		Top: () => ({
			left: parseFloat((leftImg + widthImg / 2 - text.width / 2).toFixed(2)),
			top: parseFloat((topImg - text.height - 10).toFixed(2)),
		}),
		Bottom: () => ({
			left: parseFloat((leftImg + widthImg / 2 - text.width / 2).toFixed(2)),
			top: parseFloat((topImg + heightImg + 15).toFixed(2)),
		}),
		Center: () => ({
			left: parseFloat((leftImg + widthImg / 2 - text.width / 2).toFixed(2)),
			top: parseFloat((topImg + heightImg / 2 - text.height / 2).toFixed(2)),
		}),
	}
	// Si la imagen tiene un ángulo de rotación, ajusta también la posición del texto
	const position = (positions[textPosition] || positions.Center)()
	if (angle) {
		const rad = (angle * Math.PI) / 180 // Convertir a radianes
		const cos = Math.cos(rad)
		const sin = Math.sin(rad)
		const xOffset = position.left - leftImg
		const yOffset = position.top - topImg
		position.left = leftImg + xOffset * cos - yOffset * sin
		position.top = topImg + xOffset * sin + yOffset * cos
	}
	return position
}
