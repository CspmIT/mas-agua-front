import React, { useEffect } from 'react';
import { BiSync } from "react-icons/bi";

const LineStylePanel = ({ 
    visible, 
    lineStyle, 
    onChange, 
    setElements,
    selectedId,
    setSelectedId,
    elements,
    tool,
    setTool
}) => {
    // Buscar elemento seleccionado
    const selectedElement = selectedId && elements 
        ? elements.find(el => el.id === selectedId) 
        : null;

    const elementType = selectedElement?.type || tool;

    // Determinar si el elemento seleccionado es una línea o polilínea
    const isLine = elementType === 'line' || elementType === 'simpleLine';
    const isPolyline = elementType === 'polyline';

    const canEdit = selectedId && (isLine || isPolyline);

    // Deseleccionar si el elemento no es linea o polilinea
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
                invertAnimation: selectedElement.invertAnimation || false
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

    return (
        <div className="absolute top-5 left-1 m-1 p-4 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-48">
            <h4 className="text-sm font-bold mb-2">
                {canEdit 
                    ? `Editar ${isLine ? 'línea' : 'polilínea'}` 
                    : `Estilo de ${tool === 'polyline' ? 'la polilínea' : 'la línea'}`
                }
            </h4>

            <label className="block text-sm font-medium mb-1">Color</label>
            <input
                type="color"
                value={lineStyle.color}
                onChange={(e) => {
                    const newColor = e.target.value;
                    onChange({ ...lineStyle, color: newColor });

                    if (canEdit) {
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

                    if (canEdit) {
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
                style={{ padding: 0 }}
            />

            {canEdit && (
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
                    className="mt-3 flex items-center gap-1 px-2 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
                >               
                    <BiSync 
                        className={`transform transition-transform ${lineStyle.invertAnimation ? 'rotate-180' : ''}`} 
                    />
                    Cambiar sentido
                </button>
            )}

            {!canEdit && (
                <button
                    onClick={() => 
                        setTool(null)
                    }
                    className="mt-3 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Cancelar
                </button>
            )}
        </div>
    );
};

export default LineStylePanel;
