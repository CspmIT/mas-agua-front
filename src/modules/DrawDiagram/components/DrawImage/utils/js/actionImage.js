import * as fabric from 'fabric'
import { ImageDiagram } from '../../../../class/ImageClass'
import { calcWidthText, getInstanceType } from '../../../../utils/js/drawActions'
import Swal from 'sweetalert2'
import { ListImg } from '../../../../utils/js/ListImg'

/**
 * Agrega o actualiza un texto en el canvas asociado a un objeto específico.
 *
 * @param {Object} propsImg - Propiedades del objeto que requiere el texto.
 * @param {React.MutableRefObject<fabric.Canvas>} fabricCanvasRef - Referencia al canvas de Fabric.js.
 * @param {string} type - Tipo de texto: 'default' para texto regular.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const addTextToCanvas = async (propsImg, fabricCanvasRef) => {
	const fabricCanvas = fabricCanvasRef.current
	if (!fabricCanvas) return
	// Identificación del texto basado en su tipo
	const textId = `${propsImg.image.id}_text_image`
	let textObject = fabricCanvas.getObjects('textbox').find((obj) => obj.id === textId)

	// Lógica para eliminar texto si no se requiere

	if (!propsImg?.text?.statusText) {
		fabricCanvas.remove(textObject)
		fabricCanvas.requestRenderAll()
		return false
	}
	let object = propsImg
	if (!getInstanceType(propsImg)) {
		object = fabricCanvas.getObjects('image').find((obj) => obj.id === propsImg.image.id)?.metadata
		if (!object) return
	}
	// Actualizar o crear el texto
	if (textObject) {
		editTextImg(object, fabricCanvas, textObject)
	} else {
		newTextImg(object, fabricCanvas)
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
export const createImage = async (data, fabricCanvasRef, setSelectedObject, changeTool) => {
	try {
		const canvas = fabricCanvasRef.current

		if (canvas.getObjects('image').find((obj) => obj.id == data.id)) return false

		const imgNode = new Image()

		imgNode.src = data.src
		if (data.width && data.height) {
			imgNode.width = parseInt(data.width)
			imgNode.height = parseInt(data.height)
		}
		const imgBuffer = ListImg()
		const variables = data.variables.length
			? data.variables.reduce(
					(acc, val) => {
						acc.variables[val.name_var] = {
							id_variable: val.id_influxvars,
							show: val.show_var,
						}
						return acc
					},
					{ variables: {} }
			  )
			: { variables: imgBuffer.find((item) => item.src.includes(data.src)).variables }
		const imgnueva = new ImageDiagram({
			...data,
			...variables,
			width: parseFloat(data?.width) || imgNode.width * 0.5 || 100,
			height: parseFloat(data?.height) || imgNode.height * 0.5 || 100,
		})
		imgNode.onload = () => {
			// Crear una imagen de Fabric.js con las dimensiones correctas
			const img = new fabric.FabricImage(imgNode, {
				left: data.left,
				top: data.top,
				scaleX: 0.5, // Escala inicial (se ajustará después si es necesario)
				scaleY: 0.5,
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
			if (data.statusText) {
				newTextImg(imgnueva, canvas)
			}
			canvas.add(img)
		}

		return imgnueva
	} catch (error) {
		console.error(error)
		Swal.fire({ title: 'Atención!', text: error.message, icon: 'warning' })
		return false
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
	})
	object.on('moving', () => {
		object.metadata.move(object.top, object.left)
		addTextToCanvas(object.metadata, fabricCanvasRef)
	})
	object.on('scaling', () => {
		object.metadata.resize(object.width * object.scaleX, object.height * object.scaleY)
		object.metadata.move(object.top, object.left)
		addTextToCanvas(object.metadata, fabricCanvasRef)
	})
	object.on('rotating', () => {
		object.metadata.rotate(object.angle)
		object.metadata.move(object.top, object.left)
		addTextToCanvas(object.metadata, fabricCanvasRef)
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
	const texto = img.text.text || defaultText
	const maxWidth = calcWidthText(texto, img.sizeText || 20)

	const textbox = new fabric.Textbox(texto, {
		id: `${img.image.id}_text_image`,
		left: img.image.position.left,
		top: img.image.position.top,
		fontSize: img.text.sizeText || 20,
		width: maxWidth,
		fill: img.text.colorText || '#000000',
		fontFamily: 'Arial',
		textAlign: 'center',
		backgroundColor: img.text.backgroundText || 'white',
		hasControls: false,
		hasBorders: false,
		selectable: false,
	})
	textbox.metadata = img
	const { left, top } = calculateTextPosition(img, textbox)
	textbox.set({ left, top })
	fabricCanvas.add(textbox)
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
	let angle = img.image.angle || textbox.angle || 0
	let flipX = false
	let flipY = false

	if (angle > 90 && angle < 270) {
		flipX = true
		flipY = true
	}
	let texto = img.text.text
	texto = texto == '' ? 'Escriba en la caja de config' : texto
	textbox.set({
		text: texto,
		width: calcWidthText(texto, img.text.sizeText || textbox.fontSize),
		fontSize: img.text.sizeText || textbox.fontSize,
		fill: img.text.colorText || textbox.fill,
		backgroundColor: img.text.backgroundText || textbox.backgroundColor,
		angle,
		flipX,
		flipY,
	})
	// Ajusta posición si es necesario
	if (img?.text?.textPosition) {
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
	const { left: leftImg, top: topImg } = img.image.position
	const { width: widthImg, height: heightImg } = img.image.size
	const textPosition = img.text.textPosition
	const angle = img.image.angle
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

export const waveEffect = (canvas, data) => {
	// Crear una forma personalizada para el agua con efecto de ola
	let wavePath = new fabric.Path('M 0 200 Q 100 180 200 200 T 400 200 L 400 400 L 0 400 Z', {
		left: data.left + data.width * data.configAnimation.margenLeft,
		top: data.top + data.height * data.configAnimation.margenTop,
		selectable: false,
		fill: data.configAnimation.color,
		id: `${data.id}_wave`,
		metadata: data,
	})
	let wavePath2 = new fabric.Path('M 0 200 Q 100 180 200 200 T 400 200 L 400 400 L 0 400 Z', {
		left: data.left + data.width * data.configAnimation.margenLeft,
		top: data.top + data.height * data.configAnimation.margenTop,
		selectable: false,
		fill: darkenColor(data.configAnimation.color),
		id: `${data.id}_wave2`,
		metadata: data,
	})
	if (data.id == '61') {
		console.log(data.top, data.height, data.configAnimation.margenTop)
	}
	// Agregar los paths al canvas
	canvas.add(wavePath2)
	canvas.add(wavePath)
	// Función para animar el movimiento de la ola

	// Iniciar la animación de la ola
	animatedWave(canvas, wavePath, wavePath2)
	return [wavePath2, wavePath]
}

export const animatedWave = (canvas, wavePath, wavePath2 = false, porcentajes = 100) => {
	let offsetX = 0
	let offsetX2 = 0
	const data = wavePath.metadata
	let percent = porcentajes
	if (percent == 0) {
		percent = 1
	}
	const totalWidth = data.width // Ancho total del canvas
	const totalHeight = data.height * (percent / 100) // Alto total del canvas
	let waveHeight = data.height * 0.01 // Amplitud de la ola
	const waveWidth = data.width * 0.1 // Longitud de onda
	const baseHeight = 0 // altura base necesaria

	if (percent <= 100 && percent >= 0) {
		const margen =
			(data.configAnimation.margenTopMin - data.configAnimation.margenTopMax) * (percent / 100) +
			data.configAnimation.margenTopMax
		wavePath.set('top', data.top + data.height * margen)
		if (wavePath2) {
			wavePath2.set('top', data.top + data.height * margen)
		}
	}
	function moveWave() {
		offsetX += 0.02 // Incrementar el desplazamiento
		offsetX2 -= 0.01 // Incrementar el desplazamiento

		// Cálculo del ancho superior e inferior basado en los porcentajes
		const widthTop = totalWidth * (data.configAnimation.widthTop / 100)
		const widthBottom = totalWidth * (data.configAnimation.widthBottom / 100)
		const heightLeft = totalHeight * (data.configAnimation.heightLeft / 100)
		const heightRight = totalHeight * (data.configAnimation.heightRight / 100)
		const initDraw = ((totalWidth - widthBottom) / 2) * data.configAnimation.margenBotonLeft
		// Generar path para wavePath
		let pathData = `M ${initDraw} ${heightLeft} `
		for (let x = 0; x <= widthTop; x += waveWidth / 4) {
			const y = baseHeight + Math.sin(((x + offsetX * 50) * Math.PI) / waveWidth) * waveHeight
			pathData += `L ${x} ${y} `
		}
		pathData += `L ${widthBottom} ${heightRight} L ${initDraw} ${heightLeft} Z`
		if (wavePath2) {
			// Generar path para wavePath2
			let pathData2 = `M ${initDraw} ${heightLeft} `
			for (let x = 0; x <= widthTop; x += waveWidth / 4) {
				const y = baseHeight + Math.sin(((x + offsetX2 * 50) * Math.PI) / waveWidth) * waveHeight
				pathData2 += `L ${x} ${y} `
			}
			pathData2 += `L ${widthBottom} ${heightRight} L ${initDraw} ${heightLeft} Z`
			wavePath2.path = new fabric.Path(pathData2).path
			wavePath2.setBoundingBox()
		}

		wavePath.path = new fabric.Path(pathData).path

		wavePath.setBoundingBox()
		canvas.renderAll()

		requestAnimationFrame(moveWave)
	}
	moveWave()
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
export const viewImage = async (data, canvas) => {
	try {
		if (canvas.getObjects('image').find((obj) => obj.id == data.id)) return false

		const imgNode = new Image()
		const listImage = ListImg()
		const imgBuffer = listImage.find((item) => item.animation && item.src.includes(data.src))
		imgNode.src = imgBuffer.srcView
		if (data.width && data.height) {
			imgNode.width = parseInt(data.width)
			imgNode.height = parseInt(data.height)
		}

		const variables = data.variables.length
			? data.variables.reduce(
					(acc, val) => {
						acc.variables[val.name_var] = {
							id_variable: val.id_influxvars,
							show: val.show_var,
						}
						return acc
					},
					{ variables: {} }
			  )
			: { variables: {} }
		const imgnueva = new ImageDiagram({
			...data,
			...variables,
			width: parseFloat(data?.width) || imgNode.width * 0.25 || 100,
			height: parseFloat(data?.height) || imgNode.height * 0.25 || 100,
		})

		imgNode.onload = async () => {
			// Crear una imagen de Fabric.js con las dimensiones correctas
			const img = new fabric.FabricImage(imgNode, {
				left: data.left,
				top: data.top,
				selectable: false,
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

			// Añadir la imagen al lienzo
			if (data.statusText) {
				newTextImg(imgnueva, canvas)
			}
			canvas.add(img)
		}
		switch (imgBuffer?.animation) {
			case 'wave':
				const info = {
					left: parseFloat(data.left.toFixed(2)),
					top: parseFloat(data.top.toFixed(2)),
					height: parseFloat(imgNode.height.toFixed(2)),
					width: parseFloat(imgNode.width.toFixed(2)),
					configAnimation: imgBuffer.configAnimation,
					id: data.id,
				}
				waveEffect(canvas, info)
				break
			default:
				break
		}
		return imgnueva
	} catch (error) {
		console.error(error)
		Swal.fire({ title: 'Atención!', text: error.message, icon: 'warning' })
		return false
	}
}

const darkenColor = (hex, factor = 0.2) => {
	// Convertir hex a RGB
	const bigint = parseInt(hex.slice(1), 16)
	const r = Math.max(0, ((bigint >> 16) & 255) * (1 - factor))
	const g = Math.max(0, ((bigint >> 8) & 255) * (1 - factor))
	const b = Math.max(0, (bigint & 255) * (1 - factor))

	// Convertir RGB a hexadecimal
	return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`
}
