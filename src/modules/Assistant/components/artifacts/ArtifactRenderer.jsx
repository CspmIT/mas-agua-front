import LineChartArtifact from './LineChartArtifact'
import BinaryChartArtifact from './BinaryChartArtifact'
import LabelTimelineArtifact from './LabelTimelineArtifact'
import TableArtifact from './TableArtifact'

const RENDERERS = {
	line_chart: LineChartArtifact,
	binary_chart: BinaryChartArtifact,
	label_timeline: LabelTimelineArtifact,
	table: TableArtifact,
}

/**
 * Itera el array de artifacts del response y delega a cada renderer.
 * Soporta múltiples artifacts en un mismo turno (apilados verticalmente).
 *
 * Si el `type` es desconocido se ignora silenciosamente para no romper
 * la respuesta del asistente — el texto sigue visible.
 *
 * @param {{ artifacts: Array<any> }} props
 */
const ArtifactRenderer = ({ artifacts }) => {
	if (!Array.isArray(artifacts) || artifacts.length === 0) return null

	return (
		<div className='space-y-3'>
			{artifacts.map((artifact, i) => {
				const Comp = RENDERERS[artifact?.type]
				if (!Comp) {
					if (import.meta.env.DEV) {
						console.warn('[ArtifactRenderer] Tipo desconocido:', artifact?.type, artifact)
					}
					return null
				}
				return <Comp key={i} data={artifact} />
			})}
		</div>
	)
}

export default ArtifactRenderer
