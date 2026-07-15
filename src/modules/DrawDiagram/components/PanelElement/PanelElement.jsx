import React from 'react';
import { Group, Rect, Text } from 'react-konva';

export const PANEL_TITLE_HEIGHT = 26;
export const PANEL_ROW_HEIGHT = 22;
export const PANEL_PADDING = 8;

export const DEFAULT_PANEL_STYLES = {
  titleBg: '#1f4e79',
  titleColor: '#ffffff',
  bg: '#ffffff',
  borderColor: '#94a3b8',
  fontSize: 12,
  cornerRadius: 6,
};

//ALTO DEL PANEL: el definido por el usuario (resize) o el calculado por filas
export const getPanelHeight = (el) => {
  const custom = Number(el.height);
  if (custom > 0) return custom;
  return PANEL_TITLE_HEIGHT + (el.rows?.length || 0) * PANEL_ROW_HEIGHT + PANEL_PADDING;
};

//FABRICA DE UN PANEL NUEVO CON VALORES POR DEFECTO
export const createDefaultPanel = (pos) => ({
  id: String(Date.now()),
  type: 'panel',
  x: pos.x,
  y: pos.y,
  width: 230,
  title: 'Nuevo panel',
  styles: { ...DEFAULT_PANEL_STYLES },
  rows: [
    { id: 1, label: 'Etiqueta', kind: 'static', value: 'Valor' },
  ],
  draggable: true,
});

//FORMATEO DEL VALOR DE UNA FILA (fija o variable)
const formatRowValue = (row) => {
  if (row.kind !== 'variable') return row.value ?? '';

  const value = row.dataInflux?.value;
  const unit = row.dataInflux?.unit || '';

  if (value === null || value === undefined) return 'Sin datos';
  if (!isNaN(value)) return unit ? `${Number(value)} ${unit}` : `${Number(value)}`;
  return String(value);
};

const PanelElement = ({ el, isSelected = false, onSelect, onDragEnd, onTransformEnd }) => {
  const styles = { ...DEFAULT_PANEL_STYLES, ...el.styles };
  const height = getPanelHeight(el);
  const radius = styles.cornerRadius;

  // Las filas se reparten el alto disponible; la tipografia queda fija
  const rowHeight = el.rows?.length
    ? Math.max((height - PANEL_TITLE_HEIGHT - PANEL_PADDING) / el.rows.length, 16)
    : PANEL_ROW_HEIGHT;

  const valueColX = el.width * 0.42;
  const valueColWidth = el.width * 0.52;

  return (
    <Group
      id={String(el.id)}
      x={el.x}
      y={el.y}
      draggable={Boolean(onDragEnd) && el.draggable !== false}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      {/* Fondo y borde del panel */}
      <Rect
        width={el.width}
        height={height}
        fill={styles.bg}
        stroke={isSelected ? '#368bed' : styles.borderColor}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={radius}
        shadowColor='#94a3b8'
        shadowBlur={isSelected ? 8 : 4}
        shadowOpacity={0.4}
      />
      {/* Barra de titulo */}
      <Rect
        width={el.width}
        height={PANEL_TITLE_HEIGHT}
        fill={styles.titleBg}
        cornerRadius={[radius, radius, 0, 0]}
      />
      <Text
        text={el.title}
        width={el.width}
        height={PANEL_TITLE_HEIGHT}
        align='center'
        verticalAlign='middle'
        fill={styles.titleColor}
        fontSize={styles.fontSize + 1}
        fontStyle='bold'
        fontFamily='arial'
        wrap='none'
        ellipsis
      />
      {/* Filas etiqueta: valor */}
      {(el.rows || []).map((row, i) => {
        const rowY = PANEL_TITLE_HEIGHT + i * rowHeight;
        const chipHeight = Math.min(rowHeight - 6, styles.fontSize + 14);
        const chipY = (rowHeight - chipHeight) / 2;
        return (
          <Group key={row.id} y={rowY}>
            <Text
              text={`${row.label}:`}
              x={PANEL_PADDING}
              width={valueColX - PANEL_PADDING * 2}
              height={rowHeight}
              verticalAlign='middle'
              fontSize={styles.fontSize}
              fontFamily='arial'
              fill='#44403c'
              wrap='none'
              ellipsis
            />
            {/* Chip de fondo del valor, como los recuadros del diagrama de referencia */}
            <Rect
              x={valueColX}
              y={chipY}
              width={valueColWidth}
              height={chipHeight}
              fill='#f3f4f6'
              stroke='#d1d5db'
              strokeWidth={1}
              cornerRadius={3}
            />
            <Text
              text={formatRowValue(row)}
              x={valueColX}
              width={valueColWidth}
              height={rowHeight}
              align='center'
              verticalAlign='middle'
              fontSize={styles.fontSize}
              fontFamily='arial'
              fill='#1c1917'
              wrap='none'
              ellipsis
            />
          </Group>
        );
      })}
    </Group>
  );
};

export default PanelElement;
