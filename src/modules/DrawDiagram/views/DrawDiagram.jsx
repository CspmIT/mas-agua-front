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
import { useParams } from 'react-router-dom';

const imageList = ListImg();

const DrawDiagram = () => {
  const { id } = useParams();
  const [elements, setElements] = useState([]);
  const [tool, setTool] = useState(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const isDrawing = useRef(false);
  const stageRef = useRef();
  const [selectedId, setSelectedId] = useState(null);
  const transformerRef = useRef();
  const [lineStart, setLineStart] = useState(null);
  const [reverseDirection, setReverseDirection] = useState(false);
  const [circles, setCircles] = useState([]);
  const [tempLine, setTempLine] = useState(null);
  const [lineStyle, setLineStyle] = useState({
    color: '#040255',
    strokeWidth: 10,
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
  const [deletedItems, setDeletedItems] = useState({
    lines: [],
    texts: [],
    images: [],
    polylines: []
  });
  const [newElementsIds, setNewElementsIds] = useState([]);
  const [polylinePoints, setPolylinePoints] = useState([]);
  const [isDrawingPolyline, setIsDrawingPolyline] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(null);


  const handleSelect = (e, id) => {
    setSelectedId(id);

    // Si estás editando un texto y tocás otro, terminá la edición
    if (editingTextId && editingTextId !== id) {
      setEditingTextId(null);
      setTextInput('');
      setTextPosition(null);
    }

    const selectedElement = elements.find((el) => el.id === id);

    if (selectedElement?.type === 'polyline') {
      setTool('polyline');
      setShowLineStyleSelector(true);
      setLineStyle({
        color: selectedElement.stroke,
        strokeWidth: selectedElement.strokeWidth,
        invertAnimation: selectedElement.invertAnimation || false,
      });
      setShowTextStyler(false);

      // Mostrar círculos de control para la polilínea
      setCircles((prev) =>
        prev.map((c) => ({
          ...c,
          visible: c.lineId === id
        }))
      );
    } else if (selectedElement?.type === 'line') {
      setTool('simpleLine');
      setShowLineStyleSelector(true);
      setLineStyle({
        color: selectedElement.stroke,
        strokeWidth: selectedElement.strokeWidth,
        invertAnimation: selectedElement.invertAnimation || false,
      });
      setShowTextStyler(false);
      setLineStart(null);
      setTempLine(null);

    } else if (selectedElement?.type === 'text') {
      setTool('text');
      setShowLineStyleSelector(false);
      setShowTextStyler(true);
      setTextInput(selectedElement.text);
      setTextPosition({ x: selectedElement.x, y: selectedElement.y });
      setEditingTextId(id);
      setTextStyle({
        fontSize: selectedElement.fontSize || 16,
        fill: selectedElement.fill || '#000000',
        fontStyle: selectedElement.fontStyle || 'normal',
      });
    } else {
      setTool(null);
      setShowLineStyleSelector(false);
      setShowTextStyler(false);
      setLineStart(null);
      setTempLine(null);
    }
  };

  const handleMouseDown = (e) => {
    const stage = stageRef.current;
    const pos = stage.getPointerPosition();

    if (!pos) {
      return;
    }

    const clickedOnEmpty = e.target === e.target.getStage();

    // Manejo de texto
    if (tool === 'text' && clickedOnEmpty) {
      if (editingTextId) return;
      setTextPosition(pos);
      setTextInput('');
      setEditingTextId(null);
      return;
    }

    // Manejo de líneas simples
    if (tool === 'simpleLine') {
      if (selectedId) {
        return;
      }
      if (!lineStart) {
        if (!clickedOnEmpty) {
          return;
        }
        setLineStart(pos);
        setTempLine({
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: lineStyle.color,
          strokeWidth: lineStyle.strokeWidth,
        });
      } else {

        const isSamePoint = pos.x === lineStart.x && pos.y === lineStart.y;
        if (isSamePoint) {
          return;
        }

        const id = Date.now();
        const x = Math.min(lineStart.x, pos.x);
        const y = Math.min(lineStart.y, pos.y);

        const relativePoints = [
          lineStart.x - x,
          lineStart.y - y,
          pos.x - x,
          pos.y - y,
        ];

        const newLine = {
          id,
          type: 'line',
          x,
          y,
          points: relativePoints,
          stroke: lineStyle.color,
          strokeWidth: lineStyle.strokeWidth,
          draggable: true,
          dataInflux: null,
        };

        const newCircles = [
          {
            id: `${id}-start`,
            x: lineStart.x,
            y: lineStart.y,
            lineId: id,
            fill: 'blue',
            visible: false,
          },
          {
            id: `${id}-end`,
            x: pos.x,
            y: pos.y,
            lineId: id,
            fill: 'red',
            visible: false,
          },
        ];

        setElements((prev) => [...prev, newLine]);
        setNewElementsIds((prev) => [...prev, newLine.id]);
        setCircles((prev) => [...prev, ...newCircles]);
        setNewElementsIds((prev) => [...prev, newCircles.id]);
        setLineStart(null);
        setTempLine(null);
        setShowLineStyleSelector(false);
        setTool(null);
      }
      return;
    }
    // Manejo de polilíneas
    if (tool === 'polyline') {
      if (selectedId) return;

      if (clickedOnEmpty) {
        // Si es el primer clic para esta polilínea
        if (!isDrawingPolyline) {
          setIsDrawingPolyline(true);
          setPolylinePoints([pos.x, pos.y]);
          setTempLine({
            points: [pos.x, pos.y, pos.x, pos.y],
            stroke: lineStyle.color,
            strokeWidth: lineStyle.strokeWidth,
          });
        } else {
          // Si es un clic subsiguiente para la polilínea
          const updatedPoints = [...polylinePoints, pos.x, pos.y];
          setPolylinePoints(updatedPoints);
          setTempLine({
            points: updatedPoints,
            stroke: lineStyle.color,
            strokeWidth: lineStyle.strokeWidth,
          });

          // Detección de doble clic para finalizar la polilínea
          const now = Date.now();
          if (lastClickTime && now - lastClickTime < 300 &&
            Math.abs(pos.x - polylinePoints[polylinePoints.length - 2]) < 10 &&
            Math.abs(pos.y - polylinePoints[polylinePoints.length - 1]) < 10) {
            // Finalizar la polilínea si se hizo doble clic cerca del último punto
            finishPolyline();
          }
          setLastClickTime(now);
        }
      }
      return;
    }

    if (tool === 'floatingVariable') {
      const img = new window.Image();
      img.src = '/assets/img/Diagram/newDiagram/img_sinfondo.PNG'; 
      img.onload = () => {
        const width = 100;
        const height = (img.height / img.width) * width;
    
        const newImage = {
          id: Date.now(),
          type: 'image',
          src: img.src,
          x: pos.x,
          y: pos.y,
          width,
          height,
          draggable: true,
          dataInflux: null,
        };
    
        setElements((prev) => [...prev, newImage]);
        setNewElementsIds((prev) => [...prev, newImage.id]);
        setTool(null);
      };
      return;
    }

  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    // Línea simple: seguir el mouse
    if (tool === 'simpleLine' && lineStart) {
      setTempLine({
        points: [lineStart.x, lineStart.y, point.x, point.y],
        stroke: lineStyle.color,
        strokeWidth: lineStyle.strokeWidth,
      });
      return;
    }

    // Polilínea: seguir el mouse desde el último punto
    if (tool === 'polyline' && isDrawingPolyline && polylinePoints.length > 0) {
      const updatedPoints = [...polylinePoints, point.x, point.y];
      setTempLine({
        points: updatedPoints,
        stroke: lineStyle.color,
        strokeWidth: lineStyle.strokeWidth,
      });
      return;
    }
  };

  const finishPolyline = () => {
    if (polylinePoints.length >= 4) { // Al menos necesitamos 2 puntos (4 valores x,y)
      const id = Date.now();

      // Calcular la posición relativa
      let minX = Number.MAX_VALUE;
      let minY = Number.MAX_VALUE;

      for (let i = 0; i < polylinePoints.length; i += 2) {
        minX = Math.min(minX, polylinePoints[i]);
        minY = Math.min(minY, polylinePoints[i + 1]);
      }

      // Crear puntos relativos a la posición (minX, minY)
      const relativePoints = [];
      for (let i = 0; i < polylinePoints.length; i += 2) {
        relativePoints.push(polylinePoints[i] - minX);
        relativePoints.push(polylinePoints[i + 1] - minY);
      }

      const newPolyline = {
        id,
        type: 'polyline',
        x: minX,
        y: minY,
        points: relativePoints,
        stroke: lineStyle.color,
        strokeWidth: lineStyle.strokeWidth,
        draggable: true,
        dataInflux: null,
      };

      // Crear círculos para cada punto de la polilínea
      const newCircles = [];
      for (let i = 0; i < polylinePoints.length; i += 2) {
        newCircles.push({
          id: `${id}-point-${i / 2}`,
          x: polylinePoints[i],
          y: polylinePoints[i + 1],
          lineId: id,
          fill: i === 0 ? 'blue' : i === polylinePoints.length - 2 ? 'red' : 'green',
          visible: false,
        });
      }

      setElements((prev) => [...prev, newPolyline]);
      setNewElementsIds((prev) => [...prev, newPolyline.id]);
      setCircles((prev) => [...prev, ...newCircles]);

      // Resetear estados
      setIsDrawingPolyline(false);
      setPolylinePoints([]);
      setTempLine(null);
      setShowLineStyleSelector(false);
      setTool(null);
    }
  };


  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const addImageToCanvas = (src) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;
      const maxSize = 100;
      let width = originalWidth;
      let height = originalHeight;

      if (width > height) {
        if (width > maxSize) {
          height = (maxSize / width) * height;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (maxSize / height) * width;
          height = maxSize;
        }
      }

      const newImage = {
        id: Date.now(),
        type: 'image',
        src,
        x: 100,
        y: 100,
        width,
        height,
        draggable: true,
        dataInflux: null,
      };
      setElements((prev) => [...prev, newImage]);
      setNewElementsIds((prev) => [...prev, newImage.id]);
      setShowImageSelector(false);
    };
  };

  const handleTransformEnd = (e) => {
    const node = e.target;
    const id = node.id();

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const updated = {
      x: node.x(),
      y: node.y(),
      width: node.width() * scaleX,
      height: node.height() * scaleY,
      rotation: node.rotation(),
    };

    node.scaleX(1);
    node.scaleY(1);

    setElements((prev) =>
      prev.map((el) =>
        String(el.id) === id && el.type === 'image'
          ? { ...el, ...updated }
          : el
      )
    );
  };

  const saveText = () => {
    if (!textInput.trim() || !textPosition) {
      setTextPosition(null);
      return;
    }

    if (editingTextId !== null) {
      setElements((prev) =>
        prev.map((el) =>
          el.id === editingTextId
            ? {
              ...el,
              text: textInput,
              fontSize: textStyle.fontSize,
              fill: textStyle.fill,
              fontStyle: textStyle.fontStyle
            }
            : el
        )
      );
      console.log("Text updated");
    } else {
      const id = Date.now();
      const newText = {
        id,
        type: 'text',
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
        fontSize: textStyle.fontSize,
        fill: textStyle.fill,
        fontStyle: textStyle.fontStyle,
        draggable: true,
        dataInflux: null,
      };

      setElements(prev => [...prev, newText]);
      setNewElementsIds((prev) => [...prev, newText.id]);
      console.log("New text created:", newText);
    }
    setTextPosition(null);
    setTextInput('');
    setEditingTextId(null);
  };

  const handleAssignVariable = (dataInflux) => {
    if (tool === 'floatingVariable') {
      const img = new window.Image();
      img.src = '/assets/img/Diagram/newDiagram/img_sinfondo.PNG';
      img.onload = () => {
        const width = 100;
        const height = (img.height / img.width) * width;
  
        const newImage = {
          id: Date.now(),
          type: 'image',
          src: img.src,
          x: 150,
          y: 150,
          width,
          height,
          draggable: true,
          dataInflux: dataInflux, // ASIGNAR VARIABLE
        };
  
        setElements((prev) => [...prev, newImage]);
        setNewElementsIds((prev) => [...prev, newImage.id]);
        setTool(null); // salir del modo variable suelta
        setShowListField(false);
      };
      return;
    }
  
    // comportamiento normal para línea, texto, imagen, etc.
    if (!selectedId) return;
  
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId ? { ...el, dataInflux } : el
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

  const handleSaveDiagram = async () => {
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

    await saveDiagramKonva(diagramToSave);

    setNewElementsIds([]);
    setDeletedItems({
      lines: [],
      texts: [],
      images: [],
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

  const handleDeleteElement = (id) => {
    const elementToDelete = elements.find(el => el.id === id);
    if (!elementToDelete) return;

    setElements((prev) => prev.filter((el) => el.id !== id));

    // Eliminar los círculos asociados con el elemento
    setCircles((prev) => prev.filter((c) => c.lineId !== id));

    if (Number.isInteger(id)) {
      setDeletedItems((prev) => {
        const typeKey = `${elementToDelete.type}s`;
        return {
          ...prev,
          [typeKey]: [...(prev[typeKey] || []), id]
        };
      });
    }
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
        if (el.id === selectedId && el.type === 'line') {
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
      setDashOffset((prev) => (reverseDirection ? prev - 1 : prev + 1));
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [reverseDirection]);

  useEffect(() => {
    if (id) {
      uploadCanvaDb(id, {
        setElements,
        setCircles,
        setDiagramMetadata,
        setTool,
      });
    }
  }, [id]);

  return (
    <>
      <div className="w-full">
        {/* Barra arriba */}
        <TopNavbar
          onClear={handleClearCanvas}
          onSave={handleSaveDiagram}
          onUndo={handleUndo}
          elements={elements}
        />
        {/* Contenedor horizontal de sidebar + canvas */}
        <div className="flex w-full min-h-screen">
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
              <div className="absolute left-1 m-1 p-4 bg-white border border-gray-300 shadow-lg rounded-lg z-10 max-w-md">
                <ListField
                  onSelectVariable={handleAssignVariable}
                  onClose={() => setShowListField(false)}
                />
              </div>
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
              handleMouseDown={handleMouseDown}
              handleMouseMove={handleMouseMove}
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
            />
            {/* Editor de texto */}
            <TextEditor
              textPosition={textPosition}
              textStyle={textStyle}
              textInput={textInput}
              onChange={setTextInput}
              onSave={saveText}
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
  );
};

export default DrawDiagram;