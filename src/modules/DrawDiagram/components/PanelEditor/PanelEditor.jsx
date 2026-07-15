import React from 'react';
import { Box, Button, Divider, IconButton, Slider, TextField, Tooltip } from '@mui/material';
import { Add, DeleteOutline, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { HiOutlineVariable } from 'react-icons/hi';
import {
  floatingPanelSx,
  ghostPillSx,
  panelLabelClass,
  panelTitleClass,
  primaryPillSx,
} from '../../utils/js/diagramTheme';
import { DEFAULT_PANEL_STYLES } from '../PanelElement/PanelElement';

const rowIconButtonSx = {
  width: 26,
  height: 26,
  color: '#64748b',
  'body.dark &': { color: '#cbd5e1' },
};

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

const KindButton = ({ active, onClick, children }) => (
  <Button
    size='small'
    variant={active ? 'contained' : 'outlined'}
    onClick={onClick}
    sx={{ ...(active ? primaryPillSx : ghostPillSx), minWidth: 0, px: 1.25, flex: 1 }}
  >
    {children}
  </Button>
);

const PanelEditor = ({ panel, onChange, onAssignVariableRequest }) => {
  if (!panel || panel.type !== 'panel') return null;

  const styles = { ...DEFAULT_PANEL_STYLES, ...panel.styles };

  const update = (patch) => onChange({ ...panel, ...patch });
  const updateStyles = (patch) => update({ styles: { ...styles, ...patch } });

  const updateRow = (rowId, patch) =>
    update({ rows: panel.rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)) });

  const addRow = () =>
    update({
      rows: [...panel.rows, { id: Date.now(), label: 'Etiqueta', kind: 'static', value: '' }],
    });

  const removeRow = (rowId) => update({ rows: panel.rows.filter((r) => r.id !== rowId) });

  const moveRow = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= panel.rows.length) return;
    const rows = [...panel.rows];
    [rows[index], rows[target]] = [rows[target], rows[index]];
    update({ rows });
  };

  return (
    <Box
      sx={floatingPanelSx}
      className='absolute left-2 top-2 z-10 w-72 p-3 flex flex-col gap-3 max-h-[calc(100%-16px)] overflow-y-auto'
    >
      <h4 className={panelTitleClass}>Panel de información</h4>

      <TextField
        size='small'
        label='Título'
        value={panel.title}
        onChange={(e) => update({ title: e.target.value })}
        fullWidth
      />

      <div className='flex items-start justify-between px-1'>
        <ColorInput label='Título' value={styles.titleBg} onChange={(v) => updateStyles({ titleBg: v })} />
        <ColorInput label='Texto' value={styles.titleColor} onChange={(v) => updateStyles({ titleColor: v })} />
        <ColorInput label='Fondo' value={styles.bg} onChange={(v) => updateStyles({ bg: v })} />
        <ColorInput label='Borde' value={styles.borderColor} onChange={(v) => updateStyles({ borderColor: v })} />
      </div>

      <div className='px-1'>
        <label className={`${panelLabelClass} block`}>Ancho: {panel.width}px</label>
        <Slider
          size='small'
          min={140}
          max={500}
          value={panel.width}
          onChange={(_, v) => update({ width: v })}
        />
        <label className={`${panelLabelClass} block`}>Tamaño de letra: {styles.fontSize}px</label>
        <Slider
          size='small'
          min={9}
          max={20}
          value={styles.fontSize}
          onChange={(_, v) => updateStyles({ fontSize: v })}
        />
      </div>

      <Divider flexItem />

      <div className='flex items-center justify-between'>
        <label className={panelLabelClass}>Filas</label>
        <Button size='small' startIcon={<Add fontSize='small' />} sx={primaryPillSx} variant='contained' onClick={addRow}>
          Agregar
        </Button>
      </div>

      <div className='flex flex-col gap-2'>
        {panel.rows.map((row, index) => (
          <div
            key={row.id}
            className='rounded-lg border border-slate-200 dark:border-gray-700 p-2 flex flex-col gap-1.5'
          >
            <div className='flex items-center justify-between'>
              <span className={panelLabelClass}>Fila {index + 1}</span>
              <div className='flex items-center'>
                <IconButton size='small' sx={rowIconButtonSx} disabled={index === 0} onClick={() => moveRow(index, -1)}>
                  <KeyboardArrowUp fontSize='small' />
                </IconButton>
                <IconButton
                  size='small'
                  sx={rowIconButtonSx}
                  disabled={index === panel.rows.length - 1}
                  onClick={() => moveRow(index, 1)}
                >
                  <KeyboardArrowDown fontSize='small' />
                </IconButton>
                <IconButton
                  size='small'
                  sx={{ ...rowIconButtonSx, color: '#ef4444' }}
                  onClick={() => removeRow(row.id)}
                >
                  <DeleteOutline fontSize='small' />
                </IconButton>
              </div>
            </div>

            <TextField
              size='small'
              label='Etiqueta'
              value={row.label}
              onChange={(e) => updateRow(row.id, { label: e.target.value })}
              fullWidth
            />

            <div className='flex gap-1.5'>
              <KindButton active={row.kind === 'static'} onClick={() => updateRow(row.id, { kind: 'static' })}>
                Texto
              </KindButton>
              <KindButton active={row.kind === 'variable'} onClick={() => updateRow(row.id, { kind: 'variable' })}>
                Variable
              </KindButton>
            </div>

            {row.kind === 'static' ? (
              <TextField
                size='small'
                label='Valor'
                value={row.value ?? ''}
                onChange={(e) => updateRow(row.id, { value: e.target.value })}
                fullWidth
              />
            ) : (
              <Tooltip title={row.dataInflux?.name ? 'Cambiar variable' : 'Elegir variable'} placement='top'>
                <Button
                  size='small'
                  variant='outlined'
                  fullWidth
                  startIcon={<HiOutlineVariable size={14} />}
                  sx={{ ...ghostPillSx, justifyContent: 'flex-start', overflow: 'hidden' }}
                  onClick={() => onAssignVariableRequest(row.id)}
                >
                  <span className='truncate'>{row.dataInflux?.name || 'Elegir variable...'}</span>
                </Button>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
    </Box>
  );
};

export default PanelEditor;
