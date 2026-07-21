import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Stage, Layer, Line, Text, Transformer, Circle, Group, Rect, Label, Tag } from 'react-konva';
import ImageElement from '../ImageElement/ImageElement';
import PanelElement, { getPanelHeight, PANEL_PADDING, PANEL_TITLE_HEIGHT } from '../PanelElement/PanelElement';
import { getFlowAnimation } from '../../utils/js/flowAnimation';
import TankElement from '../WidgetElements/TankElement';
import LedElement from '../WidgetElements/LedElement';
import LinkButtonElement from '../WidgetElements/LinkButtonElement';
import VarCardElement from '../WidgetElements/VarCardElement';
import ActionButtonElement from '../WidgetElements/ActionButtonElement';

const WIDGET_COMPONENTS = { tank: TankElement, led: LedElement, linkButton: LinkButtonElement, varCard: VarCardElement, actionButton: ActionButtonElement };

// Funcion para calcular puntos a la hora de hacer la polilinea
const distToSegment = (p, v, w) => {
  const squaredLength = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (squaredLength === 0) return Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2);

  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / squaredLength;
  t = Math.max(0, Math.min(1, t));

  const closestPoint = {
    x: v.x + t * (w.x - v.x),
    y: v.y + t * (w.y - v.y)
  };

  return Math.sqrt((p.x - closestPoint.x) ** 2 + (p.y - closestPoint.y) ** 2);
};

