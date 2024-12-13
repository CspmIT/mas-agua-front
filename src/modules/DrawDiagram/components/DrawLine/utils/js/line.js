import * as fabric from 'fabric'

export const drawLine = async (click, fabricCanvasRef, setPointer, changeCursor, lines) => {
	if (click) {
		const fabricCanvas = fabricCanvasRef.current
		const { x, y } = click
		let newLine
		// Manejo del primer clic: inicializa la línea temporal
		setPointer((prevPointer) => {
			const id = Math.floor(Math.random() * 99) + 1
			const tempLine = new fabric.Line([x, y, x, y], {
				id: `temp_line_${id}`,
				stroke: 'black',
				strokeWidth: 2,
				selectable: false,
			})

			if (prevPointer.length === 0) {
				// Crea una línea temporal
				fabricCanvas.add(tempLine)
				fabricCanvas.renderAll()

				fabricCanvas.on('mouse:move', handleMouseMove(tempLine, fabricCanvasRef))

				return [{ x, y }]
			}

			// Manejo del segundo clic: finaliza la línea
			const [start] = prevPointer
			const finalLine = new fabric.Line([start.x, start.y, x, y], {
				id: `newline_${id}`,
				stroke: 'black',
				strokeWidth: 2,
				hasControls: false,
				hasBorders: false,
				selectable: true,
				perPixelTargetFind: true,
				targetFindTolerance: 15,
			})

			// Crear puntos movibles para los extremos de la línea
			const startCircle = new fabric.Circle({
				id: `${id}_start`,
				left: start.x - 6,
				top: start.y - 6,
				radius: 6,
				fill: 'blue',
				hasControls: false,
				hasBorders: false,
				selectBack: true,
			})

			const endCircle = new fabric.Circle({
				id: `${id}_end`,
				left: x - 6,
				top: y - 6,
				radius: 6,
				fill: 'red',
				hasControls: false,
				hasBorders: false,
				selectable: true,
			})
			startCircle.on('moving', (e) => {
				startCircle.visible = true
				endCircle.visible = true
				updateLine(e, fabricCanvasRef, lines)
			})
			endCircle.on('moving', (e) => {
				startCircle.visible = true
				endCircle.visible = true
				updateLine(e, fabricCanvasRef, lines)
			})
			startCircle.on('deselected', (e) => {
				startCircle.visible = false
				endCircle.visible = false
			})
			endCircle.on('deselected', (e) => {
				startCircle.visible = false
				endCircle.visible = false
			})

			finalLine.on('moving', (e) => {
				// Reseteamos las posiciones cuando se termina el movimiento.
				const locateLine = getPiontsLine(finalLine)
				updatePoint(e, fabricCanvasRef, locateLine)
			})

			// Detectar selección de la línea
			finalLine.on('selected', () => {
				startCircle.visible = true
				endCircle.visible = true
				fabricCanvas.renderAll()
			})

			finalLine.on('deselected', () => {
				startCircle.visible = false
				endCircle.visible = false
				fabricCanvas.renderAll()
			})
			fabricCanvas.add(finalLine)

			fabricCanvas.remove(fabricCanvas.getObjects('line').find((obj) => obj?.id?.split('_')[0] === 'temp')) // Elimina la línea temporal
			fabricCanvas.off('mouse:move') // Detiene la escucha del mouse
			fabricCanvas.renderAll()
			newLine = finalLine
			changeCursor('default')

			return [] // Resetea los puntos
		})
		return newLine
	}
}

export const handleMouseMove = (tempLine, fabricCanvasRef) => (e) => {
	const { x, y } = e.pointer
	tempLine.set({ x2: x, y2: y }) // Actualiza la posición final de la línea temporal
	fabricCanvasRef.current.renderAll()
}

export const updatePoint = (e, fabricCanvasRef, points) => {
	const fabricCanvas = fabricCanvasRef.current
	const LineMoved = fabricCanvasRef.current.getActiveObject()
	const idLine = LineMoved.id.split('_')[1]

	const startPoint = fabricCanvas.getObjects('circle').find((item) => {
		if (item.id == `${idLine}_start`) {
			return item
		}
	})
	const endPoint = fabricCanvas.getObjects('circle').find((item) => {
		if (item.id == `${idLine}_end`) {
			return item
		}
	})
	if (startPoint) {
		startPoint.set(points.start)
		startPoint.setCoords()
	}
	if (endPoint) {
		endPoint.set(points.end)
		endPoint.setCoords()
	}

	fabricCanvas.renderAll()
}
export const updateLine = (e, fabricCanvasRef, lines) => {
	const fabricCanvas = fabricCanvasRef.current
	const PointMoved = e.transform.target
	const namePoint = PointMoved.id.split('_')[1]
	const points = { start: {}, end: {} }
	points[namePoint] = { left: PointMoved.left, top: PointMoved.top, radius: PointMoved.radius }
	const idLine = PointMoved.id.split('_')[0]
	const lineSelect = fabricCanvas.getObjects('line').find((item) => {
		if (item.id == `newline_${idLine}`) {
			return item
		}
	})
	const otherPoint = fabricCanvas.getObjects('circle').find((item) => {
		if (item.id == `${idLine}_${namePoint == 'start' ? 'end' : 'start'}`) {
			return item
		}
	})
	const nameOtherPoint = otherPoint.id.split('_')[1]
	points[namePoint] = { left: PointMoved.left, top: PointMoved.top, radius: PointMoved.radius }
	points[nameOtherPoint] = { left: otherPoint.left, top: otherPoint.top, radius: otherPoint.radius }

	lineSelect.set({
		x1: points.start.left + points.start.radius,
		y1: points.start.top + points.start.radius,
		x2: points.end.left + points.end.radius,
		y2: points.end.top + points.end.radius,
	})
	lineSelect.setCoords()
	console.log(lines)
	fabricCanvas.renderAll()
}

export const getPiontsLine = (Line) => {
	const locateLine = {
		start: {
			left: Line.getCenterPoint().x + Line.calcLinePoints().x1 - 6,
			top: Line.getCenterPoint().y + Line.calcLinePoints().y1 - 6,
		},
		end: {
			left: Line.getCenterPoint().x + Line.calcLinePoints().x2 - 6,
			top: Line.getCenterPoint().y + Line.calcLinePoints().y2 - 6,
		},
	}
	return locateLine
}
