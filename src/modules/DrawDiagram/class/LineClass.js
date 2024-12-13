export class LineDiagram {
	/**
	 * @param {Object} params - Parámetros para inicializar la instancia.
	 * @param {number} params.id - Identificador del texto.
	 * @param {Object} params.points - Objeto con los puntos {start:{left, top}, end:{left, top}}.
	 * @param {string} params.color - Color de linea principal.
	 * @param {number} params.width - Angulo del texto.
	 * @param {boolean} params.dobleLine - Angulo del texto.
	 * @param {string} params.colorSecondary - Color de linea secundaria.
	 * @param {boolean} params.animation - Estado de la animacion de la linea.
	 * @param {number} params.status - Estado del texto (1 para activo, 0 para inactivo).
	 * @param {string} params.text - Texto del texto.
	 * @param {number} params.sizeText - Tamaño del texto.
	 * @param {number} params.colorText - Color del texto.
	 * @param {string} params.backgroundText - Color de fondo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({
		id,
		points = { start: {}, end: {} },
		color = '#00ccff',
		width = 3,
		dobleLine = false,
		colorSecondary = '#000000',
		animation = false,
		status = 1,
		text = '',
		sizeText = 20,
		colorText = '#000000',
		backgroundText = '#ffffff',
	}) {
		if (!id || !points.start || !points.end) throw new Error('Debes pasar todo los parametros necesarios')
		Object.assign(this, {
			id,
			points,
			color,
			width,
			dobleLine,
			colorSecondary,
			animation,
			status,
			text,
			sizeText,
			colorText,
			backgroundText,
		})
	}

	/**
	 * Cambia el estado del texto a inactivo.
	 */
	delete() {
		this.status = 0
	}

	/**
	 * Establece los Puntos que componen la linea.
	 * @param {Object} points - Objeto con los puntos { start:{left, top}, end:{left, top} }.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setPoints(points) {
		this.points = points
	}

	/**
	 * Establece el color principal de la linea.
	 * @param {string} color - Nuevo color principal.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setColor(color) {
		this.color = color
	}

	/**
	 * Establece el ancho de la linea principal.
	 * @param {number} width - Nuevo tamaño.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setWidth(width) {
		this.width = width
	}

	/**
	 * Establece si se utilizara o no una linea secundaria.
	 * @param {boolean} status - Nuevo estado.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setActiveDobleLine(status) {
		this.dobleLine = status
	}

	/**
	 * Establece el color de la linea secundaria.
	 * @param {string} color - Nuevo Color para la linea secundaria.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setColorLineSecondary(color) {
		this.colorSecondary = color
	}

	/**
	 * Establece si la linea tiene animación.
	 * @param {boolean} status - Nuevo estado de activacion de la animación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setAnimation(status) {
		this.animation = status
	}

	/**
	 * Establece el nuevo texto.
	 * @param {string} text - Nuevo texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setText(text) {
		this.text = text
	}

	/**
	 * Establece el tamaño del texto.
	 * @param {number} size - Nuevo tamaño de texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setSizeText(size) {
		this.sizeText = size
	}

	/**
	 * Establece el color del texto.
	 * @param {string} color - Nuevo color de texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setColorText(color) {
		this.colorText = color
	}

	/**
	 * Cambia el color del fondo de texto.
	 * @param {string} color - Nuevo color de fondo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setBackgroundTextColor(color) {
		this.backgroundText = color
	}
}
