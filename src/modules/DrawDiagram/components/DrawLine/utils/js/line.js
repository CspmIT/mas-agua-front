import * as fabric from 'fabric'
import { calcWidthText } from '../../../../utils/js/drawActions'
import { LineDiagram } from '../../../../class/LineClass'
import { invertHexColor } from '../../../ToolsCanvas/utils/js'
let points = []
/**
 * Dibuja una línea en el canvas de Fabric.js al hacer clic.
 * La función maneja dos clics: el primero crea una línea temporal, el segundo finaliza la línea y la agrega al canvas.
 *
 * @param {Object} click - Objeto con las coordenadas del clic.
 * @param {React.RefObject} fabricCanvasRef - Referencia al canvas de Fabric.js.
 * @param {Function} changeTool - Función para cambiar la herramienta activa.
 * @param {Function} setSelectedObject - Función para establecer el objeto seleccionado en el canvas.
 * @returns {fabric.Line} Línea creada en el canvas.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const drawLine = async (click, fabricCanvasRef, changeTool, setSelectedObject) => {
	if (click) {
		const canvas = fabricCanvasRef.current
		const { x, y } = click
		const handleEscape = async (e) => {
			if (e.key === 'Escape') {
				deleteLineTemp(canvas)
				canvas?.set({ defaultCursor: 'default' })
				points = []
				window.removeEventListener('keydown', handleEscape)
			}
		}

		window.addEventListener('keydown', handleEscape)
		// Manejo del primer clic: inicializa la línea temporal
		const id = Math.random().toString(36).substring(2, 9)
		const tempLine = new fabric.Line([x, y, x, y], {
			id: `temp_line_${id}`,
			stroke: 'black',
			strokeWidth: 2,
			selectable: false,
		})
		if (!points.length) {
			// Crea una línea temporal
			canvas.add(tempLine)
			canvas.renderAll()

			canvas.on('mouse:move', handleMouseMove(tempLine, fabricCanvasRef))
			points.push(x, y)
			return false
		}
		// const [start] = prevPointer
		points.push(x, y)
		// CREACION DE LA LINEA FINAL
		const finalLine = createLine(points, fabricCanvasRef, setSelectedObject, changeTool, id)

		//ELIMINO LA LINEA TEMPORAL
		deleteLineTemp(canvas)

		//ELIMINO LA FUNCION DE MOVIMIENTO DEL MOUSE QUE MOVIA LA LINEA TEMPORAL
		canvas.off('mouse:move')

		// SELECCIONAMOS LA LINEA QUE SE TERMINO DE CREAR PARA MODIFICAR LOS PARAMETROS
		canvas.setActiveObject(finalLine)

		// CAMBIO EL CURSOR PARA QUE NO PAREZCA QUE SEGUIMOS CREANDO LINEAS
		canvas?.set({ defaultCursor: 'default' })

		// VOLVEMOS A ACTIVAR LA FUNCION DE SELECCION A TODO LOS OBJETOS
		canvas?.getObjects().forEach((obj) => (obj.selectable = true))
		points = []
	}
}

export const createLine = (points, fabricCanvasRef, setSelectedObject, changeTool, data) => {
	const canvas = fabricCanvasRef.current
	const id = data?.id || data
	if (canvas.getObjects('line').find((obj) => obj.id == id)) return false
	const finalLine = new fabric.Line(points, {
		id: id,
		stroke: data.stroke || 'black',
		strokeWidth: data.strokeWidth || 2,
		hasControls: false,
		hasBorders: false,
		selectable: true,
		perPixelTargetFind: true,
		targetFindTolerance: 20,
	})
	const variable = data?.id_influxvars ? { variable: data.id_influxvars } : {}
	finalLine.metadata = new LineDiagram({
		...data,
		...variable,
		id: finalLine.id,
		points: getPointsLine(finalLine),
	})

	// Crear puntos movibles para los extremos de la línea
	const startCircle = new fabric.Circle({
		id: `${id}_start`,
		left: points[0],
		top: points[1],
		radius: 8,
		fill: 'blue',
		originX: 'center',
		originY: 'center',
		hasControls: false,
		hasBorders: false,
		selectBack: true,
	})

	const endCircle = new fabric.Circle({
		id: `${id}_end`,
		left: points[2],
		top: points[3],
		radius: 8,
		fill: 'red',
		originX: 'center',
		originY: 'center',
		hasControls: false,
		hasBorders: false,
		selectable: true,
	})
	startCircle.visible = false
	endCircle.visible = false
	canvas.add(startCircle)
	canvas.add(endCircle)
	addCircleListeners(finalLine, fabricCanvasRef)
	addLineListeners(finalLine, fabricCanvasRef, setSelectedObject, changeTool)
	canvas.add(finalLine)
	if (data?.animation) {
		animationDobleLine(canvas, data.id)
	}
	if (data?.showText) {
		addTextLine(finalLine.metadata, fabricCanvasRef)
	}
	return finalLine
}

const addCircleListeners = (line, fabricCanvasRef) => {
	const canvas = fabricCanvasRef.current
	const startCircle = canvas.getObjects('circle').find((obj) => obj.id == line.id + '_start')
	const endCircle = canvas.getObjects('circle').find((obj) => obj.id == line.id + '_end')
	startCircle.on('moving', (e) => {
		startCircle.visible = true
		endCircle.visible = true
		updateLineMoveCircle(e, fabricCanvasRef)
		canvas.renderAll()
	})
	endCircle.on('moving', (e) => {
		startCircle.visible = true
		endCircle.visible = true
		updateLineMoveCircle(e, fabricCanvasRef)
		canvas.renderAll()
	})
	startCircle.on('deselected', (e) => {
		startCircle.visible = false
		endCircle.visible = false
	})
	endCircle.on('deselected', (e) => {
		startCircle.visible = false
		endCircle.visible = false
	})
}
const addLineListeners = (line, fabricCanvasRef, setSelectedObject, changeTool) => {
	const canvas = fabricCanvasRef.current
	const startCircle = canvas.getObjects('circle').find((obj) => obj.id == line.id + '_start')
	const endCircle = canvas.getObjects('circle').find((obj) => obj.id == line.id + '_end')
	line.on('moving', (e) => {
		const locateLine = getPointsLine(line)
		updatePoint(e, fabricCanvasRef, locateLine)
		line.metadata.setPoints(locateLine)
		updateLineMove(canvas, line)
		addTextLine(line.metadata, fabricCanvasRef)
		canvas.renderAll()
	})

	// Detectar selección de la línea
	line.on('selected', () => {
		startCircle.visible = true
		endCircle.visible = true
		canvas.bringObjectToFront(startCircle)
		canvas.bringObjectToFront(endCircle)
		changeTool(null)
		setSelectedObject(line.metadata)
		addMetadataPoints(line.metadata, canvas)
		canvas.renderAll()
	})

	line.on('deselected', () => {
		startCircle.visible = false
		endCircle.visible = false
		canvas.renderAll()
	})
}
/**
 * Actualiza la posición de una línea en el canvas según los círculos de sus extremos.
 *
 * @param {fabric.Canvas} canvas - Canvas de Fabric.js.
 * @param {fabric.Line} finalLine - Línea a actualizar.
 * @returns {void}
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const updateLineMove = (canvas, finalLine) => {
	const circleStart = canvas
		.getObjects('circle')
		.find((item) => item.id == `${finalLine.id}_start`)
		.getCenterPoint()
	const circleEnd = canvas
		.getObjects('circle')
		.find((item) => item.id == `${finalLine.id}_end`)
		.getCenterPoint()

	finalLine.set({
		x1: circleStart.x,
		x2: circleEnd.x,
		y1: circleStart.y,
		y2: circleEnd.y,
	})
}

/**
 * Maneja el movimiento del ratón y actualiza la posición final de la línea temporal.
 *
 * @param {fabric.Line} tempLine - Línea temporal a actualizar.
 * @param {React.RefObject} fabricCanvasRef - Referencia al canvas de Fabric.js.
 * @returns {Function} Función para manejar el evento de movimiento del ratón.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const handleMouseMove = (tempLine, fabricCanvasRef) => (e) => {
	const { x, y } = e.pointer
	tempLine.set({ x2: x, y2: y }) // Actualiza la posición final de la línea temporal
	fabricCanvasRef.current.renderAll()
}

/**
 * Actualiza la posición de los puntos (círculos) de una línea al moverla.
 *
 * @param {Object} e - Evento de movimiento.
 * @param {React.RefObject} fabricCanvasRef - Referencia al canvas de Fabric.js.
 * @param {Object} points - Puntos actualizados de la línea.
 * @returns {void}
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const updatePoint = (e, fabricCanvasRef, points) => {
	const canvas = fabricCanvasRef.current
	const LineMoved = fabricCanvasRef.current.getActiveObject()
	const idLine = LineMoved.id
	const startPoint = canvas.getObjects('circle').find((item) => item.id == `${idLine}_start`)
	const endPoint = canvas.getObjects('circle').find((item) => item.id == `${idLine}_end`)
	if (startPoint) {
		startPoint.set(points.start)
		startPoint.setCoords()
	}
	if (endPoint) {
		endPoint.set(points.end)
		endPoint.setCoords()
	}
}

/**
 * Actualiza la posición de una línea en el canvas según los nuevos puntos de sus extremos.
 *
 * @param {fabric.Line} line - Línea a actualizar.
 * @param {Object} points - Nuevos puntos de la línea.
 * @returns {void}
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const updateLinePosition = (line, points) => {
	const x1 = points.start.left
	const y1 = points.start.top
	const x2 = points.end.left
	const y2 = points.end.top
	line.set({ x1, y1, x2, y2 })
	line.metadata.setPoints({
		start: { left: x1, top: y1 },
		end: { left: x2, top: y2 },
	})
	line.setCoords()
}

/**
 * Actualiza la posición de la linea al mover los círculos de la línea.
 *
 * @param {Object} e - Evento de movimiento.
 * @param {React.RefObject} fabricCanvasRef - Referencia al canvas de Fabric.js.
 * @returns {void}
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const updateLineMoveCircle = (e, fabricCanvasRef) => {
	const canvas = fabricCanvasRef.current
	const PointMoved = e.transform.target
	const isStart = PointMoved.id.includes('start')
	const id = PointMoved.id.split('_')[0]
	const lineSelect = canvas.getObjects('line').find((obj) => obj.id == id)
	const otherPoint = canvas.getObjects('circle').find((obj) => obj.id === `${id}_${isStart ? 'end' : 'start'}`)
	const movedPoint = { left: PointMoved.left, top: PointMoved.top, radius: PointMoved.radius }
	const lastPoint = { left: otherPoint.left, top: otherPoint.top, radius: otherPoint.radius }

	const points = {
		start: isStart ? movedPoint : lastPoint,
		end: isStart ? lastPoint : movedPoint,
	}
	updateLinePosition(lineSelect, points)
	addTextLine(lineSelect.metadata, fabricCanvasRef)
}

/**
 * Obtiene la línea asociada a un círculo en el canvas.
 *
 * @param {fabric.Circle} circle - Círculo del cual se obtiene la línea asociada.
 * @param {fabric.Canvas} canvas - Canvas de Fabric.js.
 * @returns {fabric.Line} Línea asociada al círculo.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const getLinexCircle = (circle, canvas) => {
	const id = circle.id.split('_')[0]
	const lineSelect = canvas.getObjects('line').find((obj) => obj.id === id)
	return lineSelect
}

/**
 * Obtiene los puntos de inicio y fin de una línea en el canvas.
 *
 * @param {fabric.Line} Line - Línea de la cual se obtienen los puntos.
 * @returns {Object} Puntos de inicio y fin de la línea.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const getPointsLine = (Line) => ({
	start: {
		left: Line.getCenterPoint().x + Line.calcLinePoints().x1,
		top: Line.getCenterPoint().y + Line.calcLinePoints().y1,
	},
	end: {
		left: Line.getCenterPoint().x + Line.calcLinePoints().x2,
		top: Line.getCenterPoint().y + Line.calcLinePoints().y2,
	},
})

/**
 * Elimina la línea temporal del canvas.
 *
 * @param {fabric.Canvas} canvas - Canvas de Fabric.js.
 * @returns {void}
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const deleteLineTemp = (canvas) => {
	const tempLine = canvas.getObjects('line').find((obj) => {
		if (typeof obj.id == 'number') return false
		return obj?.id?.startsWith('temp')
	})
	if (tempLine) canvas.remove(tempLine)
}

/**
 * Añade los puntos de una línea como metadata a los círculos de inicio y fin.
 *
 * @param {fabric.Line} line - Línea cuya metadata se asigna a los círculos.
 * @param {fabric.Canvas} canvas - Canvas de Fabric.js.
 * @returns {void}
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const addMetadataPoints = (line, canvas) => {
	const startPoint = canvas.getObjects('circle').find((item) => item.id == `${line.line.id}_start`)
	const endPoint = canvas.getObjects('circle').find((item) => item.id == `${line.line.id}_end`)
	startPoint.metadata = line
	endPoint.metadata = line
}

/**
 * Actualiza una propiedad de una línea en el canvas.
 *
 * @param {fabric.Line} line - Línea cuya propiedad se va a actualizar.
 * @param {string} property - Propiedad de la línea a actualizar.
 * @param {fabric.Canvas} canvas - Canvas de Fabric.js.
 * @returns {void}
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const updatePropertyLine = (line, property, canvas) => {
	const lineSelect = canvas.getObjects('line').find((obj) => obj.id === line.line.id)
	if (!lineSelect) return
	const value = parseInt(line.appearance[property]) || line.appearance[property]
	lineSelect.set({ [property]: value })
	const circles_start = canvas.getObjects('circle').find((circle) => circle.id.includes(`${line.line.id}_start`))
	const circles_end = canvas.getObjects('circle').find((circle) => circle.id.includes(`${line.line.id}_end`))
	if (circles_start && circles_end && property !== 'stroke') {
		circles_start.set('radius', 8 + value - 3)
		circles_end.set('radius', 8 + value - 3)
		const movedPoint = { left: circles_start.left, top: circles_start.top, radius: circles_start.radius }
		const lastPoint = { left: circles_end.left, top: circles_end.top, radius: circles_end.radius }
		const points = { start: movedPoint, end: lastPoint }
		updateLinePosition(lineSelect, points)
	}
	canvas.renderAll()
}

/**
 * Obtiene la ubicación y el ángulo para colocar el texto sobre una línea.
 *
 * @param {fabric.Line} line - Línea en la que se va a colocar el texto.
 * @returns {Object} Ubicación y ángulo del texto sobre la línea.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const getLocationLineforText = (line) => {
	const x1 = line.line.points.start.left
	const x2 = line.line.points.end.left
	const y1 = line.line.points.start.top
	const y2 = line.line.points.end.top
	const centerX = (x1 + x2) / 2
	const centerY = (y1 + y2) / 2
	let angleRadians = Math.atan2(y2 - y1, x2 - x1)
	let offset = 20

	let textY =
		line.text.locationText !== 'Top'
			? centerY + offset // Arriba de la línea
			: centerY - offset // Abajo de la línea
	offset = angleRadians < 0.5 ? offset : 0
	let textX = centerX - offset
	if (angleRadians > 1.4 || angleRadians < -1.4) {
		offset = line.text.locationText !== 'Top' ? -15 : 15
		angleRadians = parseFloat(angleRadians) - Math.PI
		textX = centerX - offset * Math.sin(angleRadians) * -1
	}

	return { textX, textY, angleRadians }
}

/**
 * Añade o actualiza un texto en una línea en el canvas.
 *
 * @param {fabric.Line} line - Línea a la que se le añadirá el texto.
 * @param {React.RefObject} fabricCanvasRef - Referencia al canvas de Fabric.js.
 * @returns {void}
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const addTextLine = (line, fabricCanvasRef) => {
	const canvas = fabricCanvasRef.current
	if (line.text?.showText) {
		const textLine = canvas.getObjects('textbox').find((obj) => obj.id === `${line.line.id}_text_line`)
		const Line = canvas.getObjects('line').find((obj) => obj.id === line.line.id)
		const textLocation = getLocationLineforText(line)
		const maxWidth = calcWidthText(line.text.text, line.text.sizeText)
		if (textLine) {
			textLine.set({
				text: line.text.text,
				fontSize: line.text.sizeText,
				fill: line.text.colorText,
				originY: line.text.locationText === 'Top' ? 'bottom' : 'top',
				backgroundColor: line.text.backgroundText,
				left: textLocation.textX,
				top: textLocation.textY,
				angle: (textLocation.angleRadians * 180) / Math.PI,
			})
		} else {
			const text = new fabric.Textbox(line.text.text, {
				id: `${line.line.id}_text_line`,
				left: textLocation.textX,
				top: textLocation.textY,
				angle: (textLocation.angleRadians * 180) / Math.PI,
				fontSize: line.text.sizeText || 20,
				fontFamily: 'Arial',
				fill: line.text.colorText || '#000000',
				textAlign: 'center',
				originX: 'center', // Establecer origen en el centro
				originY: line.text.locationText === 'Top' ? 'bottom' : 'top',
				width: maxWidth,
				backgroundColor: line.text.backgroundText || 'white',
				editable: false,
				hasBorders: false,
				hasControls: false,
				selectable: false,
			})
			text.on('selected', () => {
				canvas.setActiveObject(Line)
			})
			canvas.add(text)
		}
		canvas.renderAll()
	} else {
		const textLine = canvas.getObjects('textbox').find((obj) => obj.id === `${line.id}_text_line`)
		canvas.remove(textLine)
		canvas.renderAll()
	}
}

/**
 * Realiza una animación sobre una línea en el canvas, creando un efecto de línea animada.
 *
 * @param {fabric.Canvas} canvas - Canvas de Fabric.js.
 * @param {string} id - ID de la línea a animar.
 * @returns {void}
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const animationDobleLine = (canvas, id) => {
	const line = canvas.getObjects('line').find((obj) => obj.id == id)

	if (!line) return // Verificar si la polylinea existe
	let lineFlow = canvas.getObjects('line').find((obj) => obj.id === `${id}_back`)
	if (!lineFlow) {
		lineFlow = new fabric.Line([line.x1, line.y1, line.x2, line.y2], {
			id: `${id}_back`,
			stroke: invertHexColor(line.metadata.appearance.stroke),
			strokeWidth: parseInt(line.metadata.appearance.strokeWidth),
			strokeDashArray: [20, 30],
			centeredScaling: true,
			hasBorders: false,
			hasControls: false,
			evented: false,
			selectable: true,
			perPixelTargetFind: true,
			targetFindTolerance: 20,
		})

		lineFlow.on('selected', () => {
			line.fire('selected')
		})

		canvas.add(lineFlow)
	}
	const animateLineFlow = () => {
		if (!line.metadata.animation.animation || !canvas.getObjects('line').some((item) => item.id == line.id)) {
			canvas.remove(lineFlow)
			line.set('strokeWidth', parseInt(line.metadata.appearance.strokeWidth))
			return
		}
		line.set('strokeWidth', parseInt(line.metadata.appearance.strokeWidth) + 4)
		canvas.requestRenderAll()
		updateLineMove(canvas, line)
		lineFlow.set({
			stroke: invertHexColor(line.metadata.appearance.stroke),
			x1: line.x1,
			y1: line.y1,
			x2: line.x2,
			y2: line.y2,
		})
		const movement = line.metadata.animation.invertAnimation ? 1 : -1
		lineFlow.set('strokeDashOffset', lineFlow.strokeDashOffset - movement)

		if (lineFlow.strokeDashOffset < -50 || lineFlow.strokeDashOffset > 50) {
			lineFlow.set('strokeDashOffset', 0)
		}
		canvas.requestRenderAll()
		requestAnimationFrame(animateLineFlow)
	}
	animateLineFlow()
}

export const viewLine = async (points, canvas, data) => {
	const id = data?.id || data
	if (canvas.getObjects('line').find((obj) => obj.id == id)) return false
	const finalLine = new fabric.Line(points, {
		id: id,
		stroke: data.stroke || 'black',
		strokeWidth: data.strokeWidth || 2,
		hasControls: false,
		hasBorders: false,
		selectable: false,
	})
	const variable = data?.id_influxvars ? { variable: data.id_influxvars } : {}
	finalLine.metadata = new LineDiagram({
		...data,
		...variable,
		id: finalLine.id,
		points: getPointsLine(finalLine),
	})
	canvas.add(finalLine)
	if (data?.animation) {
		animationDobleLine(canvas, data.id)
	}
	if (data?.showText) {
		addTextLine(finalLine.metadata, fabricCanvasRef)
	}
	return finalLine
}
