import React from 'react';
import { BiSync } from "react-icons/bi";

const LineStylePanel = ({ 
    visible, 
    lineStyle, 
    onChange, 
    setElements, 
    selectedId 
}) => {
    if (!visible) return null;

    return (
        <div className="absolute top-5 left-1 m-1 p-4 bg-white border border-gray-300 shadow-lg rounded-lg z-10 max-w-md">
            <label className="block text-sm font-medium mb-1">Color</label>
            <input
                type="color"
                value={lineStyle.color}
                onChange={(e) => onChange({ ...lineStyle, color: e.target.value })}
                className="w-full h-8 p-0 border rounded"
            />

            <label className="block mt-2 text-sm font-medium mb-1">Ancho</label>
            <input
                type="range"
                min={1}
                max={10}
                value={lineStyle.strokeWidth}
                onChange={(e) => onChange({ ...lineStyle, strokeWidth: parseInt(e.target.value) })}
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
        </div>
    );
};

export default LineStylePanel;
