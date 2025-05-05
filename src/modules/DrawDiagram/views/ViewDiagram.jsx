import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stage, Layer, Line, Text, Group } from 'react-konva';
import { uploadCanvaDb } from '../utils/js/drawActions';
import CardCustom from '../../../components/CardCustom';
import { IconButton, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { request } from '../../../utils/js/request';
import { backend } from '../../../utils/routes/app.routes';
import { Tooltip } from '@mui/material';

import RenderImage from '../components/RenderImage/RenderImage';

function ViewDiagram() {
	const { id } = useParams();
	const stageRef = useRef();
	const [dashOffset, setDashOffset] = useState(0);
	const [elements, setElements] = useState([]);
	const [circles, setCircles] = useState([]);
	const [diagramMetadata, setDiagramMetadata] = useState({
		id: null,
		title: '',
		backgroundColor: '#ffffff',
		backgroundImg: ''
	});
	const navigate = useNavigate();

	useEffect(() => {
		if (id) {
			uploadCanvaDb(id, {
				setElements,
				setCircles,
				setDiagramMetadata,
				setTool: () => {}
			});
		}
	}, [id]);

	useEffect(() => {
		let frameId;
		const animate = () => {
			setDashOffset((prev) => prev + 1);
			frameId = requestAnimationFrame(animate);
		};
		animate();
		return () => cancelAnimationFrame(frameId);
	}, []);

	useEffect(() => {
		const interval = setInterval(async () => {
			const influxPayload = elements
				.filter(el => el.dataInflux?.varsInflux)
				.map(el => ({
					id: el.dataInflux.id,
					varsInflux: el.dataInflux.varsInflux
				}));

			if (influxPayload.length) {
				try {
					const response = await request(`${backend['Mas Agua']}/multipleDataInflux`, 'POST', influxPayload);
					const result = response.data;
					setElements(prev =>
						prev.map(el =>
							el.dataInflux?.id && result[el.dataInflux.id] !== undefined
								? { ...el, dataInflux: { ...el.dataInflux, value: result[el.dataInflux.id] } }
								: el
						)
					);
				} catch (err) {
					console.error('Error actualizando datos desde Influx:', err);
				}
			}
		}, 10000);

		return () => clearInterval(interval);
	}, [elements]);

	return (
		<CardCustom className="w-full h-full flex flex-col items-center justify-center !bg-gray-300 text-black relative p-3 rounded-md">
			<div className="flex-1 w-full rounded-br-lg relative text-end">
				<IconButton
					title='Volver'
					onClick={() => navigate('/config/diagram')}
					className='!bg-blue-400'
					size='small'
				>
					<ArrowBack />
				</IconButton>

				{/* Canvas Konva */}
				<Stage width={window.innerWidth - 100} height={window.innerHeight - 100} ref={stageRef}>
					<Layer>
						{elements.map((el) => {
							if (el.type === 'text') {
								return (
									<Group key={el.id}>
										<Text
											x={el.x}
											y={el.y}
											text={el.text}
											fontSize={el.fontSize}
											fill={el.fill}
											fontStyle={el.fontStyle}
										/>
									</Group>
								);
							}
							if (el.type === 'line') {
								return (
									<Group key={el.id}>
										<Line points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth + 4} />
										<Line points={el.points} stroke="white" strokeWidth={el.strokeWidth + 2} />
										<Line
											points={el.points}
											stroke={el.stroke}
											strokeWidth={el.strokeWidth}
											dash={[20, 10]}
											dashOffset={el.invertAnimation ? -dashOffset : dashOffset}
										/>
									</Group>
								);
							}
							if (el.type === 'image') {
								return <RenderImage key={el.id} el={el} />;
							}
							return null;
						})}
					</Layer>
				</Stage>

				{/* Overlay de datos */}
				{elements.map((el) => {
					if (!el.dataInflux?.name) return null;

					let left = el.x + (el.width || 0) / 2;
					let top = el.y + 10;
					let transform = 'translate(-50%, -50%)';

					if (el.type === 'text') {
						left = el.x + 25;
						top = el.y + 10;
					}

					if (el.type === 'line' && el.points?.length === 4) {
						const [x1, y1, x2, y2] = el.points;
						left = ((x1 + x2) / 2) + (el.x || 0);
						top = ((y1 + y2) / 2) + (el.y || 0);

						const angleRad = Math.atan2(y2 - y1, x2 - x1);
						const angleDeg = angleRad * (180 / Math.PI);
						transform += ` rotate(${angleDeg}deg)`;
					}

					return (
						<Tooltip
							key={`tooltip-${el.id}`}
							title={`[${el.dataInflux.name}]`}
							placement="top"
							arrow
						>
							<Box
								sx={{
									position: 'absolute',
									top,
									left,
									transform,
									bgcolor: 'oklch(50% 0.199 265.638)',
									color: 'white',
									fontSize: 14,
									px: 1.5,
									py: 0.5,
									borderRadius: 2,
									fontFamily: 'monospace',
									whiteSpace: 'nowrap',
									zIndex: 10,
									cursor: 'default',
								}}
							>
								{el.dataInflux.value != null
									? el.dataInflux.value === 1
									? 'Activa'
									: `${el.dataInflux.value} ${el.dataInflux.unit || ''}`
								: 'No hay datos'}
							</Box>
						</Tooltip>
					);
				})}
			</div>
		</CardCustom>
	);
}

export default ViewDiagram;
