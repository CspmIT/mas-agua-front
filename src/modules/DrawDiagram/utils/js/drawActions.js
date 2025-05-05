import Swal from 'sweetalert2'
import * as fabric from 'fabric'
import { request, requestFile } from '../../../../utils/js/request'
import { backend } from '../../../../utils/routes/app.routes'
import { ImageDiagram } from '../../class/ImageClass'
import { LineDiagram } from '../../class/LineClass'
import { PolylineDiagram } from '../../class/PolylineClass'
import { TextDiagram } from '../../class/TextClass'
import { createLine } from '../../components/DrawLine/utils/js/line'
import { finalizePolyline } from '../../components/DrawPolyLine/utils/js/polyline'
import { createImage } from '../../components/DrawImage/utils/js/actionImage'
import { newText } from '../../components/DrawText/utils/js'
import axios from 'axios'
import SwalLoader from '../../../../components/SwalLoader/SwalLoader'

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
		SwalLoader()
		const canvas = fabricCanvasRef.current
		const objects = canvas.getObjects()
		const saveObjects = await objects.reduce(
			(acc, obj) => {
				if (!obj.metadata || !obj.visible) return acc
				switch (obj.type) {
					case 'image':
						acc.images.push(obj.metadata.getDataSave())
						break
					case 'textbox':
						if (getInstanceType(obj.metadata) === 'TextDiagram') {
							acc.texts.push(obj.metadata.getDataSave())
						}
						break
					case 'line':
						acc.lines.push(obj.metadata.getDataSave())
						break
					case 'polyline':
						acc.polylines.push(obj.metadata.getDataSave())
						break
				}
				return acc
			},
			{ images: [], texts: [], lines: [], polylines: [] }
		)
		if (saveObjects.images.length) {
			if (validationVariableImg(saveObjects.images)) {
				Swal.fire({
					title: 'Atención!',
					text: 'Falta definir las variables requeridas en imagenes.',
					icon: 'warning',
				})
				return false
			}
		}
		if (!Object.values(saveObjects).some((item) => item.length)) {
			Swal.close()
			return false
		}
		let imgSave = ''
		if (canvas.metadata) {
			const formData = new FormData()
			formData.append('image', canvas.metadata)
			formData.append('bucketName', 'mas-agua')
			imgSave = await requestFile(`${backend.Archivos}/uploadImg`, 'POST', formData)
		}
		if (!canvas?.title) {
			Swal.fire({
				title: 'Atención!',
				text: 'Se necesita poner un titulo al diagrama. Clickea la opción de propiedades y escribe un titulo',
				icon: 'warning',
			})
			return false
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
const validationVariableImg = (images) => {
	return images.some((item) => {
		return Object.values(item.variables).some((variable) => variable.require && variable.id_variable === 0)
	})
}
export const uploadCanvaDb = async (id, {
	setElements,
	setCircles,
	setDiagramMetadata,
	setTool
}) => {
	try {
		const objectDiagram = await request(
			`${backend['Mas Agua']}/getObjectCanva?id=${id}`,
			'GET'
		).then((res) => res?.data?.[0]);

		if (!objectDiagram) return;

		setDiagramMetadata({
			id: objectDiagram.id,
			title: objectDiagram.title,
			backgroundColor: objectDiagram.backgroundColor,
			backgroundImg: objectDiagram.backgroundImg || '',
		});

		const elements = [];
		const influxVarsToRequest = [];

		// === LÍNEAS ===
		for (const line of objectDiagram?.lines || []) {
			const pts = [
				line.points.start.left,
				line.points.start.top,
				line.points.end.left,
				line.points.end.top,
			];

			let dataInflux = null;
			if (line.variable?.varsInflux) {
				const vars = Object.values(line.variable.varsInflux)[0];
				dataInflux = {
					id: line.id_influxvars,
					name: line.variable.name,
					unit: line.variable.unit,
					varsInflux: vars,
				};
				influxVarsToRequest.push({ id: line.id, varsInflux: vars });
			}

			elements.push({
				id: line.id,
				type: 'line',
				x: 0,
				y: 0,
				points: pts,
				stroke: line.stroke || '#000',
				strokeWidth: line.strokeWidth || 2,
				draggable: true,
				invertAnimation: line.invertAnimation,
				dataInflux,
			});
		}

		// === TEXTOS ===
		for (const text of objectDiagram?.texts || []) {
			let dataInflux = null;
			if (text.variable?.varsInflux) {
				const vars = Object.values(text.variable.varsInflux)[0];
				dataInflux = {
					id: text.id_influxvars,
					name: text.variable.name,
					unit: text.variable.unit,
					varsInflux: vars,
				};
				influxVarsToRequest.push({ id: text.id, varsInflux: vars });
			}

			elements.push({
				id: text.id,
				type: 'text',
				x: text.left,
				y: text.top,
				text: text.text || '',
				fontSize: text.sizeText || 16,
				fill: text.colorText || '#000',
				fontStyle: 'normal',
				dataInflux,
			});
		}

		// === IMÁGENES ===
		for (const image of objectDiagram?.images || []) {
			let dataInflux = null;
			const variable = image.variables?.[0];
			if (variable?.variable?.varsInflux) {
				const vars = Object.values(variable.variable.varsInflux)[0];
				dataInflux = {
					id: variable.id_influxvars,
					name: variable.name_var,
					unit: variable.variable.unit,
					varsInflux: vars,
				};
				influxVarsToRequest.push({ id: image.id, varsInflux: vars });
			}

			elements.push({
				id: image.id,
				type: 'image',
				src: image.src,
				x: image.left,
				y: image.top,
				width: parseFloat(image.width) || 0,
				height: parseFloat(image.height) || 0,
				draggable: true,
				rotation: parseFloat(image.angle) || 0,
				dataInflux,
			});
		}

		// CONSULTA A /multipleDataInflux UNA VEZ PARA TODOS
		if (influxVarsToRequest.length > 0) {
			const response = await request(
				`${backend['Mas Agua']}/multipleDataInflux`,
				'POST',
				influxVarsToRequest
			);
			
			const valuesResponse = response.data; // <-- acceso correcto
			
			setElements(
				elements.map((el) => {
				  if (el.dataInflux && valuesResponse?.[el.id] !== undefined) {
					const updatedEl = {
					  ...el,
					  dataInflux: {
						...el.dataInflux,
						value: valuesResponse[el.id] ?? 'Sin datos',
					  },
					};	  
					return updatedEl;
				  }
				  return el;
				})
			  );	
			
		} else {
			setElements(elements);
		}
		
		// Los círculos solo si querés editar
		const circles = elements
			.filter((el) => el.type === 'line')
			.flatMap((el) => {
				const [x1, y1, x2, y2] = el.points;
				return [
					{ id: `${el.id}-start`, x: x1, y: y1, lineId: el.id, fill: 'blue', visible: false },
					{ id: `${el.id}-end`, x: x2, y: y2, lineId: el.id, fill: 'red', visible: false }
				];
			});
		setCircles(circles);

		setTool(null);
	} catch (err) {
		console.error('Error en uploadCanvaDb:', err);
	}
};


// const getImageBackgroundDb = async (name) => {
// 	try {
// 		const image = await axios({
// 			method: 'GET',
// 			url: `${backend.Archivos}/getImg/mas-agua/${name}`,
// 			headers: {
// 				accesskey: 'ZRJGodMUp2FzrLF9N9fg',
// 				secretkey: 'KYTjiz1pC6AGM1U07mlDl2mUmDvUSNqnX6iM6DjL',
// 				Accept: 'image/*', // o el tipo de contenido que esperas recibir
// 			},
// 			responseType: 'blob',
// 		})
// 		return new Promise((resolve, reject) => {
// 			const reader = new FileReader()
// 			reader.onloadend = () => resolve(reader.result)
// 			reader.onerror = reject
// 			reader.readAsDataURL(image.data)
// 		})
// 	} catch (error) {
// 		console.error(error)
// 	}
// }

// ================= KONVA ==================

export const saveDiagramKonva = async ({
	elements,
	circles,
	diagramMetadata,
	deleted
}) => {
	try {
		Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

		const saveObjects = {
			images: [],
			texts: [],
			lines: [],
			polylines: [],
			deleted,
		};

		elements.forEach((el) => {
			switch (el.type) {
				case 'image':
					saveObjects.images.push({
						...(el.id ? { id: el.id } : {}),
						name: el.name || '',
						src: el.src,
						left: el.x,
						top: el.y,
						angle: el.rotation || 0,
						width: el.width,
						height: el.height,
						status: 1,
						variables: el.dataInflux ? {
							[el.dataInflux.name]: {
								id_variable: el.dataInflux.id || null,
								show: true
							}
						} : {}
					});
					break;


				case 'text':
					saveObjects.texts.push({
						...(el.id ? { id: el.id } : {}),
						name: '',
						left: el.x,
						top: el.y,
						angle: 0,
						status: 1,
						text: el.text,
						sizeText: el.fontSize,
						colorText: el.fill,
						backgroundText: '',
						id_influxvars: el.dataInflux?.id || null,
					});
					break;

				case 'line':
					const absPoints = {
						start: {
							left: el.points[0] + el.x,
							top: el.points[1] + el.y,
						},
						end: {
							left: el.points[2] + el.x,
							top: el.points[3] + el.y,
						},
					};

					saveObjects.lines.push({
						...(el.id ? { id: el.id } : {}),
						id_influxvars: el.dataInflux?.id || null,
						points: absPoints,
						stroke: el.stroke,
						strokeWidth: el.strokeWidth,
						dobleLine: 0,
						colorSecondary: '',
						animation: 1,
						invertAnimation: el.invertAnimation,
						status: 1,
						showText: 0,
						text: '',
						sizeText: 14,
						colorText: '#000',
						backgroundText: '',
						locationText: '',
					});
					break;
			}
		});

		saveObjects.diagram = {
			title: diagramMetadata.title,
			status: 1,
			backgroundColor: diagramMetadata.backgroundColor || '',
			backgroundImg: diagramMetadata.backgroundImg || '',
			...(diagramMetadata.id && { id: diagramMetadata.id }),
		};

		await request(`${backend[import.meta.env.VITE_APP_NAME]}/saveDiagram`, 'POST', saveObjects);

		Swal.fire({
			title: 'Perfecto!',
			text: 'Se guardó correctamente',
			icon: 'success',
		});

	} catch (error) {
		console.error(error);
		Swal.fire({
			title: 'Error!',
			text: 'Hubo un problema al guardar el diagrama.',
			icon: 'error',
		});
	}
};