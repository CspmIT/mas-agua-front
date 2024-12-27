import * as fabric from 'fabric'
import { PolylineDiagram } from '../../../../class/PolylineClass'
import { invertHexColor } from '../../../ToolsCanvas/utils/js'
import { gridColumnLookupSelector } from '@mui/x-data-grid'

let tempPolyline = null
let points = []

/**
 * Dibuja una polilínea temporal sobre el canvas al hacer clic en él.
 * Actualiza la polilínea en curso o inicializa una nueva si no existe.
 *
 * @param {Object} click - Coordenadas del clic, contiene 'x' y 'y'.
 * @param {React.RefObject} canvasRef - Referencia al canvas de Fabric.js.
 * @param {Function} setSelectedObject - Función para establecer el objeto seleccionado.
 * @param {Function} changeTool - Función para cambiar la herramienta activa.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const drawPolyline = (click, canvasRef, setSelectedObject, changeTool) => {
	const { x, y } = click
	const canvas = canvasRef.current
	points.push({ x, y })

	if (!tempPolyline) {
		initializeTempPolyline(canvas, setSelectedObject, changeTool)
	} else {
		tempPolyline.set({ points })
		tempPolyline.setBoundingBox(true)
		canvas.renderAll()
	}
}

/**
 * Inicializa una polilínea temporal en el canvas. Se establece un evento para manejar la tecla Escape y Enter.
 *
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @param {Function} setSelectedObject - Función para establecer el objeto seleccionado.
 * @param {Function} changeTool - Función para cambiar la herramienta activa.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const initializeTempPolyline = (canvas, setSelectedObject, changeTool) => {
	const id = generateId()

	tempPolyline = new fabric.Polyline(points, {
		id: `temp_polyline_${id}`,
		stroke: 'black',
		strokeWidth: 2,
		fill: 'transparent',
		selectable: false,
	})

	canvas.add(tempPolyline)
	canvas.on('mouse:move', handleMouseMoveTemp(canvas))
	canvas.renderAll()

	window.addEventListener('keydown', (e) => handleEscape(e, canvas, setSelectedObject, changeTool))
}

const handleEscape = async (e, canvas, setSelectedObject, changeTool) => {
	if (e.key === 'Escape') {
		exitDrawPolyline(canvas, setSelectedObject)
		canvas.getObjects().forEach((obj) => (obj.selectable = true))
		window.removeEventListener('keydown', handleEscape)
		changeTool(null)
	}
	if (e.key === 'Enter') {
		finalizePolyline(canvas, setSelectedObject)
		window.removeEventListener('keydown', handleEscape)
		changeTool(null)
	}
}
/**
 * Función que maneja el movimiento del mouse para la polilínea temporal.
 * Actualiza la posición de los puntos de la polilínea según la ubicación del puntero.
 *
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @returns {Function} - Función de manejo de evento de movimiento del mouse.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const handleMouseMoveTemp = (canvas) => (e) => {
	if (!tempPolyline || !e.pointer) return

	const { x, y } = e.pointer
	tempPolyline.set({ points: [...points, { x, y }] })
	tempPolyline.setBoundingBox(true)
	canvas.renderAll()
}

/**
 * Finaliza la creación de la polilínea al presionar Enter.
 * Agrega la polilínea al canvas y asigna sus eventos y vértices.
 *
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @param {Function} setSelectedObject - Función para establecer el objeto seleccionado.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const finalizePolyline = async (canvas, setSelectedObject, data = {}) => {
	if ((tempPolyline && points.length > 1) || data?.points) {
		const id = data?.id + '_polyline' || generateId()
		if (canvas.getObjects('polyline').find((obj) => obj.id == id)) return false
		if (tempPolyline) {
			canvas.remove(tempPolyline)
		}
		const polylinePopints = data?.points || points
		const polyline = new PolylineDiagram({ ...data, id, points: polylinePopints })

		const finalPolyline = new fabric.Polyline(polylinePopints, {
			id,
			stroke: data?.stroke || 'black',
			strokeWidth: data?.strokeWidth || 2,
			fill: 'transparent',
			strokeLineCap: 'round',
			hasControls: false,
			hasBorders: false,
			selectable: true,
			perPixelTargetFind: true,
			targetFindTolerance: 20,
			strokeLineJoin: 'round',
		})

		finalPolyline.metadata = polyline

		addPolylineListeners(finalPolyline, canvas, setSelectedObject)

		canvas.add(finalPolyline)
		canvas?.set({ defaultCursor: 'default' })

		polylinePopints.forEach((point, index) => createVertexCircle(canvas, point, index, id))

		points = []
		if (tempPolyline) {
			tempPolyline = null
		}
		if (polyline.animation) {
			animationDoblePolyline(canvas, polyline.id)
		}
		canvas.getObjects().forEach((obj) => (obj.selectable = true))
		setSelectedObject(finalPolyline.metadata)
		canvas.setActiveObject(finalPolyline)
		window.removeEventListener('keydown', handleEscape)
		canvas.renderAll()
	}
}

/**
 * Añade los escuchadores de eventos a la polilínea final.
 * Maneja la selección, deselección y movimiento de la polilínea.
 *
 * @param {fabric.Polyline} polyline - La polilínea a la que se agregarán los escuchadores.
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @param {Function} setSelectedObject - Función para establecer el objeto seleccionado.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const addPolylineListeners = (polyline, canvas, setSelectedObject) => {
	polyline.on('selected', (e) => {
		if (tempPolyline) return // No hacer nada si hay una polilínea en creación
		setSelectedObject(polyline.metadata)
		handleVisualizerCircle(polyline.id, true, canvas)
	})

	polyline.on('deselected', () => {
		if (tempPolyline) return // Ignorar si estamos creando
		handleVisualizerCircle(polyline.id, false, canvas)
		setSelectedObject(null)
	})

	polyline.on('moving', (e) => {
		if (tempPolyline) return // No mover mientras se crea
		const { movementX = 0, movementY = 0 } = e.e || {}
		setSelectedObject(polyline.metadata)
		updateCirclesOnPolylineMove(polyline.id, canvas, movementX, movementY)
		handleVisualizerCircle(polyline.id, true, canvas)
	})
}

/**
 * Controla la visibilidad de los círculos visualizadores (vértices) de la polilínea.
 *
 * @param {string} idLine - ID de la polilínea.
 * @param {boolean} status - Estado de visibilidad de los círculos.
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const handleVisualizerCircle = (idLine, status, canvas) => {
	canvas.getObjects('circle').forEach((circle) => {
		circle.set({ visible: circle.id.includes(idLine) ? status : false })
		if (status) {
			canvas.bringObjectToFront(circle)
		}
	})
}

/**
 * Crea un círculo en cada vértice de la polilínea para poder interactuar con ellos.
 *
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @param {Object} point - Coordenadas del punto del vértice.
 * @param {number} index - Índice del vértice en la polilínea.
 * @param {string} id - ID de la polilínea a la que pertenece el vértice.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const createVertexCircle = (canvas, point, index, id) => {
	const polyline = canvas.getObjects('polyline').find((obj) => obj.id === id)
	let potencia = 1.3
	if (parseInt(polyline.strokeWidth) <= 6) {
		potencia = 2
	}
	if (parseInt(polyline.strokeWidth) <= 4) {
		potencia = 3
	}
	const pointCircle = new fabric.Circle({
		id: `${id}_poliyline_${index}`,
		left: point.x,
		top: point.y,
		radius: parseInt(polyline.strokeWidth) * potencia,
		fill: index === 0 ? 'green' : index === polyline.points.length - 1 ? 'red' : 'blue',
		originX: 'center',
		originY: 'center',
		hasControls: false,
		hasBorders: false,
		selectable: true,
	})

	pointCircle.on('selected', () => handleVisualizerCircle(id, true, canvas))
	pointCircle.on('deselected', () => handleVisualizerCircle(id, false, canvas))
	pointCircle.on('moving', (e) => updatePolylinePoints(e, index, id, canvas))

	pointCircle.metadata = polyline.metadata
	canvas.add(pointCircle)
}

/**
 * Actualiza los puntos de la polilínea cuando se mueve un vértice.
 *
 * @param {fabric.Event} e - Evento de movimiento de vértice.
 * @param {number} index - Índice del vértice en la polilínea.
 * @param {string} id - ID de la polilínea.
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const updatePolylinePoints = (e, index, id, canvas) => {
	const pointCircle = e.transform.target
	const polyline = canvas.getObjects('polyline').find((obj) => obj.id === id)
	const polylineback = canvas.getObjects('polyline').find((obj) => obj.id === id + '_back')
	if (polyline) {
		polyline.points[index] = { x: pointCircle.left, y: pointCircle.top }
		polyline.set({ points: polyline.points })
		polyline.setBoundingBox(true)
		if (polylineback) {
			polylineback.setBoundingBox(true)
		}
		polyline.setCoords()
		polyline.metadata.setPoints(polyline.points)
	}
}

/**
 * Actualiza la posición de los círculos de los vértices al mover la polilínea.
 *
 * @param {string} polylineId - ID de la polilínea que se mueve.
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @param {number} dx - Desplazamiento en el eje X.
 * @param {number} dy - Desplazamiento en el eje Y.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const updateCirclesOnPolylineMove = (polylineId, canvas, dx, dy) => {
	canvas
		.getObjects('polyline')
		.find((polyline) => polyline.id === polylineId)
		?.points.forEach((_, index) => {
			const circle = canvas
				.getObjects('circle')
				.find((circle) => circle.id === `${polylineId}_poliyline_${index}`)
			if (circle) {
				circle.set({ left: circle.left + dx, top: circle.top + dy })
				circle.setCoords()
			}
		})

	updateAllPolyline(polylineId, canvas)
}

/**
 * Actualiza todas las polilíneas y círculos asociados, sincronizando los puntos con los vértices.
 *
 * @param {string} id - ID de la polilínea a actualizar.
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const updateAllPolyline = (id, canvas) => {
	const polyline = canvas.getObjects('polyline').find((obj) => obj.id === id)
	const circles = canvas.getObjects('circle').filter((circle) => circle.id.includes(`${id}_poliyline_`))
	const polylineback = canvas.getObjects().find((obj) => obj.id === id + '_back')
	if (polyline && circles) {
		circles.forEach((circle, index) => {
			polyline.points[index] = { x: circle.left, y: circle.top }
		})

		polyline.set({ points: polyline.points })
		polyline.setBoundingBox(true)
		polyline.setCoords()
		polyline.metadata.setPoints(polyline.points)
		if (polylineback) {
			polylineback.setBoundingBox(true)
		}
	}
}

/**
 * Genera un ID único para la polilínea.
 *
 * @returns {string} - ID generado aleatoriamente.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const generateId = () => Math.random().toString(36).substring(2, 9)

/**
 * Actualiza una propiedad específica de la polilínea seleccionada, como el color o el grosor.
 *
 * @param {Object} polyline - Objeto de la polilínea a actualizar.
 * @param {string} property - Nombre de la propiedad a actualizar.
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const updatePropertyPolyline = (polyline, property, canvas) => {
	const lineSelect = canvas.getObjects('polyline').find((obj) => obj.id === polyline.id)
	const polylineback = canvas.getObjects('polyline').find((obj) => obj.id === polyline.id + '_back')
	const circles = canvas.getObjects('circle').filter((circle) => circle.id.includes(`${polyline.id}_poliyline_`))

	if (lineSelect) {
		const value = isNaN(polyline[property]) ? polyline[property] : parseInt(polyline[property], 10)
		lineSelect.set({ [property]: value })

		if (polylineback && property === 'stroke') {
			polylineback.set({
				[property]: invertHexColor(value),
			})
			polylineback.setBoundingBox(true)
		}

		if (circles.length && property !== 'stroke') {
			circles.forEach((circle, index) => {
				circle.set('radius', 8 + value - 3)
				lineSelect.points[index] = { x: circle.left, y: circle.top }
				lineSelect.set({ points: polyline.points })
				lineSelect.setBoundingBox(true)
				lineSelect.setCoords()
				lineSelect.metadata.setPoints(polyline.points)
			})
		}
		canvas.requestRenderAll()
	}
}

/**
 * Sale del modo de creación de la polilínea temporal y limpia los puntos y la polilínea en el canvas.
 *
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const exitDrawPolyline = (canvas) => {
	canvas.remove(tempPolyline)
	points = []
	tempPolyline = null
	canvas?.set({ defaultCursor: 'default' })
}

/**
 * Animación de la polilínea de doble trazo, creando un efecto visual de movimiento.
 *
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js .
 * @param {string} id - ID de la polilínea a animar.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const animationDoblePolyline = (canvas, id) => {
	const polyline = canvas.getObjects('polyline').find((obj) => obj.id === id)

	if (!polyline) return // Verificar si la polilínea existe
	let polylineFlow = canvas.getObjects('polyline').find((obj) => obj.id === `${id}_back`)

	if (!polylineFlow) {
		const adjustedPoints = adjustPointsToCenter(canvas, id)
		// Crear la nueva polilínea animada
		polylineFlow = new fabric.Polyline(adjustedPoints, {
			id: `${id}_back`,
			stroke: invertHexColor(polyline.metadata.stroke),
			strokeWidth: parseInt(polyline.metadata.strokeWidth),
			strokeDashArray: [20, 30],
			fill: null, // Asegurar que no tenga relleno
			centeredScaling: true,
			hasBorders: false,
			hasControls: false,
			evented: false,
			selectable: true,
			perPixelTargetFind: true,
			targetFindTolerance: 20,
		})

		polylineFlow.on('selected', () => {
			polyline.fire('selected')
		})

		canvas.add(polylineFlow)
	}

	const animatePolylineFlow = () => {
		if (!polyline.metadata.animation) {
			canvas.remove(polylineFlow)
			polyline.strokeWidth = parseInt(polyline.metadata.strokeWidth)
			return
		}

		polyline.strokeWidth = parseInt(polyline.metadata.strokeWidth) + 4
		polylineFlow.stroke = invertHexColor(polyline.metadata.stroke)
		const adjustedPoints = adjustPointsToCenter(canvas, id)

		updateAllPolyline(id, canvas)
		// Sincronizar puntos de la polilínea animada con los puntos originales
		polylineFlow.set({
			points: adjustedPoints,
		})
		const movement = polyline.metadata.invertAnimation ? -1 : 1
		polylineFlow.strokeDashOffset -= movement

		if (polylineFlow.strokeDashOffset < -50) polylineFlow.strokeDashOffset = 0

		canvas.requestRenderAll()
		requestAnimationFrame(animatePolylineFlow)
	}

	animatePolylineFlow()
}

/**
 * Captura la ubicacion de los circulos de la polilinea para luego centrarla.
 * @param {fabric.Canvas} canvas - El objeto canvas de Fabric.js.
 * @param {string} id - ID de la polilínea a ajustar.
 * @returns {Array} - Lista de puntos ajustados para centrar la polilínea.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const adjustPointsToCenter = (canvas, id) => {
	const circles = canvas.getObjects('circle').filter((circle) => circle.id.includes(`${id}_poliyline_`))
	const points = []
	if (circles) {
		circles.forEach((circle, index) => {
			points.push({ x: circle.left, y: circle.top })
		})
	}
	return points
}
