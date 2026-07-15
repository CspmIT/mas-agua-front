import React from 'react';
import { Group, Rect, Text } from 'react-konva';

export const createDefaultTank = (pos) => ({
  id: String(Date.now()),
  type: 'tank',
  x: pos.x,
  y: pos.y,
  width: 90,
  height: 130,
  draggable: true,
  dataInflux: null,
});

//CALCULA EL PORCENTAJE DE LLENADO SEGUN EL VALOR Y EL MAXIMO CONFIGURADO
const getFillPercentage = (dataInflux) => {
  const value = dataInflux?.value;
  if (value === null || value === undefined || isNaN(value)) return null;

  const max = dataInflux?.max_value_var;
  const pct = max && !isNaN(max) && Number(max) > 0
    ? (Number(value) * 100) / Number(max)
    : Number(value); // sin maximo se asume que la variable ya es un porcentaje

  return Math.max(0, Math.min(100, pct));
};

const TankElement = ({ el, isSelected = false, onSelect, onDragEnd, onTransformEnd }) => {
  const width = el.width || 90;
  const height = el.height || 130;
  const wall = 3;
  const pct = getFillPercentage(el.dataInflux);

  const innerHeight = height - wall * 2;
  const fillHeight = pct === null ? 0 : (innerHeight * pct) / 100;
  const fontSize = Math.min(width * 0.24, 18);

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
      {/* Cuerpo del tanque */}
      <Rect
        width={width}
        height={height}
        fill='#e2e8f0'
        stroke={isSelected ? '#368bed' : '#64748b'}
        strokeWidth={wall}
        cornerRadius={6}
      />
      {/* Agua */}
      <Rect
        x={wall}
        y={wall + innerHeight - fillHeight}
        width={width - wall * 2}
        height={fillHeight}
        fill='#38bdf8'
        opacity={0.9}
        cornerRadius={fillHeight >= innerHeight - 2 ? 4 : [0, 0, 4, 4]}
      />
      {/* Porcentaje */}
      <Text
        text={pct === null ? 'S/D' : `${Math.round(pct)}%`}
        width={width}
        height={height}
        align='center'
        verticalAlign='middle'
        fontSize={fontSize}
        fontStyle='bold'
        fontFamily='arial'
        fill='#0f172a'
        shadowColor='#ffffff'
        shadowBlur={4}
        shadowOpacity={0.8}
        listening={false}
      />
    </Group>
  );
};

export default TankElement;