const DiagramCanvas = ({
  elements,
  circles,
  tempLine,
  captureRect,
  selectedId,
  stageRef,
  transformerRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleSelect,
  setElements,
  setCircles,
  setTextInput,
  setTextPosition,
  setEditingTextId,
  setTextStyle,
  tool,
  handleTransformEnd,
  stageScale,
  stagePosition,
  isPanning,
  setStagePosition,
  setStageScale,
  isDraggingStage,
  setIsDraggingStage,
  dragStartPos,
  setDragStartPos,
}) => {
  // Animacion de flujo: actualiza los dashOffset de las lineas .flowLine directo
  // sobre Konva, sin re-renderizar React. Resuelve la capa viva en cada frame
  // para sobrevivir remontajes del Stage.
  useEffect(() => {
    let raf;
    const start = performance.now();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const stage = stageRef.current;
      if (!stage) return;
      const layer = stage.getLayers()[0];
      if (!layer) return;
      const nodes = layer.find('.flowLine');
      if (!nodes.length) return;

      const offset = ((performance.now() - start) / 1000) * 5; // pixeles por segundo
      nodes.forEach((node) => node.dashOffset((node.getAttr('flowDir') || 1) * offset));
      // Solo el canvas visible: el canvas de hit no cambia con el dashOffset
      layer.drawScene();
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ===== Guias de alineacion (snapping) =====
  const GUIDELINE_OFFSET = 5; // umbral en pixeles de pantalla
  const [guides, setGuides] = useState([]);
  const elementIdSet = useMemo(() => new Set(elements.map((el) => String(el.id))), [elements]);

  const handleLayerDragMove = (e) => {
    const node = e.target;
    const nodeId = node.getAttr('id');
    // Solo elementos del diagrama (excluye circulos de edicion, transformer, etc.)
    if (!nodeId || !elementIdSet.has(String(nodeId))) return;

    // Bordes y centros del resto de los elementos, en coordenadas de pantalla
    // (los elementos viven dentro del grupo contenedor "elementsRoot")
    const elementsRoot = node.getLayer().findOne('.elementsRoot');
    if (!elementsRoot) return;

    const stopsV = [];
    const stopsH = [];
    elementsRoot.getChildren().forEach((child) => {
      const childId = child.getAttr('id');
      if (!childId || String(childId) === String(nodeId) || !elementIdSet.has(String(childId))) return;
      const box = child.getClientRect();
      stopsV.push(box.x, box.x + box.width / 2, box.x + box.width);
      stopsH.push(box.y, box.y + box.height / 2, box.y + box.height);
    });

    // Bordes y centro del elemento arrastrado, con su offset respecto de la posicion absoluta
    const box = node.getClientRect();
    const absPos = node.absolutePosition();
    const edgesV = [
      { guide: box.x, offset: absPos.x - box.x },
      { guide: box.x + box.width / 2, offset: absPos.x - (box.x + box.width / 2) },
      { guide: box.x + box.width, offset: absPos.x - (box.x + box.width) },
    ];
    const edgesH = [
      { guide: box.y, offset: absPos.y - box.y },
      { guide: box.y + box.height / 2, offset: absPos.y - (box.y + box.height / 2) },
      { guide: box.y + box.height, offset: absPos.y - (box.y + box.height) },
    ];

    let bestV = null;
    let bestH = null;
    stopsV.forEach((stop) => {
      edgesV.forEach((edge) => {
        const diff = Math.abs(stop - edge.guide);
        if (diff < GUIDELINE_OFFSET && (!bestV || diff < bestV.diff)) bestV = { stop, offset: edge.offset, diff };
      });
    });
    stopsH.forEach((stop) => {
      edgesH.forEach((edge) => {
        const diff = Math.abs(stop - edge.guide);
        if (diff < GUIDELINE_OFFSET && (!bestH || diff < bestH.diff)) bestH = { stop, offset: edge.offset, diff };
      });
    });

    const newGuides = [];
    const newPos = node.absolutePosition();
    if (bestV) {
      newPos.x = bestV.stop + bestV.offset;
      newGuides.push({ orientation: 'V', stop: bestV.stop });
    }
    if (bestH) {
      newPos.y = bestH.stop + bestH.offset;
      newGuides.push({ orientation: 'H', stop: bestH.stop });
    }
    node.absolutePosition(newPos);
    setGuides(newGuides);
  };

  const handleLayerDragEnd = () => {
    setGuides((prev) => (prev.length ? [] : prev));
  };

  return (
    <>
      <Stage
        width={window.innerWidth - 190}
        height={window.innerHeight - 125}
        ref={stageRef}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        onMouseDown={(e) => {
          if (isPanning && e.target === e.target.getStage()) {
            setIsDraggingStage(true);
            const pointer = e.target.getStage().getPointerPosition();
            setDragStartPos({ x: pointer.x, y: pointer.y });
          } else {
            handleMouseDown(e);
          }
        }}
        onMouseMove={(e) => {
          if (isDraggingStage && dragStartPos) {
            const pointer = e.target.getStage().getPointerPosition();
            const dx = pointer.x - dragStartPos.x;
            const dy = pointer.y - dragStartPos.y;

            setDragStartPos(pointer);
            setStagePosition((prev) => ({
              x: prev.x + dx,
              y: prev.y + dy,
            }));
          } else {
            handleMouseMove(e);
          }
        }}
        onMouseUp={() => {
          if (isDraggingStage) setIsDraggingStage(false);
          handleMouseUp();
        }}
        onWheel={(e) => {
          e.evt.preventDefault();
          const scaleBy = 1.05;
          const stage = e.target.getStage();
          const oldScale = stage.scaleX();
          const pointer = stage.getPointerPosition();

          const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
          };

          const direction = e.evt.deltaY > 0 ? -1 : 1;
          const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

          const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          };

          setStageScale(newScale);
          setStagePosition(newPos);
        }}
        style={{
          cursor: isPanning ? 'grab' : ['simpleLine', 'polyline', 'panel', 'captureSymbol'].includes(tool) ? 'crosshair' : 'default',
        }}
      >
        <Layer onDragMove={handleLayerDragMove} onDragEnd={handleLayerDragEnd}>
          {/* Durante la captura de simbolo los elementos no reciben eventos */}
          <Group name='elementsRoot' listening={tool !== 'captureSymbol'}>
          {
            elements.map((el) => {
              if (el.type === 'line') {
                return (
                  <Fragment key={el.id}>
                    <Group
                      x={el.x}
                      y={el.y}
                      draggable={el.draggable}
                      id={String(el.id)}
                      onClick={(e) => {
                        const id = e.target.getAttr('id');
                        handleSelect(e, id);
                      }}
                      onDragEnd={(e) => {
                        const { x, y } = e.target.position();
                        setElements((prev) =>
                          prev.map((item) => (item.id === el.id ? { ...item, x, y } : item))
                        );
                      }}
                    >
                      {/* Borde exterior (caño) */}
                      <Line
                        key={`${el.id}-border`}
                        points={el.points}
                        stroke='#94a3b8'
                        strokeWidth={el.strokeWidth + 5}
                        lineCap='round'
                        lineJoin='round'
                      />
                      {/* Cuerpo del caño */}
                      <Line
                        key={`${el.id}-body`}
                        points={el.points}
                        stroke='#e2e8f0'
                        strokeWidth={el.strokeWidth + 3}
                        lineCap='round'
                        lineJoin='round'
                      />
                      {/* Flujo animado dentro del caño */}
                      <Line
                        id={String(el.id)}
                        key={`${el.id}-main`}
                        points={el.points}
                        stroke={el.stroke}
                        strokeWidth={el.strokeWidth}
                        dash={[10, 8]}
                        name={getFlowAnimation(el.dataInflux).isClosed ? undefined : 'flowLine'}
                        flowDir={el.invertAnimation ? -1 : 1}
                        lineCap='round'
                        lineJoin='round'
                      />

                      {/* Label para mostrar la variable asignada a la linea */}
                      {el.dataInflux?.name && (() => {
                        const [x1, y1, x2, y2] = el.points;
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        const angleRadians = Math.atan2(y2 - y1, x2 - x1);
                        const angleDegrees = (angleRadians * 180) / Math.PI;

                        const offset = 30;
                        let labelX = midX;
                        let labelY = midY;

                        switch (el.dataInflux.position) {
                          case 'Arriba':
                            labelY = midY - offset;
                            break;
                          case 'Abajo':
                            labelY = midY + offset;
                            break;
                          case 'Derecha':
                            labelX = midX - offset;
                            break;
                          case 'Izquierda':
                            labelX = midX + offset;
                            break;
                          case 'Centro':
                          default:
                            break;
                        }

                        return (
                          <Label x={labelX - 25} y={labelY - 20} rotation={angleDegrees} opacity={el.dataInflux.show ? 1 : 0.5}>
                            <Tag
                              fill="white"
                              pointerDirection="down"
                              pointerWidth={10}
                              pointerHeight={10}
                              lineJoin="round"
                              cornerRadius={5}
                            />
                            <Text
                              text={el.dataInflux.name}
                              fontFamily="arial"
                              fontSize={14}
                              padding={8}
                              fill="black"
                            />
                          </Label>
                        );
                      })()}
                    </Group>
                  </Fragment>
                );
              }

              if (el.type === 'text') {
                const offset = 30;
                let labelX = el.x + (el.width || 0) / 2;
                let labelY = el.y;

                switch (el.dataInflux?.position) {
                  case 'Arriba':
                    labelY = el.y - offset;
                    break;
                  case 'Abajo':
                    labelY = el.y + offset;
                    break;
                  case 'Izquierda':
                    labelX = el.x - offset;
                    break;
                  case 'Derecha':
                    labelX = el.x + (el.width || 0) + offset;
                    break;
                  case 'Centro':
                  default:
                    break;
                }

                return (
                  <Fragment key={el.id}>
                    <Group
                      x={el.x}
                      y={el.y}
                      draggable
                      id={String(el.id)}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        const id = e.target.getAttr('id');
                        handleSelect(e, id);
                      }}
                      onDblClick={(e) => {
                        e.cancelBubble = true;
                        setTextPosition({ x: el.x, y: el.y });
                        setTextInput(el.text);
                        setEditingTextId(el.id);
                        setTextStyle({
                          fontSize: el.fontSize || 16,
                          fill: el.fill || '#000',
                          fontStyle: el.fontStyle || 'normal',
                        });
                      }}
                      onDragEnd={(e) => {
                        const { x, y } = e.target.position();
                        setElements((prev) =>
                          prev.map((item) => (item.id === el.id ? { ...item, x, y } : item))
                        );
                      }}
                    >
                      <Text
                        id={String(el.id)}
                        text={el.text}
                        x={0}
                        y={0}
                        fontSize={el.fontSize || 16}
                        fill={el.fill || '#000'}
                        fontStyle={el.fontStyle || 'normal'}
                        hitStrokeWidth={20}
                      />
                    </Group>

                    {el.dataInflux && el.dataInflux.name && (
                      <Label x={labelX} y={labelY} opacity={el.dataInflux.show ? 1 : 0.5}>
                        <Tag
                          fill="white"
                          pointerDirection="down"
                          pointerWidth={10}
                          pointerHeight={10}
                          lineJoin="round"
                          cornerRadius={5}
                        />
                        <Text
                          text={el.dataInflux.name}
                          fontFamily="arial"
                          fontSize={14}
                          padding={8}
                          fill="black"
                        />
                      </Label>
                    )}
                  </Fragment>
                );
              }

              if (el.type === 'image') {
                const offset = 5;
                let labelX = el.x + (el.width || 0) / 2;
                let labelY = el.y + (el.height || 0) / 2;

                let pointerDir = 'down';
                switch (el.dataInflux?.position) {
                  case 'Arriba':
                    labelY = el.y - offset;
                    pointerDir = 'down';
                    break;
                  case 'Abajo':
                    labelY = el.y + (el.height || 0) + offset;
                    pointerDir = 'up';
                    break;
                  case 'Izquierda':
                    labelX = el.x - offset;
                    pointerDir = 'right';
                    break;
                  case 'Derecha':
                    labelX = el.x + (el.width || 0) + offset;
                    pointerDir = 'left';
                    break;
                  case 'Centro':
                  default:
                    pointerDir = 'down';
                    break;
                }

                return (
                  <Fragment key={el.id}>
                    <ImageElement
                      src={el.src}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      draggable={el.draggable}
                      id={String(el.id)}
                      onClick={(e) => {
                        const id = e.target.getAttr('id');
                        handleSelect(e, id);
                      }}
                      onDragEnd={(e) => {
                        const { x, y } = e.target.position();
                        setElements((prev) =>
                          prev.map((item) => (item.id === el.id ? { ...item, x, y } : item))
                        );
                      }}
                      onTransformEnd={(e) => handleTransformEnd(el.id, e.target)}
                    />

                    {el.dataInflux && el.dataInflux.name && (
                      <Label x={labelX} y={labelY} opacity={el.dataInflux.show ? 1 : 0.5}>
                        <Tag
                          fill="white"
                          pointerDirection={pointerDir}
                          pointerWidth={10}
                          pointerHeight={10}
                          lineJoin="round"
                          cornerRadius={5}
                        />
                        <Text
                          text={
                            el.dataInflux.bit_name
                              ? `${el.dataInflux.name} - (${el.dataInflux.bit_name})`
                              : el.dataInflux.name
                          }
                          fontFamily="arial"
                          fontSize={14}
                          padding={8}
                          fill="black"
                        />
                      </Label>
                    )}

                    {/* Indicador de bomba PLC asignada (solo en el editor) */}
                    {el.idBomb && (
                      <Label x={el.x + (el.width || 0) / 2} y={el.y - 4} opacity={0.95}>
                        <Tag
                          fill='#1f4e79'
                          pointerDirection='down'
                          pointerWidth={8}
                          pointerHeight={6}
                          lineJoin='round'
                          cornerRadius={4}
                        />
                        <Text
                          text={`⏻ ${el.bombName || 'Bomba PLC'}`}
                          fontFamily='arial'
                          fontSize={12}
                          padding={5}
                          fill='#ffffff'
                        />
                      </Label>
                    )}
                  </Fragment>
                );
              }


              if (WIDGET_COMPONENTS[el.type]) {
                const WidgetComponent = WIDGET_COMPONENTS[el.type];
                const offset = 5;
                let labelX = el.x + (el.width || 0) / 2;
                let labelY = el.y + (el.height || 0) / 2;
                let pointerDir = 'down';
                switch (el.dataInflux?.position) {
                  case 'Arriba':
                    labelY = el.y - offset;
                    pointerDir = 'down';
                    break;
                  case 'Abajo':
                    labelY = el.y + (el.height || 0) + offset;
                    pointerDir = 'up';
                    break;
                  case 'Izquierda':
                    labelX = el.x - offset;
                    pointerDir = 'right';
                    break;
                  case 'Derecha':
                    labelX = el.x + (el.width || 0) + offset;
                    pointerDir = 'left';
                    break;
                  default:
                    break;
                }

                return (
                  <Fragment key={el.id}>
                    <WidgetComponent
                      el={el}
                      isSelected={String(selectedId) === String(el.id)}
                      onSelect={(e) => {
                        e.cancelBubble = true;
                        handleSelect(e, String(el.id));
                      }}
                      onDragEnd={(e) => {
                        const { x, y } = e.target.position();
                        setElements((prev) =>
                          prev.map((item) => (item.id === el.id ? { ...item, x, y } : item))
                        );
                      }}
                      onTransformEnd={(e) => {
                        // La card de variable se auto-ajusta al contenido: el resize
                        // escala la tipografia en vez del ancho/alto
                        if (el.type === 'varCard') {
                          const node = e.target;
                          const newFontSize = Math.max(
                            9,
                            Math.min((el.config?.fontSize || 14) * node.scaleY(), 40)
                          );
                          node.scaleX(1);
                          node.scaleY(1);
                          setElements((prev) =>
                            prev.map((item) =>
                              item.id === el.id
                                ? { ...item, x: node.x(), y: node.y(), config: { ...item.config, fontSize: newFontSize } }
                                : item
                            )
                          );
                          return;
                        }
                        handleTransformEnd(el.id, e.target);
                      }}
                    />
                    {/* La card de variable solo muestra el nombre si el usuario lo activa */}
                    {el.dataInflux && el.dataInflux.name && (el.type !== 'varCard' || el.dataInflux.show) && (
                      <Label x={labelX} y={labelY} opacity={el.dataInflux.show ? 1 : 0.5}>
                        <Tag
                          fill="white"
                          pointerDirection={pointerDir}
                          pointerWidth={10}
                          pointerHeight={10}
                          lineJoin="round"
                          cornerRadius={5}
                        />
                        <Text
                          text={el.dataInflux.name}
                          fontFamily="arial"
                          fontSize={14}
                          padding={8}
                          fill="black"
                        />
                      </Label>
                    )}
                  </Fragment>
                );
              }

              if (el.type === 'panel') {
                return (
                  <PanelElement
                    key={el.id}
                    el={el}
                    isSelected={String(selectedId) === String(el.id)}
                    onSelect={(e) => {
                      e.cancelBubble = true;
                      handleSelect(e, String(el.id));
                    }}
                    onDragEnd={(e) => {
                      const { x, y } = e.target.position();
                      setElements((prev) =>
                        prev.map((item) => (item.id === el.id ? { ...item, x, y } : item))
                      );
                    }}
                    onTransformEnd={(e) => {
                      // Resize libre: el estiramiento pasa a ancho/alto reales y la
                      // tipografia queda fija (se maneja desde el editor del panel)
                      const node = e.target;
                      const sx = node.scaleX();
                      const sy = node.scaleY();
                      node.scaleX(1);
                      node.scaleY(1);

                      const minHeight =
                        PANEL_TITLE_HEIGHT + (el.rows?.length || 0) * 16 + PANEL_PADDING;
                      const newWidth = Math.max(120, Math.min((el.width || 230) * sx, 800));
                      const newHeight = Math.max(minHeight, Math.min(getPanelHeight(el) * sy, 1200));

                      setElements((prev) =>
                        prev.map((item) =>
                          item.id === el.id
                            ? { ...item, x: node.x(), y: node.y(), width: newWidth, height: newHeight }
                            : item
                        )
                      );
                    }}
                  />
                );
              }

              if (el.type === 'polyline') {
                return (
                  <Fragment key={el.id}>
                    <Group
                      x={el.x}
                      y={el.y}
                      draggable={el.draggable}
                      id={String(el.id)}
                      onClick={(e) => {
                        const id = e.target.getAttr('id');
                        handleSelect(e, id);
                      }}
                      onDragEnd={(e) => {
                        const { x, y } = e.target.position();

                        setElements((prev) =>
                          prev.map((item) =>
                            item.id === el.id ? { ...item, x, y } : item
                          )
                        );

                        setCircles((prev) =>
                          prev.map((circle) =>
                            circle.lineId === el.id
                              ? {
                                ...circle,
                                x: circle.x + (x - el.x),
                                y: circle.y + (y - el.y),
                              }
                              : circle
                          )
                        );
                      }}
                      onDblClick={(e) => {
                        if (el.type !== 'polyline') return;

                        const stage = stageRef.current;
                        const pointerPos = {
                          x: (stage.getPointerPosition().x - stage.x()) / stage.scaleX(),
                          y: (stage.getPointerPosition().y - stage.y()) / stage.scaleY(),
                        };
                        const relativePos = {
                          x: pointerPos.x - el.x,
                          y: pointerPos.y - el.y
                        };

                        let minDist = Infinity;
                        let insertIndex = -1;

                        for (let i = 0; i < el.points.length - 2; i += 2) {
                          const x1 = el.points[i];
                          const y1 = el.points[i + 1];
                          const x2 = el.points[i + 2];
                          const y2 = el.points[i + 3];

                          const dist = distToSegment(relativePos, { x: x1, y: y1 }, { x: x2, y: y2 });

                          if (dist < minDist) {
                            minDist = dist;
                            insertIndex = i + 2;
                          }
                        }

                        if (minDist < 20 && insertIndex !== -1) {
                          const newPoints = [...el.points];
                          newPoints.splice(insertIndex, 0, relativePos.x, relativePos.y);

                          const updatedElements = elements.map(item =>
                            item.id === el.id ? { ...item, points: newPoints } : item
                          );

                          const newCircleId = `${el.id}-point-${insertIndex / 2}`;
                          const newCircle = {
                            id: newCircleId,
                            x: el.x + relativePos.x,
                            y: el.y + relativePos.y,
                            lineId: el.id,
                            fill: 'green',
                            visible: false,
                          };

                          const updatedCircles = circles
                            .map(c => {
                              if (c.lineId === el.id) {
                                const parts = c.id.split('-point-');
                                const currentIndex = parseInt(parts[1]);
                                if (currentIndex >= insertIndex / 2) {
                                  return {
                                    ...c,
                                    id: `${parts[0]}-point-${currentIndex + 1}`
                                  };
                                }
                              }
                              return c;
                            })
                            .concat(newCircle);

                          setElements(updatedElements);
                          setCircles(updatedCircles);
                        }
                      }}
                    >
                      {/* Borde exterior (caño) */}
                      <Line
                        key={`${el.id}--border`}
                        points={el.points}
                        stroke='#94a3b8'
                        strokeWidth={el.strokeWidth + 5}
                        lineCap='round'
                        lineJoin='round'
                      />
                      {/* Cuerpo del caño */}
                      <Line
                        key={`${el.id}--body`}
                        points={el.points}
                        stroke='#e2e8f0'
                        strokeWidth={el.strokeWidth + 3}
                        lineCap='round'
                        lineJoin='round'
                      />
                      {/* Flujo animado dentro del caño */}
                      <Line
                        id={String(el.id)}
                        key={`${el.id}--main`}
                        points={el.points}
                        stroke={el.stroke}
                        strokeWidth={el.strokeWidth}
                        dash={[10, 8]}
                        name={getFlowAnimation(el.dataInflux).isClosed ? undefined : 'flowLine'}
                        flowDir={el.invertAnimation ? -1 : 1}
                        lineCap='round'
                        lineJoin='round'
                      />

                      {/* Label para mostrar la variable asignada a la polilinea */}
                      {el.dataInflux?.name && (() => {

                        const segmentIndex = Math.floor(el.points.length / 4) * 2;
                        const x1 = el.points[segmentIndex];
                        const y1 = el.points[segmentIndex + 1];
                        const x2 = el.points[segmentIndex + 2];
                        const y2 = el.points[segmentIndex + 3];

                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        const angleRadians = Math.atan2(y2 - y1, x2 - x1);
                        const angleDegrees = (angleRadians * 180) / Math.PI;

                        const offset = 30;
                        let labelX = midX;
                        let labelY = midY;

                        switch (el.dataInflux.position) {
                          case 'Arriba':
                            labelY = midY - offset;
                            break;
                          case 'Abajo':
                            labelY = midY + offset;
                            break;
                          case 'Izquierda':
                            labelX = midX - offset;
                            break;
                          case 'Derecha':
                            labelX = midX + offset;
                            break;
                          case 'Centro':
                          default:
                            break;
                        }

                        return (
                          <Label x={labelX - 25} y={labelY - 20} rotation={angleDegrees} opacity={el.dataInflux.show ? 1 : 0.5}>
                            <Tag
                              fill="white"
                              pointerDirection="down"
                              pointerWidth={10}
                              pointerHeight={10}
                              lineJoin="round"
                              cornerRadius={5}
                            />
                            <Text
                              text={el.dataInflux.name}
                              fontFamily="arial"
                              fontSize={14}
                              padding={8}
                              fill="black"
                            />
                          </Label>
                        );
                      })()}
                    </Group>
                  </Fragment>
                );
              }

              return null;
            })}
          </Group>

          {selectedId && (() => {
            // Tanque, boton y panel: estiramiento libre en ancho y alto
            // (en el panel lo horizontal ajusta el layout y lo vertical la escala)
            const selectedEl = elements.find((el) => String(el.id) === String(selectedId));
            const isPanel = selectedEl?.type === 'panel';
            const isFreeResize = isPanel || ['tank', 'linkButton', 'actionButton'].includes(selectedEl?.type);
            return (
              <Transformer
                ref={transformerRef}
                keepRatio={!isFreeResize}
                rotateEnabled={!isPanel}
                enabledAnchors={
                  isFreeResize
                    ? ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']
                    : ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                }
              />
            );
          })()}

          {circles.map((circle) => (
            <Circle
              key={circle.id}
              id={circle.id}
              x={circle.x}
              y={circle.y}
              radius={8}
              fill={circle.fill}
              draggable
              visible={circle.visible}
              onDragMove={(e) => {
                const { x, y } = e.target.position();
                const updatedCircles = circles.map((c) =>
                  c.id === circle.id ? { ...c, x, y } : c
                );

                if (circle.id.includes('-start') || circle.id.includes('-end')) {
                  const updatedElements = elements.map((line) => {
                    if (line.id === circle.lineId) {
                      const start = updatedCircles.find((c) => c.id === `${line.id}-start`);
                      const end = updatedCircles.find((c) => c.id === `${line.id}-end`);
                      return {
                        ...line,
                        points: [start.x, start.y, end.x, end.y],
                      };
                    }
                    return line;
                  });
                  setCircles(updatedCircles);
                  setElements(updatedElements);
                }
                else if (circle.id.includes('-point-')) {
                  const lineElement = elements.find((el) => el.id === circle.lineId);
                  if (lineElement && lineElement.type === 'polyline') {
                    const pointIndex = parseInt(circle.id.split('-point-')[1]);

                    const relativeX = x - lineElement.x;
                    const relativeY = y - lineElement.y;

                    const updatedPoints = [...lineElement.points];
                    updatedPoints[pointIndex * 2] = relativeX;
                    updatedPoints[pointIndex * 2 + 1] = relativeY;

                    const updatedElements = elements.map(el =>
                      el.id === circle.lineId ? { ...el, points: updatedPoints } : el
                    );

                    setCircles(updatedCircles);
                    setElements(updatedElements);
                  }
                }
              }}
            />
          ))}

          {tempLine && (
            <Line
              points={tempLine.points}
              stroke={tempLine.stroke}
              strokeWidth={tempLine.strokeWidth}
              dash={[10, 8]}
              lineCap='round'
              lineJoin='round'
              opacity={0.7}
            />
          )}

          {/* Recuadro de captura de simbolo */}
          {captureRect && (
            <Rect
              x={captureRect.x}
              y={captureRect.y}
              width={captureRect.width}
              height={captureRect.height}
              fill='rgba(54, 139, 237, 0.08)'
              stroke='#368bed'
              strokeWidth={1 / stageScale}
              dash={[6, 4]}
              listening={false}
            />
          )}

          {/* Lineas guia de alineacion (los stops estan en coordenadas de pantalla) */}
          {guides.map((g, i) => {
            const pos = g.orientation === 'V'
              ? (g.stop - stagePosition.x) / stageScale
              : (g.stop - stagePosition.y) / stageScale;
            const points = g.orientation === 'V'
              ? [pos, -10000, pos, 10000]
              : [-10000, pos, 10000, pos];
            return (
              <Line
                key={`guide-${i}`}
                points={points}
                stroke='#f43f5e'
                strokeWidth={1 / stageScale}
                dash={[4, 6]}
                listening={false}
              />
            );
          })}
        </Layer>
      </Stage>
    </>

  );
};

export default DiagramCanvas;
