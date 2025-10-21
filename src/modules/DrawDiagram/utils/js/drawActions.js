import Swal from 'sweetalert2'
import { request,  } from '../../../../utils/js/request'
import { backend } from '../../../../utils/routes/app.routes'


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
					position: line.variable.position || 'Centro',
    				show: line.variable.show_var || true
				};
				influxVarsToRequest.push({ id: line.id_influxvars, varsInflux: vars });
			}

			elements.push({
				id: `line-${line.id}`,
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

		// === POLILÍNEAS ===
		for (const poly of objectDiagram?.polylines || []) {
			const points = poly.points.flatMap(pt => [pt.left, pt.top]);

			let dataInflux = null;
			if (poly.variable?.varsInflux) {
				const vars = Object.values(poly.variable.varsInflux)[0];
				dataInflux = {
					id: poly.id_influxvars,
					name: poly.variable.name,
					unit: poly.variable.unit,
					varsInflux: vars,
					position: poly.variable.position || 'Centro',
    				show: poly.variable.show_var || true
				};
				influxVarsToRequest.push({ id: poly.id_influxvars, varsInflux: vars });
			}

			elements.push({
				id: `poly-${poly.id}`,
				type: 'polyline',
				x: 0,
				y: 0,
				points,
				stroke: poly.stroke || '#000',
				strokeWidth: poly.strokeWidth || 2,
				draggable: true,
				invertAnimation: poly.invertAnimation,
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
					position: text.variable.position || 'Centro',
    				show: text.variable.show_var || true
				};
				influxVarsToRequest.push({ id: text.id, varsInflux: vars });
			}

			elements.push({
				id: `text-${text.id}`,
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
				id_variable: variable.id_influxvars,
				name: variable.variable.name || variable.name_var,
				unit: variable.variable.unit,
				type: variable.variable.type,
				calc: variable.variable.calc,
				varsInflux: vars,
				equation: variable.variable.equation,
				status: variable.variable.status,
				show: variable.show_var,
				position: variable.position_var,
				max_value_var: variable.max_value_var,
				calculatePercentage: variable.max_value_var ? true : false,
				boolean_colors: variable.boolean_colors || {}
			  };
		
			influxVarsToRequest.push({ id: variable.id_influxvars, varsInflux: vars }); 
			}

			elements.push({
				id: `image-${image.id}`,
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

		
    // === VALORES INFLUX ===
    let finalElements = elements;

    if (influxVarsToRequest.length > 0) {
      const response = await request(
        `${backend['Mas Agua']}/multipleDataInflux`,
        'POST',
        influxVarsToRequest
      );

      const valuesResponse = response.data;

      finalElements = elements.map((el) => {
        if (el.dataInflux && valuesResponse?.[el.dataInflux.id] !== undefined) {
          return {
            ...el,
            dataInflux: {
              ...el.dataInflux,
              value: valuesResponse[el.dataInflux.id],
            },
          };
        }
        return el;
      });
    }

    // CÍRCULOS PARA EDICIÓN
    const circles = finalElements
      .filter((el) => el.type === 'line')
      .flatMap((el) => {
        const [x1, y1, x2, y2] = el.points;
        return [
          { id: `${el.id}-start`, x: x1, y: y1, lineId: el.id, fill: 'blue', visible: false },
          { id: `${el.id}-end`, x: x2, y: y2, lineId: el.id, fill: 'red', visible: false },
        ];
      });

    setCircles(circles);
    setTool(null);

    return finalElements; 
  } catch (err) {
    console.error('Error en uploadCanvaDb:', err);
    return [];
  }
};


export const saveDiagramKonva = async ({
	elements,
	circles,
	diagramMetadata,
	deleted,
	navigate
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

		const getNumericId = (compositeId) => {
			const match = compositeId?.toString().match(/-(\d+)$/);
			return match ? parseInt(match[1], 10) : null;
		  };

		elements.forEach((el) => {
			console.log(el);
			switch (el.type) {
				case 'image':
					saveObjects.images.push({
						...(el.id ? { id: getNumericId(el.id) } : {}),
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
								show: el.dataInflux.show,
        						position: el.dataInflux.position,
								max_value: el.dataInflux.max_value_var,
								boolean_colors: el.dataInflux.boolean_colors
							}
						} : {}
					});
					break;

				case 'polyline':
					const points = el.points.map((val, i) =>
						i % 2 === 0 ? val + el.x : val + el.y
					);

					const polylinePoints = [];
					for (let i = 0; i < points.length; i += 2) {
						polylinePoints.push({ left: points[i], top: points[i + 1] });
					}

					saveObjects.polylines.push({
						...(el.id ? { id: getNumericId(el.id) } : {}),
						id_influxvars: el.dataInflux?.id || null,
						points: polylinePoints,
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
						variables: el.dataInflux ? {
							[el.dataInflux.name]: {
								id_variable: el.dataInflux.id || null,
								show: el.dataInflux.show,
        						position: el.dataInflux.position,
								max_value_var: el.dataInflux.maxValue
							}
						} : {}
					});

					break;

				case 'text':
					saveObjects.texts.push({
						...(el.id ? { id: getNumericId(el.id) } : {}),
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
						...(el.id ? { id: getNumericId(el.id) } : {}),
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
		navigate('/config/diagram');

	} catch (error) {
		console.error(error);
		Swal.fire({
			title: 'Error!',
			text: 'Hubo un problema al guardar el diagrama.',
			icon: 'error',
		});
	}
};