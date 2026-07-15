import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Stage, Layer, Text, Line, Label, Tag, Group, Rect } from 'react-konva';
import { uploadCanvaDb } from '../utils/js/drawActions';
import { getFlowAnimation } from '../utils/js/flowAnimation';
import { getElementBBox } from '../hooks/useDrawingTools';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { request } from '../../../utils/js/request';
import { backend } from '../../../utils/routes/app.routes';
import RenderImage from '../components/RenderImage/RenderImage';
import PanelElement from '../components/PanelElement/PanelElement';
import TankElement from '../components/WidgetElements/TankElement';
import LedElement from '../components/WidgetElements/LedElement';
import LinkButtonElement from '../components/WidgetElements/LinkButtonElement';
import VariableHistoryPopup from '../components/VariableHistoryPopup/VariableHistoryPopup';
import LoaderComponent from '../../../components/Loader';
import CardCustom from '../../../components/CardCustom';
import { LuZoomOut, LuZoomIn, LuArrowLeft, LuDownload } from 'react-icons/lu';
import { storage } from '../../../storage/storage';
import { canvasAreaSx } from '../utils/js/diagramTheme';

const darkPrimaryGradient = 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)';

const darkIconBtnSx = {
  width: 40,
  height: 40,
  borderRadius: '10px',
  color: '#ffffff',
  background: darkPrimaryGradient,
  boxShadow: '0 4px 14px rgba(31, 78, 121, 0.4)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  '&:hover': {
    background: darkPrimaryGradient,
    boxShadow: '0 8px 24px rgba(31, 78, 121, 0.55)',
    transform: 'translateY(-1px)',
  },
  '&:active': { transform: 'translateY(0)' },
};

