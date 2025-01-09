import Swal from 'sweetalert2'
import * as fabric from 'fabric'
import { request } from '../../../../utils/js/request'
import { backend } from '../../../../utils/routes/app.routes'
import axios from 'axios'
import { viewLine } from '../../components/DrawLine/utils/js/line'
import { viewPolyline } from '../../components/DrawPolyLine/utils/js/polyline'
import { viewText } from '../../components/DrawText/utils/js'
import { viewImage } from '../../components/DrawImage/utils/js/actionImage'

export const uploadDiagramDb = async (id, canvas) => {
	try {
		const objectDiagram = await request(
			`${backend[import.meta.env.VITE_APP_NAME]}/getObjectCanva?id=${id}`,
			'GET'
		).then((result) => result?.data?.[0])
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
				const points = [
					line.points.start.left,
					line.points.start.top,
					line.points.end.left,
					line.points.end.top,
				]
				await viewLine(points, canvas, line)
			}
		}
		if (objectDiagram?.polylines.length) {
			const polylines = objectDiagram.polylines
			for (const polyline of polylines) {
				await viewPolyline(canvas, polyline)
			}
		}
		if (objectDiagram?.texts.length) {
			const texts = objectDiagram.texts
			for (const text of texts) {
				await viewText(canvas, text)
			}
		}
		if (objectDiagram?.images.length) {
			const images = objectDiagram.images
			for (const image of images) {
				await viewImage(image, canvas)
			}
		}

		Swal.close()
		return objectDiagram
	} catch (error) {
		console.error(error)
		Swal.fire({
			title: 'Atención!',
			text: 'Hubo un problema al traer el diagrama',
			icon: 'error',
		})
	}
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
