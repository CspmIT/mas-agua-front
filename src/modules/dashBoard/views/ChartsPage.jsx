import ChartsDashboard from './ChartsDashboard'
import ExternalClientsInvoices from '../components/ExternalClientsInvoices'

// Vista de la ruta /chart (usuarios internos): listado de graficos mas la
// facturacion de los clientes externos. Los usuarios externos siguen usando
// ChartsDashboard embebido en su propia vista, sin esta seccion.
const ChartsPage = () => (
    <div className="w-full">
        <ChartsDashboard />
        <ExternalClientsInvoices />
    </div>
)

export default ChartsPage
