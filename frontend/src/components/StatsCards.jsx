/**
 * StatsCards.jsx — Summary metric cards at top of dashboard.
 */
import { Wind, Droplets, Zap, Activity } from 'lucide-react'

const CARD_CONFIG = [
  { key: 'AQI',   label: 'Avg AQI',    icon: Activity,  color: '#f59e0b', unit: '' },
  { key: 'PM2.5', label: 'Avg PM2.5',  icon: Wind,      color: '#6366f1', unit: 'µg/m³' },
  { key: 'PM10',  label: 'Avg PM10',   icon: Droplets,  color: '#06b6d4', unit: 'µg/m³' },
  { key: 'NO2',   label: 'Avg NO₂',    icon: Zap,       color: '#10b981', unit: 'µg/m³' },
]

function aqi_color(val) {
  if (val > 300) return '#ef4444'
  if (val > 200) return '#f97316'
  if (val > 100) return '#f59e0b'
  return '#10b981'
}

export default function StatsCards({ stats, locations }) {
  if (!stats) return null

  const worstLoc = locations?.reduce((a, b) => (a.avg_aqi > b.avg_aqi ? a : b), locations[0])
  const bestLoc  = locations?.reduce((a, b) => (a.avg_aqi < b.avg_aqi ? a : b), locations[0])

  return (
    <div className="space-y-4">
      {/* Pollutant metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CARD_CONFIG.map(({ key, label, icon: Icon, color, unit }) => {
          const s = stats[key]
          if (!s) return null
          return (
            <div key={key}
              className="bg-card border border-cardBorder rounded-xl p-4 card-hover relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
                style={{ background: color, filter: 'blur(20px)', transform: 'translate(20%, -20%)' }} />

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 font-medium">{label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: color + '22' }}>
                  <Icon size={13} style={{ color }} />
                </div>
              </div>

              <div className="text-2xl font-semibold text-white animate-count"
                style={{ color: key === 'AQI' ? aqi_color(s.mean) : color }}>
                {s.mean}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{unit} mean</div>

              {/* Min/max bar */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <span>↓ {s.min}</span>
                <div className="flex-1 h-1 rounded-full bg-white/5">
                  <div className="h-full rounded-full"
                    style={{ background: color, width: `${((s.mean - s.min) / (s.max - s.min)) * 100}%` }} />
                </div>
                <span>↑ {s.max}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Best/Worst location pills */}
      {worstLoc && bestLoc && (
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-slate-400">Most Polluted:</span>
            <span className="text-red-300 font-medium">{worstLoc.location}</span>
            <span className="text-red-400">AQI {worstLoc.avg_aqi}</span>
          </div>
          <div className="flex items-center gap-2 bg-green-900/20 border border-green-800/30 rounded-lg px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-slate-400">Cleanest:</span>
            <span className="text-green-300 font-medium">{bestLoc.location}</span>
            <span className="text-green-400">AQI {bestLoc.avg_aqi}</span>
          </div>
        </div>
      )}
    </div>
  )
}
