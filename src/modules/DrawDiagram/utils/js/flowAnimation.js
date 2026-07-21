//RESUELVE LA ANIMACION DE FLUJO DE UNA LINEA SEGUN SU VARIABLE DE CAUDAL
//- Sin variable o sin dato: animacion normal (comportamiento historico)
//- Caudal <= 0: sin animacion (no pasa agua)
//- Caudal > 0: animacion a velocidad normal
export const getFlowAnimation = (dataInflux) => {
	const hasVariable = dataInflux?.id !== null && dataInflux?.id !== undefined;
	const rawValue = dataInflux?.value;
	const value =
		rawValue !== null && rawValue !== undefined && !isNaN(rawValue) ? Number(rawValue) : null;

	if (!hasVariable || value === null) return { isClosed: false, speedFactor: 1 };
	if (value <= 0) return { isClosed: true, speedFactor: 0 };

	return { isClosed: false, speedFactor: 1 };
};
