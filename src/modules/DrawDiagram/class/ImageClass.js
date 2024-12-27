export class ImageDiagram {
	/**
	 * @param {Object} params - Parámetros para inicializar la instancia.
	 * @param {number} params.id - Identificador de la imagen.
	 * @param {string} params.name - Nombre de la imagen.
	 * @param {string} params.src - URL de la imagen.
	 * @param {number} params.left - Posición horizontal de la imagen.
	 * @param {number} params.top - Posición vertical de la imagen.
	 * @param {number} params.angle - Angulo de la imagen.
	 * @param {number} params.width - Ancho de la imagen.
	 * @param {number} params.height - Alto de la imagen.
	 * @param {string|number} params.value - Valor asociado al diagrama (puede ser string o número).
	 * @param {number} params.status - Estado de la imagen (1 para activo, 0 para inactivo).
	 * @param {number} params.statusText - Estado del texto (1 para activo, 0 para inactivo).
	 * @param {string} params.text - Texto de la imagen.
	 * @param {number} params.sizeText - Tamaño del texto de la imagen.
	 * @param {number} params.colorText - Color del texto de la imagen.
	 * @param {string} params.backgroundText - Color o texto de fondo.
	 * @param {string} params.textPosition - Ubicación del titulo/texto que querramos en la imagen
	 * @param {object} params.variables - Objeto con las variables necesarias para mostrar
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({
		id,
		name,
		src,
		left,
		top,
		angle = 0,
		width,
		height,
		status = 1,
		statusText = 0,
		text = '',
		sizeText = 20,
		colorText = '#000000',
		backgroundText = '#ffffff',
		textPosition = 'Top',
		variables = {},
	}) {
		if (!id || !name || !src || !left || !top || !width || !height)
			throw new Error('Debes pasar todo los parametros necesarios')
		Object.assign(this, {
			id,
			name,
			src,
			left,
			top,
			angle,
			width,
			height,
			status,
			statusText,
			text,
			sizeText,
			colorText,
			backgroundText,
			textPosition,
			variables,
		})
	}

	/**
	 * Cambia el estado de la imagen a inactivo.
	 */
	delete() {
		this.status = 0
	}

	/**
	 * Mueve  la imagen a una nueva posición.
	 * @param {number} top - Nueva posición vertical.
	 * @param {number} left - Nueva posición horizontal.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	move(top, left) {
		this.top = top
		this.left = left
	}

	/**
	 * Rota  la imagen a una nueva posición.
	 * @param {number} angle - Angulo de rotación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	rotate(angle) {
		this.angle = angle
	}

	/**
	 * Cambia el tamaño de la imagen.
	 * @param {number} width - Nuevo ancho de la imagen.
	 * @param {number} height - Nuevo alto de la imagen.
	 * @throws {Error} Si el ancho o el alto son menores o iguales a cero.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	resize(width, height) {
		if (width <= 0 || height <= 0) {
			throw new Error('El ancho y alto deben ser mayores que cero.')
		}
		this.width = parseFloat(width.toFixed(2))
		this.height = parseFloat(height.toFixed(2))
	}

	/**
	 * Cambia el nombre de la imagen.
	 * @param {string} name - Nuevo nombre de la imagen.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setName(name) {
		this.name = name
	}

	/**
	 * Cambia el estado del texto.
	 * @param {number} status - Nuevo estado del texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setStatusText(status) {
		this.statusText = status
	}

	/**
	 * Establece el texto de la imagen.
	 * @param {string} text - Nuevo texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setText(text) {
		this.text = text
	}

	/**
	 * Establece el tamaño del texto de la imagen.
	 * @param {number} size - Nuevo tamaño de texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setSizeText(size) {
		this.sizeText = size
	}

	/**
	 * Establece el color del texto de la imagen.
	 * @param {string} color - Nuevo color de texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setColorText(color) {
		this.colorText = color
	}

	/**
	 * Cambia el color del texto de fondo.
	 * @param {string} color - Nuevo color de fondo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setBackgroundTextColor(color) {
		this.backgroundText = color
	}

	/**
	 * Cambia la ubicación del texto.
	 * @param {string} ubi - Nueva ubicación.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setTextPosition(ubi) {
		this.textPosition = ubi
	}

	/**
	 * Definimos las variables para la imagen.
	 * @param {object} variable - Nueva variable
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setVariables(variable) {
		this.variables = variable
	}

	/**
	 * Devuelve la posición actual de la imagen.
	 * @returns {{top: number, left: number}} Objeto con la posición actual.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	getUbication() {
		return { top: this.top, left: this.left }
	}

	/**
	 * Devuelve el tamaño actual de la imagen.
	 * @returns {{width: number, height: number}} Objeto con el tamaño actual.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	getSize() {
		return { width: this.width, height: this.height }
	}

	/**
	 * Devuelve el texto de la imagen.
	 * @returns {string} El texto de la imagen.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	getText() {
		return this.text
	}

	/**
	 * Convierte una instancia de ImageDiagram en una instancia de ImageTopic.
	 * @param {ImageDiagram} image - Instancia de ImageDiagram.
	 * @param {number} params.statusTopic - Tema de la imagen.
	 * @param {string} params.topic - Topico de la imagen.
	 * @param {string} params.typeSensor - Tipo de sensor que va a ser esta imagen (Analogico o Binario)
	 * @param {Array} params.optionValue - Aray donde se van a pasar los parametros del sensor de tipo binario.
	 * @param {Array} params.field - Array donde vas a estar todo los fields para la consulta en influx.
	 * @param {boolean} params.showValue - Estado para saber si se muestra o no el valor del dato de influx.
	 * @param {string} params.valuePosition - Ubicación del texto del valor, que se mostrara en caso de estar habilitado.
	 * @param {number} params.sizeTextValue - Tamaño del texto del valor, que se mostrara en caso de estar habilitado.
	 * @param {string} params.colorTextValue - Color del texto del valor, que se mostrara en caso de estar habilitado.
	 * @param {string} params.backgroundTextValue - Color de fondo del texto del valor, que se mostrara en caso de estar habilitado.
	 * @param {number} params.startValueRange - Rango inicial.
	 * @param {number} params.startUniRange - Rango final.
	 * @returns {ImageTopic} Nueva instancia de ImageTopic.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	static convertToImageTopic(
		image,
		{
			statusTopic = 1,
			topic = '',
			typeSensor = '',
			optionValue = [],
			field = [],
			showValue = false,
			valuePosition = 'Top',
			sizeTextValue = 20,
			colorTextValue = '#000000',
			backgroundTextValue = '#ffffff',
			startValueRange = '1',
			startUniRange = 'm',
		}
	) {
		return new ImageTopic({
			...image,
			statusTopic,
			topic,
			typeSensor,
			optionValue,
			field,
			showValue,
			valuePosition,
			sizeTextValue,
			colorTextValue,
			backgroundTextValue,
			startValueRange,
			startUniRange,
		})
	}
}

export class ImageTopic extends ImageDiagram {
	/**
	 * @param {Object} params - Parámetros para inicializar la instancia.
	 * @param {number} params.id - Identificador de la imagen.
	 * @param {string} params.name - Nombre de la imagen.
	 * @param {string} params.src - URL de la imagen.
	 * @param {number} params.left - Posición horizontal de la imagen.
	 * @param {number} params.top - Posición vertical de la imagen.
	 * @param {number} params.angle - Angulo de la imagen.
	 * @param {number} params.width - Ancho de la imagen.
	 * @param {number} params.height - Alto de la imagen.
	 * @param {number} params.status - Estado de la imagen (1 o 0).
	 * @param {number} params.statusText - Estado del texto (1 para activo, 0 para inactivo).
	 * @param {string} params.text - Texto de la imagen.
	 * @param {number} params.sizeText - Tamaño del texto de la imagen.
	 * @param {string} params.colorText - Color del texto de la imagen.
	 * @param {string} params.backgroundText - Color de fondo del texto .
	 * @param {string} params.textPosition - Ubicación del titulo/texto que querramos en la imagen
	 * @param {boolean} params.animation - Valor para indicar si la imagen tiene activa o no animación
	 * @param {number} params.statusTopic - Tema de la imagen.
	 * @param {string} params.topic - Topico de la imagen.
	 * @param {string} params.typeSensor - Tipo de sensor que va a ser esta imagen (Analogico o Binario)
	 * @param {Array} params.optionValue - Aray donde se van a pasar los parametros del sensor de tipo binario.
	 * @param {Array} params.field - Array donde vas a estar todo los fields para la consulta en influx.
	 * @param {boolean} params.showValue - Estado para saber si se muestra o no el valor del dato de influx.
	 * @param {string} params.valuePosition - Ubicación del texto del valor, que se mostrara en caso de estar habilitado.
	 * @param {number} params.sizeTextValue - Tamaño del texto del valor, que se mostrara en caso de estar habilitado.
	 * @param {string} params.colorTextValue - Color del texto del valor, que se mostrara en caso de estar habilitado.
	 * @param {string} params.backgroundTextValue - Color de fondo del texto del valor, que se mostrara en caso de estar habilitado.
	 * @param {number} params.startValueRange - Rango inicial.
	 * @param {number} params.startUniRange - Rango final.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	constructor({
		id,
		name,
		src,
		left,
		top,
		angle = 0,
		width,
		height,
		value = 0,
		status = 1,
		statusText = 0,
		text = '',
		sizeText = 20,
		colorText = '#000000',
		backgroundText = '#ffffff',
		textPosition = 'Top',
		animation = false,
		statusTopic = 0,
		topic = '',
		typeSensor = '',
		optionValue = [],
		field = [],
		showValue = false,
		valuePosition = 'Top',
		sizeTextValue = 20,
		colorTextValue = '#000000',
		backgroundTextValue = '#ffffff',
		// startValueRange = '1',
		// startUniRange = 'm',
	}) {
		if (!id || !name || !src || !left || !top || !width || !height)
			throw new Error('Debes pasar todo los parametros necesarios')

		super({
			id,
			name,
			src,
			left,
			top,
			angle,
			width,
			height,
			value,
			status,
			statusText,
			text,
			sizeText,
			colorText,
			backgroundText,
			textPosition,
			animation,
		})
		Object.assign(this, {
			statusTopic,
			topic,
			typeSensor,
			optionValue,
			field,
			showValue,
			valuePosition,
			sizeTextValue,
			colorTextValue,
			backgroundTextValue,
			// startValueRange,
			// startUniRange,
		})
	}

	/**
	 * Establece el topico para la consulta a influx.
	 * @param {string} topic - Nuevo topico.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setStatusTopic(status) {
		this.statusTopic = status
	}

	/**
	 * Establece el topico para la consulta a influx.
	 * @param {string} topic - Nuevo topico.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setTopic(topic) {
		this.topic = topic
	}

	/**
	 * Establece el tipo de sensor.
	 * @param {string} type - Nuevo tipo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setTypeSensor(type) {
		this.typeSensor = type
	}

	/**
	 * Establece en un Array los parametros para el sensor.
	 * @param {Array} options - Nuevo array.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setOptionsValue(options) {
		this.optionValue = options
	}

	/**
	 * Establece el estado de la visualizacion del dato obtenido de Influx.
	 * @param {boolean} status - Estado de visualizacion.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setShowValue(status) {
		this.showValue = status
	}

	/**
	 * Establece la ubicación del dato obtenido de Influx.
	 * @param {string} position - Ubicación del valor.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setPositionValue(position) {
		this.valuePosition = position
	}

	/**
	 * Establece el tamaño del texto del valor de influx.
	 * @param {number} size - Nuevo tamaño de texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setSizeTextValue(size) {
		this.sizeTextValue = size
	}

	/**
	 * Establece el color del texto del valor de influx.
	 * @param {string} color - Nuevo color de texto.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setColorTextValue(color) {
		this.colorTextValue = color
	}

	/**
	 * Cambia el color de fondo del texto ( valor ).
	 * @param {string} color - Nuevo color de fondo.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setBackgroundTextValue(color) {
		this.backgroundTextValue = color
	}

	// /**
	//  * Establece el valor para el rango inicial de la consulta.
	//  * @param {number} value - Nuevo valor para el rango inicial de la consulta.
	//  * @author Jose Romani <jose.romani@hotmail.com>
	//  */
	// setStartValueRange(value) {
	// 	this.startValueRange = value
	// }

	// /**
	//  * Establece una unidad para el rango inicial de la consulta.
	//  * @param {string} uni - Nueva unidad para rango inicial de la consulta.
	//  * @author Jose Romani <jose.romani@hotmail.com>
	//  */
	// setStartUniRange(uni) {
	// 	this.startUniRange = uni
	// }

	/**
	 * Establece el fields para la consulta.
	 * @param {string} field - Nuevo field.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	setField(field) {
		this.field = field
	}

	/**
	 * Devuelve los datos para completar la query para influx.
	 * @returns {{topic: string, field: Array, finishRange: string, startRange: string}} Objeto con el topico, fields, rando de inicio y de fin.
	 * @author Jose Romani <jose.romani@hotmail.com>
	 */
	getTopicData() {
		return { topic: this.topic, field: this.field, finishRange: this.finishRange, startRange: this.startRange }
	}
}
