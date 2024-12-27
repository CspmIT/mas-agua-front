import Swal from 'sweetalert2'
import * as fabric from 'fabric'
import { request, requestFile } from '../../../../utils/js/request'
import { backend } from '../../../../utils/routes/app.routes'
import { ImageDiagram, ImageTopic } from '../../class/ImageClass'
import { LineDiagram } from '../../class/LineClass'
import { PolylineDiagram } from '../../class/PolylineClass'
import { TextDiagram } from '../../class/TextClass'
import { createLine } from '../../components/DrawLine/utils/js/line'
import { finalizePolyline } from '../../components/DrawPolyLine/utils/js/polyline'
import { createImage } from '../../components/DrawImage/utils/js/actionImage'
import { newText } from '../../components/DrawText/utils/js'
import axios from 'axios'

/**
 * Calcula el ancho del texto basado en su tamaño de fuente y contenido.
 *
 * @param {string} texto - El texto a medir.
 * @param {number} [fontSize=20] - Tamaño de la fuente en píxeles.
 * @returns {number} Ancho máximo del texto.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const calcWidthText = (texto, fontSize = 20) => {
	// Configuración de la fuente
	const globalTempCanvas = document.createElement('canvas')
	const globalContext = globalTempCanvas.getContext('2d')
	globalContext.font = `${fontSize}px Arial`

	// Calcula el ancho de la línea más larga
	const textLines = texto.split('\n')
	const maxWidth = Math.max(...textLines.map((line) => globalContext.measureText(line).width)) + 20
	return maxWidth
}

const classMap = {
	TextDiagram,
	ImageDiagram,
	ImageTopic,
	LineDiagram,
	PolylineDiagram,
}

/**
 * Detecta la clase de una instancia.
 *
 * @param {Object} obj - Objeto a evaluar.
 * @returns {string|null} Clase correspondiente o null si no coincide.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
export const getInstanceType = (obj) => {
	// Primero verificamos si es de la clase más específica (ImageTopic)
	if (obj instanceof ImageTopic) {
		return 'ImageTopic' // Si es una instancia de ImageTopic, retornamos su tipo
	}

	// Verificamos el resto de las clases en el mapa
	for (const [key, value] of Object.entries(classMap)) {
		if (obj instanceof value) {
			return key // Devuelve el nombre del tipo (como 'TextDiagram' o 'ImageDiagram')
		}
	}
	return null // Si no coincide con ninguna clase
}

export const saveDiagram = async (fabricCanvasRef) => {
	try {
		const canvas = fabricCanvasRef.current
		const objects = canvas.getObjects()
		const saveObjects = await objects.reduce(
			(acc, obj) => {
				if (!obj.metadata) return acc
				switch (obj.type) {
					case 'image':
						acc.images.push(obj.metadata)
						break
					case 'textbox':
						if (getInstanceType(obj.metadata) === 'TextDiagram') {
							acc.texts.push(obj.metadata)
						}
						break
					case 'line':
						acc.lines.push(obj.metadata)
						break
					case 'polyline':
						obj.metadata.id = parseInt(obj.metadata?.id?.split('_polyline')?.[0]) || obj.metadata.id
						acc.polylines.push(obj.metadata)
						break
				}
				return acc
			},
			{ images: [], texts: [], lines: [], polylines: [] }
		)
		if (!Object.values(saveObjects).some((item) => item.length)) return false
		let imgSave = ''
		if (canvas.metadata) {
			const formData = new FormData()
			formData.append('image', canvas.metadata)
			formData.append('bucketName', 'mas-agua')
			imgSave = await requestFile(`${backend.Archivos}/uploadImg`, 'POST', formData)
		}
		saveObjects.diagram = {
			title: canvas.title || 'Prueba',
			status: 1,
			backgroundColor: canvas.backgroundColor || '',
			backgroundImg: canvas.metadata ? imgSave?.data?.fileName : canvas.backgroundImg,
		}
		if (canvas.id) {
			saveObjects.diagram.id = canvas.id
		}
		await request(`${backend[import.meta.env.VITE_APP_NAME]}/saveDiagram`, 'POST', saveObjects)
		Swal.fire({
			title: 'Perfecto!',
			text: 'Se guardo correctamente',
			icon: 'success',
		})
	} catch (error) {
		console.error(error)
		Swal.fire({
			title: 'Atención!',
			text: 'Hubo un problema al guardar el diagrama',
			icon: 'error',
		})
	}
}

export const uploadCanvaDb = async (id, fabricCanvasRef, setSelectedObject, changeTool) => {
	const objectDiagram = await request(
		`${backend[import.meta.env.VITE_APP_NAME]}/getObjectCanva?id=${id}`,
		'GET'
	).then((result) => result.data[0])
	if (!objectDiagram) {
		await Swal.fire({
			title: 'Atención!',
			text: 'No se encontro el diagrama.',
			icon: 'warning',
		})
		setTimeout(() => {
			window.location.href = '/config/diagram'
		}, 600)

		return false
	}
	const canvas = fabricCanvasRef.current
	canvas.id = objectDiagram.id
	canvas.backgroundColor = objectDiagram.backgroundColor
	canvas.title = objectDiagram.title
	if (objectDiagram.backgroundImg) {
		const imgBuffer = await getImageBackgroundDb(objectDiagram.backgroundImg)
		const img = new Image()
		img.src = imgBuffer
		img.onload = () => {
			const left = (canvas.width - img.width) / 2
			const top = (canvas.height - img.height) / 2
			canvas.backgroundImage = new fabric.FabricImage(img, {
				width: canvas.width,
				height: canvas.height,
				left: left,
				top: top,
			})
		}
	}

	if (objectDiagram?.lines.length) {
		const lines = objectDiagram.lines
		for (const line of lines) {
			const points = [line.points.start.left, line.points.start.top, line.points.end.left, line.points.end.top]
			createLine(points, fabricCanvasRef, setSelectedObject, changeTool, line)
		}
	}
	if (objectDiagram?.polylines.length) {
		const polylines = objectDiagram.polylines
		for (const polyline of polylines) {
			finalizePolyline(canvas, setSelectedObject, polyline)
		}
	}
	if (objectDiagram?.images.length) {
		const images = objectDiagram.images
		for (const image of images) {
			createImage(image, fabricCanvasRef, setSelectedObject, changeTool)
		}
	}
	if (objectDiagram?.texts.length) {
		const texts = objectDiagram.texts
		for (const text of texts) {
			newText(fabricCanvasRef, text, changeTool, setSelectedObject)
		}
	}
	canvas._discardActiveObject()
	setSelectedObject(null)
	changeTool(null)
}

const getImageBackgroundDb = async (name) => {
	try {
		const image = await axios({
			method: 'GET',
			url: `${backend.Archivos}/getImg/mas-agua/${name}`,
			headers: {
				accesskey: 'ZRJGodMUp2FzrLF9N9fg',
				secretkey: 'KYTjiz1pC6AGM1U07mlDl2mUmDvUSNqnX6iM6DjL',
				Accept: 'image/*', // o el tipo de contenido que esperas recibir
			},
			responseType: 'blob',
		})
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result)
			reader.onerror = reject
			reader.readAsDataURL(image.data)
		})
	} catch (error) {
		console.error(error)
	}
}
