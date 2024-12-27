export class TextDiagram {
	/**
	 * @param {Object} params - Parámetros para inicializar la instancia.
	 * @param {number} params.id - Identificador del texto.
	 * @param {number} params.left - Posición horizontal del texto.
	 * @param {number} params.top - Posición vertical del texto.
	 * @param {number} params.angle - Angulo del texto.
	 * @param {number} params.status - Estado del texto (1 para activo, 0 para inactivo).
	 * @param {string} params.text - Texto del texto.
	 * @param {number} params.sizeText - Tamaño del texto.
	 * @param {number} params.colorText - Color del texto.
	 * @param {string} params.backgroundText - Color de fondo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({
		id,
		left,
		top,
		angle = 0,
		status = 1,
		text = '',
		sizeText = 20,
		colorText = '#000000',
		backgroundText = '#ffffff',
	}) {
		if (!id || !left || !top) throw new Error('Debes pasar todo los parametros necesarios')
		Object.assign(this, { id, left, top, angle, status, text, sizeText, colorText, backgroundText })
	}

	/**
	 * Cambia el estado del texto a inactivo.
	 */
	delete() {
		this.status = 0
	}

	/**
	 * Mueve el texto a una nueva posición.
	 * @param {number} top - Nueva posición vertical.
	 * @param {number} left - Nueva posición horizontal.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	move(top, left) {
		this.top = top
		this.left = left
	}

	/**
	 * Rota el texto a una nueva posición.
	 * @param {number} angle - Angulo de rotación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	rotate(angle) {
		this.angle = angle
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

	/**
	 * Devuelve la posición actual del texto.
	 * @returns {{top: number, left: number}} Objeto con la posición actual.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	static getUbication() {
		return { top: this.top, left: this.left }
	}

	/**
	 * Devuelve el tamaño actual del texto.
	 * @returns {{width: number, height: number}} Objeto con el tamaño actual.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	static getSize() {
		return { width: this.width, height: this.height }
	}

	/**
	 * Devuelve el texto .
	 * @returns {string} El texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	static getText() {
		return this.text
	}
}
