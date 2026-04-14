/**
 * Dashboard.jsx — Main dashboard that renders all panels.
 * Fetches all data on mount and distributes to child components.
 */
import { useState, useEffect, useCallback } from 'react'
import { fetchData, fetchImportance, fetchStats, fetchForecast } from '../services/api'
import AQITrendChart    from './AQITrendChart'
import ImportanceChart  from './ImportanceChart'
import PredictionForm   from './PredictionForm'
import ForecastChart    from './ForecastChart'
import StatsCards       from './StatsCards'
import LocationMap      from './LocationMap'
import { RefreshCw }    from 'lucide-react'

export default function Dashboard({ activeTab, setActiveTab }) {
  // ── Shared state ──────────────────────────────────────────────────────
  const [trendData,      setTrendData]      = useState([])
  const [importanceData, setImportanceData] = useState([])
  const [statsData,      setStatsData]      = useState(null)
  const [forecastData,   setForecastData]   = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)
  const [refreshing,     setRefreshing]     = useState(false)
  const [trendDays,      setTrendDays]      = useState(180)

  // ── Fetch all data ─────────────────────────────────────────────────────
  const loadAll = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const [trend, importance, stats, forecast] = await Promise.all([
        fetchData(trendDays),
        fetchImportance(),
        fetchStats(),
        fetchForecast(14),
      ])
      setTrendData(trend.data || [])
      setImportanceData(importance.features || [])
      setStatsData(stats)
      setForecastData(forecast.forecast || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [trendDays])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading pollution data & training model…</p>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-8">
        <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
          <span className="text-red-400 text-xl">!</span>
        </div>
        <p className="text-red-400 font-medium">Failed to load data</p>
        <p className="text-slate-500 text-sm max-w-md">{error}</p>
        <button
          onClick={() => loadAll()}
          className="mt-2 px-4 py-2 bg-accent rounded-lg text-white text-sm hover:bg-indigo-500 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // ── Tab routing ────────────────────────────────────────────────────────
  return (
    <div className="px-4 md:px-6 py-6 max-w-screen-2xl mx-auto">

      {/* Refresh button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {activeTab === 'dashboard' ? 'Overview Dashboard' :
             activeTab === 'trends'    ? 'AQI & Pollutant Trends' :
             activeTab === 'predict'   ? 'AI Prediction Engine' :
             'Location Map'}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Data: {statsData?.date_range?.start} → {statsData?.date_range?.end}
          </p>
        </div>
        <button
          onClick={() => loadAll(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cardBorder text-slate-400 text-xs hover:text-white hover:border-accent transition-all"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Dashboard Overview tab ─────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary stat cards */}
          <StatsCards stats={statsData?.statistics} locations={statsData?.locations} />

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-card border border-cardBorder rounded-xl p-5 card-hover">
              <AQITrendChart data={trendData} days={trendDays} onDaysChange={setTrendDays} />
            </div>
            <div className="bg-card border border-cardBorder rounded-xl p-5 card-hover">
              <ImportanceChart data={importanceData} />
            </div>
          </div>

          {/* Prediction + Forecast row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-card border border-cardBorder rounded-xl p-5">
              <PredictionForm />
            </div>
            <div className="bg-card border border-cardBorder rounded-xl p-5 card-hover">
              <ForecastChart data={forecastData} />
            </div>
          </div>
        </div>
      )}

      {/* ── Trends tab ─────────────────────────────────────────── */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-card border border-cardBorder rounded-xl p-5">
            <AQITrendChart data={trendData} days={trendDays} onDaysChange={setTrendDays} tall />
          </div>
          <div className="bg-card border border-cardBorder rounded-xl p-5">
            <ForecastChart data={forecastData} tall />
          </div>
        </div>
      )}

      {/* ── Predict tab ────────────────────────────────────────── */}
      {activeTab === 'predict' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-card border border-cardBorder rounded-xl p-5">
            <PredictionForm expanded />
          </div>
          <div className="bg-card border border-cardBorder rounded-xl p-5">
            <ImportanceChart data={importanceData} tall />
          </div>
        </div>
      )}

      {/* ── Map tab ────────────────────────────────────────────── */}
      {activeTab === 'map' && (
        <div className="bg-card border border-cardBorder rounded-xl p-5">
          <LocationMap locations={statsData?.locations || []} />
        </div>
      )}
    </div>
  )
}
