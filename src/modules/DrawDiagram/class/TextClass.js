/**
 * Clase base para representar atributos de un texto.
 * @abstract
 * @author Jose Romani <jose.romani@hotmail.com>
 */
class TextAttributes {
	/**
	 * @param {number} id - Identificador del texto.
	 * @param {number} left - Posición horizontal.
	 * @param {number} top - Posición vertical.
	 * @param {number} angle - Ángulo del texto.
	 * @param {number} status - Estado del texto.
	 * @param {string} text - Contenido del texto.
	 * @param {number} sizeText - Tamaño del texto.
	 * @param {string} colorText - Color del texto.
	 * @param {string} backgroundText - Fondo del texto.
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
		variable = '',
	}) {
		if (!id || left === undefined || top === undefined) {
			throw new Error('Debes pasar todos los parámetros necesarios')
		}
		Object.assign(this, { id, left, top, angle, status, text, sizeText, colorText, backgroundText, variable })
	}
}

/**
 * Clase para manipular y gestionar las operaciones del texto.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
class TextOperations extends TextAttributes {
	/**
	 * Cambia el estado del texto a inactivo.
	 * @author Jose Romani <jose.romani@hotmail.com>
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
	 * @param {number} angle - Ángulo de rotación.
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
	 * Establece la variable relacionada al estado de la linea.
	 * @param {number} idVariable - Nuevo estado de la dirección de la animación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setVariable(variable) {
		this.variable = variable
	}

	/**
	 * Obtiene los datos del texto para guardar.
	 * @returns {Object} - Datos del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	getDataSave() {
		return {
			id: typeof this.id == 'string' ? 0 : parseInt(this.id),
			left: this.left,
			top: this.top,
			angle: this.angle,
			status: this.status,
			text: this.text,
			sizeText: this.sizeText,
			colorText: this.colorText,
			backgroundText: this.backgroundText,
			id_influxvars: this.variable,
		}
	}
}

/**
 * Clase principal que combina atributos y operaciones del texto.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export class TextDiagram extends TextOperations {
	/**
	 * @param {Object} params - Parámetros para inicializar la instancia.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor(params) {
		super(params)
	}
}
