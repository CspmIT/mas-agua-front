import React, { useEffect, useState } from 'react';

const TooltipPositionPanel = ({
  selectedElement,
  onChangePosition,
  onHideTooltip,
  onShowTooltip,
  onSetMaxValue,
  onSetBooleanColors,
  onSetBinaryBit
}) => {
  if (!selectedElement?.dataInflux || selectedElement.type !== 'image') return null;

  const positions = ['Arriba', 'Abajo', 'Izquierda', 'Derecha', 'Centro'];
  const isTooltipShow = selectedElement.dataInflux.show;

  const [localMaxValue, setLocalMaxValue] = useState(selectedElement.dataInflux.max_value_var || '');
  const [calculatePercentage, setCalculatePercentage] = useState(
    selectedElement.dataInflux.calculatePercentage || false
  );

  const unit = selectedElement.dataInflux.unit?.toLowerCase() || '';
  const isBooleanUnit = ['booleano', 'binario', 'bool'].includes(unit);
  const isBinaryCompressed = selectedElement.dataInflux.binary_compressed || false;

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
      const normalizedBits = editBits.map(b => ({
        id: b.id_bit,
        name: b.bit
      }));
      setBinaryBits(normalizedBits);
    } else {
      setBinaryBits([]);
    }
  }, [selectedElement, isBinaryCompressed]);

  const selectedBitId = String(
    selectedElement.dataInflux.binary?.id_bit ?? // creación
    selectedElement.dataInflux.id_bit ?? ''       // edición
  );
  const handleBinaryBitSelect = (e) => {
    const id_bit = Number(e.target.value);
    
    const selectedBit = binaryBits.find(b => Number(b.id) === id_bit);
    if (!selectedBit) return;

    onSetBinaryBit?.({
      id_var: selectedElement.dataInflux.id,
      id_bit: selectedBit.id,
      name: selectedBit.name
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
    setCalculatePercentage(prev => {
      const newValue = !prev;
      // Guardar en el elemento que se debe calcular porcentaje
      onSetMaxValue(newValue ? parseFloat(localMaxValue) || 0 : null, newValue);
      return newValue;
    });
  };

  return (
    <div className="absolute top-72 left-1 m-1 p-4 bg-white border border-gray-300 shadow-lg rounded-lg max-w-md z-10">
      <h4 className="text-sm font-bold mb-2">Personalizar variable</h4>

      <label className="flex items-center space-x-2 mt-2">
        <input
          type="checkbox"
          checked={!isTooltipShow}
          onChange={(e) => {
            if (e.target.checked) onHideTooltip();
            else onShowTooltip?.();
          }}
        />
        <span className="text-sm">Ocultar</span>
      </label>

      <div className="grid grid-cols-3 gap-2 my-3 text-xs">
        <div></div>
        <button
          className={`px-2 py-1 rounded ${selectedElement.dataInflux.position === 'Arriba' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onChangePosition('Arriba')}
        >
          Arriba
        </button>
        <div></div>

        <button
          className={`px-2 py-1 rounded ${selectedElement.dataInflux.position === 'Izquierda' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onChangePosition('Izquierda')}
        >
          Izquierda
        </button>

        <button
          className={`px-2 py-1 rounded ${selectedElement.dataInflux.position === 'Centro' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onChangePosition('Centro')}
        >
          Centro
        </button>

        <button
          className={`px-2 py-1 rounded ${selectedElement.dataInflux.position === 'Derecha' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onChangePosition('Derecha')}
        >
          Derecha
        </button>

        <div></div>

        <button
          className={`px-2 py-1 rounded ${selectedElement.dataInflux.position === 'Abajo' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onChangePosition('Abajo')}
        >
          Abajo
        </button>

        <div></div>
      </div>

      {/* Check Calcular valor */}
      <label className="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          checked={calculatePercentage}
          onChange={handleCalculatePercentageToggle}
        />
        <span className="text-sm">Calcular valor de la variable</span>
      </label>

      {/* Valor máximo habilitable */}
      {calculatePercentage && (
        <div className="mt-1 grid grid-cols-1 gap-1">
          <label className="text-sm">Valor máximo:</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={localMaxValue}
            onChange={handleMaxValueChange}
            placeholder="Ej: 300"
            className="bg-gray-100 border rounded p-1"
          />
        </div>
      )}

      {isBinaryCompressed && (
        <div className="mt-4 border-t pt-3">
          <h5 className="text-sm font-semibold mb-2">Asignación de Bits</h5>

          <select
            onChange={handleBinaryBitSelect}
            value={selectedBitId}
            className="w-full border rounded p-1 bg-gray-100 text-sm"
          >
            <option value="" disabled>Elegí el bit</option>
            {binaryBits.map(b => (
              <option key={b.id} value={String(b.id)}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isBooleanUnit && (
        <div className="mt-4 border-t pt-3">
          <h5 className="text-sm font-semibold mb-2">Colores por estado</h5>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">False:</span>
              <select
                value={booleanColors.false}
                onChange={(e) => {
                  const newColors = { ...booleanColors, false: e.target.value };
                  setBooleanColors(newColors);
                  onSetBooleanColors?.(newColors);
                }}
                className="border rounded px-2 py-1 text-sm bg-gray-100"
              >
                <option value="-">Seleccione...</option>
                <option value="default">Apagado (gris)</option>
                <option value="success">Encendido (verde)</option>
                <option value="error">En falla (rojo)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">True:</span>
              <select
                value={booleanColors.true}
                onChange={(e) => {
                  const newColors = { ...booleanColors, true: e.target.value };
                  setBooleanColors(newColors);
                  onSetBooleanColors?.(newColors);
                }}
                className="border rounded px-2 py-1 text-sm bg-gray-100"
              >
                <option value="-">Seleccione...</option>
                <option value="default">Apagado (gris)</option>
                <option value="success">Encendido (verde)</option>
                <option value="error">En falla (rojo)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TooltipPositionPanel;
