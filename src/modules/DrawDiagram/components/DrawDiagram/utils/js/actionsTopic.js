import { ImageDiagram, ImageTopic } from '../../../../class/ImageClass'
import { TextDiagram } from '../../../../class/TextClass'
import * as fabric from 'fabric'
import { calcWidthText } from './actions'

/**
 * Calcula la posición del texto en base a las propiedades del elemento al que está asociado.
 *
 * @param {Object} props - Propiedades del elemento (posición, tamaño, posición del texto).
 * @param {fabric.Textbox} text - Objeto de texto de Fabric.js.
 * @returns {Object} Coordenadas calculadas {left, top}.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const calcTextPositionInflux = (props, text) => {
	const { left: leftImg, top: topImg, width: widthImg, height: heightImg } = props
	let left = leftImg
	let top = topImg
	switch (props.valuePosition) {
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
			top = topImg - text.height - 20
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

export const createTextInflux = async (props, fabricCanvas) => {
	if (!fabricCanvas) return
	const newText = props
	let texto = props.field.map((item) => `${item.field} ${item.uni}`).join('\n') || 'Valores de Influx'
	const maxWidth = calcWidthText(texto, props.sizeTextValue)

	// texto = texto == '' ? 'Texto predeterminado' : texto
	const textbox = new fabric.Textbox(texto, {
		id: `${props.id}_text_influx`,
		left: props.left,
		top: props.top,
		fontSize: props.sizeTextValue || 20,
		fontFamily: 'Arial',
		width: maxWidth,
		fill: props.colorTextValue || '#000000',
		textAlign: 'center',
		backgroundColor: props.backgroundTextValue || 'white',
		editable: false,
		selectable: false,
		lockScalingX: true,
		lockScalingY: true,
		lockSkewingX: true,
		lockSkewingY: true,
	})
	if (props?.textPosition) {
		const { left, top } = calcTextPositionInflux(props, textbox)
		textbox.set({ left, top })
	}
	textbox.metadata = props
	textbox.metatype = 'Influx'
	// Agregar el textbox al canvas
	fabricCanvas.add(textbox)

	return newText
}

export const updateTextInflux = async (props, fabricCanvas, textbox) => {
	if (!props || !fabricCanvas || !textbox) return

	// Crear el texto dinámico
	const texto = props.field?.map((item) => `${item.field} ${item.uni}`).join('\n') || textbox.text
	const maxWidth = calcWidthText(texto, textbox.fontSize)

	// Ajustar el Textbox para que tenga el ancho de la frase más larga
	textbox.set({
		text: texto,
		width: maxWidth, // Usar el ancho calculado
		fontSize: props.sizeTextValue || textbox.fontSize,
		fill: props.colorTextValue || textbox.fill,
		backgroundColor: props.backgroundTextValue || textbox.backgroundColor,
	})

	// Calcular la posición ajustada (usa tu función `calcTextPositionInflux`)
	const { left, top } = calcTextPositionInflux(props, textbox)
	textbox.set({
		left,
		top,
	})

	// Renderizar cambios en el canvas
	fabricCanvas.renderAll()
}
