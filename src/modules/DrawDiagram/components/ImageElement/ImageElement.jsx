// components/ImageElement.jsx
import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

const ImageElement = ({ src, ...props }) => {
  const [image] = useImage(src);
  return <Image image={image} {...props} />;
};

export default ImageElement;
