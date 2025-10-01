import { useCallback, useState, useRef } from 'react';

export const useDrawingTools = ({
  tool,
  setTool,
  lineStyle,
  setLineStyle,
  elements,
  setElements,
  setNewElementsIds,
  selectedId,
  setSelectedId,
  isDrawing,
  setCircles,
  setShowImageSelector,
  setShowLineStyleSelector,
  setShowTooltipPositionPanel,
  setTextInput,
  setTextPosition,
  editingTextId,
  setEditingTextId,
  setTextStyle,
  setShowTextStyler
}) => {
  const [lineStart, setLineStart] = useState(null);
  const [tempLine, setTempLine] = useState(null);
  const [polylinePoints, setPolylinePoints] = useState([]);
  const [isDrawingPolyline, setIsDrawingPolyline] = useState(false);

  const getTransformedPointerPosition = (stageRef, stagePosition, stageScale) => {
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;

    return {
      x: (pointer.x - stagePosition.x) / stageScale,
      y: (pointer.y - stagePosition.y) / stageScale,
    };
  };

  //SELECCION DE UN ELEMENTO
  const handleSelect = (e, id) => {

    if ((tool === 'polyline' && isDrawingPolyline) || (tool === 'simpleLine' && lineStart)) return;

    setSelectedId(id);

    // Si estás editando un texto y tocás otro, terminá la edición
    if (editingTextId && editingTextId !== id) {
      setEditingTextId(null);
      setTextInput('');
      setTextPosition(null);
    }

    const selectedElement = elements.find((el) => String(el.id) === String(id));
    console.log(selectedElement);

    if (selectedElement?.type === 'polyline') {
      setTool('polyline');
      setShowLineStyleSelector(true);
      setLineStyle({
        color: selectedElement.stroke,
        strokeWidth: selectedElement.strokeWidth,
        invertAnimation: selectedElement.invertAnimation || false,
      });
      setShowTextStyler(false);
      setLineStart(null);
      setTempLine(null);

      setCircles((prev) =>
        prev.map((c) => ({
          ...c,
          visible: c.lineId === selectedElement.id,
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

    if (selectedElement?.dataInflux) {
      setShowTooltipPositionPanel(true);
    } else {
      setShowTooltipPositionPanel(false);
    }

  };

  //MANEJO DE EVENTOS DEL MOUSE
  const handleMouseDown = useCallback((e, stageRef, stagePosition, stageScale, setSelectedId, setShowLineStyleSelector, setTextPosition, setTextInput, setEditingTextId) => {
    const pos = getTransformedPointerPosition(stageRef, stagePosition, stageScale);
    if (!pos) return;

    const clickedOnEmpty = e.target === e.target.getStage();

    // Limpieza de selección
    if (tool !== 'polyline' || !isDrawingPolyline) {
      if (clickedOnEmpty) {
        setSelectedId(null);
      } else {
        const clickedId = e.target.getAttr('id');
        if (clickedId) {
          setSelectedId(clickedId);
        }
      }
    }

    // Texto
    if (tool === 'text' && clickedOnEmpty) {
      if (selectedId) return;
      setTextPosition(pos);
      setTextInput('');
      setEditingTextId(null);
      return;
    }

    // Línea simple
    if (tool === 'simpleLine') {
      if (selectedId) return;

      if (!lineStart) {
        setSelectedId(null);
        setShowLineStyleSelector(false);

        setLineStart(pos);
        setTempLine({
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: lineStyle.color,
          strokeWidth: lineStyle.strokeWidth,
        });
      } else {
        const isSamePoint = pos.x === lineStart.x && pos.y === lineStart.y;
        if (isSamePoint) return;

        const id = String(Date.now());
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

        setLineStart(null);
        setTempLine(null);
        setTool(null);
        setShowLineStyleSelector(false);
      }
      return;
    }

    // Polilínea
    if (tool === 'polyline' && !selectedId) {
      e.cancelBubble = true;
      if (!isDrawingPolyline) {
        setSelectedId(null);
        setIsDrawingPolyline(true);
        setPolylinePoints([pos.x, pos.y]);
        setTempLine({
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: lineStyle.color,
          strokeWidth: lineStyle.strokeWidth,
        });
      } else {
        setPolylinePoints((prev) => {
          const updated = [...prev, pos.x, pos.y];
          setTempLine({
            points: updated,
            stroke: lineStyle.color,
            strokeWidth: lineStyle.strokeWidth,
          });
          return updated;
        });
      }
      return;
    }

    // Variable flotante
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
    }
  }, [tool, isDrawingPolyline, lineStart, lineStyle, selectedId]);

  const handleMouseMove = useCallback((e, stageRef, stagePosition, stageScale) => {
    const pos = getTransformedPointerPosition(stageRef, stagePosition, stageScale);
    if (!pos) return;

    if (tool === 'simpleLine' && lineStart) {
      setTempLine({
        points: [lineStart.x, lineStart.y, pos.x, pos.y],
        stroke: lineStyle.color,
        strokeWidth: lineStyle.strokeWidth,
      });
    }

    if (tool === 'polyline' && isDrawingPolyline && polylinePoints.length > 0) {
      const updatedPoints = [...polylinePoints, pos.x, pos.y];
      setTempLine({
        points: updatedPoints,
        stroke: lineStyle.color,
        strokeWidth: lineStyle.strokeWidth,
      });
    }
  }, [tool, lineStart, isDrawingPolyline, polylinePoints, lineStyle]);

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
  }, [isDrawing]);

  //FUNCION PARA FINALIZAR LA POLILINEA
  const finishPolyline = useCallback(() => {
    if (polylinePoints.length >= 4) {
      const id = String(Date.now());

      let minX = Number.MAX_VALUE;
      let minY = Number.MAX_VALUE;

      for (let i = 0; i < polylinePoints.length; i += 2) {
        minX = Math.min(minX, polylinePoints[i]);
        minY = Math.min(minY, polylinePoints[i + 1]);
      }

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

      const newCircles = [];
      for (let i = 0; i < polylinePoints.length; i += 2) {
        newCircles.push({
          id: `${id}-point-${i / 2}`,
          x: polylinePoints[i],
          y: polylinePoints[i + 1],
          lineId: id,
          fill: i === 0 ? 'blue' : i === polylinePoints.length - 2 ? 'red' : 'green',
          visible: true,
        });
      }

      setElements((prev) => [...prev, newPolyline]);
      setNewElementsIds((prev) => [...prev, newPolyline.id]);
      setCircles((prev) => [...prev, ...newCircles]);

      setIsDrawingPolyline(false);
      setPolylinePoints([]);
      setTempLine(null);
      setShowLineStyleSelector(false);
      setTool(null);
    }
  }, [polylinePoints, lineStyle]);

  //FUNCION PARA AGREGAR UNA IMAGEN AL CANVAS
  const addImageToCanvas = useCallback((src) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      const maxSize = 100;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxSize) {
        height = (maxSize / width) * height;
        width = maxSize;
      } else if (height > maxSize) {
        width = (maxSize / height) * width;
        height = maxSize;
      }

      const newImage = {
        id: String(Date.now()),
        type: 'image',
        src,
        x: 100,
        y: 100,
        width,
        height,
        draggable: true,
        dataInflux: null,
      };

      setShowImageSelector(false);
      setTool(null);
      setElements((prev) => [...prev, newImage]);
      setNewElementsIds((prev) => [...prev, newImage.id]);
    };
  }, [setElements, setNewElementsIds]);

  //FUNCION PARA SETEAR NUEVO TAMAÑO Y POSICION DE UN ELEMENTO
  const handleTransformEnd = useCallback((id, node) => {

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;

    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
            ...el,
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height: newHeight,
          }
          : el
      )
    );

    // Resetear escala en el nodo para que no se acumulen transformaciones
    node.scaleX(1);
    node.scaleY(1);
  }, [setElements]);


  return {
    lineStart,
    tempLine,
    polylinePoints,
    isDrawingPolyline,
    handleSelect,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTransformEnd,
    finishPolyline,
    addImageToCanvas,
    setTempLine,
    setLineStart,
    setPolylinePoints,
    setIsDrawingPolyline,
    setShowLineStyleSelector
  };
};
