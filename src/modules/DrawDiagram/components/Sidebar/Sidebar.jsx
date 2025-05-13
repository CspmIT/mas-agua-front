import React from 'react';
import { RiImageAddFill } from "react-icons/ri";
import { MdDelete, MdPolyline } from "react-icons/md";
import { FaArrowRightLong } from "react-icons/fa6";
import { HiOutlineVariable } from "react-icons/hi";


const Sidebar = ({
  tool,
  setTool,
  selectedId,
  setShowImageSelector,
  setShowLineStyleSelector,
  setShowTextStyler,
  setShowListField,
  setElements,
  setCircles,
  setSelectedId,
  setTextPosition,
  setTextInput,
  handleDeleteElement,
}) => {

  return (
    <div className="w-20 p-3 bg-slate-400 rounded-bl-lg">
      <button
        title="Agregar imagen"
        onClick={() => {
          if (tool === 'imageSelector') {
            setTool(null);
            setShowImageSelector(false);
          } else {
            setTool('imageSelector');
            setShowImageSelector(true);
            setShowLineStyleSelector(false);
            setShowTextStyler(false);
            setShowListField(false);
          }
        }}
        className={`w-full mb-2 p-3 h-14 rounded-lg flex items-center justify-center ${tool === 'imageSelector' ? 'bg-slate-800' : 'bg-slate-600'} text-white`}
      >
        <RiImageAddFill className="text-2xl" />
      </button>

      <button
        title="Agregar línea"
        onClick={() => {
          if (tool === 'simpleLine') {
            setTool(null);
            setShowLineStyleSelector(false);
          } else {
            setTool('simpleLine');
            setShowLineStyleSelector(true);
            setShowTextStyler(false);
            setShowImageSelector(false);
            setShowListField(false);
          }
        }}
        className={`w-full mb-2 p-2 h-14 rounded-lg flex items-center justify-center ${tool === 'simpleLine' ? 'bg-slate-800' : 'bg-slate-600'} text-white`}
      >
        <FaArrowRightLong className="text-2xl" />
      </button>

      <button
        title="Agregar texto"
        onClick={() => {
          if (tool === 'text') {
            setTool(null);
            setShowTextStyler(false);
            setTextPosition(null);
            setTextInput('');
            setEditingTextId(null);
          } else {
            setTool('text');
            setShowLineStyleSelector(false);
            setShowTextStyler(true);
            setShowImageSelector(false);
            setShowListField(false);
          }
        }}
        className={`w-full mb-2 p-3 h-14 rounded-lg flex items-center justify-center ${tool === 'text' ? 'bg-slate-800' : 'bg-slate-600'} text-white text-2xl font-bold`}
      >
        T
      </button>

      <button
        title="Agregar polilínea"
        onClick={() => {
          if (tool === 'polyline') {
            setTool(null);
            setShowLineStyleSelector(false);
          } else {
            setTool('polyline');
            setShowLineStyleSelector(true);
            setShowTextStyler(false);
            setShowImageSelector(false);
            setShowListField(false);
          }
        }}
        className={`w-full mb-2 p-2 h-14 rounded-lg flex items-center justify-center ${tool === 'polyline' ? 'bg-slate-800' : 'bg-slate-600'} text-white`}
      >
        <MdPolyline className="text-2xl" />
      </button>
      
      {!selectedId ? (
        <button
              title="Asignar variable"
              onClick={() => {
                if (tool === 'floatingVariable') {
                  setTool(null);
                  setShowListField(false);
                } else {
                  setTool('floatingVariable');
                  setShowListField(true);
                  setShowImageSelector(false);
                  setShowLineStyleSelector(false);
                  setShowTextStyler(false);
                }
              }}
              className={`w-full mb-2 p-3 h-14 rounded-lg flex items-center justify-center ${tool === 'floatingVariable' ? 'bg-slate-800' : 'bg-slate-600'
                } text-white text-2xl font-bold`}
            >
              <HiOutlineVariable className="text-2xl" />
            </button>
      ): null}
      {selectedId && (
        <div>
          <hr className="my-4 border-gray-200" />
          <button
            title="Asignar variable"
            onClick={() => {
              if (tool === 'fields') {
                setTool(null);
                setShowListField(false);
              } else {
                setTool('fields');
                setShowListField(true);
                setShowImageSelector(false);
                setShowLineStyleSelector(false);
                setShowTextStyler(false);
              }
            }}
            className={`w-full mb-2 p-3 h-14 rounded-lg flex items-center justify-center ${tool === 'fields' ? 'bg-slate-800' : 'bg-slate-600'
              } text-white text-2xl font-bold`}
          >
            <HiOutlineVariable className="text-2xl" />
          </button>

          <button
            title="Borrar elemento"
            onClick={() => {
              setElements((prev) => prev.filter((el) => String(el.id) !== String(selectedId)));
              setCircles((prev) => prev.filter((c) => String(c.lineId) !== String(selectedId)));
              handleDeleteElement(selectedId);
              setSelectedId(null);
              setShowTextStyler(false);
              setTextPosition(null);
            }}
            className="w-full mb-5 bg-red-500 text-white p-3 rounded-lg flex items-center justify-center"
          >
            <MdDelete className='text-3xl' />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
