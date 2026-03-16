import GrafBarra from '../../../components/Graphs/barchart'

function getLastTwelveMonths() {
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
        return `${months[d.getMonth()]} ${d.getFullYear()}`
    })
}

const MOCK_VALUES = [10, 30, 35, 27, 20, 22, 34, 35, 29, 18, 26, 21]

const TotalizadoPeriodo = ({ color = '#363F9C'}) => {
    const seriesData = getLastTwelveMonths().map((month, i) => ({
        name: month,
        value: MOCK_VALUES[i],
        color,
    }))

    return (
        <GrafBarra
            title=" "
            seriesData={seriesData}
            seriesName="Consumo (m³)"
            color={color}
        />
    )
}

export default TotalizadoPeriodo