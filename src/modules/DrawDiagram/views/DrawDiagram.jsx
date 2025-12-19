import React, { useEffect, useRef, useState } from 'react';
import { ListImg } from '../utils/js/ListImg';
import Swal from 'sweetalert2';
import ListField from '../components/Fields/ListField';
import ImageSelector from '../components/ImageSelector/ImageSelector';
import LineStylePanel from '../components/LineStylePanel/LineStylePanel';
import TextStyler from '../components/TextStyler/TextStyler';
import TextEditor from '../components/TextEditor/TextEditor';
import Sidebar from '../components/Sidebar/Sidebar';
import DiagramCanvas from '../components/DiagramCanvas/DiagramCanvas';
import TopNavbar from '../components/TopNavbar/TopNavbar';
import { saveDiagramKonva, uploadCanvaDb } from '../utils/js/drawActions';
import { useParams, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import LoaderComponent from '../../../components/Loader';
import TooltipPositionPanel from '../components/TooltipPositionPanel/TooltipPositionPanel';
import { useDrawingTools } from '../hooks/useDrawingTools';
import { useTooltipManager } from '../hooks/useTooltipManager';
import { useDiagramState } from '../hooks/useDiagramState';
import { useTextTools } from '../hooks/useTextTools';

const imageList = ListImg();

const DrawDiagram = () => {
  const { id } = useParams();
  const [tool, setTool] = useState(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const isDrawing = useRef(false);
  const stageRef = useRef();
  const transformerRef = useRef();
  const [reverseDirection, setReverseDirection] = useState(false);
  const [circles, setCircles] = useState([]);
  const [lineStyle, setLineStyle] = useState({
    color: '#3b82f6',
    strokeWidth: 5,
  });
  const [showLineStyleSelector, setShowLineStyleSelector] = useState(false);
  const [dashOffset, setDashOffset] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  const [textStyle, setTextStyle] = useState({
    fontSize: 16,
    fill: '#000000',
    fontStyle: 'normal',
  });
  const [showTextStyler, setShowTextStyler] = useState(false);
  const [showListField, setShowListField] = useState(false);
  const [diagramMetadata, setDiagramMetadata] = useState({
    id: null,
    title: '',
    backgroundColor: '#ffffff',
    backgroundImg: ''
  });

  const [newElementsIds, setNewElementsIds] = useState([]);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingStage, setIsDraggingStage] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);
  const [showTooltipPositionPanel, setShowTooltipPositionPanel] = useState(false);

  const {
    elements,
    setElements,
    selectedId,
    setSelectedId,
    deletedItems,
    setDeletedItems,
    handleDeleteElement,
    moveElementToBack,
    moveElementToFront
  } = useDiagramState();

  const {
    lineStart,
    tempLine,
    polylinePoints,
    isDrawingPolyline,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    finishPolyline,
    addImageToCanvas,
    setTempLine,
    setLineStart,
    setPolylinePoints,
    setIsDrawingPolyline,
    handleSelect,
    handleTransformEnd
  } = useDrawingTools({ 
    tool, setTool, 
    lineStyle, 
    elements, setElements, 
    setNewElementsIds, 
    selectedId, setSelectedId,
    isDrawing, 
    setCircles, 
    setShowLineStyleSelector,
    setShowImageSelector, 
    setShowTooltipPositionPanel,
    setTextInput,
    setTextPosition,
    editingTextId,
    setEditingTextId,
    setTextStyle,
    setShowTextStyler,
    setLineStyle
  });

  const { handleShowTooltip, handleHideTooltip, handleChangeTooltipPosition, handleSetMaxValue, handleBooleanColorChange, handleSetBinaryBit } = useTooltipManager({ selectedId, elements, setElements });

  const { saveText } = useTextTools({ elements, setElements, textStyle, setTextInput, setTextPosition, setEditingTextId, setNewElementsIds });

  const handleAssignVariable = (dataInflux) => {
    if (tool === 'floatingVariable') {
      const img = new window.Image();
      img.src = '/assets/img/Diagram/newDiagram/img_sinfondo.PNG';
      img.onload = () => {
        const width = 100;
        const height = (img.height / img.width) * width;

        const newImage = {
          id: String(Date.now()),
          type: 'image',
          src: img.src,
          x: 150,
          y: 150,
          width,
          height,
          draggable: true,
          dataInflux: dataInflux,
        };

        setElements((prev) => [...prev, newImage]);
        setNewElementsIds((prev) => [...prev, newImage.id]);
        setTool(null);
        setShowListField(false);
      };
      return;
    }

    if (!selectedId) return;

    setElements((prev) =>
      prev.map((el) =>
        String(el.id) === String(selectedId) ? {
          ...el, dataInflux: {
            ...dataInflux,
            position: 'Centro',
            show: true,
          }
        } : el
      )
    );
  };

  const handleClearCanvas = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esto eliminará todo el diagrama actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        setElements([]);
        setCircles([]);
        setSelectedId(null);
        setLineStart(null);
        setTempLine(null);
        setTextInput('');
        setTextPosition(null);
        setEditingTextId(null);
        setTool(null);
        setShowImageSelector(false);
        setShowLineStyleSelector(false);
        setShowTextStyler(false);
        Swal.fire('¡Eliminado!', 'El diagrama fue borrado.', 'success');
      }
    });
  };

  const handleSaveDiagram = async (navigate) => {
    const { value: nombre } = await Swal.fire({
      title: 'Guardar diagrama',
      input: 'text',
      inputLabel: 'Nombre del diagrama',
      inputValue: diagramMetadata.title || '',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      inputValidator: (value) => {
        if (!value.trim()) {
          return '¡Debes ingresar un nombre!';
        }
        return null;
      }
    });

    if (!nombre) return;

    const isNewDiagram = !diagramMetadata.id;

    const elementsToSave = elements.map(el => {
      const element = { ...el };
      if (!diagramMetadata.id || newElementsIds.includes(el.id)) {
        delete element.id;
      }
      return element;
    });

    ;
    const diagramToSave = {
      elements: elementsToSave,
      circles,
      diagramMetadata: {
        ...diagramMetadata,
        title: nombre,
      },
      deleted: deletedItems,
    };

    if (isNewDiagram) {
      delete diagramToSave.diagramMetadata.id;
    }

    await saveDiagramKonva({
      ...diagramToSave,
      navigate
    });

    setNewElementsIds([]);
    setDeletedItems({
      lines: [],
      texts: [],
      images: [],
      polylines: [],
    });
  };

  const handleUndo = () => {
    if (elements.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Nada para deshacer',
        text: 'No hay elementos en el diagrama.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    setElements((prev) => prev.slice(0, -1));
  };

  const handleZoomIn = () => {
    const scaleBy = 1.05;
    setStageScale((prev) => prev * scaleBy);
  };

  const handleZoomOut = () => {
    const scaleBy = 1.05;
    setStageScale((prev) => prev / scaleBy);
  };

  useEffect(() => {
    if (transformerRef.current && selectedId) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowLineStyleSelector(false);
        setLineStart(null);
        setTool('');
        if (textPosition) {
          setTextPosition(null);
          setTextInput('');
          setEditingTextId(null);
        }
        if (isDrawingPolyline) {
          setIsDrawingPolyline(false);
          setPolylinePoints([]);
          setTempLine(null);
        }
      }
      if (e.key === 'Enter' && isDrawingPolyline) {
        finishPolyline();
      }
      if (e.key === 'Delete' && selectedId) {
        handleDeleteElement(selectedId);
        setTool('');
        setSelectedId(null);
        setShowLineStyleSelector(false);
        setShowTextStyler(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, lineStart, textPosition, isDrawingPolyline, polylinePoints]);

  useEffect(() => {
    if (!selectedId) return;

    setElements((prev) =>
      prev.map((el) => {
        if (String(el.id) === String(selectedId) && el.type === 'line') {
          return {
            ...el,
            stroke: lineStyle.color,
            strokeWidth: lineStyle.strokeWidth,
          };
        }
        return el;
      })
    );
  }, [lineStyle]);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      setLineStart(null);
      setTempLine(null);
      setShowLineStyleSelector(false);
      // Añadir esto para polilíneas
      if (isDrawingPolyline) {
        // Si hay al menos 4 puntos (2 vértices), finaliza la polilínea
        if (polylinePoints.length >= 4) {
          finishPolyline();
        } else {
          // Si no hay suficientes puntos, cancela la polilínea
          setIsDrawingPolyline(false);
          setPolylinePoints([]);
          setTempLine(null);
        }
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [isDrawingPolyline, polylinePoints]);

  useEffect(() => {
    let frameId;

    const animate = () => {
      setDashOffset((prev) => (reverseDirection ? prev - 1 : prev + 0.35));
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [reverseDirection]);

  useEffect(() => {
    if (id) {
      setIsLoading(true);

      uploadCanvaDb(id, {
        setCircles,
        setDiagramMetadata,
        setTool,
      }).then((elements) => {
        setElements(elements);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [id]);

  return (
    <>
      {isLoading ? (
        <Box
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 1000 }}
        >
          <LoaderComponent />
        </Box>
      ) : (
        <>
          <div className="w-full">
            {/* Barra arriba */}
            <TopNavbar
              onClear={handleClearCanvas}
              onSaveDiagram={() => handleSaveDiagram(navigate)}
              onUndo={handleUndo}
              elements={elements}
              selectedId={selectedId}
              onSendToBack={moveElementToBack}
              onBringToFront={moveElementToFront}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              isPanning={isPanning}
              setIsPanning={setIsPanning}
            />
            {/* Contenedor horizontal de sidebar + canvas */}
            <div className="flex w-full max-h-[85vh]">
              <Sidebar
                tool={tool}
                setTool={setTool}
                selectedId={selectedId}
                setShowImageSelector={setShowImageSelector}
                setShowLineStyleSelector={setShowLineStyleSelector}
                setShowTextStyler={setShowTextStyler}
                setShowListField={setShowListField}
                setElements={setElements}
                setCircles={setCircles}
                setSelectedId={setSelectedId}
                setTextPosition={setTextPosition}
                setTextInput={setTextInput}
                handleDeleteElement={handleDeleteElement}
              />
              {/* Contenido principal (canvas + overlays) */}
              <div className="flex-1 bg-gray-300 rounded-br-lg relative">
                {/* Selector de imágenes */}
                {showImageSelector && (
                  <ImageSelector
                    visible={showImageSelector}
                    images={imageList}
                    onSelectImage={addImageToCanvas}
                  />
                )}
                {/* Panel de estilo de línea */}
                {showLineStyleSelector && (
                  <LineStylePanel
                    tool={tool}
                    setTool={setTool}
                    selectedId={selectedId}
                    visible={showLineStyleSelector}
                    lineStyle={lineStyle}
                    onChange={setLineStyle}
                    setElements={setElements}
                    elements={elements}
                    setSelectedId={setSelectedId}
                  />
                )}
                {/* Panel de estilo de texto */}
                <TextStyler
                  visible={showTextStyler}
                  textStyle={textStyle}
                  onStyleChange={setTextStyle}
                  onApply={() => {
                    if (editingTextId) {
                      setElements((prev) =>
                        prev.map((el) =>
                          el.id === editingTextId
                            ? {
                              ...el,
                              fontSize: textStyle.fontSize,
                              fill: textStyle.fill,
                              fontStyle: textStyle.fontStyle
                            }
                            : el
                        )
                      );
                      setShowTextStyler(false);
                      setTextPosition(null);
                    }
                  }}
                  isEditing={!!editingTextId}
                />
                {/* Selector de variables */}
                {showListField && (
                  <div className="absolute left-1 m-1 p-4 bg-white border border-gray-300 shadow-lg rounded-lg z-20 max-w-md">
                    <ListField
                      onSelectVariable={handleAssignVariable}
                      onClose={() => setShowListField(false)}
                    />
                  </div>
                )}
                {/* Panel posicion de variables */}
                {showTooltipPositionPanel && (
                <TooltipPositionPanel
                  selectedElement={elements.find(el => String(el.id) === String(selectedId))}
                  onChangePosition={handleChangeTooltipPosition}
                  onHideTooltip={handleHideTooltip}
                  onShowTooltip={handleShowTooltip}
                  onSetMaxValue={handleSetMaxValue}
                  onSetBooleanColors={handleBooleanColorChange}
                  onSetBinaryBit={handleSetBinaryBit}
                />
                )}
                {/* Canvas */}
                <DiagramCanvas
                  elements={elements}
                  circles={circles}
                  tempLine={tempLine}
                  dashOffset={dashOffset}
                  selectedId={selectedId}
                  stageRef={stageRef}
                  transformerRef={transformerRef}
                  handleMouseDown={e => handleMouseDown(e, stageRef, stagePosition, stageScale, setSelectedId, setShowLineStyleSelector, setTextPosition, setTextInput, setEditingTextId)}
                  handleMouseMove={e => handleMouseMove(e, stageRef, stagePosition, stageScale)}
                  handleMouseUp={handleMouseUp}
                  handleSelect={handleSelect}
                  setElements={setElements}
                  setCircles={setCircles}
                  setSelectedId={setSelectedId}
                  setTextInput={setTextInput}
                  setTextPosition={setTextPosition}
                  setEditingTextId={setEditingTextId}
                  setTextStyle={setTextStyle}
                  tool={tool}
                  handleTransformEnd={handleTransformEnd}
                  stageScale={stageScale}
                  stagePosition={stagePosition}
                  setStageScale={setStageScale}
                  setStagePosition={setStagePosition}
                  isPanning={isPanning}
                  isDraggingStage={isDraggingStage}
                  setIsDraggingStage={setIsDraggingStage}
                  dragStartPos={dragStartPos}
                  setDragStartPos={setDragStartPos}
                />
                {/* Editor de texto */}
                <TextEditor
                  textPosition={textPosition}
                  textStyle={textStyle}
                  textInput={textInput}
                  onChange={setTextInput}
                  onSave={() => saveText(textInput, textPosition, editingTextId)}
                  onCancel={() => {
                    setTextPosition(null);
                    setTextInput('');
                    setEditingTextId(null);
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default DrawDiagram;