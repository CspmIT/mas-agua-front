const ICON = `M12 2C7.03 2 3 6.03 3 11c0 2.21.81 4.22 2.14 5.86L12 22l6.86-5.14A8.962 8.962 0 0021 11c0-4.97-4.03-9-9-9z`;


function Pin({ size = 40, label = '5', color = '#3498db' }) {
  return (
    <svg
      height={size}
      viewBox="0 0 24 24"
      style={{ fill: color, stroke: 'none', position: 'relative' }}
    >
      {/* Icono del marcador */}
      <path d={ICON} />
      {/* Texto centrado dentro del marcador */}
      <text
        x="12"
        y="13"
        fontSize="10"
        fontWeight="bold"
        fill="black"
        textAnchor="middle"
      >
        {label}
      </text>
    </svg>
  );
}

export default Pin;
