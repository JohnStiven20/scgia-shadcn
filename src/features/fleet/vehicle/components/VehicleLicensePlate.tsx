import { useId } from "react"

export function VehicleLicensePlate({ value }: { value?: string | null }) {
  const id = useId().replace(/:/g, "")
  const plate = value?.trim().toUpperCase() || "Sin matrícula"

  return (
    <svg
      role="img"
      aria-label={`Matrícula: ${plate}`}
      viewBox="0 0 520 114"
      className="h-auto w-32 max-w-full shrink-0 overflow-visible sm:w-36"
    >
      <defs>
        <linearGradient id={`${id}-metal`} x2="0" y2="1">
          <stop stopColor="#f1f1f1" />
          <stop offset="0.5" stopColor="#dedede" />
          <stop offset="1" stopColor="#e9e9e9" />
        </linearGradient>
        <pattern id={`${id}-security`} width="66" height="68" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#777" strokeWidth="0.8" opacity="0.12" transform="translate(12 10)">
            <path d="M8 13 5 6l8 4 5-8 5 8 8-4-3 7ZM8 16h20M10 19h16v13c0 7-8 11-8 11S10 39 10 32Z" />
            <path d="M18 19v20M10 29h16M13 22h2v4h-2ZM21 32h2v4h-2ZM3 21v17m30-17v17M1 24h4M31 24h4M1 35h4M31 35h4" />
            <circle cx="18" cy="1" r="1" />
          </g>
        </pattern>
        <path id={`${id}-star`} d="m0-2.7.65 1.95H2.7L1.05.45l.65 1.95L0 1.2l-1.7 1.2.65-1.95L-2.7-.75h2.05Z" />
      </defs>
      <rect x="1" y="2" width="518" height="110" rx="12" fill={`url(#${id}-metal)`} stroke="#888" strokeWidth="0.6" style={{ filter: "drop-shadow(0 2px 2px rgb(0 0 0 / 0.16))" }} />
      <rect x="2" y="3" width="516" height="108" rx="11" fill="none" stroke="white" strokeOpacity="0.65" />
      <rect x="50" y="9" width="460" height="96" fill={`url(#${id}-security)`} />
      <path d="M17 6h34v102H17A12 12 0 0 1 5 96V18A12 12 0 0 1 17 6Z" fill="#003399" />
      <g fill="#ffdf00">
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index * Math.PI) / 6 - Math.PI / 2
          return <use key={index} href={`#${id}-star`} transform={`translate(${28 + Math.cos(angle) * 16} ${36 + Math.sin(angle) * 16})`} />
        })}
      </g>
      <text x="28" y="88" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="700">E</text>
      <text
        x="282"
        y="89"
        textAnchor="middle"
        fill="black"
        fontFamily="'Arial Narrow', 'Roboto Condensed', Arial, sans-serif"
        fontSize={value ? 78 : 44}
        fontWeight="700"
        textLength={value ? 350 : undefined}
        lengthAdjust="spacingAndGlyphs"
      >
        {plate}
      </text>
    </svg>
  )
}
