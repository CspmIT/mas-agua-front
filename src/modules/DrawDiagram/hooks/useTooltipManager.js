import { useCallback } from 'react';

export const useTooltipManager = ({ selectedId, elements, setElements }) => {
  const handleShowTooltip = useCallback(() => {
    if (!selectedId) return;
    setElements(prev =>
      prev.map(el =>
        String(el.id) === String(selectedId) && el.dataInflux
          ? { ...el, dataInflux: { ...el.dataInflux, show: true } }
          : el
      )
    );
  }, [selectedId, setElements]);

  const handleHideTooltip = useCallback(() => {
    if (!selectedId) return;
    setElements(prev =>
      prev.map(el =>
        String(el.id) === String(selectedId) && el.dataInflux
          ? { ...el, dataInflux: { ...el.dataInflux, show: false } }
          : el
      )
    );
  }, [selectedId, setElements]);

  const handleChangeTooltipPosition = useCallback((position) => {
    if (!selectedId) return;
    setElements(prev =>
      prev.map(el =>
        String(el.id) === String(selectedId) && el.dataInflux
          ? { ...el, dataInflux: { ...el.dataInflux, position } }
          : el
      )
    );
  }, [selectedId, setElements]);

  const handleSetMaxValue = useCallback((value, calculatePercentage) => {
    if (!selectedId) return;
    setElements(prev =>
      prev.map(el =>
        String(el.id) === String(selectedId) && el.dataInflux
          ? {
              ...el,
              dataInflux: {
                ...el.dataInflux,
                max_value_var: value,
                calculatePercentage: calculatePercentage !== undefined
                  ? calculatePercentage
                  : el.dataInflux.calculatePercentage || false
              }
            }
          : el
      )
    );
  }, [selectedId, setElements]);

  const handleBooleanColorChange = (colors) => {
    setElements(prev =>
      prev.map(el =>
        String(el.id) === String(selectedId)
          ? {
              ...el,
              dataInflux: {
                ...el.dataInflux,
                boolean_colors: colors,
              },
            }
          : el
      )
    );
  };

  return {
    handleShowTooltip,
    handleHideTooltip,
    handleChangeTooltipPosition,
    handleSetMaxValue,
    handleBooleanColorChange
  };
};