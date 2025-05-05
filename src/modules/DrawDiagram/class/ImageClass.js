/**
 * Clase que representa una imagen con posición, tamaño, y estado.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
class Image {
	/**
	 * Crea una instancia de la clase Image.
	 * @param {Object} params - Los parámetros para inicializar la imagen.
	 * @param {string} params.id - El ID único de la imagen.
	 * @param {string} params.name - El nombre de la imagen.
	 * @param {string} params.src - La fuente (URL) de la imagen.
	 * @param {number} params.left - La posición horizontal de la imagen.
	 * @param {number} params.top - La posición vertical de la imagen.
	 * @param {number} [params.angle=0] - El ángulo de rotación de la imagen.
	 * @param {number} params.width - El ancho de la imagen.
	 * @param {number} params.height - El alto de la imagen.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({ id, name, src, left, top, angle = 0, width, height }) {
		if (!id || !name || !src) throw new Error('Los parámetros id, name y src son obligatorios.')
		if (typeof left !== 'number' || typeof top !== 'number' || left < 0 || top < 0) {
			throw new Error('Los valores de posición deben ser números positivos.')
		}
		if (typeof width !== 'number' || typeof height !== 'number' || width <= 0 || height <= 0) {
			throw new Error('El ancho y alto deben ser números positivos mayores que cero.')
		}

		this.id = id
		this.name = name
		this.src = src
		this.position = { top, left }
		this.size = { width, height }
		this.angle = angle
		this.status = 1 // Activo
	}

	/**
	 * Cambio de nombre de la imagen.
	 * @param {string} name - Nuevo nombre.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	rename(name) {
		if (typeof name !== 'string' || name === '') {
			throw new Error('El nombre no es correcto.')
		}
		this.name = name
	}

	/**
	 * Mueve la imagen a una nueva posición.
	 * @param {number} top - La nueva posición vertical.
	 * @param {number} left - La nueva posición horizontal.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	move(top, left) {
		if (typeof top !== 'number' || typeof left !== 'number') {
			throw new Error('Los valores de posición deben ser números.')
		}
		this.position = { top, left }
	}

	/**
	 * Rota la imagen a un ángulo específico.
	 * @param {number} angle - El ángulo de rotación en grados.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	rotate(angle) {
		if (typeof angle !== 'number') throw new Error('El ángulo debe ser un número.')
		this.angle = angle
	}

	/**
	 * Redimensiona la imagen a un nuevo tamaño.
	 * @param {number} width - El nuevo ancho de la imagen.
	 * @param {number} height - El nuevo alto de la imagen.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	resize(width, height) {
		if (typeof width !== 'number' || typeof height !== 'number' || width <= 0 || height <= 0) {
			throw new Error('El ancho y alto deben ser números positivos mayores que cero.')
		}
		this.size = { width: Number(width.toFixed(2)), height: Number(height.toFixed(2)) }
	}

	/**
	 * Cambia el estado de la imagen a inactivo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	delete() {
		this.status = 0 // Inactivo
	}
}

/**
 * Clase que representa un texto asociado a una imagen.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
class ImageText {
	/**
	 * Crea una instancia de la clase ImageText.
	 * @param {Object} params - Los parámetros para inicializar el texto de la imagen.
	 * @param {string} [params.text=''] - El texto a mostrar.
	 * @param {number} [params.sizeText=20] - El tamaño del texto.
	 * @param {string} [params.colorText='#000000'] - El color del texto.
	 * @param {string} [params.backgroundText='#ffffff'] - El color de fondo del texto.
	 * @param {string} [params.textPosition='Top'] - La posición del texto en la imagen.
	 * @param {boolean} [params.statusText=0] - El estado del texto (activo o inactivo).
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({
		text = '',
		sizeText = 20,
		colorText = '#000000',
		backgroundText = '#ffffff',
		textPosition = 'Top',
		statusText = 0,
	}) {
		this.text = text
		this.sizeText = sizeText
		this.colorText = colorText
		this.backgroundText = backgroundText
		this.textPosition = textPosition
		this.statusText = statusText
	}

	/**
	 * Establece el texto de la imagen.
	 * @param {string} text - El nuevo texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setText(text) {
		if (typeof text !== 'string') throw new Error('El texto debe ser una cadena.')
		this.text = text
	}

	/**
	 * Establece el tamaño del texto.
	 * @param {number} size - El nuevo tamaño del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setSizeText(size) {
		if (typeof size !== 'number' || size <= 0) throw new Error('El tamaño del texto debe ser un número positivo.')
		this.sizeText = size
	}

	/**
	 * Establece el color del texto.
	 * @param {string} color - El nuevo color del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setColorText(color) {
		this.colorText = color
	}

	/**
	 * Establece el color de fondo del texto.
	 * @param {string} color - El nuevo color de fondo del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setBackgroundTextColor(color) {
		this.backgroundText = color
	}

	/**
	 * Establece la posición del texto.
	 * @param {string} position - La nueva posición del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setTextPosition(position) {
		this.textPosition = position
	}

	/**
	 * Establece el estado del texto (activo o inactivo).
	 * @param {boolean} status - El estado del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setStatusText(status) {
		if (![false, true].includes(status)) throw new Error('El estado debe ser false o true.')
		this.statusText = status
	}
}

/**
 * Clase que representa un conjunto de variables asociadas a la imagen.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
class ImageVariables {
	/**
	 * Crea una instancia de la clase ImageVariables.
	 * @param {Object} variables - Un objeto que contiene las variables.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor(variables = {}) {
		if (typeof variables !== 'object' || Array.isArray(variables)) {
			throw new Error('Las variables deben ser un objeto.')
		}
		this.variables = variables
	}

	/**
	 * Establece las variables asociadas a la imagen.
	 * @param {Object} variables - Un objeto con las variables a establecer.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setVariables(variables) {
		if (typeof variables !== 'object' || Array.isArray(variables)) {
			throw new Error('Las variables deben ser un objeto.')
		}
		this.variables = variables
	}

	getVariables() {
		const varCleaner = Object.keys(this.variables).reduce((acc, val) => {
			if (this.variables[val].id_variable !== 0 || this.variables[val].require) {
				acc[val] = this.variables[val]
			}
			return acc
		}, {})
		return varCleaner
	}
}

/**
 * Clase que representa el diagrama de imagen con texto y variables.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export class ImageDiagram {
	/**
	 * Crea una instancia de la clase ImageDiagram.
	 * @param {Object} params - Los parámetros para inicializar el diagrama de imagen.
	 * @param {string} params.id - El ID único de la imagen.
	 * @param {string} params.name - El nombre de la imagen.
	 * @param {string} params.src - La fuente (URL) de la imagen.
	 * @param {number} params.left - La posición horizontal de la imagen.
	 * @param {number} params.top - La posición vertical de la imagen.
	 * @param {number} params.angle - El ángulo de rotación de la imagen.
	 * @param {number} params.width - El ancho de la imagen.
	 * @param {number} params.height - El alto de la imagen.
	 * @param {string} params.text - El texto asociado a la imagen.
	 * @param {number} params.sizeText - El tamaño del texto.
	 * @param {string} params.colorText - El color del texto.
	 * @param {string} params.backgroundText - El color de fondo del texto.
	 * @param {string} params.textPosition - La posición del texto.
	 * @param {boolean} params.statusText - El estado del texto (activo o inactivo).
	 * @param {Object} params.variables - Un objeto con las variables asociadas.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor(params) {
		const {
			id,
			name,
			src,
			left,
			top,
			angle,
			width,
			height,
			text,
			sizeText,
			colorText,
			backgroundText,
			textPosition,
			statusText,
			variables,
		} = params

		this.image = new Image({ id, name, src, left, top, angle, width, height })
		this.text = new ImageText({ text, sizeText, colorText, backgroundText, textPosition, statusText })
		this.variables = new ImageVariables(variables)
	}

	/**
	 * Cambio de nombre de la imagen.
	 * @param {string} name - Nuevo nombre.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	rename(name) {
		if (typeof name !== 'string' || name === '') {
			throw new Error('El nombre no es correcto.')
		}
		this.image.rename = name
	}

	/**
	 * Mueve la imagen a una nueva posición.
	 * @param {number} top - La nueva posición vertical.
	 * @param {number} left - La nueva posición horizontal.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	move(top, left) {
		this.image.move(top, left)
	}

	/**
	 * Rota la imagen a un ángulo específico.
	 * @param {number} angle - El ángulo de rotación en grados.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	rotate(angle) {
		this.image.rotate(angle)
	}

	/**
	 * Redimensiona la imagen a un nuevo tamaño.
	 * @param {number} width - El nuevo ancho de la imagen.
	 * @param {number} height - El nuevo alto de la imagen.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	resize(width, height) {
		this.image.resize(width, height)
	}

	/**
	 * Cambia el estado de la imagen a inactivo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	delete() {
		this.image.delete()
	}

	/**
	 * Establece el texto de la imagen.
	 * @param {string} text - El nuevo texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setText(text) {
		this.text.setText(text)
	}

	/**
	 * Establece el tamaño del texto.
	 * @param {number} size - El nuevo tamaño del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setSizeText(size) {
		this.text.setSizeText(size)
	}

	/**
	 * Establece el color del texto.
	 * @param {string} color - El nuevo color del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setColorText(color) {
		this.text.setColorText(color)
	}

	/**
	 * Establece el color de fondo del texto.
	 * @param {string} color - El nuevo color de fondo del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setBackgroundTextColor(color) {
		this.text.setBackgroundTextColor(color)
	}

	/**
	 * Establece la posición del texto.
	 * @param {string} position - La nueva posición del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setTextPosition(position) {
		this.text.setTextPosition(position)
	}

	/**
	 * Establece el estado del texto (activo o inactivo).
	 * @param {boolean} status - El estado del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setStatusText(status) {
		this.text.setStatusText(status)
	}

	/**
	 * Establece las variables asociadas a la imagen.
	 * @param {Object} variables - Un objeto con las variables a establecer.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setVariables(variables) {
		this.variables.setVariables(variables)
	}

	/**
	 * Obtiene los datos de la imagen para guardar.
	 * @returns {Object} - Datos del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	getDataSave() {
		return {
			id: typeof this.image.id == 'string' ? 0 : parseInt(this.image.id),
			name: this.image.name,
			src: this.image.src,
			status: this.image.status,
			left: this.image.position.left,
			top: this.image.position.top,
			angle: this.image.angle,
			width: this.image.size.width,
			height: this.image.size.height,
			text: this.text.text,
			sizeText: this.text.sizeText,
			colorText: this.text.colorText,
			backgroundText: this.text.backgroundText,
			textPosition: this.text.textPosition,
			statusText: this.text.statusText,
			variables: this.variables.getVariables(),
		}
	}
}
