import * as fabric from 'fabric'
import { calcWidthText } from '../../../../utils/js/drawActions'

/**
 * Calcula la posición del texto en base a la posición y tamaño del elemento asociado.
 *
 * @param {Object} img - Propiedades de la imagen (posición, tamaño y ubicación del texto).
 * @param {fabric.Textbox} text - Objeto de texto de Fabric.js.
 * @returns {{left: number, top: number}} Coordenadas calculadas para la posición del texto.
 */
export const calculateTextPosition = (img, text) => {
	const { left, top, width, height, valuePosition } = img

	// Mapa de posiciones predefinidas
	const positions = {
		Left: () => ({
			left: left - text.width - 20,
			top: top + height / 2 - text.height / 2,
		}),
		Right: () => ({
			left: left + width + 20,
			top: top + height / 2 - text.height / 2,
		}),
		Top: () => ({
			left: left + width / 2 - text.width / 2,
			top: top - text.height - 10,
		}),
		Bottom: () => ({
			left: left + width / 2 - text.width / 2,
			top: top + height + 15,
		}),
		Center: () => ({
			left: left + width / 2 - text.width / 2,
			top: top + height / 2 - text.height / 2,
		}),
	}

	// Retorna la posición especificada o la posición 'Top' por defecto
	return (positions[valuePosition] || positions.Top)()
}
/**
 * Crea un nuevo Textbox asociado a valores de InfluxDB en el canvas de Fabric.js.
 *
 * @param {Object} propsImg - Propiedades del elemento asociado.
 * @param {fabric.Canvas} fabricCanvas - Canvas principal de Fabric.js.
 * @returns No retorna valor.
 */
export const createTextInflux = (propsImg, fabricCanvas) => {
	if (!fabricCanvas) return

	const texto = propsImg.field?.map((item) => `${item.field} ${item.uni}`).join('\n') || 'Valores de Influx'

	const maxWidth = calcWidthText(texto, propsImg.sizeTextValue)

	const textbox = new fabric.Textbox(texto, {
		id: `${propsImg.id}_text_influx`,
		left: propsImg.left,
		top: propsImg.top,
		fontSize: propsImg.sizeTextValue || 20,
		fontFamily: 'Arial',
		width: maxWidth,
		fill: propsImg.colorTextValue || '#000000',
		textAlign: 'center',
		backgroundColor: propsImg.backgroundTextValue || 'white',
		editable: false,
		selectable: false,
	})
	textbox.metadata = propsImg
	textbox.metatype = 'Influx'

	const { left, top } = calculateTextPosition(propsImg, textbox)
	textbox.set({
		left,
		top,
	})

	fabricCanvas.add(textbox)
}

/**
 * Actualiza un Textbox existente con nuevos valores asociados a InfluxDB.
 *
 * @param {Object} propsImg - Propiedades actualizadas del elemento.
 * @param {fabric.Canvas} fabricCanvas - Canvas principal de Fabric.js.
 * @param {fabric.Textbox} textbox - Objeto Textbox existente en el canvas.
 * @returns No retorna valor.
 */
export const updateTextInflux = (propsImg, fabricCanvas, textbox) => {
	if (!propsImg || !fabricCanvas || !textbox) return

	// Crear el texto dinámico
	const texto = propsImg.field?.map((item) => `${item.field} ${item.uni}`).join('\n') || textbox.text

	// Calcula el nuevo ancho para el texto
	const maxWidth = calcWidthText(texto, textbox.fontSize)

	// Ajustar el Textbox para que tenga el ancho de la frase más larga
	textbox.set({
		text: texto,
		width: maxWidth, // Usar el ancho calculado
		fontSize: propsImg.sizeTextValue || textbox.fontSize,
		fill: propsImg.colorTextValue || textbox.fill,
		backgroundColor: propsImg.backgroundTextValue || textbox.backgroundColor,
	})

	// Calcular la posición ajustada (usa tu función `calcTextPositionInflux`)
	const { left, top } = calculateTextPosition(propsImg, textbox)
	textbox.set({ left, top })
}
