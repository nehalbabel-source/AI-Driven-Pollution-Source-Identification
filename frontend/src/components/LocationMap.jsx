/**
 * LocationMap.jsx — Interactive SVG map of Delhi-NCR showing AQI by location.
 * Uses a hand-crafted SVG with approximate station positions.
 * For production, replace with Leaflet + OpenStreetMap or Mapbox.
 */
import { useState } from 'react'

function aqiColor(val) {
  if (val > 300) return '#ef4444'
  if (val > 200) return '#f97316'
  if (val > 100) return '#f59e0b'
  if (val > 50)  return '#84cc16'
  return '#10b981'
}

function aqiCategory(val) {
  if (val > 300) return 'Severe'
  if (val > 200) return 'Very Poor'
  if (val > 100) return 'Poor'
  if (val > 50)  return 'Moderate'
  return 'Good'
}

// Approximate pixel positions within the 500×500 SVG for each monitoring station
const STATION_POSITIONS = {
  'Anand Vihar':     { x: 310, y: 195 },
  'Dwarka':          { x: 105, y: 295 },
  'ITO':             { x: 235, y: 230 },
  'Rohini':          { x: 175, y: 120 },
  'Punjabi Bagh':    { x: 155, y: 200 },
  'Mandir Marg':     { x: 215, y: 215 },
  'RK Puram':        { x: 195, y: 290 },
  'Lodhi Road':      { x: 240, y: 285 },
  'Noida Sector 62': { x: 340, y: 235 },
  'Gurugram':        { x: 145, y: 375 },
}

