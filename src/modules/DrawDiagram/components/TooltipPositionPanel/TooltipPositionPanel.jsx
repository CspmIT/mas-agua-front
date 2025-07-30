import React, { useState } from 'react';

const TooltipPositionPanel = ({
  visible,
  selectedElement,
  onChangePosition,
  onHideTooltip,
  onShowTooltip,
  onSetMaxValue
}) => {
  if (
    !visible ||
    !selectedElement?.dataInflux ||
    selectedElement?.type !== 'image'
  ) return null;

  const positions = ['Arriba', 'Abajo', 'Izquierda', 'Derecha', 'Centro'];
  const isTooltipShow = selectedElement.dataInflux.show;
  const [localMaxValue, setLocalMaxValue] = useState(selectedElement.dataInflux.max_value_var || '');
  const [calculatePercentage, setCalculatePercentage] = useState(
    selectedElement.dataInflux.calculatePercentage || false
  );

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

      {/* Toggle ocultar */}
      <label className="flex items-center space-x-2 mt-2">
        <input
          type="checkbox"
          checked={!isTooltipShow}
          onChange={(e) => {
            if (e.target.checked) onHideTooltip();
            else if (onShowTooltip) onShowTooltip();
          }}
        />
        <span className="text-sm">Ocultar</span>
      </label>

      {/* Posiciones */}
      <div className="grid grid-cols-3 gap-2 my-3 text-xs">
        <div></div>
        <button
          className={`px-2 py-1 rounded ${
            selectedElement.dataInflux.position === 'Arriba' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => onChangePosition('Arriba')}
        >
          Arriba
        </button>
        <div></div>

        <button
          className={`px-2 py-1 rounded ${
            selectedElement.dataInflux.position === 'Izquierda' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => onChangePosition('Izquierda')}
        >
          Izquierda
        </button>
        <button
          className={`px-2 py-1 rounded ${
            selectedElement.dataInflux.position === 'Centro' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => onChangePosition('Centro')}
        >
          Centro
        </button>
        <button
          className={`px-2 py-1 rounded ${
            selectedElement.dataInflux.position === 'Derecha' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => onChangePosition('Derecha')}
        >
          Derecha
        </button>

        <div></div>
        <button
          className={`px-2 py-1 rounded ${
            selectedElement.dataInflux.position === 'Abajo' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
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
    </div>
  );
};

export default TooltipPositionPanel;
