import React, { useMemo } from 'react';
import Konva from 'konva';
import { Group, Rect, Text } from 'react-konva';
import { formatVariableValue } from '../../utils/js/formatVariableValue';

const PADDING_X = 12;
const PADDING_Y = 8;

export const createDefaultVarCard = (pos) => ({
  id: String(Date.now()),
  type: 'varCard',
  x: pos.x,
  y: pos.y,
  draggable: true,
  dataInflux: null,
  config: { fontSize: 14 },
});

//CARD FLOTANTE CON EL VALOR DE UNA VARIABLE: se adapta al contenido
const VarCardElement = ({ el, isSelected = false, onSelect, onDragEnd, onTransformEnd }) => {
  const fontSize = el.config?.fontSize || 14;
  const text = formatVariableValue(el.dataInflux);

  // Medicion real del texto para que la card se ajuste al contenido
  const textWidth = useMemo(() => {
    const probe = new Konva.Text({ text, fontSize, fontStyle: 'bold', fontFamily: 'arial' });
    return probe.width();
  }, [text, fontSize]);

  const width = textWidth + PADDING_X * 2;
  const height = fontSize + PADDING_Y * 2;

  return (
    <Group
      id={String(el.id)}
      x={el.x}
      y={el.y}
      width={width}
      height={height}
      draggable={Boolean(onDragEnd) && el.draggable !== false}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      <Rect
        width={width}
        height={height}
        fill='#ffffff'
        stroke={isSelected ? '#368bed' : '#4b5563'}
        strokeWidth={isSelected ? 2 : 1.5}
        cornerRadius={8}
        shadowColor='#0f172a'
        shadowBlur={6}
        shadowOffsetY={2}
        shadowOpacity={0.25}
      />
      <Text
        text={text}
        width={width}
        height={height}
        align='center'
        verticalAlign='middle'
        fontSize={fontSize}
        fontStyle='bold'
        fontFamily='arial'
        fill='#1f2937'
        listening={false}
      />
    </Group>
  );
};

export default VarCardElement;
