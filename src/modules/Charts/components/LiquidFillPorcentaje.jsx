import EChart from './EChart'
import 'echarts-liquidfill'

const LiquidFillPorcentaje = ({ value = 0, maxValue = 1, color, shape, porcentage = false, border = true, unidad= '', other = false }) => {
    const isLightColor = (color) => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155;
    };

    const backgroundColor = color ?? '#363f9c'; // Color de fondo por defecto
    const labelColor = isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
    const percentage = (value / maxValue);
    const textColor =  percentage > 0.6 ? '#ffffff' : '#0f2a44';

    // Opciones para configurar los datos
    const options = {
        backgroundColor: 'transparent',
        series: [
          {
            type: 'liquidFill',
            data: [
              percentage,
              percentage * 0.98,
              percentage * 0.96,
            ],
            radius: '82%',
      
            // 🌊 Agua con volumen
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#a5f3fc' },
                  { offset: 0.5, color: color ?? '#38bdf8' },
                  { offset: 1, color: '#0c4a6e' },
                ],
              },
              shadowBlur: 30,
              shadowOffsetY: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
      
            // 🧊 Ondas más suaves
            amplitude: 8,
            waveLength: '80%',
            period: 4000,
      
            // 🔤 Texto flotante
            label: {
              show: true,
              formatter: (params) => {
                if (porcentage) {
                  return `${(params.value * 100).toFixed(2)} %`
                }
                return `${parseFloat(value).toFixed(2)} ${unidad}${other ? `\n${other}` : ''}`
              },
              fontSize: 26,
              fontWeight: 'bold',
              color: textColor,
              textShadowColor: 'rgba(0,0,0,0.3)',
              textShadowBlur: 8,
            },
      
            // 🛢️ Tanque / borde
            outline: {
              show: border,
              borderDistance: 10,
              itemStyle: {
                borderWidth: 10,
                borderColor: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: '#93c5fd' },
                    { offset: 1, color: '#1e3a8a' },
                  ],
                },
                shadowBlur: 15,
                shadowColor: 'rgba(0,0,0,0.4)',
              },
            },
      
            shape: shape ?? 'circle',
            animationEasing: 'cubicOut',
            animationDuration: 2000,
            silent: true,
          },
        ],
      }
      

    return <EChart config={options} />
}

export default LiquidFillPorcentaje