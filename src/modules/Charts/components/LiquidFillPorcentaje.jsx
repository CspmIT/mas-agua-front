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

    const options = {
        series: [
            {
                type: 'liquidFill',
                data: [percentage],
                radius: '80%',
                label: {
                    formatter: (params) => {
                        if (porcentage) {
                            return `${parseFloat((params.value * 100)).toFixed(2)} %`
                        }
                        return `${parseFloat(value).toFixed(2)} ${unidad} ${other ? `\n ${other}` : ''}`
                    },
                    fontSize: 26,
                    color: '#000',
                    insideColor: labelColor,
                },
                itemStyle: {
                    color: color,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                },
                outline: {
                    show: border,
                    borderDistance: 8,
                    itemStyle: {
                        color: 'none',
                        borderColor: color ?? '#294D99',
                        borderWidth: 8,
                    },
                },
                shape: shape ?? 'circle',
                animationEasing: 'cubicOut',
                silent: true,
            },
        ],
    }

    return <EChart config={options} />
}

export default LiquidFillPorcentaje