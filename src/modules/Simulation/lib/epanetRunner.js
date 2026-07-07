import {
	Project,
	Workspace,
	CountType,
	NodeProperty,
	LinkProperty,
	NodeType,
	LinkType,
	InitHydOption,
	FlowUnits,
	TimeParameter,
} from 'epanet-js'

const NODE_TYPE_LABELS = {
	[NodeType.Junction]: 'Nodo de consumo',
	[NodeType.Reservoir]: 'Reservorio',
	[NodeType.Tank]: 'Tanque',
}

const LINK_TYPE_LABELS = {
	[LinkType.CVPipe]: 'Tubería (VR)',
	[LinkType.Pipe]: 'Tubería',
	[LinkType.Pump]: 'Bomba',
	[LinkType.PRV]: 'Válvula PRV',
	[LinkType.PSV]: 'Válvula PSV',
	[LinkType.PBV]: 'Válvula PBV',
	[LinkType.FCV]: 'Válvula FCV',
	[LinkType.TCV]: 'Válvula TCV',
	[LinkType.GPV]: 'Válvula GPV',
}

const FLOW_UNIT_LABELS = {
	[FlowUnits.CFS]: 'ft³/s',
	[FlowUnits.GPM]: 'gal/min',
	[FlowUnits.MGD]: 'Mgal/día',
	[FlowUnits.IMGD]: 'Mgal imp/día',
	[FlowUnits.AFD]: 'acre-ft/día',
	[FlowUnits.LPS]: 'L/s',
	[FlowUnits.LPM]: 'L/min',
	[FlowUnits.MLD]: 'ML/día',
	[FlowUnits.CMH]: 'm³/h',
	[FlowUnits.CMD]: 'm³/día',
}

// Con unidades de caudal métricas EPANET expresa presión en m.c.a.; con unidades US, en psi
const METRIC_FLOW_UNITS = new Set([FlowUnits.LPS, FlowUnits.LPM, FlowUnits.MLD, FlowUnits.CMH, FlowUnits.CMD])

// Traducciones de las advertencias más comunes del motor
const WARNING_TRANSLATIONS = [
	[/negative pressures/i, 'El sistema tiene presiones negativas: hay zonas donde la demanda no se puede abastecer.'],
	[/pump.*cannot deliver.*head/i, 'Hay bombas que no pueden entregar la altura requerida.'],
	[/pump.*cannot deliver.*flow/i, 'Hay bombas que no pueden entregar el caudal requerido.'],
	[/disconnected/i, 'Hay partes de la red desconectadas de toda fuente de agua.'],
	[/unbalanced/i, 'El cálculo hidráulico no convergió del todo: revisá los resultados con cautela.'],
	[/valve.*cannot deliver/i, 'Hay válvulas que no pueden cumplir su consigna.'],
]

function translateWarning(message) {
	for (const [pattern, translation] of WARNING_TRANSLATIONS) {
		if (pattern.test(message)) return translation
	}
	return message.replace(/^epanet-js \(Warning \d+\):\s*/i, '').replace(/^WARNING:\s*/i, '')
}

// El Workspace carga el WASM una sola vez y se reutiliza entre corridas
let workspacePromise = null
function getWorkspace() {
	if (!workspacePromise) {
		workspacePromise = (async () => {
			const ws = new Workspace()
			await ws.loadModule()
			return ws
		})()
	}
	return workspacePromise
}

/**
 * Corre una simulación hidráulica de período extendido sobre un modelo .INP
 * y devuelve la red y las series de resultados por paso de tiempo.
 *
 * @param {string} inpText - contenido del archivo .INP
 * @returns {Promise<{
 *   flowUnitLabel: string,
 *   pressureUnitLabel: string,
 *   isMetric: boolean,
 *   duration: number,
 *   nodes: Array<{index:number, id:string, type:number, typeLabel:string, elevation:number}>,
 *   links: Array<{index:number, id:string, type:number, typeLabel:string, from:string, to:string, diameter:number, length:number}>,
 *   steps: Array<{time:number, nodes:Array<{pressure:number, head:number, demand:number}>, links:Array<{flow:number, velocity:number}>}>
 * }>}
 */
export async function runSimulation(inpText) {
	const ws = await getWorkspace()
	const model = new Project(ws)

	ws.writeFile('model.inp', inpText)
	model.open('model.inp', 'report.rpt', 'out.bin')

	try {
		const flowUnits = model.getFlowUnits()
		const isMetric = METRIC_FLOW_UNITS.has(flowUnits)
		const duration = model.getTimeParameter(TimeParameter.Duration)

		const nodeCount = model.getCount(CountType.NodeCount)
		const nodes = []
		for (let i = 1; i <= nodeCount; i++) {
			const type = model.getNodeType(i)
			nodes.push({
				index: i,
				id: model.getNodeId(i),
				type,
				typeLabel: NODE_TYPE_LABELS[type] ?? 'Nodo',
				elevation: model.getNodeValue(i, NodeProperty.Elevation),
			})
		}

		const linkCount = model.getCount(CountType.LinkCount)
		const links = []
		for (let i = 1; i <= linkCount; i++) {
			const type = model.getLinkType(i)
			const { node1, node2 } = model.getLinkNodes(i)
			links.push({
				index: i,
				id: model.getLinkId(i),
				type,
				typeLabel: LINK_TYPE_LABELS[type] ?? 'Tramo',
				from: model.getNodeId(node1),
				to: model.getNodeId(node2),
				diameter: model.getLinkValue(i, LinkProperty.Diameter),
				length: model.getLinkValue(i, LinkProperty.Length),
			})
		}

		// El motor emite advertencias por consola: las capturamos para mostrarlas en la UI
		const warnings = new Set()
		const origWarn = console.warn
		const origLog = console.log
		const intercept = (orig) => (...args) => {
			const message = args.join(' ')
			if (/epanet-js \(Warning|WARNING:/i.test(message)) warnings.add(translateWarning(message))
			else orig(...args)
		}
		console.warn = intercept(origWarn)
		console.log = intercept(origLog)

		const steps = []
		try {
			model.openH()
			model.initH(InitHydOption.NoSave)
			try {
				let tStep = Infinity
				do {
					const time = model.runH()
					steps.push({
						time,
						nodes: nodes.map((n) => ({
							pressure: model.getNodeValue(n.index, NodeProperty.Pressure),
							head: model.getNodeValue(n.index, NodeProperty.Head),
							demand: model.getNodeValue(n.index, NodeProperty.Demand),
						})),
						links: links.map((l) => ({
							flow: model.getLinkValue(l.index, LinkProperty.Flow),
							velocity: model.getLinkValue(l.index, LinkProperty.Velocity),
							headloss: model.getLinkValue(l.index, LinkProperty.Headloss),
						})),
					})
					tStep = model.nextH()
				} while (tStep > 0)
			} finally {
				model.closeH()
			}
		} finally {
			console.warn = origWarn
			console.log = origLog
		}

		return {
			flowUnitLabel: FLOW_UNIT_LABELS[flowUnits] ?? '?',
			pressureUnitLabel: isMetric ? 'm.c.a.' : 'psi',
			isMetric,
			duration,
			nodes,
			links,
			steps,
			warnings: [...warnings],
		}
	} finally {
		model.close()
	}
}
