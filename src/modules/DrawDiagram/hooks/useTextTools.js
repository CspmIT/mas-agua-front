import { useCallback } from 'react';

export const useTextTools = ({ elements, setElements, textStyle, setTextInput, setTextPosition, setEditingTextId, setNewElementsIds }) => {
  const saveText = useCallback((textInput, textPosition, editingTextId) => {
    if (!textInput.trim() || !textPosition) {
      setTextPosition(null);
      return;
    }

    if (editingTextId !== null) {
      setElements(prev => prev.map(el =>
        el.id === editingTextId
          ? {
              ...el,
              text: textInput,
              fontSize: textStyle.fontSize,
              fill: textStyle.fill,
              fontStyle: textStyle.fontStyle
            }
          : el
      ));
    } else {
      const id = String(Date.now());
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
      setNewElementsIds(prev => [...prev, newText.id]);
    }
    setTextPosition(null);
    setTextInput('');
    setEditingTextId(null);
  }, [textStyle, setElements]);

  return {
    saveText
  };
};
