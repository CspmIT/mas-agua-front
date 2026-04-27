import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import {
  floatingPanelSx,
  ghostPillSx,
  panelLabelClass,
  panelTitleClass,
  primaryPillSx,
} from '../../utils/js/diagramTheme';

const POSITIONS = ['Arriba', 'Izquierda', 'Centro', 'Derecha', 'Abajo'];

const BOOLEAN_COLOR_OPTIONS = [
  { value: '-', label: 'Seleccione...' },
  { value: 'default', label: 'Apagado (gris)' },
  { value: 'success', label: 'Encendido (verde)' },
  { value: 'error', label: 'En falla (rojo)' },
  { value: 'warning', label: 'Advertencia (amarillo)' },
];

const PositionButton = ({ active, onClick, children }) => (
  <Button
    size='small'
    variant={active ? 'contained' : 'outlined'}
    onClick={onClick}
    sx={{ ...(active ? primaryPillSx : ghostPillSx), minWidth: 0, px: 1.25 }}
  >
    {children}
  </Button>
);

const TooltipPositionPanel = ({
  selectedElement,
  onChangePosition,
  onHideTooltip,
  onShowTooltip,
  onSetMaxValue,
  onSetBooleanColors,
  onSetBinaryBit,
}) => {
  if (!selectedElement?.dataInflux || selectedElement.type !== 'image') return null;

  const isTooltipShow = selectedElement.dataInflux.show;
  const [localMaxValue, setLocalMaxValue] = useState(selectedElement.dataInflux.max_value_var || '');
  const [calculatePercentage, setCalculatePercentage] = useState(
    selectedElement.dataInflux.calculatePercentage || false
  );

  const unit = selectedElement.dataInflux.unit?.toLowerCase() || '';
  const isBooleanUnit = ['booleano', 'binario', 'bool'].includes(unit);
  const isBinaryCompressed = selectedElement.dataInflux.binary_compressed || false;
  const isCalc_binary = selectedElement.dataInflux.calc_binary_compressed || false;

  const [booleanColors, setBooleanColors] = useState(
    selectedElement.dataInflux.boolean_colors || { false: '-', true: '-' }
  );

  const [binaryBits, setBinaryBits] = useState([]);

  useEffect(() => {
    if (!isBinaryCompressed) return;

    const creationBits = selectedElement.dataInflux.bits;
    const editBits = selectedElement.dataInflux.value;

    if (Array.isArray(creationBits)) {
      setBinaryBits(creationBits);
    } else if (Array.isArray(editBits)) {
      const normalizedBits = editBits.map((b) => ({ id: b.id_bit, name: b.bit }));
      setBinaryBits(normalizedBits);
    } else {
      setBinaryBits([]);
    }
  }, [selectedElement, isBinaryCompressed]);

  const selectedBitId = String(
    selectedElement.dataInflux.binary?.id_bit ?? selectedElement.dataInflux.id_bit ?? ''
  );

  const handleBinaryBitSelect = (e) => {
    const id_bit = Number(e.target.value);
    const selectedBit = binaryBits.find((b) => Number(b.id) === id_bit);
    if (!selectedBit) return;

    onSetBinaryBit?.({
      id_var: selectedElement.dataInflux.id,
      id_bit: selectedBit.id,
      name: selectedBit.name,
    });
  };

  const handleMaxValueChange = (e) => {
    const value = parseFloat(e.target.value);
    setLocalMaxValue(e.target.value);
    if (!isNaN(value) && value > 0) {
      onSetMaxValue(value);
    }
  };

  const handleCalculatePercentageToggle = () => {
    setCalculatePercentage((prev) => {
      const newValue = !prev;
      onSetMaxValue(newValue ? parseFloat(localMaxValue) || 0 : null, newValue);
      return newValue;
    });
  };

  const currentPosition = selectedElement.dataInflux.position;

  return (
    <Box
      sx={floatingPanelSx}
      className='absolute left-2 top-2 z-10 w-64 p-3 flex flex-col gap-3'
    >
      <h4 className={panelTitleClass}>Personalizar variable</h4>

      <FormControlLabel
        control={
          <Checkbox
            size='small'
            checked={!isTooltipShow}
            onChange={(e) => {
              if (e.target.checked) onHideTooltip();
              else onShowTooltip?.();
            }}
          />
        }
        label={<span className='text-sm text-slate-700 dark:text-gray-300'>Ocultar tooltip</span>}
      />

      <div>
        <label className={`${panelLabelClass} block mb-1.5`}>Posición</label>
        <div className='grid grid-cols-3 gap-1.5'>
          <div />
          <PositionButton active={currentPosition === 'Arriba'} onClick={() => onChangePosition('Arriba')}>Arriba</PositionButton>
          <div />
          <PositionButton active={currentPosition === 'Izquierda'} onClick={() => onChangePosition('Izquierda')}>Izq.</PositionButton>
          <PositionButton active={currentPosition === 'Centro'} onClick={() => onChangePosition('Centro')}>Centro</PositionButton>
          <PositionButton active={currentPosition === 'Derecha'} onClick={() => onChangePosition('Derecha')}>Der.</PositionButton>
          <div />
          <PositionButton active={currentPosition === 'Abajo'} onClick={() => onChangePosition('Abajo')}>Abajo</PositionButton>
          <div />
        </div>
      </div>

      {!isBinaryCompressed && !isCalc_binary && (
        <FormControlLabel
          control={
            <Checkbox
              size='small'
              checked={calculatePercentage}
              onChange={handleCalculatePercentageToggle}
            />
          }
          label={<span className='text-sm text-slate-700 dark:text-gray-300'>Calcular valor de la variable</span>}
        />
      )}

      {calculatePercentage && (
        <TextField
          size='small'
          type='number'
          label='Valor máximo'
          value={localMaxValue}
          onChange={handleMaxValueChange}
          placeholder='Ej: 300'
          inputProps={{ min: 0, step: 0.01 }}
        />
      )}

      {isBinaryCompressed && !isCalc_binary && (
        <>
          <Divider flexItem />
          <div>
            <label className={`${panelLabelClass} block mb-1.5`}>Asignación de bits</label>
            <FormControl fullWidth size='small'>
              <Select value={selectedBitId} onChange={handleBinaryBitSelect} displayEmpty>
                <MenuItem value='' disabled>Elegí el bit</MenuItem>
                {binaryBits.map((b) => (
                  <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </>
      )}

      {isBooleanUnit && (
        <>
          <Divider flexItem />
          <div className='flex flex-col gap-2'>
            <label className={panelLabelClass}>Colores por estado</label>
            {['false', 'true'].map((stateKey) => (
              <FormControl key={stateKey} fullWidth size='small'>
                <Select
                  value={booleanColors[stateKey]}
                  onChange={(e) => {
                    const newColors = { ...booleanColors, [stateKey]: e.target.value };
                    setBooleanColors(newColors);
                    onSetBooleanColors?.(newColors);
                  }}
                  renderValue={(selected) => {
                    const opt = BOOLEAN_COLOR_OPTIONS.find((o) => o.value === selected);
                    return (
                      <span className='text-sm'>
                        <span className='font-medium mr-1.5'>{stateKey === 'true' ? 'True:' : 'False:'}</span>
                        {opt?.label}
                      </span>
                    );
                  }}
                >
                  {BOOLEAN_COLOR_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </div>
        </>
      )}
    </Box>
  );
};

export default TooltipPositionPanel;
