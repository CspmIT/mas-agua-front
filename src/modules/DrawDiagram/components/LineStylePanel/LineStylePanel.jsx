import React, { useEffect } from 'react';
import { BiSync } from "react-icons/bi";

const LineStylePanel = ({ 
    visible, 
    lineStyle, 
    onChange, 
    setElements,
    selectedId,
    elements,
    tool,
    setTool
}) => {
    // Actualizar lineStyle cuando se selecciona un elemento existente
    useEffect(() => {
        if (selectedId && elements) {
            const selectedElement = elements.find(el => el.id === selectedId);
            if (selectedElement) {
                const newStyle = {
                    color: selectedElement.stroke,
                    strokeWidth: selectedElement.strokeWidth,
                    invertAnimation: selectedElement.invertAnimation || false
                };
    
                // Solo actualiza si hay un cambio real
                if (
                    newStyle.color !== lineStyle.color ||
                    newStyle.strokeWidth !== lineStyle.strokeWidth ||
                    newStyle.invertAnimation !== lineStyle.invertAnimation
                ) {
                    onChange(newStyle);
                }
            }
        }
    }, [selectedId, elements]);

    if (!visible) return null;

    const isEditing = Boolean(selectedId);
    const selectedElement = isEditing && elements ? 
        elements.find(el => el.id === selectedId) : null;
    const elementType = selectedElement?.type || tool;

    // Determinar si estamos trabajando con una línea o polilínea
    const isLine = elementType === 'line' || elementType === 'simpleLine';
    const isPolyline = elementType === 'polyline';

    return (
        <div className="absolute top-5 left-1 m-1 p-4 bg-white border border-gray-300 shadow-lg rounded-lg z-10 max-w-md">
            <h4 className="text-sm font-bold mb-2">
                {isEditing ? 
                    `Editar ${isLine ? 'línea' : isPolyline ? 'polilínea' : 'elemento'}` : 
                    `Estilo de ${isLine ? 'la línea' : isPolyline ? 'la polilínea' : 'elemento'}`}
            </h4>
            
            <label className="block text-sm font-medium mb-1">Color</label>
            <input
                type="color"
                value={lineStyle.color}
                onChange={(e) => {
                    const newColor = e.target.value;
                    onChange({ ...lineStyle, color: newColor });
            
                    if (selectedId) {
                        setElements((prev) =>
                            prev.map((el) =>
                                el.id === selectedId
                                    ? { ...el, stroke: newColor }
                                    : el
                            )
                        );
                    }
                }}
                className="w-full h-8 p-0 border rounded"
            />

            <label className="block mt-2 text-sm font-medium mb-1">Ancho</label>
            <input
                type="range"
                min={1}
                max={10}
                value={lineStyle.strokeWidth}
                onChange={(e) => {
                    const newWidth = parseInt(e.target.value);
                    onChange({ ...lineStyle, strokeWidth: newWidth });
            
                    if (selectedId) {
                        setElements((prev) =>
                            prev.map((el) =>
                                el.id === selectedId
                                    ? { ...el, strokeWidth: newWidth }
                                    : el
                            )
                        );
                    }
                }}
                className="w-full"
            />

            {selectedId && (
            <button
                onClick={() => {
                    setElements((prev) =>
                        prev.map((el) =>
                            el.id === selectedId
                                ? { ...el, invertAnimation: !el.invertAnimation }
                                : el
                        )
                    );
                    onChange({ 
                        ...lineStyle, 
                        invertAnimation: !lineStyle.invertAnimation 
                    });
                }}
                className="mt-3 flex items-center gap-2 px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
            >
                <BiSync 
                    className={`transform transition-transform ${lineStyle.invertAnimation ? 'rotate-180' : ''}`} 
                />
                Cambiar sentido
            </button>
            )}

            {!selectedId && (
            <button
                onClick={() => setTool(null)}
                className="mt-3 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
                Cancelar
            </button>
            )}
        </div>
    );
};

export default LineStylePanel;