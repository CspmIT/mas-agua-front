import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const EChart = ({ config }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }

        chartInstance.current.setOption(config, { notMerge: true }); // ⚡ Evita reiniciar el gráfico

        const resizeObserver = new ResizeObserver(() => {
            chartInstance.current.resize();
        });

        resizeObserver.observe(chartRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [config]);

    return <div ref={chartRef} style={{ height: '100%', width: '100%' }}></div>;
};

export default EChart;
