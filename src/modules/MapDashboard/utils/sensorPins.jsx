// Pins SVG por tipo de sensor — paths tomados del mockup de diseño.
// Cada función recibe { color, label } y devuelve un SVG completo (32x42)
// con la forma característica del tipo y un círculo blanco interior con el label.

const InnerBadge = ({ color, label }) => (
    <>
        <circle cx='16' cy='14' r='9' fill='white' stroke={color} strokeWidth='0.5' />
        <text
            x='16'
            y='17.5'
            textAnchor='middle'
            fontSize='10'
            fontWeight='700'
            fill='#1f2937'
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
        >
            {label}
        </text>
    </>
)

// Gota — Presión (presión hidrostática)
export const PresionPin = ({ color, label }) => (
    <svg width='32' height='42' viewBox='0 0 32 42' xmlns='http://www.w3.org/2000/svg'>
        <path
            d='M16 41 C 16 41, 30 24, 30 14 C 30 6, 24 1, 16 1 C 8 1, 2 6, 2 14 C 2 24, 16 41, 16 41 Z'
            fill={color}
            stroke='white'
            strokeWidth='2'
        />
        <InnerBadge color={color} label={label} />
    </svg>
)

// Rombo / hexágono — Caudal
export const CaudalPin = ({ color, label }) => (
    <svg width='32' height='42' viewBox='0 0 32 42' xmlns='http://www.w3.org/2000/svg'>
        <path
            d='M16 41 L 8 28 L 2 14 L 8 1 L 24 1 L 30 14 L 24 28 Z'
            fill={color}
            stroke='white'
            strokeWidth='2'
        />
        <InnerBadge color={color} label={label} />
    </svg>
)

// Cisterna / tanque con tapa — Nivel
export const NivelPin = ({ color, label }) => (
    <svg width='32' height='42' viewBox='0 0 32 42' xmlns='http://www.w3.org/2000/svg'>
        <path
            d='M16 41 L 5 28 L 4 8 C 4 4, 9 1, 16 1 C 23 1, 28 4, 28 8 L 27 28 Z'
            fill={color}
            stroke='white'
            strokeWidth='2'
        />
        <ellipse cx='16' cy='6' rx='11' ry='3' fill={color} stroke='white' strokeWidth='1.5' />
        <InnerBadge color={color} label={label} />
    </svg>
)

// Engranaje — Bombeo
export const BombeoPin = ({ color, label }) => (
    <svg width='32' height='42' viewBox='0 0 32 42' xmlns='http://www.w3.org/2000/svg'>
        <path
            d='M16 41 L 11 30 L 4 26 L 2 18 L 4 10 L 10 4 L 16 2 L 22 4 L 28 10 L 30 18 L 28 26 L 21 30 Z'
            fill={color}
            stroke='white'
            strokeWidth='2'
        />
        <circle cx='16' cy='14' r='11' fill={color} stroke='white' strokeWidth='1' />
        <g fill='white'>
            <rect x='15' y='2' width='2' height='3' />
            <rect x='15' y='23' width='2' height='3' />
            <rect x='4' y='13' width='3' height='2' />
            <rect x='25' y='13' width='3' height='2' />
        </g>
        <InnerBadge color={color} label={label} />
    </svg>
)

export const PIN_BY_TYPE = {
    presion: PresionPin,
    caudal: CaudalPin,
    nivel: NivelPin,
    bombeo: BombeoPin,
}
