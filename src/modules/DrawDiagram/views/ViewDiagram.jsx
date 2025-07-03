import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stage, Layer, Text, Line, Label, Tag, Group } from 'react-konva';
import { uploadCanvaDb } from '../utils/js/drawActions';
import CardCustom from '../../../components/CardCustom';
import { IconButton, Box } from '@mui/material';
import { request } from '../../../utils/js/request';
import { backend } from '../../../utils/routes/app.routes';
import RenderImage from '../components/RenderImage/RenderImage';
import LoaderComponent from '../../../components/Loader'
import { LuZoomOut, LuZoomIn, LuArrowLeft } from "react-icons/lu";

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
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();
	const [scale, setScale] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [dimensions, setDimensions] = useState({
		width: window.innerWidth - 10,
		height: window.innerHeight - 10,
	});

	const renderTooltipLabel = (el) => {		
		const value = el.dataInflux?.value;
		const unit = el.dataInflux?.unit || '';
		let text = '';

		if (unit === 'binario' || value === true || value === false || unit === 'bool' || unit === '-') {
			return null;
		}

		if (value != null) {
			if (!isNaN(value)) {
			text = `${Number(value).toFixed(2)} ${unit}`;
			} else {
			text = `${value} ${unit}`;
			}
		} else {
			text = 'No hay datos';
		}

		// Si es una sonda conductímetro, aplicar estilo personalizado
		const isSondaConductimetro = el.src?.includes('Sonda_conductimetro.png');

		if (isSondaConductimetro) {

			const relX = 0.29;
			const relY = 0.15;
			const boxWidth = 0.70;
			const fontSize = el.width * 0.13;

			return (
				<Group rotation={el.rotation || 0}>
					<Text
						text={text}
						x={el.x + el.width * relX}
						y={el.y + el.height * relY}
						width={el.width * boxWidth}
						align="center"
						fontSize={fontSize}
						fontFamily="Arial"
						fill="yellow"
					/>
				</Group>
			);
		}

		const tanqueImages = [
			'Estanque_cloro.png',
			'Cisterna.png',
			'Tanques_agua_multiple.png',
			'Tanques_agua_simple.png',
			'tanque_horizontal.png',
			'Tanque_elevado.png',
		];
		  
		const isEstanque = tanqueImages.some(name => el.src?.includes(name));
		if (isEstanque) {
			text = `${Math.round(value)}${unit}`;
			const baseFontSize = el.width * 0.12;
			const fontSize = Math.min(baseFontSize, 18);
			const padding = 5;
			const maxTextWidth = 80;
			const textWidth = Math.min(el.width * 0.45, maxTextWidth);
			const textHeight = fontSize + padding * 1;
		  
			return (
			  <Group rotation={el.rotation || 0}>
				<Label
				  x={el.x + el.width / 2 - textWidth / 2.2}
				  y={el.y + el.height / 2 - textHeight / 1.3}
				>
				  <Tag
					fill="#fff"
					cornerRadius={2}
					lineJoin="round"
					shadowColor="#27272a"
					shadowBlur={5}
				  />
				  <Text
					text={text}
					fontFamily="Arial"
					fontSize={fontSize}
					padding={padding}
					width={textWidth}
					align="center"
					fill="black"
				  />
				</Label>
			  </Group>
			);
		  }

		return (
			<Label
				x={el.x + (el.width || 0) / 2}
				y={el.y}
			>
				<Tag
					fill='#ffff'
					pointerDirection="down"
					pointerWidth={10}
					pointerHeight={10}
					lineJoin="round"
					cornerRadius={5}
					shadowColor="#94a3b8"
					shadowBlur={7}
				/>
				<Text
					text={text}
					fontFamily="arial"
					fontSize={14}
					padding={8}
					fill="black"
				/>
			</Label>
		);
	};

	useEffect(() => {
		if (id) {
			setIsLoading(true);

			uploadCanvaDb(id, {
				setCircles,
				setDiagramMetadata,
				setTool: () => { },
			}).then((updatedElements) => {
				setElements(updatedElements);
			}).finally(() => {
				setIsLoading(false);
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
		const handleResize = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
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
		}, 15000);

		return () => clearInterval(interval);
	}, [elements]);

	const zoomIn = () => {
		const stage = stageRef.current;
		const scaleBy = 1.05;
		const newScale = scale * scaleBy;

		const pointer = {
			x: dimensions.width / 2,
			y: dimensions.height / 2
		};

		const mousePointTo = {
			x: (pointer.x - position.x) / scale,
			y: (pointer.y - position.y) / scale,
		};

		const newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		};

		setScale(newScale);
		setPosition(newPos);
	};

	const zoomOut = () => {
		const stage = stageRef.current;
		const scaleBy = 1.05;
		const newScale = scale / scaleBy;

		const pointer = {
			x: dimensions.width / 2,
			y: dimensions.height / 2
		};

		const mousePointTo = {
			x: (pointer.x - position.x) / scale,
			y: (pointer.y - position.y) / scale,
		};

		const newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		};

		setScale(newScale);
		setPosition(newPos);
	};


	return (
		<>
			{isLoading ? (
				<Box
					className="absolute inset-0 flex items-center justify-center"
					style={{ zIndex: 1000 }}
				>
					<LoaderComponent />
				</Box>
			) : (
				<>
					{/* Título "DIAGRAMA" */}
					<div className="w-full">
						<div className="absolute ms-2 px-3 z-30 bg-blue-600 text-white font-semibold rounded-t-md shadow-md">
							{diagramMetadata.title}
						</div>
					</div>

					{/* Card principal */}
					<CardCustom className="w-full h-auto flex flex-col items-center justify-center !bg-gray-300 text-black relative mt-6 pt-2 rounded-md border-gray-400 border-2 !overflow-clip" >
						<div className="flex-1 w-full rounded-br-lg relative text-end">

							{/* Botones de zoom */}
							<div className="absolute left-2 flex flex-col gap-2 z-10">
								<IconButton onClick={zoomIn} title="Acercar" className="!bg-blue-400">
									<LuZoomIn />
								</IconButton>
								<IconButton onClick={zoomOut} title="Alejar" className="!bg-blue-400">
									<LuZoomOut />
								</IconButton>
							</div>

							{/* Botón de volver */}
							<div className="absolute right-2 z-10">
								<IconButton
									title="Volver"
									onClick={() => navigate('/config/diagram')}
									className="!bg-blue-400"
								>
									<LuArrowLeft />
								</IconButton>
							</div>

							{/* Canvas de Konva */}
							<Stage
								width={dimensions.width}
								height={dimensions.height}
								scaleX={scale}
								scaleY={scale}
								x={position.x}
								y={position.y}
								ref={stageRef}
								draggable
								onDragEnd={(e) => {
									setPosition({
										x: e.target.x(),
										y: e.target.y(),
									});
								}}
							>
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

										if (el.type === 'line' || el.type === 'polyline') {
											const value = el.dataInflux?.value;
											// si el valor es 0 mostrarla sin animacion								
											const isClosed = value == 0;
											const strokeColor = el.stroke;
											const dash = isClosed ? [] : [20, 10];
											const strokeLine = isClosed ? el.stroke : 'white';

											return (
												<Group key={`group-${el.type}-${el.id}`}>
													<Line points={el.points} stroke={strokeColor} strokeWidth={el.strokeWidth + 4} />
													<Line points={el.points} stroke={strokeLine} strokeWidth={el.strokeWidth + 2} />
													<Line
														points={el.points}
														stroke={strokeColor}
														strokeWidth={el.strokeWidth}
														dash={dash}
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

									{/* Tooltips */}
									{elements.map((el) => {
										if (!el.dataInflux?.name) return null;

										return (
											<React.Fragment key={`tooltip-${el.id}`}>
												{renderTooltipLabel(el)}
											</React.Fragment>
										);
									})}
								</Layer>
							</Stage>
						</div>
					</CardCustom>
				</>
			)}
		</>
	);
}

export default ViewDiagram;
