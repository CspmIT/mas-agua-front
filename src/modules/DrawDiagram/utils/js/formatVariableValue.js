//FORMATEA EL VALOR DE UNA VARIABLE PARA MOSTRAR (misma logica que los tooltips de la vista)
export const formatVariableValue = (dataInflux) => {
	if (!dataInflux) return 'Sin variable';

	const rawValue = dataInflux.value;
	const maxValue = dataInflux.max_value_var;
	const unit = dataInflux.unit || '';

	// Binaria comprimida: muestra el nombre del bit seleccionado
	if (dataInflux.binary_compressed && Array.isArray(rawValue)) {
		const bitData = rawValue.find((b) => b.id_bit === dataInflux.id_bit);
		return bitData ? bitData.bit : dataInflux.name || 'Bit desconocido';
	}

	// Calculada binaria: muestra el label del estado
	if (dataInflux.calc_binary_compressed && rawValue?.label) {
		return rawValue.label;
	}

	// Porcentaje respecto del valor maximo configurado
	if (maxValue && !isNaN(maxValue) && Number(maxValue) !== 0 && rawValue != null && !isNaN(rawValue)) {
		return `${((Number(rawValue) * 100) / Number(maxValue)).toFixed(1)}%`;
	}

	if (rawValue != null) {
		return !isNaN(rawValue) ? `${Number(rawValue)} ${unit}`.trim() : `${rawValue}`;
	}

	return 'Sin datos';
};
