import React from 'react';

const TextEditor = ({
  textPosition,
  textStyle,
  textInput,
  onChange,
  onSave,
  onCancel,
}) => {
  if (!textPosition) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <textarea
      style={{
        position: 'absolute',
        top: textPosition.y,
        left: textPosition.x,
        fontSize: `${textStyle.fontSize}px`,
        fontStyle: textStyle.fontStyle,
        color: textStyle.fill,
        zIndex: 20,
        width: 200,
      }}
      className='px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 shadow-[0_4px_14px_rgba(15,42,68,0.18)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.45)] outline-none focus:border-[#2c6aa0] dark:focus:border-[#5ea5f0] transition-colors resize-none'
      placeholder='Escribe aquí y presiona Enter'
      autoFocus
      value={textInput}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
};

export default TextEditor;
