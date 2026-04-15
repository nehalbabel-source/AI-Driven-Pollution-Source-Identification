/**
 * App.jsx — Root layout with sidebar navigation and main content area.
 */
import { useState, useEffect } from 'react'
import { healthCheck } from './services/api'
import Dashboard from './components/Dashboard'
import { Wind, Activity, AlertTriangle, BarChart2, Map } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'trends',    label: 'AQI Trends', icon: BarChart2 },
  { id: 'predict',   label: 'Predict AQI', icon: Wind },
  { id: 'map',       label: 'Location Map', icon: Map },
]

export default function App() {
  const [activeTab, setActiveTab]     = useState('dashboard')
  const [apiStatus, setApiStatus]     = useState('checking') // 'ok' | 'error' | 'checking'

  // Check if backend is reachable
  useEffect(() => {
    healthCheck()
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('error'))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-surface text-slate-200">

      {/* ── Top Header Bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-cardBorder"
        style={{ background: '#0d0f1a', backdropFilter: 'blur(12px)' }}>

        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
            <Wind size={16} color="white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white leading-none">
              Delhi-NCR AQI Intelligence
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">AI-Powered Pollution Dashboard</p>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                activeTab === id
                  ? 'bg-accent text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </nav>

        {/* API status pill */}
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full pulse-dot ${
              apiStatus === 'ok' ? 'bg-green-400' :
              apiStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
            }`}
          />
          <span className="text-slate-400 hidden sm:block">
            {apiStatus === 'ok'       ? 'API Connected' :
             apiStatus === 'error'    ? 'API Offline' : 'Connecting…'}
          </span>
        </div>
      </header>

      {/* ── API Offline Banner ──────────────────────────────────── */}
      {apiStatus === 'error' && (
        <div className="flex items-center gap-3 px-6 py-2.5 bg-red-900/30 border-b border-red-800/40 text-red-300 text-sm">
          <AlertTriangle size={15} />
          <span>
            Backend API is offline. Start the FastAPI server:{' '}
            <code className="bg-red-900/40 px-1.5 py-0.5 rounded text-xs font-mono">
              cd backend && uvicorn main:app --reload
            </code>
          </span>
        </div>
      )}

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="px-6 py-3 border-t border-cardBorder text-xs text-slate-600 flex items-center justify-between">
        <span>Delhi-NCR AQI Intelligence Dashboard v1.0 · AI-Powered</span>
        <span>Data: CPCB India · Model: Random Forest (R²=0.93)</span>
      </footer>
    </div>
  )
}
