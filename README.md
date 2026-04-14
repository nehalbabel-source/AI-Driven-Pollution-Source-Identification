# 🌫️ Delhi-NCR AQI Intelligence Dashboard

**AI-Driven Pollution Source Identification, Forecasting & Policy Dashboard**

A full-stack, production-ready web application combining FastAPI, Random Forest ML, and a React + Recharts dashboard for real-time Delhi-NCR air quality analysis.

---

## 📸 Features

| Feature | Details |
|---|---|
| **AQI Trend Chart** | Interactive multi-line chart with 30/90/180/365-day views |
| **Pollution Source ID** | Random Forest feature importance → identifies primary pollutant drivers |
| **AI Prediction** | Predict AQI from PM2.5/PM10/NO2/CO with preset scenarios |
| **14-Day Forecast** | EWMA-based time-series forecast with category colouring |
| **Location Map** | SVG map of 10 Delhi-NCR monitoring stations with AQI heatmap |
| **Policy Engine** | Automatic policy recommendations based on AQI severity |

---

## 🗂️ Project Structure

```
delhi-aqi/
├── backend/
│   ├── main.py              # FastAPI app — data, ML, endpoints
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── services/
│       │   └── api.js       # Axios API layer
│       └── components/
│           ├── Dashboard.jsx
│           ├── StatsCards.jsx
│           ├── AQITrendChart.jsx
│           ├── ImportanceChart.jsx
│           ├── PredictionForm.jsx
│           ├── ForecastChart.jsx
│           └── LocationMap.jsx
└── data/
    ├── raw_data.csv          # Generated dataset (730 rows, 2 years)
    └── generate_data.py      # Data generation script
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

---

### 1. Clone & Navigate
```bash
cd delhi-aqi
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate       # macOS/Linux
# venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Backend running at:** `http://127.0.0.1:8000`
**Interactive API docs:** `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

Open a **new terminal tab**:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

**Frontend running at:** `http://localhost:5173`

---

### 4. Open in Browser

Navigate to **http://localhost:5173** and the dashboard will auto-connect to the backend.

---

## 🔌 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Server status + model metrics |
| `/data?limit=365` | GET | Cleaned time-series data |
| `/importance` | GET | RF feature importances |
| `/predict?pm25=&pm10=&no2=&co=` | GET | Predict AQI |
| `/forecast?days=14` | GET | N-day AQI forecast |
| `/stats` | GET | Summary stats + location data |

---

## 🤖 ML Model Details

| Metric | Value |
|---|---|
| Algorithm | Random Forest Regressor |
| Features | PM2.5, PM10, NO2, CO |
| Target | AQI |
| Train/Test Split | 80/20 temporal |
| MAE | ~10.8 |
| R² Score | ~0.93 |
| Forecasting | EWMA (Exponentially Weighted Moving Average) |

---

## 🏗️ Build for Production

```bash
# Backend — run with gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend — build static files
cd frontend && npm run build
# Output in frontend/dist/
```

---

## 🛠️ Customisation

- **Real data**: Replace `data/raw_data.csv` with CPCB/IQAir data; the preprocessing pipeline handles it automatically.
- **Upgrade model**: Swap `RandomForestRegressor` in `main.py` for `XGBRegressor` (install `xgboost`).
- **Real map**: Replace `LocationMap.jsx` with Leaflet.js + react-leaflet for live tile maps.
- **Live data**: Poll CPCB Open Data API and write to CSV periodically.

---

## 📦 Dependencies

**Backend:** fastapi, uvicorn, pandas, numpy, scikit-learn

**Frontend:** react, recharts, axios, lucide-react, tailwindcss, vite
