import React from 'react';
import { Circle, Group } from 'react-konva';

export const createDefaultLed = (pos) => ({
  id: String(Date.now()),
  type: 'led',
  x: pos.x,
  y: pos.y,
  width: 36,
  height: 36,
  draggable: true,
  dataInflux: null,
});

// Mismos estados que usa el panel "Personalizar variable" para colores booleanos
const LED_COLORS = {
  default: '#9ca3af',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#facc15',
};

const OFF_COLORS = [LED_COLORS.default, '#6b7280'];

//RESUELVE EL COLOR DEL LED SEGUN EL VALOR Y LOS COLORES CONFIGURADOS
//Replica la logica de estados de RenderImage (fotos) pero mapeando a colores
const getLedColor = (dataInflux) => {
  const value = dataInflux?.value;
  if (value === null || value === undefined) return { color: LED_COLORS.default, isOn: false };

  const userColors = dataInflux?.boolean_colors;

  // Variable calculada binaria: el backend resuelve el estado (value.image = default/success/error/warning)
  if (dataInflux?.calc_binary_compressed && typeof value === 'object' && !Array.isArray(value)) {
    const color = LED_COLORS[value.image] || LED_COLORS.default;
    return { color, isOn: !OFF_COLORS.includes(color) };
  }

  // Variable binaria comprimida: estado del bit seleccionado
  if (dataInflux?.binary_compressed && Array.isArray(value)) {
    const bitData = value.find((b) => b.id_bit === dataInflux.id_bit);
    if (!bitData) return { color: LED_COLORS.default, isOn: false };

    const bitVal = bitData.value === true || bitData.value === 1;
    const configured = userColors?.[bitVal ? 'true' : 'false'];
    const color = LED_COLORS[configured] || (bitVal ? LED_COLORS.success : LED_COLORS.default);
    return { color, isOn: !OFF_COLORS.includes(color) };
  }

  // Booleana simple
  const isTrue = value === true || value === 1 || value === '1' || value === 'true';
  const isFalse = value === false || value === 0 || value === '0' || value === 'false';
  const configured = userColors?.[isTrue ? 'true' : 'false'];

  if (LED_COLORS[configured] && (isTrue || isFalse)) {
    const color = LED_COLORS[configured];
    return { color, isOn: !OFF_COLORS.includes(color) };
  }

  if (isTrue) return { color: LED_COLORS.success, isOn: true };
  if (isFalse) return { color: '#6b7280', isOn: false };
  return { color: LED_COLORS.default, isOn: false };
};

const LedElement = ({ el, isSelected = false, onSelect, onDragEnd, onTransformEnd }) => {
  const size = Math.min(el.width || 36, el.height || 36);
  const { color, isOn } = getLedColor(el.dataInflux);

  return (
    <Group
      id={String(el.id)}
      x={el.x}
      y={el.y}
      width={size}
      height={size}
      draggable={Boolean(onDragEnd) && el.draggable !== false}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      {/* Aro exterior */}
      <Circle
        x={size / 2}
        y={size / 2}
        radius={size / 2}
        fill='#334155'
        stroke={isSelected ? '#368bed' : '#1e293b'}
        strokeWidth={isSelected ? 2 : 1}
      />
      {/* Luz */}
      <Circle
        x={size / 2}
        y={size / 2}
        radius={size / 2 - 4}
        fill={color}
        shadowColor={color}
        shadowBlur={isOn ? 14 : 0}
        shadowOpacity={0.85}
      />
      {/* Brillo */}
      <Circle
        x={size * 0.4}
        y={size * 0.38}
        radius={size * 0.12}
        fill='rgba(255,255,255,0.55)'
        listening={false}
      />
    </Group>
  );
};

export default LedElement;
