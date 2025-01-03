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

// Define the appearance properties of the Polyline
export class PolylineAppearance {
	/**
	 * @param {string} stroke - Color principal de la línea.
	 * @param {number} strokeWidth - Ancho de la línea.
	 * @param {string} colorSecondary - Color secundario de la línea.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({ stroke = '#000000', strokeWidth = 3, colorSecondary = '#000000' }) {
		this.stroke = stroke
		this.strokeWidth = strokeWidth
		this.colorSecondary = colorSecondary
	}

	/**
	 * Establece el color principal de la línea.
	 * @param {string} color - Nuevo color principal.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setStroke(color) {
		this.stroke = color
	}

	/**
	 * Establece el ancho de la línea.
	 * @param {number} width - Nuevo ancho.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setWidth(width) {
		this.strokeWidth = width
	}

	/**
	 * Establece el color secundario de la línea.
	 * @param {string} color - Nuevo color secundario.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setColorLineSecondary(color) {
		this.colorSecondary = color
	}
}

// Define the animation properties of the Polyline
export class PolylineAnimation {
	/**
	 * @param {boolean} animation - Estado de la animación de la línea.
	 * @param {boolean} invertAnimation - Sentido de la animación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({ animation = false, invertAnimation = false }) {
		this.animation = animation
		this.invertAnimation = invertAnimation
	}

	/**
	 * Activa o desactiva la animación de la línea.
	 * @param {boolean} status - Nuevo estado de la animación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setAnimation(status) {
		this.animation = status
	}

	/**
	 * Cambia el sentido de la animación.
	 * @param {boolean} status - Nuevo sentido de la animación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setInvertAnimation(status) {
		this.invertAnimation = status
	}
}

// Define the text properties of the Polyline
export class PolylineText {
	/**
	 * @param {boolean} showText - Indica si se muestra el texto.
	 * @param {string} text - Texto de la línea.
	 * @param {number} sizeText - Tamaño del texto.
	 * @param {string} colorText - Color del texto.
	 * @param {string} backgroundText - Color de fondo del texto.
	 * @param {string} locationText - Ubicación del texto respecto a la línea.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({
		showText = false,
		text = 'texto predeterminado',
		sizeText = 20,
		colorText = '#000000',
		backgroundText = '#ffffff',
		locationText = 'Top',
	}) {
		this.showText = showText
		this.text = text
		this.sizeText = sizeText
		this.colorText = colorText
		this.backgroundText = backgroundText
		this.locationText = locationText
	}

	/**
	 * Cambia el estado de mostrar el texto.
	 * @param {boolean} status - Nuevo estado.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setShowText(status) {
		this.showText = status
	}

	/**
	 * Cambia el texto de la línea.
	 * @param {string} text - Nuevo texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setText(text) {
		this.text = text
	}

	/**
	 * Cambia el tamaño del texto.
	 * @param {number} size - Nuevo tamaño.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setSizeText(size) {
		this.sizeText = size
	}

	/**
	 * Cambia el color del texto.
	 * @param {string} color - Nuevo color del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setColorText(color) {
		this.colorText = color
	}

	/**
	 * Cambia el color de fondo del texto.
	 * @param {string} color - Nuevo color de fondo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setBackgroundTextColor(color) {
		this.backgroundText = color
	}

	/**
	 * Cambia la ubicación del texto respecto a la línea.
	 * @param {string} location - Nueva ubicación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setLocationText(location) {
		this.locationText = location
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
		this.appearance = new PolylineAppearance(params)
		this.animation = new PolylineAnimation(params)
		this.text = new PolylineText(params)
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
			id: parseInt(this.polyline.id),
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
		}
	}
}
