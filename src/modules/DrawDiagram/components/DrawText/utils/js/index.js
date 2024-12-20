import { TextDiagram } from '../../../../class/TextClass'
import { calcWidthText } from '../../../DrawDiagram/utils/js/actions'
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
export const newText = (fabricCanvasRef, left, top, changeTool, setSelectedObject) => {
	const fabricCanvas = fabricCanvasRef?.current
	if (!fabricCanvas) return

	const id = Math.random().toString(36).substring(2, 9)
	// Crear las propiedades iniciales del texto
	const textnew = new TextDiagram({
		id: id,
		left: left,
		top: top,
		text: 'Escriba en la caja de config',
	})
	const texto = textnew?.text || 'Texto predeterminado'
	const maxWidth = calcWidthText(texto, textnew.sizeText || 20)
	const textbox = new fabric.Textbox(texto, {
		id: `${textnew.id}`,
		left: textnew.left ?? left ?? 0,
		top: textnew.top ?? top ?? 0,
		fontSize: textnew.sizeText || 20,
		width: maxWidth,
		fill: textnew.colorText || '#000000',
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
		textbox.metadata.move(textbox.metadata.top, textbox.metadata.left)
	})
	textbox.on('rotating', () => {
		textbox.metadata.rotate(textbox.metadata.angle)
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
