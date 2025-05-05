/**
 * Clase base Line para gestionar las propiedades principales de una línea.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
class Line {
	/**
	 * @param {Object} params - Parámetros para inicializar la línea.
	 * @param {number} params.id - Identificador de la línea.
	 * @param {Object} params.points - Objeto con los puntos {start: {left, top}, end: {left, top}}.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({ id, points }) {
		if (!id || !points?.start || !points?.end) {
			throw new Error('Debes pasar todos los parámetros necesarios')
		}
		this.id = id
		this.points = points
		this.status = 1 // Activo por defecto
	}

	/**
	 * Cambia el estado de la línea a inactivo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	delete() {
		this.status = 0
	}

	/**
	 * Establece los puntos de la línea.
	 * @param {Object} points - Objeto con los puntos {start: {left, top}, end: {left, top}}.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setPoints(points) {
		this.points = points
	}
}

// Define the appearance properties of the Polyline
export class LineAppearance {
	/**
	 * @param {Object} params - Parámetros para inicializar la línea.
	 * @param {string} params.stroke - Color principal de la línea.
	 * @param {number} params.strokeWidth - Ancho de la línea.
	 * @param {string} params.colorSecondary - Color secundario de la línea.
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

/**
 * Clase LineAnimation para gestionar las animaciones de la línea.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export class LineAnimation {
	/**
	 * @param {Object} params - Parámetros para la animación.
	 * @param {boolean} params.animation - Estado de la animación.
	 * @param {boolean} params.invertAnimation - Dirección de la animación.
	 * @param {number} params.variable - Variable de la línea.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({ animation = false, invertAnimation = false, variable = 0 }) {
		this.animation = animation
		this.invertAnimation = invertAnimation
		this.variable = variable
	}

	/**
	 * Establece si la línea tiene animación.
	 * @param {boolean} status - Nuevo estado de la animación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setAnimation(status) {
		this.animation = status
	}

	/**
	 * Establece la dirección de la animación.
	 * @param {boolean} status - Nuevo estado de la dirección de la animación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setInvertAnimation(status) {
		this.invertAnimation = status
	}

	/**
	 * Establece la variable relacionada al estado de la linea.
	 * @param {number} idVariable - Nuevo estado de la dirección de la animación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setVariable(idVariable) {
		this.variable = idVariable
	}
}

/**
 * Clase LineText para gestionar las propiedades relacionadas con el texto de la línea.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export class LineText {
	/**
	 * @param {Object} params - Parámetros para el texto de la línea.
	 * @param {boolean} params.showText - Determina si se muestra el texto.
	 * @param {string} params.text - Contenido del texto.
	 * @param {number} params.sizeText - Tamaño del texto.
	 * @param {string} params.colorText - Color del texto.
	 * @param {string} params.backgroundText - Color de fondo del texto.
	 * @param {string} params.locationText - Ubicación del texto respecto a la línea.
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
	 * Establece si se muestra el texto.
	 * @param {boolean} status - Nuevo estado de visibilidad del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setShowText(status) {
		this.showText = status
	}

	/**
	 * Establece el contenido del texto.
	 * @param {string} text - Nuevo contenido del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setText(text) {
		this.text = text
	}

	/**
	 * Establece el tamaño del texto.
	 * @param {number} size - Nuevo tamaño del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setSizeText(size) {
		this.sizeText = size
	}

	/**
	 * Establece el color del texto.
	 * @param {string} color - Nuevo color del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setColorText(color) {
		this.colorText = color
	}

	/**
	 * Cambia el color de fondo del texto.
	 * @param {string} color - Nuevo color de fondo del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setBackgroundTextColor(color) {
		this.backgroundText = color
	}

	/**
	 * Cambia la ubicación del texto respecto a la línea.
	 * @param {string} location - Nueva ubicación del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setLocationText(location) {
		this.locationText = location
	}
}

/**
 * Clase principal LineDiagram que compone las funcionalidades de Line, LineAnimation y LineText.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export class LineDiagram {
	/**
	 * @param {Object} params - Parámetros para inicializar LineDiagram.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor(params) {
		this.line = new Line(params)
		this.appearance = new LineAppearance(params)
		this.animation = new LineAnimation(params)
		this.text = new LineText(params)
	}

	/**
	 * Delegación de métodos de la clase Line.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	delete() {
		this.line.delete()
	}

	setPoints(points) {
		this.line.setPoints(points)
	}

	setStroke(color) {
		this.appearance.setStroke(color)
	}

	setWidth(width) {
		this.appearance.setWidth(width)
	}

	setColorLineSecondary(color) {
		this.appearance.setColorLineSecondary(color)
	}

	/**
	 * Delegación de métodos de la clase LineAnimation.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setAnimation(status) {
		this.animation.setAnimation(status)
	}

	setInvertAnimation(status) {
		this.animation.setInvertAnimation(status)
	}

	/**
	 * Establece la variable relacionada al estado de la linea.
	 * @param {number} idVariable - Nuevo estado de la dirección de la animación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setVariable(idVariable) {
		this.animation.variable = idVariable
	}

	/**
	 * Delegación de métodos de la clase LineText.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setShowText(status) {
		this.text.setShowText(status)
	}

	setText(text) {
		this.text.setText(text)
	}

	setSizeText(size) {
		this.text.setSizeText(size)
	}

	setColorText(color) {
		this.text.setColorText(color)
	}

	setBackgroundTextColor(color) {
		this.text.setBackgroundTextColor(color)
	}

	setLocationText(location) {
		this.text.setLocationText(location)
	}

	/**
	 * Obtiene los datos de la linea para guardar.
	 * @returns {Object} - Datos del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	getDataSave() {
		return {
			id: typeof this.line.id == 'string' ? 0 : parseInt(this.line.id),
			status: this.line.status,
			points: this.line.points,
			status: this.line.status,
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
