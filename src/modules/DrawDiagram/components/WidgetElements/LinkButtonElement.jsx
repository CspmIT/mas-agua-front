import React from 'react';
import { Group, Rect, Text } from 'react-konva';

export const createDefaultLinkButton = (pos) => ({
  id: String(Date.now()),
  type: 'linkButton',
  x: pos.x,
  y: pos.y,
  width: 170,
  height: 40,
  config: { label: 'Ir a diagrama' },
  linkDiagram: null,
  draggable: true,
});

//BOTON DE NAVEGACION: en la vista, el clic navega al diagrama vinculado
const LinkButtonElement = ({ el, isSelected = false, onSelect, onDragEnd, onTransformEnd }) => {
  const width = el.width || 170;
  const height = el.height || 40;
  const label = el.config?.label || 'Ir a diagrama';
  const fontSize = Math.min(height * 0.4, 16);
  const hasLink = Boolean(el.linkDiagram);

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
        fillLinearGradientColorStops={[0, '#2c6aa0', 1, '#1f4e79']}
        stroke={isSelected ? '#368bed' : 'rgba(255,255,255,0.35)'}
        strokeWidth={isSelected ? 2 : 1}
        shadowColor='#1f4e79'
        shadowBlur={8}
        shadowOpacity={0.35}
        shadowOffsetY={3}
        opacity={hasLink ? 1 : 0.6}
      />
      <Text
        text={`${label}  ➜`}
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

export default LinkButtonElement;
