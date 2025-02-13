import { useState } from 'react'
import '../Style/ControlPanel.css'
const ControlPanel = ({ title }) => {
    const [checked, setChecked] = useState(true)
    return (
        <div className="control-panel">
            <h3>Agregar datos al mapa</h3>
            <hr />
            <div className="input">
                <label>{'Presion de red'}</label>
                <input
                    type="checkbox"
                    value={checked}
                    onChange={(evt) => onChange(setChecked(evt.target.value))}
                />
            </div>
        </div>
    )
}

export default ControlPanel
