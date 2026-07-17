import React from 'react';
import { Group, Rect, Text } from 'react-konva';

export const createDefaultActionButton = (pos) => ({
  id: String(Date.now()),
  type: 'actionButton',
  x: pos.x,
  y: pos.y,
  width: 150,
  height: 36,
  draggable: true,
  idBomb: null,
  bombName: null,
  config: { label: 'Acción PLC', showWhen: 'always' },
});

// Colores segun el estado del boton (verde = encender, rojo = apagar,
// ambar = accion puntual, gris = deshabilitado)
const VARIANTS = {
  editor: ['#475569', '#1f2937'],
  green: ['#34d399', '#059669'],
  red: ['#f43f5e', '#be123c'],
  amber: ['#f59e0b', '#b45309'],
  disabled: ['#94a3b8', '#64748b'],
};

//BOTON DE ACCION PLC: en la vista envia el comando del equipo asignado
const ActionButtonElement = ({ el, variant = 'editor', isSelected = false, onSelect, onDragEnd, onTransformEnd }) => {
  const width = el.width || 150;
  const height = el.height || 36;
  const label = el.config?.label || 'Acción PLC';
  const fontSize = Math.min(height * 0.42, 15);
  const [colorA, colorB] = VARIANTS[variant] || VARIANTS.editor;
  const hasBomb = Boolean(el.idBomb || el.config?.timedReboot);

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
        cornerRadius={height / 2}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: width, y: height }}
        fillLinearGradientColorStops={[0, colorA, 1, colorB]}
        stroke={isSelected ? '#368bed' : 'rgba(255,255,255,0.35)'}
        strokeWidth={isSelected ? 2 : 1}
        shadowColor={colorB}
        shadowBlur={8}
        shadowOpacity={0.35}
        shadowOffsetY={3}
        opacity={hasBomb ? 1 : 0.6}
      />
      <Text
        text={`⏻ ${label}`}
        width={width}
        height={height}
        align='center'
        verticalAlign='middle'
        fill='#ffffff'
        fontSize={fontSize}
        fontStyle='bold'
        fontFamily='arial'
        wrap='none'
        ellipsis
        listening={false}
      />
    </Group>
  );
};

export default ActionButtonElement;
