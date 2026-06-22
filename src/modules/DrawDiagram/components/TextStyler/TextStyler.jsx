import React from 'react';
import { Box, Button, Slider } from '@mui/material';
import {
  floatingPanelSx,
  ghostPillSx,
  panelLabelClass,
  panelTitleClass,
  primaryPillSx,
} from '../../utils/js/diagramTheme';

const styleOptions = [
  { value: 'normal', label: 'Normal', className: '' },
  { value: 'bold', label: 'Negrita', className: 'font-bold' },
  { value: 'italic', label: 'Cursiva', className: 'italic' },
];

const TextStyler = ({ visible, textStyle, onStyleChange, onApply, isEditing }) => {
  if (!visible) return null;

  return (
    <Box
      sx={floatingPanelSx}
      className='absolute top-2 left-2 z-10 w-60 p-3 flex flex-col gap-3'
    >
      <h4 className={panelTitleClass}>Estilo de texto</h4>

      <div>
        <label className={`${panelLabelClass} block mb-1`}>Color</label>
        <input
          type='color'
          value={textStyle.fill}
          onChange={(e) => onStyleChange({ ...textStyle, fill: e.target.value })}
          className='w-full h-9 p-0 border border-slate-200 dark:border-slate-700 rounded cursor-pointer bg-transparent'
        />
      </div>

      <div>
        <div className='flex items-center justify-between mb-1'>
          <label className={panelLabelClass}>Tamaño</label>
          <span className='text-xs text-slate-600 dark:text-gray-300'>{textStyle.fontSize}px</span>
        </div>
        <Slider
          size='small'
          min={8}
          max={72}
          value={textStyle.fontSize}
          onChange={(_, v) => onStyleChange({ ...textStyle, fontSize: Array.isArray(v) ? v[0] : v })}
          sx={{ color: '#2c6aa0' }}
        />
      </div>

      <div>
        <label className={`${panelLabelClass} block mb-1`}>Estilo</label>
        <div className='flex gap-1.5 flex-wrap'>
          {styleOptions.map((opt) => {
            const active = textStyle.fontStyle === opt.value;
            return (
              <Button
                key={opt.value}
                size='small'
                variant={active ? 'contained' : 'outlined'}
                onClick={() => onStyleChange({ ...textStyle, fontStyle: opt.value })}
                sx={active ? primaryPillSx : ghostPillSx}
                className={opt.className}
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
      </div>

      {isEditing && (
        <Button fullWidth variant='contained' sx={primaryPillSx} onClick={onApply}>
          Aplicar cambios
        </Button>
      )}
    </Box>
  );
};

export default TextStyler;
