import { useEffect, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Line } from 'react-konva';
import useImage from 'use-image';
import { ListImg } from '../../utils/js/ListImg';

const RenderImage = ({ el }) => {
  const imageList = ListImg();
  const config = imageList.find(item => item.src === el.src || item.name === el.name);

  const getImageSrc = () => {
    if (!config) return el.src;

    const val = el.dataInflux?.value;

    if (config.animation === 'boolean' && config.optionsImage) {
      if (val === 1) return config.optionsImage.success;
      if (val === 0) return config.optionsImage.error;
      return config.optionsImage.default;
    }

    if (config.srcView) return config.srcView;
    return el.src;
  };

  const [image] = useImage(getImageSrc());
  const wavePointsRef = useRef([]);
  const [renderKey, setRenderKey] = useState(0);
  const animationFrameRef = useRef();
  const offsetRef = useRef(0);

  useEffect(() => {
    if (!config || config.animation !== 'wave') return;

    const animate = () => {
      offsetRef.current += 0.1;

      wavePointsRef.current = generateWavePoints(el, config, offsetRef.current);

      setRenderKey(prev => prev + 1);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [el.dataInflux?.value, el]);

  return (
    <Group x={el.x} y={el.y} rotation={el.rotation || 0} key={el.id}>
      {config?.animation === 'wave' && wavePointsRef.current.length > 0 && (
        <Line
          key={renderKey}
          points={wavePointsRef.current}
          fill={config.configAnimation.color}
          closed
          opacity={1}
          strokeEnabled={false}
        />
      )}
      <KonvaImage 
        image={image} 
        width={el.width} 
        height={el.height}
      />
    </Group>
  );
};

// FUNCION PARA GENERAR LA ANIMACION TIPO OLA
function generateWavePoints(el, config, offset) {
  const { configAnimation } = config;
  if (!configAnimation) return [];

  const value = parseFloat(el.dataInflux?.value);
  if (isNaN(value)) return [];

  const percent = Math.max(0, Math.min(value, 100));
  const height = el.height;
  const width = el.width;

  // Alto y ancho de la ola
  const waveHeight = height * 0.015; 
  const waveWidth = width * 0.1; 

  const minTop = height * (configAnimation.margenTopMin ?? 0); 
  let maxTop = height * (configAnimation.margenTopMax ?? 1); 

  if (configAnimation.offsetBottom) {
    maxTop -= height * configAnimation.offsetBottom;
  }

  // Calcular la posición del borde superior basado en el porcentaje
  let topOffset = ((maxTop - minTop) * (1 - percent / 100)) + minTop;

  const leftOffset = width * configAnimation.margenLeft; 
  const widthTop = width * (configAnimation.widthTop / 100); 
  const widthBottom = width * (configAnimation.widthBottom / 100); 
  const initDraw = ((width - widthBottom) / 2) + leftOffset; 

  const points = [];

  // Generacion de la parte superior de la ola
  for (let x = 0; x <= widthTop; x += waveWidth / 4) {
    const y = topOffset + Math.sin((x + offset * 5) * 0.1) * waveHeight;
    points.push(leftOffset + x, y);
  }

  // Borde inferior fijo (alineado con la base de la imagen)
  points.push(leftOffset + widthBottom, maxTop); 
  points.push(leftOffset, maxTop); 

  return points;
}

export default RenderImage;
