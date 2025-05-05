import { LineAnimation, LineAppearance, LineText } from './LineClass'

// Define the core functionality for Polyline management
export class Polyline {
	/**
	 * @param {number} id - Identificador de la línea.
	 * @param {Array} points - Puntos que componen la línea [{left, top}, {left, top}, ...].
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({ id, points }) {
		if (!id || points.length < 2) {
			throw new Error('Debes pasar todo los parámetros necesarios')
		}
		this.id = id
		this.points = points
		this.status = 1
	}
	/**
	 * Cambia el estado de la polilínea a inactivo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	delete() {
		this.status = 0
	}
	/**
	 * Establece los puntos que componen la línea.
	 * @param {Array} points - Nuevos puntos de la línea.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setPoints(points) {
		this.points = points
	}
}

// Main PolylineDiagram class combining all functionalities
export class PolylineDiagram {
	/**
	 * @param {Object} params - Parámetros para inicializar PolylineDiagram.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor(params) {
		this.polyline = new Polyline(params)
		this.appearance = new LineAppearance(params)
		this.animation = new LineAnimation(params)
		this.text = new LineText(params)
	}

	setPoints(points) {
		this.polyline.points = points
	}

	/**
	 * Cambia el estado de la línea a inactivo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	delete() {
		this.polyline.status = 0
	}

	setShowText(status) {
		this.text.showText = status
	}

	setText(text) {
		this.text.text = text
	}

	setSizeText(size) {
		this.text.sizeText = size
	}

	setColorText(color) {
		this.text.colorText = color
	}

	setBackgroundTextColor(color) {
		this.text.backgroundText = color
	}

	setLocationText(location) {
		this.text.locationText = location
	}

	setAnimation(status) {
		this.animation.animation = status
	}

	setInvertAnimation(status) {
		this.animation.invertAnimation = status
	}

	/**
	 * Establece la variable relacionada al estado de la linea.
	 * @param {number} idVariable - Nuevo estado de la dirección de la animación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setVariable(idVariable) {
		this.animation.variable = idVariable
	}

	setStroke(color) {
		this.appearance.stroke = color
	}

	setWidth(width) {
		this.appearance.strokeWidth = width
	}

	setColorLineSecondary(color) {
		this.appearance.colorSecondary = color
	}
	/**
	 * Obtiene los datos de la polilinea para guardar.
	 * @returns {Object} - Datos del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	getDataSave() {
		return {
			id: typeof this.polyline.id == 'string' ? 0 : parseInt(this.polyline.id),
			status: this.polyline.status,
			points: this.polyline.points,
			stroke: this.appearance.stroke,
			strokeWidth: this.appearance.strokeWidth,
			colorSecondary: this.appearance.colorSecondary,
			animation: this.animation.animation,
			invertAnimation: this.animation.invertAnimation,
			showText: this.text.showText,
			text: this.text.text,
			sizeText: this.text.sizeText,
			colorText: this.text.colorText,
			backgroundText: this.text.backgroundText,
			locationText: this.text.locationText,
			id_influxvars: this.animation.variable,
		}
	}
}
