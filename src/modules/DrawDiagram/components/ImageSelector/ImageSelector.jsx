import React from 'react';

const ImageSelector = ({ visible, images, onSelectImage }) => {
  if (!visible) return null;

  return (
    <div className="absolute top-1 left-1 p-4 bg-white border border-gray-300 shadow-lg rounded-lg z-10 max-w-md">
      <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
        {images.map((img) => (
          <div
            key={img.name}
            className="cursor-pointer p-1 hover:shadow-md max-h-36"
            onClick={() => onSelectImage(img.src)}
          >
            <img
              src={img.src}
              alt={img.name}
              className="object-contain w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSelector;