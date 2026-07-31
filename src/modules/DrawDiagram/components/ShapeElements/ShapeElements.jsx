import React from 'react';
import { Ellipse, Group, Line, Rect } from 'react-konva';

export const SHAPE_TYPES = ['rect', 'circle', 'ellipse', 'triangle'];

export const SHAPE_LABELS = {
  rect: 'Rectángulo',
  circle: 'Círculo',
  ellipse: 'Óvalo',
  triangle: 'Triángulo',
};

export const DEFAULT_SHAPE_CONFIG = {
  fill: '#e2e8f0',
  stroke: '#64748b',
  strokeWidth: 2,
  opacity: 1,
  cornerRadius: 4,
  rotation: 0,
};

const SHAPE_SIZES = {
  rect: { width: 120, height: 80 },
  circle: { width: 90, height: 90 },
  ellipse: { width: 130, height: 80 },
  triangle: { width: 100, height: 90 },
};

export const createDefaultShape = (type) => (pos) => ({
  id: String(Date.now()),
  type,
  x: pos.x,
  y: pos.y,
  ...SHAPE_SIZES[type],
  draggable: true,
  dataInflux: null,
  config: { ...DEFAULT_SHAPE_CONFIG },
});

const ShapeElement = ({ el, isSelected = false, onSelect, onDragEnd, onTransformEnd }) => {
  const width = el.width || 100;
  const height = el.height || 100;
  const cfg = { ...DEFAULT_SHAPE_CONFIG, ...el.config };
  const common = {
    fill: cfg.fill,
    stroke: cfg.stroke,
    strokeWidth: cfg.strokeWidth,
    opacity: cfg.opacity,
  };

  return (
    <Group
      id={String(el.id)}
      x={el.x}
      y={el.y}
      width={width}
      height={height}
      rotation={cfg.rotation || 0}
      draggable={Boolean(onDragEnd) && el.draggable !== false}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      {el.type === 'rect' && (
        <Rect width={width} height={height} cornerRadius={cfg.cornerRadius} {...common} />
      )}
      {(el.type === 'circle' || el.type === 'ellipse') && (
        <Ellipse
          x={width / 2}
          y={height / 2}
          radiusX={width / 2}
          radiusY={height / 2}
          {...common}
        />
      )}
      {el.type === 'triangle' && (
        <Line
          closed
          points={[width / 2, 0, width, height, 0, height]}
          lineJoin='round'
          {...common}
        />
      )}
    </Group>
  );
};

export default ShapeElement;
