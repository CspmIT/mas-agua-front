import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stage, Layer, Text, Line, Label, Tag, Group, Rect } from 'react-konva';
import { uploadCanvaDb } from '../utils/js/drawActions';
import CardCustom from '../../../components/CardCustom';
import { IconButton, Box } from '@mui/material';
import { request } from '../../../utils/js/request';
import { backend } from '../../../utils/routes/app.routes';
import RenderImage from '../components/RenderImage/RenderImage';
import LoaderComponent from '../../../components/Loader';
import { LuZoomOut, LuZoomIn, LuArrowLeft } from "react-icons/lu";
import { storage } from '../../../storage/storage';

function ViewDiagram() {
  const { id } = useParams();
  const stageRef = useRef();
  const [dashOffset, setDashOffset] = useState(0);
  const [elements, setElements] = useState([]);
  const elementsRef = useRef(elements); 
  const [diagramMetadata, setDiagramMetadata] = useState({ id: null, title: '', backgroundColor: '#ffffff', backgroundImg: '' });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [scale, setScale] = useState(1);
  const [circles, setCircles] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const usuario = storage.get('usuario');
  const containerRef = useRef(null);

  useEffect(() => { elementsRef.current = elements; }, [elements]);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      uploadCanvaDb(id, {
        setCircles,
        setDiagramMetadata,
        setTool: () => { },
      }).then((updatedElements) => {
        setElements(updatedElements || []);
      }).finally(() => setIsLoading(false));
    }
  }, [id]);

  useEffect(() => {
    let frameId;
    const animate = () => {
      setDashOffset(prev => prev + 0.25);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
  
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
  
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isLoading]);

  useEffect(() => {
    const updateInflux = async () => {
      const currentElements = elementsRef.current;
      const influxPayload = currentElements
        .filter(el => el.dataInflux)
        .map(el => ({ id: el.dataInflux.id, dataInflux: el.dataInflux }));
      if (!influxPayload.length) return;

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
    };

    const interval = setInterval(updateInflux, 15000);
    return () => clearInterval(interval);
  }, []); 

  // funciones de zoom
  const zoomIn = useCallback(() => {
    const scaleBy = 1.05;
    const newScale = scale * scaleBy;
    const pointer = { x: dimensions.width / 2, y: dimensions.height / 2 };
    const mousePointTo = { x: (pointer.x - position.x) / scale, y: (pointer.y - position.y) / scale };
    const newPos = { x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale };
    setScale(newScale);
    setPosition(newPos);
  }, [scale, position, dimensions]);

  const zoomOut = useCallback(() => {
    const scaleBy = 1.05;
    const newScale = scale / scaleBy;
    const pointer = { x: dimensions.width / 2, y: dimensions.height / 2 };
    const mousePointTo = { x: (pointer.x - position.x) / scale, y: (pointer.y - position.y) / scale };
    const newPos = { x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale };
    setScale(newScale);
    setPosition(newPos);
  }, [scale, position, dimensions]);

  const renderTooltipLabel = useCallback((el) => {
    if (!el.dataInflux?.show) return null;
    const offset = 5;
    let labelX = el.x + (el.width || 0) / 2;
    let labelY = el.y + (el.height || 0) / 2;
    let pointerDir = 'down';
    switch (el.dataInflux?.position) {
      case 'Arriba': labelY = el.y - offset; pointerDir = 'down'; break;
      case 'Abajo': labelY = el.y + (el.height || 0) + offset; pointerDir = 'up'; break;
      case 'Izquierda': labelX = el.x - offset; pointerDir = 'right'; break;
      case 'Derecha': labelX = el.x + (el.width || 0) + offset; pointerDir = 'left'; break;
      default: pointerDir = 'down'; break;
    }

    const rawValue = el.dataInflux.value;
    const maxValue = el.dataInflux.max_value_var;
    const unit = el.dataInflux?.unit || '';
    let text = '';

    if (el.dataInflux.binary_compressed && Array.isArray(rawValue)) {
      const selectedBitId = el.dataInflux.id_bit;
      const bitData = rawValue.find(b => b.id_bit === selectedBitId);
      text = bitData ? bitData.bit : (el.dataInflux.name || 'Bit desconocido');
    } else if (maxValue && !isNaN(maxValue) && Number(maxValue) !== 0 && rawValue != null && !isNaN(rawValue)) {
      const percentage = ((Number(rawValue) * 100) / Number(maxValue)).toFixed(1);
      text = `${percentage}%`;
    } else if (rawValue != null) {
      text = !isNaN(rawValue) ? `${Number(rawValue).toFixed(1)} ${unit}` : `${rawValue}`;
    } else {
      text = 'No hay datos';
    }

    const isSondaConductimetro = el.src?.includes('Sonda_conductimetro.png');
    if (isSondaConductimetro) {
      const relX = 0.20;
      const relY = 0.02;
      const boxWidth = el.width * 1.25;
      const boxHeight = el.height * 0.36;
      const fontSize = el.width * 0.20;
      const unitSize = el.width * 0.16;
      const padding = el.width * 0.02;
      
      const [value = text, unit = ''] = text.split(' ');

      return (
        <Group key={`tooltip-${el.id}`} rotation={el.rotation || 0}>
          {/* Fondo exterior */}
          <Rect
            x={el.x + el.width * relX - padding}
            y={el.y + el.height * relY - padding}
            width={boxWidth + padding * 2}
            height={boxHeight + padding * 2}
            fill="#3a3a3a"
            cornerRadius={4}
            stroke="#666"
            strokeWidth={1.5}
          />
          {/* Pantalla */}
          <Rect
            x={el.x + el.width * relX}
            y={el.y + el.height * relY}
            width={boxWidth}
            height={boxHeight}
            fill="#0a1a0a"
            cornerRadius={2}
            stroke="#1a3a1a"
            strokeWidth={1}
          />
          {/* Valor numérico */}
          <Text
            text={value}
            x={el.x + el.width * relX}
            y={el.y + el.height * relY + boxHeight * 0.1}
            width={boxWidth}
            align="center"
            fontSize={fontSize}
            fontFamily="'Courier New', monospace"
            fontStyle="bold"
            fill="#FFE000"
            shadowColor="#FFE000"
            shadowBlur={6}
            shadowOpacity={0.5}
          />
          {/* Unidad */}
          <Text
            text={unit}
            x={el.x + el.width * relX}
            y={el.y + el.height * relY + boxHeight * 0.6}
            width={boxWidth}
            align="center"
            fontSize={unitSize}
            fontFamily="'Courier New', monospace"
            fill="#AACCAA"
            shadowColor="#88BB88"
            shadowBlur={4}
            shadowOpacity={0.4}
          />
        </Group>
      );
    }

    const tanqueImages = ['Estanque_cloro.png', 'Cisterna.png', 'Tanques_agua_multiple.png', 'Tanques_agua_simple.png', 'tanque_horizontal.png', 'Tanque_elevado.png'];
    const isEstanque = tanqueImages.some(name => el.src?.includes(name));
    if (isEstanque) {
      const percentage = (maxValue && !isNaN(maxValue) && Number(maxValue) !== 0 && rawValue != null && !isNaN(rawValue)) ? `${((Number(rawValue) * 100) / Number(maxValue)).toFixed(1)}%` : `${Math.round(rawValue)}${unit}`;
      const baseFontSize = el.width * 0.12;
      const fontSize = Math.min(baseFontSize, 18);
      const padding = 5;
      const maxTextWidth = 80;
      const textWidth = Math.min(el.width * 0.45, maxTextWidth);
      const textHeight = fontSize + padding * 1;
      return (
        <Group rotation={el.rotation || 0} key={`tooltip-${el.id}`}>
          <Label x={el.x + el.width / 2 - textWidth / 2} y={el.y + el.height / 2 - textHeight / 1.3}>
            <Tag fill="#fff" cornerRadius={2} lineJoin="round" shadowColor="#27272a" shadowBlur={5} />
            <Text text={percentage} fontFamily="Arial" fontSize={fontSize} padding={padding} width={textWidth} align="center" fill="black" />
          </Label>
        </Group>
      );
    }
    
    return (
      <Label x={labelX} y={labelY} key={`tooltip-${el.id}`}>
        <Tag fill='#ffff' pointerDirection={pointerDir} pointerWidth={10} pointerHeight={10} lineJoin="round" cornerRadius={5} shadowColor="#94a3b8" shadowBlur={7} />
        <Text text={text} fontFamily='arial' fontSize={14} padding={8} fill="black" />
      </Label>
    );
  }, []);

  // autoFit (separada por claridad)
  const autoFitDiagram = useCallback((elementsParam) => {
    if (!elementsParam?.length) return;
    if (dimensions.width === 0 || dimensions.height === 0) return;
    const minX = Math.min(...elementsParam.map(el => el.x));
    const minY = Math.min(...elementsParam.map(el => el.y));
    const maxX = Math.max(...elementsParam.map(el => (el.x + (el.width || 0))));
    const maxY = Math.max(...elementsParam.map(el => (el.y + (el.height || 0))));
    const diagramWidth = maxX - minX;
    const diagramHeight = maxY - minY;
    const padding = 32;
    const availableWidth = dimensions.width - padding * 2;
    const availableHeight = dimensions.height - padding * 2;

    const newScale = Math.min(availableWidth / diagramWidth, availableHeight / diagramHeight);
    const offsetX = (dimensions.width - diagramWidth * newScale) / 2;
    const offsetY = (dimensions.height - diagramHeight * newScale) / 2;
    setScale(newScale);
    setPosition({
      x: offsetX - minX * newScale,
      y: offsetY - minY * newScale,
    });
  }, [dimensions]);
  
  const renderElementsAndTooltips = () => {
    return elements.map((el) => {
      const elementRender = (() => {
        if (el.type === 'text') {
          return (
            <Group key={`group-text-${el.id}`}>
              <Text x={el.x} y={el.y} text={el.text} fontSize={el.fontSize} fill={el.fill} fontStyle={el.fontStyle} />
            </Group>
          );
        }
        if (el.type === 'line' || el.type === 'polyline') {
          const value = el.dataInflux?.value;
          const isClosed = value == 0;
          const strokeColor = el.stroke;
          const dash = isClosed ? [] : [20, 10];
          const strokeLine = isClosed ? el.stroke : 'white';
          return (
            <Group key={`group-${el.type}-${el.id}`}>
              <Line points={el.points} stroke={strokeColor} strokeWidth={el.strokeWidth + 4} />
              <Line points={el.points} stroke={strokeLine} strokeWidth={el.strokeWidth + 2} />
              <Line points={el.points} stroke={strokeColor} strokeWidth={el.strokeWidth} dash={dash} dashOffset={el.invertAnimation ? -dashOffset : dashOffset} />
            </Group>
          );
        }
        if (el.type === 'image') {
          return <RenderImage key={el.id} el={el} />;
        }
        return null;
      })();

      const tooltip = el.dataInflux?.name ? renderTooltipLabel(el) : null;

      return (
        <React.Fragment key={`frag-${el.id}`}>
          {elementRender}
          {tooltip}
        </React.Fragment>
      );
    });
  };
  
  useEffect(() => {
    if (elements.length && dimensions.width > 0) {
      autoFitDiagram(elements);
    }
  }, [dimensions, autoFitDiagram]);
  
  
  return (
    <>
      {isLoading ? (
        <Box className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1000 }}>
          <LoaderComponent />
        </Box>
      ) : (
        <div className="h-[85vh] w-full flex flex-col items-center mb-10">
          <div className="w-full">
            <div className="absolute ms-2 px-3 z-30 bg-[#2c6aa0] text-white font-semibold rounded-t-md shadow-md">
              {diagramMetadata.title}
            </div>
          </div>

          <CardCustom className="w-full h-full flex flex-col items-center justify-center !bg-gray-300/50 text-black relative mt-6 pt-2 rounded-md border-gray-400 border-2 !overflow-clip" >
            <div ref={containerRef} className="flex-1 w-full h-full rounded-br-lg relative text-end">
              <div className="absolute top-2 left-0 right-0 flex justify-between items-start px-4 z-10">
                <div className="flex flex-col gap-2">
                  <IconButton onClick={zoomIn} title="Acercar" className="!bg-blue-600 !text-white !shadow-lg"><LuZoomIn /></IconButton>
                  <IconButton onClick={zoomOut} title="Alejar" className="!bg-blue-600 !text-white !shadow-lg"><LuZoomOut /></IconButton>
                </div>

                {usuario.profile === 4 && (
                  <IconButton title="Volver" onClick={() => navigate('/config/diagram')} className="!bg-blue-600 !text-white !shadow-sm">
                    <LuArrowLeft />
                  </IconButton>
                )}
              </div>

              {dimensions.width > 0 && (
                <Stage width={dimensions.width} height={dimensions.height} scaleX={scale} scaleY={scale} x={position.x} y={position.y} ref={stageRef} draggable onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}>
                  <Layer>
                    {renderElementsAndTooltips()}
                  </Layer>
                </Stage>
              )}
            </div>
          </CardCustom>
        </div>
      )}
    </>
  );
}

export default ViewDiagram;
