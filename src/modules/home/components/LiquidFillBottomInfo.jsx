import { Typography } from '@mui/material'

const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return null
    const num = Number(value)
    return isNaN(num) ? value : num.toFixed(2)
}

const LiquidFillBottomInfo = ({ bottom1, bottom2 }) => {
    if (!bottom1) return null

    const renderItem = (item) => {

        if (!item?.value && item?.value !== 0) return null

        const label = item.label ?? ''
        const unit = item.unit ?? ''
        const value = formatValue(item.value)

        if (value === null) return null

        return (
            <>
                <Typography variant="subtitle1" className="text-center">
                    {label && <span className="font-medium">{label} </span>}    
                    <span className="font-bold text-lg">{value} {unit}</span>
                </Typography>
            </>
        )
    }

    return (
        <div className="flex flex-col items-center mb-1 rounded-xl bg-slate-50/30 border-2 border-blue-200 w-full">
            {renderItem(bottom1)}
            {renderItem(bottom2)}
        </div>
    )
}

export default LiquidFillBottomInfo
