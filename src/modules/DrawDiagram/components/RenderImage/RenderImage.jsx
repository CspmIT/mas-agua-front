import { useEffect, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Line } from 'react-konva';
import useImage from 'use-image';
import { ListImg } from '../../utils/js/ListImg';

const RenderImage = ({ el }) => {
  const imageList = ListImg();
  const config = imageList.find(item => item.src === el.src || item.name === el.name);

  // Determina la imagen según el valor de dataInflux
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

  // Animación tipo "wave"
  useEffect(() => {
    
    if (!config || config.animation !== 'wave') return;
  
    const animate = () => {
      offsetRef.current += 0.1;
      wavePointsRef.current = generateWavePoints(el, config, offsetRef.current);
      setRenderKey(prev => prev );
      animationFrameRef.current = requestAnimationFrame(animate);
    };
  
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [el.dataInflux?.value, el]); 

  return (
    <Group x={el.x} y={el.y} rotation={el.rotation || 0} key={el.id}>
      <KonvaImage image={image} width={el.width} height={el.height} />
      {config?.animation === 'wave' && wavePointsRef.current.length > 0 && (
        <Line
          key={renderKey}
          points={wavePointsRef.current}
          fill={config.configAnimation.color}
          closed
          opacity={0.5}
          strokeEnabled={false}
        />
      )}
    </Group>
  );
};

// Función que genera los puntos de la ola en base al valor de dataInflux
function generateWavePoints(el, config, offset) {
    
    const { configAnimation } = config;
    if (!configAnimation) return [];
  
    const value = parseFloat(el.dataInflux?.value);
    if (isNaN(value)) return [];
  
    const percent = Math.max(1, Math.min(value, 100)); // entre 1 y 100
  
    const waveHeight = el.height * 0.03;
    const waveWidth = el.width * 0.1;
  
    const topOffset =
      el.height *
      ((configAnimation.margenTopMin - configAnimation.margenTopMax) * (percent / 100) +
        configAnimation.margenTopMax);
  
    const leftOffset = el.width * configAnimation.margenLeft;
  
    const widthTop = el.width * (configAnimation.widthTop / 100);
    const widthBottom = el.width * (configAnimation.widthBottom / 100);
    const heightLeft = el.height * (configAnimation.heightLeft / 100);
    const heightRight = el.height * (configAnimation.heightRight / 100);
    const initDraw = ((el.width - widthBottom) / 2) * configAnimation.margenBotonLeft;
  
    const points = [];
  
    for (let x = 0; x <= widthTop; x += waveWidth / 4) {
      const y = topOffset + Math.sin((x + offset * 5) * 0.1) * waveHeight;
      points.push(leftOffset + x, y);
    }
  
    points.push(leftOffset + widthBottom, topOffset + heightRight);
    points.push(leftOffset + initDraw, topOffset + heightLeft);
  
    return points;
  }

export default RenderImage;
