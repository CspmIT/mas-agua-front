export class PolylineDiagram {
	/**
	 * @param {Object} params - Parámetros para inicializar la instancia.
	 * @param {number} params.id - Identificador de la linea.
	 * @param {Array} params.points - Array de objetos con los puntos que componen la polylinea [{left, top},{left, top},...].
	 * @param {string} params.stroke - Color de linea principal.
	 * @param {number} params.strokeWidth - Angulo de la linea.
	 * @param {string} params.colorSecondary - Color de linea secundaria.
	 * @param {boolean} params.animation - Estado de la animacion de la linea.
	 * @param {boolean} params.invertAnimation - Sentido de la animación.
	 * @param {number} params.status - Estado de la linea (1 para activo, 0 para inactivo).
	 * @param {boolean} params.showText - Estado para mostrar el texto.
	 * @param {string} params.text - Texto de la linea.
	 * @param {number} params.sizeText - Tamaño del texto.
	 * @param {number} params.colorText - Color del texto.
	 * @param {string} params.backgroundText - Color de fondo.
	 * @param {string} params.locationText - Ubicación del texto respecto a la linea
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({
		id,
		points = [],
		stroke = '#000000',
		strokeWidth = 3,
		colorSecondary = '#000000',
		animation = false,
		invertAnimation = false,
		status = 1,
		showText = false,
		text = 'texto predeterminado',
		sizeText = 20,
		colorText = '#000000',
		backgroundText = '#ffffff',
		locationText = 'Top',
	}) {
		if (!id || points.length < 2) throw new Error('Debes pasar todo los parametros necesarios')
		Object.assign(this, {
			id,
			points,
			stroke,
			strokeWidth,
			colorSecondary,
			animation,
			invertAnimation,
			status,
			showText,
			text,
			sizeText,
			colorText,
			backgroundText,
			locationText,
		})
	}

	/**
	 * Cambia el estado de la linea a inactivo.
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
	setStroke(color) {
		this.stroke = color
	}

	/**
	 * Establece el ancho de la linea principal.
	 * @param {number} width - Nuevo tamaño.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setWidth(width) {
		this.strokeWidth = width
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
	 * Establece el Sentido de la animación.
	 * @param {boolean} status - Nuevo Sentido.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setInvertAnimation(status) {
		this.invertAnimation = status
	}

	/**
	 * Establece el estado para activar/desactivar el texto para la linea.
	 * @param {boolean} status - Nuevo estado.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setShowText(status) {
		this.showText = status
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
	 * Establece el tamaño de la linea.
	 * @param {number} size - Nuevo tamaño de texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setSizeText(size) {
		this.sizeText = size
	}

	/**
	 * Establece el color de la linea.
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

	/**
	 * Cambia la ubicación del texto con respecto a la línea.
	 * @param {string} ubi - Nuevo Ubicación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setLocationText(ubi) {
		this.locationText = ubi
	}
}
