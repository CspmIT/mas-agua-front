import { ImageDiagram, ImageTopic } from '../../../../class/ImageClass'
import { LineDiagram } from '../../../../class/LineClass'
import { PolylineDiagram } from '../../../../class/PolylineClass'
import { TextDiagram } from '../../../../class/TextClass'
import * as fabric from 'fabric'

/**
 * Calcula el ancho del texto basado en su tamaño de fuente y contenido.
 *
 * @param {string} texto - El texto a medir.
 * @param {number} [fontSize=20] - Tamaño de la fuente en píxeles.
 * @returns {number} Ancho máximo del texto.
 * @author Jose Romani <jose.romani@hotmail.com>
 */

export const calcWidthText = (texto, fontSize = 20) => {
	// Configuración de la fuente
	const globalTempCanvas = document.createElement('canvas')
	const globalContext = globalTempCanvas.getContext('2d')
	globalContext.font = `${fontSize}px Arial`

	// Calcula el ancho de la línea más larga
	const textLines = texto.split('\n')
	const maxWidth = Math.max(...textLines.map((line) => globalContext.measureText(line).width)) + 20
	return maxWidth
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
	const { left: leftImg, top: topImg, width: widthImg, height: heightImg, textPosition } = img
	const positions = {
		Left: () => ({ left: leftImg - text.width - 20, top: topImg + heightImg / 2 - text.height / 2 }),
		Right: () => ({ left: leftImg + widthImg + 20, top: topImg + heightImg / 2 - text.height / 2 }),
		Top: () => ({ left: leftImg + widthImg / 2 - text.width / 2, top: topImg - text.height - 10 }),
		Bottom: () => ({ left: leftImg + widthImg / 2 - text.width / 2, top: topImg + heightImg + 15 }),
		Center: () => ({
			left: leftImg + widthImg / 2 - text.width / 2,
			top: topImg + heightImg / 2 - text.height / 2,
		}),
	}
	return (positions[textPosition] || positions.Center)()
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
		editable: false,
		selectable: !img?.textPosition,
		lockScalingX: true,
		lockScalingY: true,
		lockSkewingX: true,
		lockSkewingY: true,
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
	textbox.set({
		text: img.text || textbox.text,
		width: calcWidthText(img.text || textbox.text, img.sizeText || textbox.fontSize),
		fontSize: img.sizeText || textbox.fontSize,
		fill: img.colorText || textbox.fill,
		backgroundColor: img.backgroundText || textbox.backgroundColor,
	})
	// Ajusta posición si es necesario
	if (img?.textPosition) {
		const { left, top } = calculateTextPosition(img, textbox)
		textbox.set({ left, top })
	}

	fabricCanvas.requestRenderAll() // Optimización del renderizado
	return textbox
}

const classMap = {
	TextDiagram,
	ImageDiagram,
	ImageTopic,
	LineDiagram,
	PolylineDiagram,
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
