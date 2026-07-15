//RESUELVE LA ANIMACION DE FLUJO DE UNA LINEA SEGUN SU VARIABLE DE CAUDAL
//- Sin variable o sin dato: animacion normal (comportamiento historico)
//- Caudal <= 0: sin animacion (no pasa agua)
//- Con caudal de referencia cargado por el usuario (max_value_var, en m3/h):
//  velocidad proporcional, 1x cuando el caudal iguala la referencia
//- Sin referencia: solo prende/apaga a velocidad normal
export const getFlowAnimation = (dataInflux) => {
	const hasVariable = dataInflux?.id !== null && dataInflux?.id !== undefined;
	const rawValue = dataInflux?.value;
	const value =
		rawValue !== null && rawValue !== undefined && !isNaN(rawValue) ? Number(rawValue) : null;

	if (!hasVariable || value === null) return { isClosed: false, speedFactor: 1 };
	if (value <= 0) return { isClosed: true, speedFactor: 0 };

	const reference = Number(dataInflux?.max_value_var);
	if (reference > 0) {
		return { isClosed: false, speedFactor: Math.min(Math.max(value / reference, 0.15), 2) };
	}

	return { isClosed: false, speedFactor: 1 };
};
