import { ImageDiagram, ImageTopic } from '../../../../class/Image'
import { TextDiagram } from '../../../../class/Text'
import * as fabric from 'fabric'
export const calcWidthText = (texto, fontSize) => {
	// Crear un canvas temporal para medir el ancho del texto
	const tempCanvas = document.createElement('canvas')
	const context = tempCanvas.getContext('2d')

	// Configurar el estilo de la fuente basado en las propiedades del Textbox
	const fontSizeText = fontSize || 20
	const fontFamily = 'Arial'
	context.font = `${fontSizeText}px ${fontFamily}`

	// Calcular el ancho de la frase más larga
	const textLines = texto.split('\n') // Separar en líneas
	const maxWidth = Math.max(...textLines.map((line) => context.measureText(line).width)) + 20
	return maxWidth
}
/**
 * Calcula la posición del texto en base a las propiedades del elemento al que está asociado.
 *
 * @param {Object} props - Propiedades del elemento (posición, tamaño, posición del texto).
 * @param {fabric.Textbox} text - Objeto de texto de Fabric.js.
 * @returns {Object} Coordenadas calculadas {left, top}.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const calculateTextPosition = (props, text) => {
	const { left: leftImg, top: topImg, width: widthImg, height: heightImg } = props
	let left = leftImg
	let top = topImg
	switch (props.textPosition) {
		case 'Left':
			left = leftImg - text.width - 20
			top = topImg + heightImg / 2 - text.height / 2
			break
		case 'Right':
			left = leftImg + widthImg + 20
			top = topImg + heightImg / 2 - text.height / 2
			break
		case 'Top':
			left = leftImg + widthImg / 2 - text.width / 2
			top = topImg - text.height - 10
			break
		case 'Bottom':
			left = leftImg + widthImg / 2 - text.width / 2
			top = topImg + heightImg + 15
			break
		case 'Center':
			left = leftImg + widthImg / 2 - text.width / 2
			top = topImg + heightImg / 2 - text.height / 2
			break
		default:
			left = leftImg + widthImg / 2 - text.width / 2
			top = topImg + heightImg / 2 - text.height / 2
			break
	}

	return { left, top }
}

/**
 * Crea un nuevo textbox en el canvas utilizando Fabric.js.
 *
 * @param {string} id - Identificador único para el textbox.
 * @param {fabric.Canvas} fabricCanvas - Canvas de Fabric.js.
 * @param {number|null} [left=null] - Posición horizontal inicial del texto.
 * @param {number|null} [top=null] - Posición vertical inicial del texto.
 * @param {Object|null} [props=null] - Propiedades opcionales del texto.
 * @returns {Promise<fabric.Textbox>} Objeto textbox de Fabric.js.
 * @author Jose Romani
 */
export const newTextCanva = async (id, fabricCanvas, left = null, top = null, props = null) => {
	if (!fabricCanvas) return
	// Crear las propiedades iniciales del texto
	const newText =
		props ||
		new TextDiagram({
			id: id,
			left: left,
			top: top,
			text: props?.text || 'Escriba en la caja de config',
		})
	const texto = newText?.text || 'Texto predeterminado'
	const maxWidth = calcWidthText(texto, newText.sizeText || 20)

	const textbox = new fabric.Textbox(texto, {
		id: `${id}_text`,
		left: newText.left ?? left ?? 0,
		top: newText.top ?? top ?? 0,
		fontSize: newText.sizeText || 20,
		width: maxWidth,
		fill: newText.colorText || '#000000',
		fontFamily: 'Arial',
		textAlign: 'center',
		backgroundColor: newText.backgroundText || 'white',
		editable: false,
		selectable: props?.textPosition ? false : true,
		lockScalingX: true,
		lockScalingY: true,
		lockSkewingX: true,
		lockSkewingY: true,
	})
	if (props?.textPosition) {
		const { left, top } = calculateTextPosition(props, textbox)
		textbox.set({ left, top })
	}

	textbox.metadata = newText

	// Agregar el textbox al canvas
	fabricCanvas.add(textbox)
	if (!props?.textPosition) {
		fabricCanvas.setActiveObject(textbox)
	}

	return newText
}

