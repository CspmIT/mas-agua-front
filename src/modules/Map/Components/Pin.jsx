const ICON = `M12 2C7.03 2 3 6.03 3 11c0 2.21.81 4.22 2.14 5.86L12 22l6.86-5.14A8.962 8.962 0 0021 11c0-4.97-4.03-9-9-9z`;

function Pin({ size = 43, label = '', color = '#3498db' }) {
  return (
    <svg
      height={size}
      viewBox="0 0 24 24"
      style={{
        filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))',
      }}
    >
      {/* Halo */}
      <circle
        cx="12"
        cy="11"
        r="9"
        fill={color}
        opacity="0.25"
      />

      {/* Pin */}
      <defs>
        <linearGradient id="pinGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="35%" stopColor={color} />
          <stop offset="100%" stopColor="#2c6aa0" />
        </linearGradient>
      </defs>

      <path d={ICON} fill="url(#pinGradient)" />

      {/* Texto */}
      {label && (
        <text
          x="12"
          y="13"
          fontSize="9"
          fontWeight="bold"
          fill="#ffffff"
          textAnchor="middle"
          style={{ pointerEvents: 'none' }}
        >
          {label}
        </text>
      )}
    </svg>
  );
}

export default Pin;
