import React, { useEffect } from 'react';
import { Box, Button, Divider, Slider, TextField } from '@mui/material';
import { BiSync } from 'react-icons/bi';
import {
  floatingPanelSx,
  ghostPillSx,
  panelLabelClass,
  panelTitleClass,
  primaryPillSx,
} from '../../utils/js/diagramTheme';

const LineStylePanel = ({
  visible,
  lineStyle,
  onChange,
  setElements,
  selectedId,
  setSelectedId,
  elements,
  tool,
  setTool,
}) => {
  const selectedElement = selectedId && elements
    ? elements.find((el) => el.id === selectedId)
    : null;

  const elementType = selectedElement?.type || tool;
  const isLine = elementType === 'line' || elementType === 'simpleLine';
  const isPolyline = elementType === 'polyline';
  const canEdit = selectedId && (isLine || isPolyline);

  useEffect(() => {
    if (selectedId && !canEdit) {
      setSelectedId(null);
    }
  }, [selectedId, canEdit, setSelectedId]);

  useEffect(() => {
    if (canEdit && selectedElement) {
      const newStyle = {
        color: selectedElement.stroke,
        strokeWidth: selectedElement.strokeWidth,
        invertAnimation: selectedElement.invertAnimation || false,
      };

      if (
        newStyle.color !== lineStyle.color ||
        newStyle.strokeWidth !== lineStyle.strokeWidth ||
        newStyle.invertAnimation !== lineStyle.invertAnimation
      ) {
        onChange(newStyle);
      }
    }
  }, [selectedId, elements]);

  if (!visible) return null;

  const title = canEdit
    ? `Editar ${isLine ? 'línea' : 'polilínea'}`
    : `Estilo de ${tool === 'polyline' ? 'la polilínea' : 'la línea'}`;

  const handleWidthChange = (_, v) => {
    const newWidth = Array.isArray(v) ? v[0] : v;
    onChange({ ...lineStyle, strokeWidth: newWidth });
    if (canEdit) {
      setElements((prev) =>
        prev.map((el) => (el.id === selectedId ? { ...el, strokeWidth: newWidth } : el))
      );
    }
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    onChange({ ...lineStyle, color: newColor });
    if (canEdit) {
      setElements((prev) =>
        prev.map((el) => (el.id === selectedId ? { ...el, stroke: newColor } : el))
      );
    }
  };

  const handleFlowReferenceChange = (e) => {
    const parsed = parseFloat(e.target.value);
    const newValue = isNaN(parsed) || parsed <= 0 ? null : parsed;
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId && el.dataInflux
          ? { ...el, dataInflux: { ...el.dataInflux, max_value_var: newValue } }
          : el
      )
    );
  };

  const handleToggleDirection = () => {
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, invertAnimation: !el.invertAnimation } : el))
    );
    onChange({ ...lineStyle, invertAnimation: !lineStyle.invertAnimation });
  };

  return (
    <Box
      sx={floatingPanelSx}
      className='absolute top-5 left-2 z-10 w-56 p-3 flex flex-col gap-3'
    >
      <h4 className={panelTitleClass}>{title}</h4>

      <div>
        <label className={`${panelLabelClass} block mb-1`}>Color</label>
        <input
          type='color'
          value={lineStyle.color}
          onChange={handleColorChange}
          className='w-full h-9 p-0 border border-slate-200 dark:border-slate-700 rounded cursor-pointer bg-transparent'
        />
      </div>

      <div>
        <div className='flex items-center justify-between mb-1'>
          <label className={panelLabelClass}>Ancho</label>
          <span className='text-xs text-slate-600 dark:text-gray-300'>{lineStyle.strokeWidth}px</span>
        </div>
        <Slider
          size='small'
          min={1}
          max={10}
          value={lineStyle.strokeWidth}
          onChange={handleWidthChange}
          sx={{ color: '#2c6aa0' }}
        />
      </div>

      {canEdit && (
        <Button
          variant='contained'
          size='small'
          onClick={handleToggleDirection}
          sx={primaryPillSx}
          startIcon={
            <BiSync
              className={`transition-transform ${lineStyle.invertAnimation ? 'rotate-180' : ''}`}
            />
          }
        >
          Cambiar sentido
        </Button>
      )}

      {canEdit && selectedElement?.dataInflux && (
        <>
          <Divider flexItem />
          <div className='flex flex-col gap-1.5'>
            <label className={panelLabelClass}>Animación por caudal</label>
            <p className='text-[11px] leading-snug text-slate-500 dark:text-gray-400 m-0'>
              Sin caudal, el flujo se detiene. Ingresá el caudal al que esta
              línea corre a velocidad normal: con más caudal acelera, con menos
              se frena. Vacío = solo prende/apaga.
            </p>
            <TextField
              size='small'
              type='number'
              label='Caudal de velocidad normal (m³/h)'
              value={selectedElement.dataInflux.max_value_var ?? ''}
              onChange={handleFlowReferenceChange}
              placeholder='Ej: 1'
              inputProps={{ min: 0, step: 0.1 }}
            />
          </div>
        </>
      )}

      {!canEdit && (
        <Button variant='outlined' size='small' onClick={() => setTool(null)} sx={ghostPillSx}>
          Cancelar
        </Button>
      )}
    </Box>
  );
};

export default LineStylePanel;
