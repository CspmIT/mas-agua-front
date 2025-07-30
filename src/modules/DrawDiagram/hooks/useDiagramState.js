import { useState, useCallback } from 'react';

export const useDiagramState = () => {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [deletedItems, setDeletedItems] = useState({ lines: [], texts: [], images: [], polylines: [] });

  const handleDeleteElement = useCallback((id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (typeof id === 'string' && id.includes('-')) {
      const idStr = String(id);
      const numericId = parseInt(idStr.split('-').pop(), 10);
      if (!isNaN(numericId)) {
        const typeKey = idStr.includes('text') ? 'texts' : idStr.includes('image') ? 'images' : idStr.includes('polyline') ? 'polylines' : 'lines';
        setDeletedItems(prev => ({
          ...prev,
          [typeKey]: [...(prev[typeKey] || []), numericId]
        }));
      }
    }
  }, []);

  const moveElementToBack = useCallback(() => {
    if (!selectedId) return;
    setElements(prev => {
      const selected = prev.find(el => el?.id === selectedId);
      if (!selected) return prev;
      const remaining = prev.filter(el => el?.id !== selectedId);
      return [selected, ...remaining];
    });
  }, [selectedId]);

  const moveElementToFront = useCallback(() => {
    if (!selectedId) return;
    setElements(prev => {
      const selected = prev.find(el => el?.id === selectedId);
      if (!selected) return prev;
      const remaining = prev.filter(el => el?.id !== selectedId);
      return [...remaining, selected];
    });
  }, [selectedId]);

  return {
    elements,
    setElements,
    selectedId,
    setSelectedId,
    deletedItems,
    setDeletedItems,
    handleDeleteElement,
    moveElementToBack,
    moveElementToFront
  };
};