/**
 * Edita un textbox existente en el canvas utilizando Fabric.js.
 *
 * @param {Object} props - Propiedades actualizadas del texto.
 * @param {fabric.Canvas} fabricCanvas - Canvas de Fabric.js.
 * @param {fabric.Textbox} textbox - Objeto textbox existente.
 * @returns {Promise<fabric.Textbox>} Objeto de texto actualizado.
 */
export const editTextCanva = async (props, fabricCanvas, textbox) => {
	if (!props || !fabricCanvas || !textbox) return
	// Actualizar las propiedades del textbox
	const maxWidth = calcWidthText(props.text || textbox.text, props.sizeText || textbox.fontSize)
	textbox.set({
		text: props.text || textbox.text,
		width: maxWidth,
		fontSize: props.sizeText || textbox.fontSize,
		fill: props.colorText || textbox.fill,
		backgroundColor: props.backgroundText || textbox.backgroundColor,
	})

	// Actualizar la posición si se proporcionan nuevas coordenadas
	if (props?.textPosition) {
		const { left, top } = calculateTextPosition(props, textbox)
		textbox.set({ left, top })
	}
	// Renderizar cambios en el canvas
	fabricCanvas.renderAll()

	return textbox
}

const classMap = {
	TextDiagram,
	ImageDiagram,
	ImageTopic,
}

/**
 * Detecta la clase de una instancia.
 *
 * @param {Object} obj - Objeto a evaluar.
 * @returns {string|null} Clase correspondiente o null si no coincide.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const getInstanceType = (obj) => {
	// Primero verificamos si es de la clase más específica (ImageTopic)
	if (obj instanceof ImageTopic) {
		return 'ImageTopic' // Si es una instancia de ImageTopic, retornamos su tipo
	}

	// Verificamos el resto de las clases en el mapa
	for (const [key, value] of Object.entries(classMap)) {
		if (obj instanceof value) {
			return key // Devuelve el nombre del tipo (como 'TextDiagram' o 'ImageDiagram')
		}
	}
	return null // Si no coincide con ninguna clase
}

/**
 * Crea y agrega una imagen al canvas utilizando Fabric.js.
 *
 * Esta función utiliza un evento de arrastrar y soltar para obtener los datos de la imagen y
 * crear un objeto de imagen en el canvas. Además, se asocia un objeto de tipo `ImageDiagram`
 * como metadatos a la imagen para su posterior gestión.
 *
 * @param {DragEvent} e - Evento de arrastrar y soltar que contiene los datos de la imagen.
 * @param {Array} images - Lista actual de imágenes para generar un identificador único.
 * @param {React.MutableRefObject<fabric.Canvas>} fabricCanvasRef - Referencia al canvas de Fabric.js.
 * @returns {ImageDiagram|undefined} - Instancia de `ImageDiagram` asociada a la imagen creada o `undefined` si ocurre un error.
 * @author José Romani <jose.romani@hotmail.com>
 */
export const createImage = (e, images, fabricCanvasRef) => {
	const imageSrc = e.dataTransfer.getData('text/plain') // URL de la imagen
	const imageName = e.dataTransfer.getData('name') // URL de la imagen
	const imageAnimation = JSON.parse(e.dataTransfer.getData('animation')) // URL de la imagen
	const fabricCanvas = fabricCanvasRef.current
	if (!fabricCanvas || !imageSrc) return

	const imgNode = new Image()
	imgNode.src = imageSrc

	const left = e.nativeEvent.offsetX - 50
	const top = e.nativeEvent.offsetY - 50
	const id = images.length + 1
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

		// Añadir la imagen al lienzo
		fabricCanvas.add(img)
	}

	return imgnueva
}
