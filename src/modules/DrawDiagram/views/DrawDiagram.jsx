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
import PanelEditor from '../components/PanelEditor/PanelEditor';
import LinkDiagramPanel from '../components/LinkDiagramPanel/LinkDiagramPanel';
import SymbolSelector from '../components/SymbolSelector/SymbolSelector';
import SelectionToolbar from '../components/SelectionToolbar/SelectionToolbar';
import TopNavbar from '../components/TopNavbar/TopNavbar';
import { saveDiagramKonva, uploadCanvaDb } from '../utils/js/drawActions';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import LoaderComponent from '../../../components/Loader';
import TooltipPositionPanel from '../components/TooltipPositionPanel/TooltipPositionPanel';
import { useDrawingTools } from '../hooks/useDrawingTools';
import { request } from '../../../utils/js/request';
import { backend } from '../../../utils/routes/app.routes';
import { useTooltipManager } from '../hooks/useTooltipManager';
import { useDiagramState } from '../hooks/useDiagramState';
import { useTextTools } from '../hooks/useTextTools';
import { canvasAreaSx, panelShellSx } from '../utils/js/diagramTheme';

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
  const [panelRowForVariable, setPanelRowForVariable] = useState(null);
  const [showSymbolSelector, setShowSymbolSelector] = useState(false);

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

  //GUARDAR UN SIMBOLO CAPTURADO EN EL CATALOGO
  const handleSymbolCaptured = async (capturedElements) => {
    if (!capturedElements.length) {
      Swal.fire({
        icon: 'info',
        title: 'Sin elementos',
        text: 'No hay elementos completos dentro del área marcada.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const { value: name } = await Swal.fire({
      title: 'Guardar símbolo',
      input: 'text',
      inputLabel: `${capturedElements.length} elemento(s) capturado(s). Nombre del símbolo:`,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      inputValidator: (value) => (!value.trim() ? '¡Debes ingresar un nombre!' : null),
    });
    if (!name) return;

    try {
      await request(`${backend[import.meta.env.VITE_APP_NAME]}/saveDiagramSymbol`, 'POST', {
        name,
        elements: capturedElements,
      });
      Swal.fire({
        icon: 'success',
        title: 'Símbolo guardado',
        text: 'Ya está disponible en el catálogo de símbolos.',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error guardando el símbolo:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el símbolo.' });
    }
  };

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
    handleTransformEnd,
    captureRect,
    setCaptureRect,
    setSymbolCaptureStart
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
    setLineStyle,
    onSymbolCaptured: handleSymbolCaptured
  });

  const { handleShowTooltip, handleHideTooltip, handleChangeTooltipPosition, handleSetMaxValue, handleBooleanColorChange, handleSetBinaryBit } = useTooltipManager({ selectedId, elements, setElements });

  const { saveText } = useTextTools({ elements, setElements, textStyle, setTextInput, setTextPosition, setEditingTextId, setNewElementsIds });

  const selectedElement = elements.find((el) => String(el.id) === String(selectedId));

  const copiedElementIdRef = useRef(null);

  // ===== Historial para deshacer/rehacer =====
  const historyRef = useRef({ stack: [], index: -1 });
  const isRestoringRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }

    // Debounce: agrupa cambios rapidos (ej. arrastrar puntos) en un solo snapshot
    const timer = setTimeout(() => {
      const history = historyRef.current;
      const snapshot = JSON.stringify(elements);
      if (history.stack[history.index] === snapshot) return;

      history.stack = history.stack.slice(0, history.index + 1);
      history.stack.push(snapshot);
      if (history.stack.length > 50) history.stack.shift();
      history.index = history.stack.length - 1;
    }, 400);

    return () => clearTimeout(timer);
  }, [elements, isLoading]);

  //RECONSTRUYE LOS CIRCULOS DE EDICION A PARTIR DE LOS ELEMENTOS
  const rebuildCircles = (els) => {
    const circles = [];
    els.forEach((el) => {
      if (el.type === 'line') {
        const [x1, y1, x2, y2] = el.points;
        circles.push({ id: `${el.id}-start`, x: el.x + x1, y: el.y + y1, lineId: el.id, fill: 'blue', visible: false });
        circles.push({ id: `${el.id}-end`, x: el.x + x2, y: el.y + y2, lineId: el.id, fill: 'red', visible: false });
      } else if (el.type === 'polyline') {
        for (let i = 0; i < el.points.length; i += 2) {
          circles.push({
            id: `${el.id}-point-${i / 2}`,
            x: el.x + el.points[i],
            y: el.y + el.points[i + 1],
            lineId: el.id,
            fill: i === 0 ? 'blue' : i === el.points.length - 2 ? 'red' : 'green',
            visible: false,
          });
        }
      }
    });
    return circles;
  };

  const restoreSnapshot = (snapshot) => {
    isRestoringRef.current = true;
    const restored = JSON.parse(snapshot);
    setElements(restored);
    setCircles(rebuildCircles(restored));
    setSelectedId(null);
    setShowLineStyleSelector(false);
    setShowTextStyler(false);
    setShowTooltipPositionPanel(false);
  };

  //DUPLICAR UN ELEMENTO CON UN PEQUEÑO CORRIMIENTO
  const duplicateElement = (id) => {
    const source = elements.find((el) => String(el.id) === String(id));
    if (!source) return null;

    const clone = structuredClone(source);
    clone.id = String(Date.now());
    clone.x = (source.x || 0) + 20;
    clone.y = (source.y || 0) + 20;

    setElements((prev) => [...prev, clone]);
    setNewElementsIds((prev) => [...prev, clone.id]);

    // Circulos de edicion para lineas y polilineas
    if (clone.type === 'line') {
      const [x1, y1, x2, y2] = clone.points;
      setCircles((prev) => [
        ...prev,
        { id: `${clone.id}-start`, x: clone.x + x1, y: clone.y + y1, lineId: clone.id, fill: 'blue', visible: false },
        { id: `${clone.id}-end`, x: clone.x + x2, y: clone.y + y2, lineId: clone.id, fill: 'red', visible: false },
      ]);
    } else if (clone.type === 'polyline') {
      const newCircles = [];
      for (let i = 0; i < clone.points.length; i += 2) {
        newCircles.push({
          id: `${clone.id}-point-${i / 2}`,
          x: clone.x + clone.points[i],
          y: clone.y + clone.points[i + 1],
          lineId: clone.id,
          fill: i === 0 ? 'blue' : i === clone.points.length - 2 ? 'red' : 'green',
          visible: false,
        });
      }
      setCircles((prev) => [...prev, ...newCircles]);
    }

    setSelectedId(clone.id);
    return clone.id;
  };

  //TOGGLE DEL SELECTOR DE VARIABLES PARA EL ELEMENTO SELECCIONADO
  const handleToggleAssignVariable = () => {
    if (tool === 'fields') {
      setTool(null);
      setShowListField(false);
    } else {
      setTool('fields');
      setShowListField(true);
      setShowImageSelector(false);
      setShowLineStyleSelector(false);
      setShowTextStyler(false);
      setShowSymbolSelector(false);
    }
  };

  //BORRAR EL ELEMENTO SELECCIONADO
  const handleDeleteSelected = () => {
    setElements((prev) => prev.filter((el) => String(el.id) !== String(selectedId)));
    setCircles((prev) => prev.filter((c) => String(c.lineId) !== String(selectedId)));
    handleDeleteElement(selectedId);
    setTool(null);
    setSelectedId(null);
    setShowImageSelector(false);
    setShowLineStyleSelector(false);
    setShowTextStyler(false);
    setTextPosition(null);
  };

  //INSERTAR UN SIMBOLO DEL CATALOGO EN EL CENTRO VISIBLE DEL CANVAS
  const insertSymbol = (symbol) => {
    const stage = stageRef.current;
    const baseId = Date.now();
    const baseX = (stage.width() / 2 - stagePosition.x) / stageScale;
    const baseY = (stage.height() / 2 - stagePosition.y) / stageScale;

    const newElements = (symbol.elements || []).map((el, index) => ({
      ...structuredClone(el),
      id: String(baseId + index),
      x: baseX + (el.x || 0),
      y: baseY + (el.y || 0),
      draggable: true,
    }));

    if (!newElements.length) return;

    setElements((prev) => [...prev, ...newElements]);
    setNewElementsIds((prev) => [...prev, ...newElements.map((el) => el.id)]);
    setCircles((prev) => [...prev, ...rebuildCircles(newElements)]);
    setShowSymbolSelector(false);
    setSelectedId(null);
  };

  //ACTUALIZAR UN PANEL DE INFORMACION DESDE SU EDITOR
  const handlePanelChange = (updatedPanel) => {
    setElements((prev) =>
      prev.map((el) => (String(el.id) === String(updatedPanel.id) ? updatedPanel : el))
    );
  };

  //ABRIR EL SELECTOR DE VARIABLES PARA UNA FILA DEL PANEL
  const handlePanelRowVariableRequest = (rowId) => {
    setPanelRowForVariable(rowId);
    setShowListField(true);
  };

  //BUSCAR EL VALOR ACTUAL DE LA VARIABLE RECIEN ASIGNADA A UNA FILA
  const fetchPanelRowValue = async (panelId, rowId, dataInflux) => {
    try {
      const response = await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/multipleDataInflux`,
        'POST',
        [{ dataInflux }]
      );
      const value = response?.data?.[dataInflux.id];
      if (value === undefined) return;

      setElements((prev) =>
        prev.map((el) =>
          String(el.id) === String(panelId) && el.type === 'panel'
            ? {
              ...el,
              rows: el.rows.map((r) =>
                r.id === rowId ? { ...r, dataInflux: { ...r.dataInflux, value } } : r
              ),
            }
            : el
        )
      );
    } catch (error) {
      console.error('Error obteniendo el valor de la variable:', error);
    }
  };

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

    // Paneles: la variable va a la fila que pidio la asignacion, no al elemento
    if (selectedElement?.type === 'panel') {
      if (panelRowForVariable == null) return;

      const rowId = panelRowForVariable;
      const rowDataInflux = { ...dataInflux, show: true };

      setElements((prev) =>
        prev.map((el) =>
          String(el.id) === String(selectedElement.id)
            ? {
              ...el,
              rows: el.rows.map((r) =>
                r.id === rowId ? { ...r, kind: 'variable', dataInflux: rowDataInflux } : r
              ),
            }
            : el
        )
      );
      setPanelRowForVariable(null);
      setShowListField(false);
      fetchPanelRowValue(selectedElement.id, rowId, rowDataInflux);
      return;
    }

    setElements((prev) =>
      prev.map((el) =>
        String(el.id) === String(selectedId) ? {
          ...el, dataInflux: {
            ...dataInflux,
            position: 'Centro',
            // En lineas y polilineas el tooltip nace oculto
            show: !['line', 'polyline'].includes(el.type),
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
      panels: [],
      widgets: [],
    });
  };

  const handleUndo = () => {
    const history = historyRef.current;
    if (history.index <= 0) return;
    history.index -= 1;
    restoreSnapshot(history.stack[history.index]);
  };

  const handleRedo = () => {
    const history = historyRef.current;
    if (history.index >= history.stack.length - 1) return;
    history.index += 1;
    restoreSnapshot(history.stack[history.index]);
  };

  //EXPORTA EL AREA VISIBLE DEL CANVAS COMO IMAGEN PNG
  const handleExportPng = () => {
    setSelectedId(null);
    setCircles((prev) => prev.map((c) => ({ ...c, visible: false })));

    // Esperar el re-render para que no salgan el transformer ni los circulos
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${diagramMetadata.title || 'diagrama'}.png`;
      link.href = uri;
      link.click();
    }, 100);
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
  }, [selectedId, elements]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Si el usuario esta escribiendo en un input, no disparar atajos del canvas
      const isTyping =
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable;

      if (e.key === 'Escape') {
        setShowLineStyleSelector(false);
        setLineStart(null);
        setTool('');
        setCaptureRect(null);
        setSymbolCaptureStart(null);
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
      if (e.key === 'Delete' && selectedId && !isTyping) {
        handleDeleteElement(selectedId);
        setTool('');
        setSelectedId(null);
        setShowLineStyleSelector(false);
        setShowTextStyler(false);
      }

      // Copiar / pegar / duplicar elementos
      if ((e.ctrlKey || e.metaKey) && !isTyping) {
        const key = e.key.toLowerCase();
        if (key === 'c' && selectedId) {
          copiedElementIdRef.current = selectedId;
        }
        if (key === 'v' && copiedElementIdRef.current) {
          // El pegado en cadena duplica desde la ultima copia para ir escalonando
          const newId = duplicateElement(copiedElementIdRef.current);
          if (newId) copiedElementIdRef.current = newId;
        }
        if (key === 'd' && selectedId) {
          e.preventDefault();
          duplicateElement(selectedId);
        }
        if (key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        }
        if (key === 'y' || (key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, lineStart, textPosition, isDrawingPolyline, polylinePoints, elements]);

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
    <Container
      maxWidth={false}
      disableGutters
      className='w-full px-2 py-2 h-[calc(100vh-72px)]'
    >
      <Box sx={panelShellSx} className='w-full h-full flex flex-col overflow-hidden relative'>
        {isLoading ? (
          <div className='flex-1 flex items-center justify-center'>
            <LoaderComponent />
          </div>
        ) : (
          <>
            {/* Barra arriba */}
            <TopNavbar
              onClear={handleClearCanvas}
              onSaveDiagram={() => handleSaveDiagram(navigate)}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onExportPng={handleExportPng}
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
            <div className='flex flex-1 min-h-0 w-full'>
              <Sidebar
                tool={tool}
                setTool={setTool}
                selectedId={selectedId}
                setShowImageSelector={setShowImageSelector}
                setShowLineStyleSelector={setShowLineStyleSelector}
                setShowTextStyler={setShowTextStyler}
                setShowListField={setShowListField}
                setTextPosition={setTextPosition}
                setTextInput={setTextInput}
                showSymbolSelector={showSymbolSelector}
                setShowSymbolSelector={setShowSymbolSelector}
              />
              {/* Contenido principal (canvas + overlays) */}
              <Box sx={canvasAreaSx} className='flex-1 relative'>
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
                  <div className='absolute left-2 top-2 z-20 max-w-md w-80'>
                    <ListField
                      onSelectVariable={handleAssignVariable}
                      onClose={() => {
                        setShowListField(false);
                        setPanelRowForVariable(null);
                      }}
                    />
                  </div>
                )}
                {/* Editor del botón de navegación */}
                {selectedElement?.type === 'linkButton' && (
                  <LinkDiagramPanel
                    button={selectedElement}
                    currentDiagramId={diagramMetadata.id}
                    onChange={handlePanelChange}
                  />
                )}
                {/* Editor de paneles de información */}
                {selectedElement?.type === 'panel' && (
                  <PanelEditor
                    panel={selectedElement}
                    onChange={handlePanelChange}
                    onAssignVariableRequest={handlePanelRowVariableRequest}
                  />
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
                  captureRect={captureRect}
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
                {/* Acciones del elemento seleccionado */}
                {selectedId && (
                  <SelectionToolbar
                    isAssigningVariable={tool === 'fields'}
                    onAssignVariable={handleToggleAssignVariable}
                    onDuplicate={() => duplicateElement(selectedId)}
                    onDelete={handleDeleteSelected}
                  />
                )}
                {/* Selector de símbolos */}
                {showSymbolSelector && (
                  <SymbolSelector
                    onInsert={insertSymbol}
                    onClose={() => setShowSymbolSelector(false)}
                  />
                )}
                {/* Ayuda para la captura de símbolos */}
                {tool === 'captureSymbol' && (
                  <div className='absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none'>
                    <div className='flex items-center gap-4 rounded-full bg-slate-800/90 text-white text-xs px-4 py-2 shadow-lg whitespace-nowrap'>
                      <span>Arrastrá un recuadro alrededor de los elementos del símbolo</span>
                      <span>
                        <kbd className='px-1.5 py-0.5 rounded bg-white/15 border border-white/25 font-semibold mr-1'>Esc</kbd>
                        cancelar
                      </span>
                    </div>
                  </div>
                )}
                {/* Ayuda de atajos para el dibujo de lineas y polilineas */}
                {['simpleLine', 'polyline'].includes(tool) && (
                  <div className='absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none'>
                    <div className='flex items-center gap-4 rounded-full bg-slate-800/90 text-white text-xs px-4 py-2 shadow-lg whitespace-nowrap'>
                      <span>
                        <kbd className='px-1.5 py-0.5 rounded bg-white/15 border border-white/25 font-semibold mr-1'>Shift</kbd>
                        tramo recto (90°/45°)
                      </span>
                      {tool === 'polyline' && (
                        <span>
                          <kbd className='px-1.5 py-0.5 rounded bg-white/15 border border-white/25 font-semibold mr-1'>Enter</kbd>
                          o clic derecho: finalizar
                        </span>
                      )}
                      <span>
                        <kbd className='px-1.5 py-0.5 rounded bg-white/15 border border-white/25 font-semibold mr-1'>Esc</kbd>
                        cancelar
                      </span>
                    </div>
                  </div>
                )}
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
              </Box>
            </div>
          </>
        )}
      </Box>
    </Container>
  );
}

export default DrawDiagram;