/**
 * api.js — Centralized Axios service for all backend calls.
 * Base URL points to FastAPI running on :8000
 */
import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Response interceptor: normalise errors ────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.detail ||
      error?.message ||
      'Unknown API error'
    return Promise.reject(new Error(message))
  },
)

// ── API methods ───────────────────────────────────────────────────────────

/** Fetch cleaned time-series data for charts (latest N days) */
export const fetchData = (limit = 365) =>
  api.get(`/data?limit=${limit}`)

/** Fetch RF feature importances */
export const fetchImportance = () =>
  api.get('/importance')

/**
 * Predict AQI from raw pollutant values
 * @param {{ pm25, pm10, no2, co }} inputs
 */
export const predictAQI = ({ pm25, pm10, no2, co }) =>
  api.get(`/predict?pm25=${pm25}&pm10=${pm10}&no2=${no2}&co=${co}`)

/** Fetch N-day AQI forecast */
export const fetchForecast = (days = 14) =>
  api.get(`/forecast?days=${days}`)

/** Fetch summary statistics + location data */
export const fetchStats = () =>
  api.get('/stats')

/** Health check */
export const healthCheck = () =>
  api.get('/health')

export default api