const darkPillSx = {
  borderRadius: '999px',
  textTransform: 'none',
  fontWeight: 500,
  px: 2.25,
  py: 0.75,
  minHeight: 0,
  fontSize: '0.82rem',
  color: '#ffffff',
  background: darkPrimaryGradient,
  boxShadow: '0 4px 14px rgba(31, 78, 121, 0.4)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  '&:hover': {
    background: darkPrimaryGradient,
    boxShadow: '0 8px 24px rgba(31, 78, 121, 0.55)',
    transform: 'translateY(-1px)',
  },
  '&:active': { transform: 'translateY(0)' },
};

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
  const [rotation, setRotation] = useState(0);
  const [circles, setCircles] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const usuario = storage.get('usuario');
  const containerRef = useRef(null);
  const location = useLocation();
  const [historyPopup, setHistoryPopup] = useState(null);

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
      const influxPayload = [];

      currentElements.forEach(el => {
        if (el.dataInflux) {
          influxPayload.push({ id: el.dataInflux.id, dataInflux: el.dataInflux });
        }
        if (el.type === 'panel') {
          el.rows?.forEach(row => {
            if (row.dataInflux) {
              influxPayload.push({ id: row.dataInflux.id, dataInflux: row.dataInflux });
            }
          });
        }
      });
      if (!influxPayload.length) return;

      try {
        const response = await request(`${backend['Mas Agua']}/multipleDataInflux`, 'POST', influxPayload);
        const result = response.data;
        setElements(prev =>
          prev.map(el => {
            if (el.type === 'panel') {
              return {
                ...el,
                rows: el.rows.map(row =>
                  row.dataInflux?.id && result[row.dataInflux.id] !== undefined
                    ? { ...row, dataInflux: { ...row.dataInflux, value: result[row.dataInflux.id] } }
                    : row
                ),
              };
            }
            return el.dataInflux?.id && result[el.dataInflux.id] !== undefined
              ? { ...el, dataInflux: { ...el.dataInflux, value: result[el.dataInflux.id] } }
              : el;
          })
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

  //EXPORTA EL AREA VISIBLE DEL DIAGRAMA COMO IMAGEN PNG
  const exportPng = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `${diagramMetadata.title || 'diagrama'}.png`;
    link.href = uri;
    link.click();
  };

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
    }
    // ── NUEVO: calc_binary_compressed → muestra el label del resultado ──
    else if (el.dataInflux.calc_binary_compressed && rawValue?.label) {
      text = rawValue.label;
    } else if (maxValue && !isNaN(maxValue) && Number(maxValue) !== 0 && rawValue != null && !isNaN(rawValue)) {
      const percentage = ((Number(rawValue) * 100) / Number(maxValue)).toFixed(1);
      text = `${percentage}%`;
    } else if (rawValue != null) {
      text = !isNaN(rawValue) ? `${Number(rawValue)} ${unit}` : `${rawValue}`;
    } else {
      text = 'No hay datos';
    }

    const isSondaConductimetro = el.src?.includes('Sonda_conductimetro.png');
    if (isSondaConductimetro) {
      const relX = 0.20;
      const relY = 0.02;
      const boxWidth = el.width * 1.25;
      const boxHeight = el.height * 0.36;
      const fontSize = el.width * 0.18;
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
    // Cajas reales de cada elemento (las lineas tienen x=0 y puntos absolutos:
    // usar el.x directo rompia el encuadre)
    const boxes = elementsParam.map(getElementBBox);
    const minX = Math.min(...boxes.map(b => b.x));
    const minY = Math.min(...boxes.map(b => b.y));
    const maxX = Math.max(...boxes.map(b => b.x + b.width));
    const maxY = Math.max(...boxes.map(b => b.y + b.height));
    const diagramWidth = maxX - minX;
    const diagramHeight = maxY - minY;
    if (diagramWidth === 0 || diagramHeight === 0) return;
    const padding = 32;
    const availableWidth = dimensions.width - padding * 2;
    const availableHeight = dimensions.height - padding * 2;

    // Si el diagrama es horizontal pero el contenedor es vertical (mobile),
    // lo rotamos 90° para aprovechar el alto de la pantalla.
    const diagramIsLandscape = diagramWidth >= diagramHeight;
    const containerIsPortrait = dimensions.height > dimensions.width;
    const shouldRotate = diagramIsLandscape && containerIsPortrait;
    setRotation(shouldRotate ? 90 : 0);

    if (shouldRotate) {
      // Rotado 90°: el ancho del diagrama ocupa el alto del contenedor y viceversa.
      const newScale = Math.min(availableWidth / diagramHeight, availableHeight / diagramWidth);
      setScale(newScale);
      setPosition({
        x: dimensions.width / 2 + (newScale * (minY + maxY)) / 2,
        y: dimensions.height / 2 - (newScale * (minX + maxX)) / 2,
      });
      return;
    }

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
          // Animacion segun el caudal: sin caudal se detiene, y con caudal de
          // referencia la velocidad acompaña al valor
          const { isClosed, speedFactor } = getFlowAnimation(el.dataInflux);
          return (
            <Group key={`group-${el.type}-${el.id}`}>
              {/* Borde exterior del caño */}
              <Line
                points={el.points}
                stroke='#94a3b8'
                strokeWidth={el.strokeWidth + 5}
                lineCap='round'
                lineJoin='round'
              />
              {/* Cuerpo del caño */}
              <Line
                points={el.points}
                stroke='#e2e8f0'
                strokeWidth={el.strokeWidth + 3}
                lineCap='round'
                lineJoin='round'
              />
              {/* Flujo animado — sólo cuando hay caudal */}
              {!isClosed && (
                <Line
                  points={el.points}
                  stroke={el.stroke}
                  strokeWidth={el.strokeWidth}
                  dash={[10, 8]}
                  dashOffset={(el.invertAnimation ? -dashOffset : dashOffset) * speedFactor}
                  lineCap='round'
                  lineJoin='round'
                />
              )}
            </Group>
          );
        }
        if (el.type === 'image') {
          return <RenderImage key={el.id} el={el} />;
        }
        if (el.type === 'panel') {
          return <PanelElement key={el.id} el={el} />;
        }
        if (el.type === 'tank') {
          return <TankElement key={el.id} el={el} />;
        }
        if (el.type === 'led') {
          return <LedElement key={el.id} el={el} />;
        }
        if (el.type === 'linkButton') {
          return <LinkButtonElement key={el.id} el={el} />;
        }
        return null;
      })();

      // El tanque ya muestra su porcentaje adentro, y en las cañerias el flujo
      // animado ya cuenta la historia: sin tooltip para esos tipos
      const tooltip =
        el.dataInflux?.name && !['tank', 'line', 'polyline'].includes(el.type)
          ? renderTooltipLabel(el)
          : null;

      // Elementos vinculados: clic navega al otro diagrama (drill-down)
      if (el.linkDiagram) {
        return (
          <Group
            key={`frag-${el.id}`}
            onClick={() => navigate(`/viewDiagram/${el.linkDiagram}`, { state: { drill: true } })}
            onTap={() => navigate(`/viewDiagram/${el.linkDiagram}`, { state: { drill: true } })}
            onMouseEnter={(e) => {
              e.target.getStage().container().style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
              e.target.getStage().container().style.cursor = 'default';
            }}
          >
            {elementRender}
            {tooltip}
          </Group>
        );
      }

      // Elementos con variable numerica: clic abre la historia reciente
      const canShowHistory =
        el.dataInflux?.id &&
        el.type !== 'panel' &&
        !el.dataInflux.binary_compressed &&
        !el.dataInflux.calc_binary_compressed;

      if (canShowHistory) {
        return (
          <Group
            key={`frag-${el.id}`}
            onClick={() => setHistoryPopup(el.dataInflux)}
            onTap={() => setHistoryPopup(el.dataInflux)}
            onMouseEnter={(e) => {
              e.target.getStage().container().style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
              e.target.getStage().container().style.cursor = 'default';
            }}
          >
            {elementRender}
            {tooltip}
          </Group>
        );
      }

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
    // "id" re-encuadra al navegar entre diagramas vinculados
  }, [dimensions, autoFitDiagram, id, elements.length]);


  return (
    <div className='w-full h-[88vh] flex flex-col'>
      <div className='flex items-end justify-between gap-3'>
        <div
          className='inline-flex items-center gap-2 text-white rounded-t-md shadow-md min-w-0'
          style={{
            padding: '4px 20px',
            background: darkPrimaryGradient,
            boxShadow: '0 4px 20px rgba(44, 106, 160, 0.3)',
          }}
        >
          <span className='hidden sm:inline text-[9px] font-semibold uppercase tracking-[0.18em] text-white/75'>
            Diagrama
          </span>
          <span className='hidden sm:inline text-white/40'>·</span>
          <span className='text-sm font-semibold text-white truncate'>
            {diagramMetadata.title || 'Diagrama sin nombre'}
          </span>
        </div>

        {usuario?.profile === 4 && (
          <Button
            variant='contained'
            startIcon={<LuArrowLeft />}
            onClick={() => navigate('/config/diagram')}
            sx={{ ...darkPillSx, mb: 0.5 }}
          >
            Volver
          </Button>
        )}
      </div>

      <CardCustom className='rounded-xl rounded-tl-none h-auto w-auto flex-1 overflow-hidden relative'>
        {isLoading ? (
          <LoaderComponent />
        ) : (
          <Box sx={canvasAreaSx} className='w-full h-full relative rounded-lg overflow-hidden'>
            <div ref={containerRef} className='w-full h-full relative'>
              <div className='absolute top-2 left-2 z-10 flex flex-col gap-2'>
                <Tooltip title='Acercar' placement='right'>
                  <IconButton onClick={zoomIn} sx={darkIconBtnSx}>
                    <LuZoomIn size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Alejar' placement='right'>
                  <IconButton onClick={zoomOut} sx={darkIconBtnSx}>
                    <LuZoomOut size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Descargar como imagen' placement='right'>
                  <IconButton onClick={exportPng} sx={darkIconBtnSx}>
                    <LuDownload size={18} />
                  </IconButton>
                </Tooltip>
                {location.state?.drill && (
                  <Tooltip title='Volver al diagrama anterior' placement='right'>
                    <IconButton onClick={() => navigate(-1)} sx={darkIconBtnSx}>
                      <LuArrowLeft size={18} />
                    </IconButton>
                  </Tooltip>
                )}
              </div>

              {historyPopup && (
                <VariableHistoryPopup
                  dataInflux={historyPopup}
                  onClose={() => setHistoryPopup(null)}
                />
              )}

              {dimensions.width > 0 && (
                <Stage
                  width={dimensions.width}
                  height={dimensions.height}
                  scaleX={scale}
                  scaleY={scale}
                  rotation={rotation}
                  x={position.x}
                  y={position.y}
                  ref={stageRef}
                  draggable
                  onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
                >
                  <Layer>{renderElementsAndTooltips()}</Layer>
                </Stage>
              )}
            </div>
          </Box>
        )}
      </CardCustom>
    </div>
  );
}

export default ViewDiagram;
