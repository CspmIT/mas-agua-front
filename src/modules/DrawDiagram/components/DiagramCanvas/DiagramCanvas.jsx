// components/DiagramCanvas.jsx
import React, { Fragment } from 'react';
import { Stage, Layer, Line, Text, Transformer, Circle, Group, Rect } from 'react-konva';
import ImageElement from '../ImageElement/ImageElement';

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
  setSelectedId,
  setTextInput,
  setTextPosition,
  setEditingTextId,
  setTextStyle,
  tool,
  handleTransformEnd
}) => {

  return (
    <>
      <Stage
        width={window.innerWidth - 190}
        height={window.innerHeight}
        ref={stageRef}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage() && tool !== 'text') {
            setSelectedId(null);
            setCircles((prev) => prev.map((c) => ({ ...c, visible: false })));
          }
          handleMouseDown(e);
        }}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          {elements.map((el) => {
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
                      dash={[20, 10]}
                      dashOffset={el.invertAnimation ? -dashOffset : dashOffset}
                    />

                    {/* Texto alineado a la línea */}
                    {el.dataInflux?.name && (() => {
                      const [x1, y1, x2, y2] = el.points;
                      const midX = (x1 + x2) / 2;
                      const midY = (y1 + y2) / 2;
                      const angleRadians = Math.atan2(y2 - y1, x2 - x1);
                      const angleDegrees = (angleRadians * 180) / Math.PI;

                      return (
                        <Group x={midX -25} y={midY - 20} rotation={angleDegrees}>
                          <Rect
                            fill="white"
                            height={18}
                            width={el.dataInflux.name.length * 8}
                            cornerRadius={4}
                            offsetX={(el.dataInflux.name.length * 8) / 2}
                            offsetY={9}
                          />
                          <Text
                            text={`[${el.dataInflux.name}]`}
                            fontSize={14}
                            fill="black"
                            align="center"
                            offsetX={(el.dataInflux.name.length * 8) / 2}
                            offsetY={9}
                          />
                        </Group>
                      );
                    })()}
                  </Group>
                </Fragment>
              );
            }

            if (el.type === 'text') {
              return (
                <Fragment key={el.id}>
                  {/* Texto principal */}
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
                  {el.dataInflux && el.dataInflux.name && (
                    <Group x={el.x} y={el.y - 30}>
                      <Group key={el.id}>
                        <Rect
                          fill="white"
                          height={18}
                          width={(el.dataInflux.name.length * 8)}
                          cornerRadius={4}
                        />
                        <Text
                          text={`[${el.dataInflux.name}]`}
                          fontSize={14}
                          fill="black"
                          padding={4}
                        />
                      </Group>
                    </Group>
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
                  {el.dataInflux && el.dataInflux.name && (
                    <Group x={el.x} y={el.y - 30}>
                      <Group key={el.id}>
                        <Rect
                          fill="white"
                          height={18}
                          width={(el.dataInflux.name.length * 8)}
                          cornerRadius={4}
                        />
                        <Text
                          text={`[${el.dataInflux.name}]`}
                          fontSize={14}
                          fill="black"
                          padding={4}
                        />
                      </Group>
                    </Group>
                  )}
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
              }}
            />
          ))}

          {tempLine && (
            <Line
              points={tempLine.points}
              stroke={tempLine.stroke}
              strokeWidth={tempLine.strokeWidth}
              dash={[10, 10]}
            />
          )}
        </Layer>
      </Stage>
    </>

  );
};

export default DiagramCanvas;
