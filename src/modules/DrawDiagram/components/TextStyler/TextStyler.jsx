import React from 'react';

const TextStyler = ({
  visible,
  textStyle,
  onStyleChange,
  onApply,
  isEditing
}) => {
  if (!visible) return null;

  return (
    <div className="absolute top-16 left-1 m-1 p-4 bg-white border border-gray-300 shadow-lg rounded-lg z-10 max-w-md">
      <label className="block text-sm font-medium mb-1">Color</label>
      <input
        type="color"
        value={textStyle.fill}
        onChange={(e) => onStyleChange({ ...textStyle, fill: e.target.value })}
        className="w-full h-8 p-0 border rounded mb-3"
      />

      <label className="block text-sm font-medium mb-1">Tamaño</label>
      <div className="flex items-center mb-3">
        <input
          type="range"
          min={8}
          max={72}
          value={textStyle.fontSize}
          onChange={(e) => onStyleChange({ ...textStyle, fontSize: parseInt(e.target.value) })}
          className="w-full mr-2"
        />
        <span className="text-sm">{textStyle.fontSize}px</span>
      </div>

      <label className="block text-sm font-medium mb-1">Estilo</label>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded ${textStyle.fontStyle === 'normal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onStyleChange({ ...textStyle, fontStyle: 'normal' })}
        >
          Normal
        </button>
        <button
          className={`px-3 py-1 rounded font-bold ${textStyle.fontStyle === 'bold' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onStyleChange({ ...textStyle, fontStyle: 'bold' })}
        >
          Negrita
        </button>
        <button
          className={`px-3 py-1 rounded italic ${textStyle.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onStyleChange({ ...textStyle, fontStyle: 'italic' })}
        >
          Cursiva
        </button>
      </div>

      {isEditing && (
        <button
          className="w-full mt-3 bg-blue-500 text-white py-1 rounded"
          onClick={onApply}
        >
          Aplicar cambios
        </button>
      )}
    </div>
  );
};

export default TextStyler;