export default function LocationMap({ locations }) {
  const [hovered, setHovered] = useState(null)

  // Create lookup map
  const locMap = {}
  locations.forEach((l) => { locMap[l.location] = l })

  const sortedByAQI = [...locations].sort((a, b) => b.avg_aqi - a.avg_aqi)

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Location-wise AQI Map — Delhi-NCR</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Hover over a station to see details. Circle size reflects AQI severity.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* SVG Map */}
        <div className="flex-1 bg-surface rounded-xl border border-cardBorder overflow-hidden relative">
          <svg viewBox="0 0 500 500" className="w-full" style={{ maxHeight: 440 }}>
            {/* Background — Delhi NCR approximate outline */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Map background */}
            <rect width="500" height="500" fill="#0f1117" />

            {/* Rough NCR boundary */}
            <path
              d="M80 80 L420 80 L440 160 L430 260 L410 360 L340 420 L200 430 L120 380 L80 280 L70 180 Z"
              fill="#1a1d2e" stroke="#252840" strokeWidth="1.5" strokeDasharray="6 3"
            />

            {/* Major roads (approximate) */}
            {/* Ring roads & expressways */}
            <path d="M235 120 L235 380" stroke="#252840" strokeWidth="1" />
            <path d="M100 230 L400 230" stroke="#252840" strokeWidth="1" />
            <path d="M155 155 L315 315" stroke="#252840" strokeWidth="0.8" />
            <path d="M155 305 L315 155" stroke="#252840" strokeWidth="0.8" />

            {/* Yamuna river (approximate) */}
            <path
              d="M300 80 Q330 140 310 200 Q295 250 300 310 Q305 350 280 420"
              fill="none" stroke="#1e40af" strokeWidth="6" opacity="0.3"
            />
            <text x="315" y="220" fill="#3b82f6" fontSize="9" opacity="0.6" fontFamily="Inter,sans-serif">Yamuna</text>

            {/* City label */}
            <text x="215" y="250" fill="#334155" fontSize="28" fontWeight="700"
              fontFamily="Inter,sans-serif" opacity="0.15" textAnchor="middle">DELHI</text>

            {/* Grid lines */}
            {[100, 150, 200, 250, 300, 350, 400].map((v) => (
              <g key={v}>
                <line x1={v} y1="70" x2={v} y2="430" stroke="#1e2136" strokeWidth="0.5" />
                <line x1="70" y1={v} x2="430" y2={v} stroke="#1e2136" strokeWidth="0.5" />
              </g>
            ))}

            {/* Station circles */}
            {Object.entries(STATION_POSITIONS).map(([name, pos]) => {
              const loc  = locMap[name]
              if (!loc) return null
              const aqi   = loc.avg_aqi
              const color = aqiColor(aqi)
              const r     = Math.max(12, Math.min(28, aqi / 12))
              const isHov = hovered === name

              return (
                <g key={name}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}>

                  {/* Pulse ring when hovered */}
                  {isHov && (
                    <circle cx={pos.x} cy={pos.y} r={r + 10}
                      fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
                  )}

                  {/* Glow */}
                  <circle cx={pos.x} cy={pos.y} r={r + 4}
                    fill={color} opacity="0.12" />

                  {/* Main circle */}
                  <circle cx={pos.x} cy={pos.y} r={r}
                    fill={color} opacity={isHov ? 1 : 0.85}
                    stroke={isHov ? '#fff' : color}
                    strokeWidth={isHov ? 1.5 : 0.5}
                  />

                  {/* AQI value */}
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={r > 18 ? 10 : 8} fontWeight="700"
                    fontFamily="Inter,sans-serif">
                    {Math.round(aqi)}
                  </text>

                  {/* Location label */}
                  <text x={pos.x} y={pos.y + r + 10} textAnchor="middle"
                    fill={isHov ? '#e2e8f0' : '#64748b'}
                    fontSize="8" fontFamily="Inter,sans-serif">
                    {name.split(' ')[0]}
                  </text>
                </g>
              )
            })}

            {/* Compass */}
            <g transform="translate(450, 90)">
              <circle cx="0" cy="0" r="16" fill="#1a1d2e" stroke="#252840" strokeWidth="1" />
              <text x="0" y="-5" textAnchor="middle" fill="#6366f1" fontSize="8"
                fontWeight="700" fontFamily="Inter,sans-serif">N</text>
              <line x1="0" y1="-12" x2="0" y2="12" stroke="#334155" strokeWidth="0.8" />
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#334155" strokeWidth="0.8" />
            </g>
          </svg>

          {/* Hover tooltip */}
          {hovered && locMap[hovered] && (
            <div className="absolute bottom-4 left-4 bg-card border border-cardBorder rounded-xl p-3 text-xs shadow-xl min-w-[160px]">
              <p className="text-white font-semibold mb-1">{hovered}</p>
              <p className="text-slate-400 mb-2">Avg AQI: <span className="font-bold"
                style={{ color: aqiColor(locMap[hovered].avg_aqi) }}>
                {locMap[hovered].avg_aqi}
              </span></p>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: aqiColor(locMap[hovered].avg_aqi) + '22',
                  color: aqiColor(locMap[hovered].avg_aqi)
                }}>
                {aqiCategory(locMap[hovered].avg_aqi)}
              </span>
            </div>
          )}
        </div>

        {/* Station ranking list */}
        <div className="xl:w-64 space-y-2">
          <p className="text-xs font-semibold text-slate-400 mb-3">Station Rankings</p>
          {sortedByAQI.map((loc, i) => {
            const color = aqiColor(loc.avg_aqi)
            const pct   = Math.min(100, (loc.avg_aqi / 400) * 100)
            return (
              <div key={loc.location}
                onMouseEnter={() => setHovered(loc.location)}
                onMouseLeave={() => setHovered(null)}
                className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all"
                style={{
                  background: hovered === loc.location ? color + '12' : '#1a1d2e',
                  border: `1px solid ${hovered === loc.location ? color + '44' : '#252840'}`
                }}>
                <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate">{loc.location}</p>
                  <div className="h-1 rounded-full bg-white/5 mt-1">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
                <span className="text-xs font-semibold" style={{ color }}>{loc.avg_aqi}</span>
              </div>
            )
          })}

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-cardBorder space-y-1.5">
            <p className="text-xs text-slate-600 mb-2">AQI Scale</p>
            {[
              { label: 'Good (0–50)',          color: '#10b981' },
              { label: 'Moderate (51–100)',    color: '#84cc16' },
              { label: 'Poor (101–200)',       color: '#f59e0b' },
              { label: 'Very Poor (201–300)', color: '#f97316' },
              { label: 'Severe (301+)',        color: '#ef4444' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
