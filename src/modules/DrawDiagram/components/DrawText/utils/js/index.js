import { TextDiagram } from '../../../../class/TextClass'
import { calcWidthText } from '../../../../utils/js/drawActions'
import * as fabric from 'fabric'
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
export const newText = (fabricCanvasRef, data, changeTool, setSelectedObject) => {
	const fabricCanvas = fabricCanvasRef?.current
	if (!fabricCanvas) return
	const id = data.id || Math.random().toString(36).substring(2, 9)
	if (fabricCanvas.getObjects('textbox').find((obj) => obj.id == id)) return false
	// Crear las propiedades iniciales del texto
	const variable = data?.id_influxvars ? { variable: data.id_influxvars } : {}
	const textnew = new TextDiagram({
		id: data.id || id,
		...variable,
		left: data.left,
		top: data.top,
		text: data.text || 'Escriba en la caja de config',
		sizeText: data.sizeText || 20,
		colorText: data.colorText || '#000000',
		backgroundText: data.backgroundText || 'white',
	})
	// const texto = textnew?.text || 'Texto predeterminado'
	const maxWidth = calcWidthText(textnew.text, textnew.sizeText || 20)
	const textbox = new fabric.Textbox(textnew.text, {
		id: `${textnew.id}`,
		left: textnew.left ?? left ?? 0,
		top: textnew.top ?? top ?? 0,
		fontSize: textnew.sizeText || 20,
		width: maxWidth,
		fill: textnew.colorText,
		fontFamily: 'Arial',
		textAlign: 'center',
		backgroundColor: textnew.backgroundText || 'white',
		editable: false,
		selectable: true,
		lockScalingX: true,
		lockScalingY: true,
		lockSkewingX: true,
		lockSkewingY: true,
	})

	textbox.metadata = textnew

	textbox.on('selected', () => {
		changeTool(null)
		setSelectedObject(textnew)
	})

	textbox.on('moving', () => {
		textbox.metadata.move(textbox.top, textbox.left)
	})

	textbox.on('rotating', () => {
		textbox.metadata.rotate(textbox.angle)
	})

	// Agregar el textbox al canvas
	fabricCanvas.add(textbox)
	fabricCanvas.setActiveObject(textbox)
	fabricCanvas.renderAll()
}

/**
 * Edita un textbox existente en el canvas utilizando Fabric.js.
 *
 * @param {Object} propsText - Propiedades actualizadas del texto.
 * @param {fabric.Canvas} fabricCanvas - Canvas de Fabric.js.
 * @param {fabric.Textbox} textbox - Objeto textbox existente.
 * @returns {Promise<fabric.Textbox>} Objeto de texto actualizado.
 */
export const editText = async (propsText, fabricCanvasRef) => {
	const fabricCanvas = fabricCanvasRef?.current
	if (!propsText || !fabricCanvas) return
	// Actualizar las propiedades del textbox
	const maxWidth = calcWidthText(propsText.text, propsText.sizeText)
	console.log(propsText)
	const textbox = fabricCanvas.getObjects('textbox').find((obj) => obj.id === propsText.id)
	textbox.set({
		text: propsText.text,
		width: maxWidth,
		fontSize: propsText.sizeText,
		fill: propsText.colorText,
		backgroundColor: propsText.backgroundText,
	})
	// Renderizar cambios en el canvas
	fabricCanvas.renderAll()
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
export const viewText = async (canvas, data) => {
	if (!canvas) return
	const id = data.id || Math.random().toString(36).substring(2, 9)
	if (canvas.getObjects('textbox').find((obj) => obj.id == id)) return false
	// Crear las propiedades iniciales del texto
	const variable = data?.id_influxvars ? { variable: data.id_influxvars } : {}
	const textnew = new TextDiagram({
		id: data.id || id,
		...variable,
		left: data.left,
		top: data.top,
		text: data.text || 'Escriba en la caja de config',
		sizeText: data.sizeText || 20,
		colorText: data.colorText || '#000000',
		backgroundText: data.backgroundText || 'white',
	})
	// const texto = textnew?.text || 'Texto predeterminado'
	const maxWidth = calcWidthText(textnew.text, textnew.sizeText || 20)
	const textbox = new fabric.Textbox(textnew.text, {
		id: `${textnew.id}`,
		left: textnew.left ?? left ?? 0,
		top: textnew.top ?? top ?? 0,
		fontSize: textnew.sizeText || 20,
		width: maxWidth,
		fill: textnew.colorText,
		fontFamily: 'Arial',
		textAlign: 'center',
		backgroundColor: textnew.backgroundText || 'white',
		editable: false,
		selectable: false,
	})

	textbox.metadata = textnew

	// Agregar el textbox al canvas
	canvas.add(textbox)
	canvas.renderAll()
}
