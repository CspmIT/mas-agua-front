import React, { Fragment } from 'react';
import { Stage, Layer, Line, Text, Transformer, Circle, Group, Rect, Label, Tag } from 'react-konva';
import ImageElement from '../ImageElement/ImageElement';

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
  dashOffset,
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

  return (
    <>
      <Stage
        width={window.innerWidth - 190}
        height={window.innerHeight}
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

            setDragStartPos(pointer); // actualizar punto inicial
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
          cursor: isPanning ? 'grab' : ['simpleLine', 'polyline'].includes(tool) ? 'crosshair' : 'default',
        }}
      >
        <Layer>
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
                      onClick={(e) => handleSelect(e, el.id)}
                      onDragEnd={(e) => {
                        const { x, y } = e.target.position();
                        setElements((prev) =>
                          prev.map((item) => (item.id === el.id ? { ...item, x, y } : item))
                        );
                      }}
                    >
                      {/* Fondo, borde blanco y línea principal */}
                      <Line key={`${el.id}-bg`} points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth + 4} />
                      <Line key={`${el.id}-white`} points={el.points} stroke="white" strokeWidth={el.strokeWidth + 2} />
                      <Line
                        key={`${el.id}-main`}
                        points={el.points}
                        stroke={el.stroke}
                        strokeWidth={el.strokeWidth}
                        dash={[25, 15]}
                        dashOffset={el.invertAnimation ? -dashOffset : dashOffset}
                      />

                      {/* Label para mostrar la variable asignada a la linea */}
                      {el.dataInflux?.name && (() => {
                        const [x1, y1, x2, y2] = el.points;
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        const angleRadians = Math.atan2(y2 - y1, x2 - x1);
                        const angleDegrees = (angleRadians * 180) / Math.PI;

                        return (
                          <Label
                            x={midX - 25} y={midY - 20} rotation={angleDegrees}
                          >
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
                              fill="black "
                            />
                          </Label>
                        );
                      })()}
                    </Group>
                  </Fragment>
                );
              }

              if (el.type === 'text') {
                return (
                  <Fragment key={el.id}>
                    <Group
                      x={el.x}
                      y={el.y}
                      draggable
                      id={String(el.id)}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        handleSelect(e, el.id);
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
                        text={el.text}
                        x={0}
                        y={0}
                        fontSize={el.fontSize || 16}
                        fill={el.fill || '#000'}
                        fontStyle={el.fontStyle || 'normal'}
                        hitStrokeWidth={20}
                      />
                    </Group>
                    {/* Label para mostrar la variable asignada a l texto*/}
                    {el.dataInflux && el.dataInflux.name && (
                      <Label
                        x={el.x + (el.width || 0) / 2}
                        y={el.y}
                      >
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
                          fill="black "
                        />
                      </Label>
                    )}
                  </Fragment>
                );
              }


              if (el.type === 'image') {
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
                      onClick={(e) => handleSelect(e, el.id)}
                      onDragEnd={(e) => {
                        const { x, y } = e.target.position();
                        setElements((prev) =>
                          prev.map((item) => (item.id === el.id ? { ...item, x, y } : item))
                        );
                      }}
                      onTransformEnd={handleTransformEnd}
                    />
                    {/* Label para mostrar la variable asignada a la imagen */}
                    {el.dataInflux && el.dataInflux.name && (
                      <Label
                        x={el.x + (el.width || 0) / 2}
                        y={el.y}
                      >
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
                          fill="black "
                        />
                      </Label>
                    )}
                  </Fragment>
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
                      onClick={(e) => handleSelect(e, el.id)}
                      onDragEnd={(e) => {
                        const { x, y } = e.target.position();

                        // Actualizar la posición de la polilínea
                        setElements((prev) =>
                          prev.map((item) =>
                            item.id === el.id ? { ...item, x, y } : item
                          )
                        );

                        // Actualizar las posiciones de los puntos de control
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

                        // Obtener la posición del clic relativa al grupo
                        const stage = stageRef.current;
                        const pointerPos = {
                          x: (stage.getPointerPosition().x - stage.x()) / stage.scaleX(),
                          y: (stage.getPointerPosition().y - stage.y()) / stage.scaleY(),
                        };
                        const relativePos = {
                          x: pointerPos.x - el.x,
                          y: pointerPos.y - el.y
                        };

                        // Encontrar el segmento más cercano al clic
                        let minDist = Infinity;
                        let insertIndex = -1;

                        for (let i = 0; i < el.points.length - 2; i += 2) {
                          const x1 = el.points[i];
                          const y1 = el.points[i + 1];
                          const x2 = el.points[i + 2];
                          const y2 = el.points[i + 3];

                          // Calcular distancia del punto al segmento
                          const dist = distToSegment(relativePos, { x: x1, y: y1 }, { x: x2, y: y2 });

                          if (dist < minDist) {
                            minDist = dist;
                            insertIndex = i + 2;
                          }
                        }

                        // Si está lo suficientemente cerca, insertar un nuevo punto
                        if (minDist < 20 && insertIndex !== -1) {
                          const newPoints = [...el.points];
                          newPoints.splice(insertIndex, 0, relativePos.x, relativePos.y);

                          // Actualizar el elemento
                          const updatedElements = elements.map(item =>
                            item.id === el.id ? { ...item, points: newPoints } : item
                          );

                          // Crear un nuevo círculo para el punto
                          const newCircleId = `${el.id}-point-${insertIndex / 2}`;
                          const newCircle = {
                            id: newCircleId,
                            x: el.x + relativePos.x,
                            y: el.y + relativePos.y,
                            lineId: el.id,
                            fill: 'green',
                            visible: false,
                          };

                          // Actualizar los IDs de los círculos existentes
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
                      {/* Fondo, borde blanco y línea principal para polilíneas */}
                      <Line key={`${el.id}--bg`} points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth + 4} />
                      <Line key={`${el.id}--white`} points={el.points} stroke="white" strokeWidth={el.strokeWidth + 2} />
                      <Line
                        key={`${el.id}--main`}
                        points={el.points}
                        stroke={el.stroke}
                        strokeWidth={el.strokeWidth}
                        dash={[25, 15]}
                        dashOffset={el.invertAnimation ? -dashOffset : dashOffset}
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

                        return (
                          <Label
                            x={midX - 25} y={midY - 20} rotation={angleDegrees}
                          >
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
                              fill="black "
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

          {selectedId && (
            <Transformer
              ref={transformerRef}
              keepRatio={true}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            />
          )}

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

                // Manejar círculos para líneas simples
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
                // Manejar círculos para polilíneas
                else if (circle.id.includes('-point-')) {
                  const lineElement = elements.find((el) => el.id === circle.lineId);
                  if (lineElement && lineElement.type === 'polyline') {
                    const pointIndex = parseInt(circle.id.split('-point-')[1]);

                    // Calcular la posición relativa al grupo
                    const relativeX = x - lineElement.x;
                    const relativeY = y - lineElement.y;

                    // Actualizar los puntos de la polilínea
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
              dash={[15, 15]}
            />
          )}
        </Layer>
      </Stage>
    </>

  );
};

export default DiagramCanvas;
