// components/TopNavbar.jsx
import React from 'react';
import { PiBroomBold } from "react-icons/pi";
import { FaSave } from "react-icons/fa";
import { IoArrowUndo, IoCaretBackOutline } from "react-icons/io5";
import { MdOutlineMoveDown, MdOutlineMoveUp } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const TopNavbar = ({ 
    onClear, 
    onSave, 
    onUndo, 
    elements = [],
    selectedId,
    onSendToBack,
    onBringToFront }) => {
    const navigate = useNavigate()

    const listDiagram = async () => {
        if (elements.length > 0) {
            const result = await Swal.fire({
                title: '¿Deseás salir?',
                text: 'Hay elementos en el lienzo. Si salís podrías perder cambios.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
            });

            if (!result.isConfirmed) return;
        }

        navigate(`/config/diagram`);
    };
    
    return (
        <div className="w-full flex-1 bg-slate-400 rounded-t-lg">
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-3 ps-16">
                    <button
                        onClick={onSave}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-800 rounded text-sm text-white"
                    >
                        <FaSave className="text-lg" />
                        Guardar
                    </button>
                    <button
                        onClick={onClear}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-800 rounded text-sm text-white"
                    >
                        <PiBroomBold className="text-lg" />
                        Limpiar
                    </button>
                    <button
                        onClick={onUndo}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-800 rounded text-sm text-white"
                    >
                        <IoArrowUndo className="text-lg" />
                        Deshacer
                    </button>

                    {selectedId && (
                        <>
                            <button
                            onClick={onSendToBack}
                            title="Mover al fondo"
                            className="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-800 rounded text-sm text-white"
                            >
                            <MdOutlineMoveDown className="text-lg" />
                            </button>
                            <button
                            onClick={onBringToFront}
                            title="Mover al frente"
                            className="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-800 rounded text-sm text-white"
                            >
                            <MdOutlineMoveUp className="text-lg" />
                            </button>
                        </>
                        )}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        title="Volver al listado"
                        onClick={listDiagram}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-800 rounded text-sm text-white"
                    >
                        <IoCaretBackOutline className="text-lg" />
                       
                    </button>
                </div>
            </div>
        </div>

    );
};

export default TopNavbar;
