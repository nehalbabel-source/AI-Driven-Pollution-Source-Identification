/**
 * PredictionForm.jsx — Input form to predict AQI from pollutant readings.
 * Calls GET /predict and shows category + policy recommendation.
 */
import { useState } from 'react'
import { predictAQI } from '../services/api'
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'

// Preset scenarios for quick testing
const PRESETS = [
  { label: 'Good Day',    pm25: 20,  pm10: 40,  no2: 20, co: 0.5 },
  { label: 'Moderate',    pm25: 55,  pm10: 100, no2: 40, co: 1.2 },
  { label: 'Poor',        pm25: 90,  pm10: 160, no2: 70, co: 2.5 },
  { label: 'Very Poor',   pm25: 140, pm10: 260, no2: 100, co: 4.0 },
  { label: 'Severe',      pm25: 220, pm10: 350, no2: 130, co: 6.5 },
]

// AQI category styling
function getCategoryStyle(category) {
  const map = {
    'Good':      { bg: '#064e3b', border: '#065f46', text: '#34d399' },
    'Moderate':  { bg: '#1c3b1c', border: '#166534', text: '#4ade80' },
    'Poor':      { bg: '#451a03', border: '#78350f', text: '#fbbf24' },
    'Very Poor': { bg: '#431407', border: '#7c2d12', text: '#fb923c' },
    'Severe':    { bg: '#450a0a', border: '#7f1d1d', text: '#f87171' },
    'Severe+':   { bg: '#3b0764', border: '#4c1d95', text: '#c084fc' },
  }
  return map[category] || { bg: '#1a1d2e', border: '#252840', text: '#94a3b8' }
}

// AQI gauge bar
function AQIGauge({ value }) {
  const pct = Math.min(100, (value / 500) * 100)
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>0</span><span>Good</span><span>Poor</span><span>Severe</span><span>500</span>
      </div>
      <div className="h-3 aqi-bar rounded-full relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-700"
          style={{ left: `calc(${pct}% - 8px)`, background: 'white' }}
        />
      </div>
    </div>
  )
}

export default function PredictionForm({ expanded = false }) {
  const [inputs, setInputs] = useState({ pm25: 75, pm10: 130, no2: 50, co: 1.5 })
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setInputs((prev) => ({ ...prev, [name]: Number(value) }))
  }

  const handlePreset = (preset) => {
    const { label, ...vals } = preset
    setInputs(vals)
    setResult(null)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await predictAQI(inputs)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'pm25', label: 'PM2.5', unit: 'µg/m³', min: 0,   max: 500, step: 1,   color: '#6366f1' },
    { name: 'pm10', label: 'PM10',  unit: 'µg/m³', min: 0,   max: 800, step: 1,   color: '#06b6d4' },
    { name: 'no2',  label: 'NO₂',   unit: 'µg/m³', min: 0,   max: 300, step: 1,   color: '#10b981' },
    { name: 'co',   label: 'CO',    unit: 'mg/m³',  min: 0,   max: 10,  step: 0.1, color: '#f59e0b' },
  ]

  const catStyle = result ? getCategoryStyle(result.category) : null

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">AI AQI Prediction</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter pollutant readings to predict AQI with Random Forest (R²=0.93)
        </p>
      </div>

      {/* Quick preset buttons */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {PRESETS.map((p) => (
          <button key={p.label}
            onClick={() => handlePreset(p)}
            className="px-2.5 py-1 text-xs rounded-md border border-cardBorder text-slate-500 hover:text-white hover:border-accent transition-all"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input sliders */}
      <div className="space-y-4 mb-5">
        {fields.map(({ name, label, unit, min, max, step, color }) => (
          <div key={name}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">
                {label}
                <span className="ml-1 text-slate-600">{unit}</span>
              </label>
              <span className="text-xs font-semibold" style={{ color }}>
                {inputs[name]}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                name={name}
                min={min}
                max={max}
                step={step}
                value={inputs[name]}
                onChange={handleChange}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${color} ${((inputs[name] - min) / (max - min)) * 100}%, #1e2136 0%)`,
                  accentColor: color,
                }}
              />
              <input
                type="number"
                name={name}
                min={min}
                max={max}
                step={step}
                value={inputs[name]}
                onChange={handleChange}
                className="w-16 bg-surface border border-cardBorder rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Predict button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}
      >
        {loading ? (
          <><Loader2 size={14} className="animate-spin" /> Predicting…</>
        ) : (
          '⚡ Predict AQI'
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg p-3">
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Result card */}
      {result && (
        <div className="mt-4 rounded-xl p-4 border transition-all animate-count"
          style={{ background: catStyle.bg, borderColor: catStyle.border }}>

          {/* AQI value */}
          <div className="flex items-end justify-between mb-1">
            <div>
              <p className="text-xs text-slate-500">Predicted AQI</p>
              <p className="text-4xl font-bold mt-0.5" style={{ color: catStyle.text }}>
                {result.predicted_aqi}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: catStyle.text + '22', color: catStyle.text }}>
                {result.category}
              </span>
            </div>
          </div>

          {/* Gauge */}
          <AQIGauge value={result.predicted_aqi} />

          {/* Policy recommendation */}
          <div className="mt-4 pt-3 border-t"
            style={{ borderColor: catStyle.border }}>
            <p className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <CheckCircle size={11} style={{ color: catStyle.text }} />
              Policy Recommendation
            </p>
            <p className="text-xs leading-relaxed" style={{ color: catStyle.text + 'cc' }}>
              {result.policy}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
