import React from 'react';
import { Box, Slider } from '@mui/material';
import {
  floatingPanelSx,
  panelLabelClass,
  panelTitleClass,
} from '../../utils/js/diagramTheme';
import { DEFAULT_SHAPE_CONFIG, SHAPE_LABELS, SHAPE_TYPES } from './ShapeElements';

const ColorInput = ({ label, value, onChange }) => (
  <label className='flex flex-col items-center gap-1 cursor-pointer'>
    <input
      type='color'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='w-9 h-8 rounded-md border border-slate-300 dark:border-gray-600 cursor-pointer p-0'
    />
    <span className={panelLabelClass}>{label}</span>
  </label>
);

const ShapeStylePanel = ({ shape, onChange }) => {
  if (!shape || !SHAPE_TYPES.includes(shape.type)) return null;

  const cfg = { ...DEFAULT_SHAPE_CONFIG, ...shape.config };
  const updateConfig = (patch) => onChange({ ...shape, config: { ...cfg, ...patch } });

  return (
    <Box sx={floatingPanelSx} className='absolute left-2 top-2 z-10 w-64 p-3 flex flex-col gap-3'>
      <h4 className={panelTitleClass}>{SHAPE_LABELS[shape.type]}</h4>

      <div className='flex items-start justify-around px-1'>
        <ColorInput label='Relleno' value={cfg.fill} onChange={(v) => updateConfig({ fill: v })} />
        <ColorInput label='Borde' value={cfg.stroke} onChange={(v) => updateConfig({ stroke: v })} />
      </div>

      <div className='px-1'>
        <label className={`${panelLabelClass} block`}>Grosor del borde: {cfg.strokeWidth}px</label>
        <Slider
          size='small'
          min={0}
          max={12}
          value={cfg.strokeWidth}
          onChange={(_, v) => updateConfig({ strokeWidth: v })}
        />

        <label className={`${panelLabelClass} block`}>Opacidad: {Math.round(cfg.opacity * 100)}%</label>
        <Slider
          size='small'
          min={10}
          max={100}
          value={Math.round(cfg.opacity * 100)}
          onChange={(_, v) => updateConfig({ opacity: v / 100 })}
        />

        {shape.type === 'rect' && (
          <>
            <label className={`${panelLabelClass} block`}>Redondeo de esquinas: {cfg.cornerRadius}px</label>
            <Slider
              size='small'
              min={0}
              max={40}
              value={cfg.cornerRadius}
              onChange={(_, v) => updateConfig({ cornerRadius: v })}
            />
          </>
        )}
      </div>
    </Box>
  );
};

export default ShapeStylePanel;
