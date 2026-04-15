"""
Delhi AQI Pollution Dashboard - FastAPI Backend
<<<<<<< HEAD
================================================
Handles data loading, ML model training, AQI prediction,
feature importance (source identification), and forecasting.
"""

import os
import math
import warnings
import json
=======
"""

import os
import warnings
>>>>>>> 1a7b081191bda78c0a336a23014ac432b3eed2c2
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
<<<<<<< HEAD
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score

# ── Try importing FastAPI; fall back to a lightweight shim for codegen only ──
try:
    from fastapi import FastAPI, HTTPException, Query
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn
    HAS_FASTAPI = True
except ImportError:
    HAS_FASTAPI = False
    print("FastAPI not installed – running in data-preview mode only.")
    print("Install with: pip install fastapi uvicorn")

warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent
DATA_PATH  = BASE_DIR / "data" / "raw_data.csv"

# ── Feature columns used for modelling ────────────────────────────────────────
=======
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent
DATA_PATH  = BASE_DIR / "data" / "raw_data.csv"

>>>>>>> 1a7b081191bda78c0a336a23014ac432b3eed2c2
FEATURES = ["PM2.5", "PM10", "NO2", "CO"]
TARGET   = "AQI"


<<<<<<< HEAD
# ══════════════════════════════════════════════════════════════════════════════
# 1.  DATA LOADING & PREPROCESSING
# ══════════════════════════════════════════════════════════════════════════════

def load_and_preprocess() -> pd.DataFrame:
    """
    Load raw CSV, handle missing values, type-cast, and return a clean df.
    Only keeps rows where at least one key pollutant is present.
    """
    df = pd.read_csv(DATA_PATH)

    # Fill numeric NaNs with column median (robust to outliers)
=======
# ══════════════════════════════════════════════
# DATA
# ══════════════════════════════════════════════
def load_and_preprocess():
    df = pd.read_csv(DATA_PATH)

>>>>>>> 1a7b081191bda78c0a336a23014ac432b3eed2c2
    numeric_cols = ["PM2.5", "PM10", "NO2", "CO", "SO2", "O3", "AQI"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            df[col] = df[col].fillna(df[col].median())

<<<<<<< HEAD
    # Parse date and add useful time features
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])
    df = df.sort_values("date").reset_index(drop=True)
    df["month"]     = df["date"].dt.month
    df["day_of_year"] = df["date"].dt.dayofyear
    df["year"]      = df["date"].dt.year

    # Round numerics to 2 decimal places for clean JSON output
    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].round(2)
=======
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"]).sort_values("date")
>>>>>>> 1a7b081191bda78c0a336a23014ac432b3eed2c2

    return df


<<<<<<< HEAD
# ══════════════════════════════════════════════════════════════════════════════
# 2.  MODEL TRAINING
# ══════════════════════════════════════════════════════════════════════════════

def train_model(df: pd.DataFrame):
    """
    Train a Random Forest Regressor to predict AQI from FEATURES.
    Returns: (model, scaler, metrics_dict)
    """
    X = df[FEATURES].copy()
    y = df[TARGET].copy()

    # 80/20 temporal split (keep chronological order)
    split_idx    = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    # Scale features
    scaler  = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    # Random Forest – tuned for speed while maintaining accuracy
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train_s, y_train)

    # Evaluation metrics
    y_pred = model.predict(X_test_s)
    metrics = {
        "mae":   round(float(mean_absolute_error(y_test, y_pred)), 2),
        "r2":    round(float(r2_score(y_test, y_pred)), 4),
        "rmse":  round(float(np.sqrt(np.mean((y_test.values - y_pred) ** 2))), 2),
    }
    return model, scaler, metrics


# ══════════════════════════════════════════════════════════════════════════════
# 3.  SIMPLE MOVING-AVERAGE FORECAST
# ══════════════════════════════════════════════════════════════════════════════

def simple_forecast(series: pd.Series, steps: int = 14) -> list[float]:
    """
    Predict next `steps` AQI values using an exponentially weighted
    moving average (EWMA) with a seasonal offset derived from last year's data.
    Falls back to trailing mean if history is short.
    """
    if len(series) < 30:
        mean_val = float(series.mean())
        return [round(mean_val, 1)] * steps

    # EWMA smoothed baseline
    smoothed = series.ewm(span=30, adjust=False).mean()
    last_smooth = float(smoothed.iloc[-1])

    # Trend (slope over last 60 days)
    window = min(60, len(series))
    slope  = float(series.iloc[-1] - series.iloc[-window]) / window

    # Seasonal noise based on historical standard deviation
    hist_std = float(series.std())
    np.random.seed(7)
    noise = np.random.normal(0, hist_std * 0.12, steps)

    forecasted = []
    for i in range(steps):
        val = last_smooth + slope * (i + 1) * 0.3 + noise[i]
        val = max(0.0, min(500.0, val))
        forecasted.append(round(val, 1))
    return forecasted


# ══════════════════════════════════════════════════════════════════════════════
# 4.  AQI CATEGORY HELPER
# ══════════════════════════════════════════════════════════════════════════════

def aqi_category(aqi_val: float) -> dict:
    """Map AQI value to category, colour, and policy recommendation."""
    if aqi_val > 400:
        return {
            "category": "Severe+",
            "color": "#7B0D1E",
            "policy": (
                "🚨 EMERGENCY: All schools, colleges & offices shut. "
                "Complete ban on construction & heavy vehicles. "
                "Odd-even vehicle rationing enforced. "
                "Stay indoors with air purifiers running."
            )
        }
    elif aqi_val > 300:
        return {
            "category": "Severe",
            "color": "#C0392B",
            "policy": (
                "🔴 SEVERE: Emergency health advisory issued. "
                "Schools closed. Avoid all outdoor activities. "
                "Use N95 masks if going out. "
                "Graded Response Action Plan (GRAP) Stage IV activated."
            )
        }
    elif aqi_val > 200:
        return {
            "category": "Very Poor",
            "color": "#E67E22",
            "policy": (
                "🟠 VERY POOR: Restrict outdoor activities for children & elderly. "
                "N95 masks recommended outdoors. "
                "GRAP Stage II/III measures enforced. "
                "Industries on clean-fuel only."
            )
        }
    elif aqi_val > 100:
        return {
            "category": "Poor",
            "color": "#F39C12",
            "policy": (
                "🟡 POOR: Sensitive groups should avoid prolonged outdoor exposure. "
                "Reduce vehicle use, prefer public transport. "
                "Anti-smog guns deployed at major intersections."
            )
        }
    elif aqi_val > 50:
        return {
            "category": "Moderate",
            "color": "#2ECC71",
            "policy": (
                "🟢 MODERATE: Acceptable air quality. "
                "Continue routine activity monitoring. "
                "Maintain green cover & dust suppression measures."
            )
        }
    else:
        return {
            "category": "Good",
            "color": "#27AE60",
            "policy": "✅ GOOD: Air quality is satisfactory. No restrictions needed."
        }


# ══════════════════════════════════════════════════════════════════════════════
# 5.  STARTUP: Load data + train model once at boot
# ══════════════════════════════════════════════════════════════════════════════

print("⏳ Loading and preprocessing data…")
df_clean = load_and_preprocess()
print(f"✅ Data loaded: {len(df_clean)} rows, {df_clean['date'].min().date()} → {df_clean['date'].max().date()}")

print("⏳ Training Random Forest model…")
rf_model, scaler, model_metrics = train_model(df_clean)
print(f"✅ Model trained | MAE={model_metrics['mae']} | R²={model_metrics['r2']}")

# Pre-compute feature importances (sorted descending)
importances_raw = rf_model.feature_importances_
feature_importance_data = [
    {"feature": feat, "importance": round(float(imp), 4)}
    for feat, imp in sorted(zip(FEATURES, importances_raw), key=lambda x: -x[1])
]


# ══════════════════════════════════════════════════════════════════════════════
# 6.  FASTAPI APPLICATION
# ══════════════════════════════════════════════════════════════════════════════

if HAS_FASTAPI:
    app = FastAPI(
        title="Delhi AQI Pollution Dashboard API",
        description="AI-driven pollution source identification & AQI forecasting for Delhi-NCR",
        version="1.0.0",
    )

    # Allow frontend dev server (Vite default port 5173) and production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173",
                       "http://localhost:3000", "http://127.0.0.1:3000", "*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── GET /health ────────────────────────────────────────────────────────
    @app.get("/health", tags=["Health"])
    def health():
        return {"status": "ok", "rows": len(df_clean), "model_metrics": model_metrics}

    # ── GET /data ──────────────────────────────────────────────────────────
    @app.get("/data", tags=["Data"])
    def get_data(limit: int = Query(default=365, ge=10, le=730)):
        """
        Return cleaned AQI + pollutant time-series (latest `limit` rows).
        Used by the frontend trend chart.
        """
        cols = ["date", "location", "PM2.5", "PM10", "NO2", "CO", "SO2", "AQI"]
        subset = df_clean[cols].tail(limit).copy()
        subset["date"] = subset["date"].dt.strftime("%Y-%m-%d")

        # Aggregate by date (mean across locations for the day)
        daily = (
            subset.groupby("date")[["PM2.5","PM10","NO2","CO","SO2","AQI"]]
            .mean()
            .round(2)
            .reset_index()
        )
        return {
            "data": daily.to_dict(orient="records"),
            "total": len(daily),
        }

    # ── GET /importance ────────────────────────────────────────────────────
    @app.get("/importance", tags=["ML"])
    def get_importance():
        """
        Return Random Forest feature importances.
        Represents each pollutant's contribution to AQI prediction
        (proxy for pollution source identification).
        """
        total = sum(f["importance"] for f in feature_importance_data)
        enriched = [
            {
                **f,
                "percentage": round(f["importance"] / total * 100, 1),
            }
            for f in feature_importance_data
        ]
        return {
            "features": enriched,
            "model_metrics": model_metrics,
            "interpretation": (
                "Feature importance indicates each pollutant's relative contribution "
                "to AQI prediction. Higher values suggest that pollutant is a primary "
                "driver of air quality degradation in Delhi-NCR."
            ),
        }

    # ── GET /predict ───────────────────────────────────────────────────────
    @app.get("/predict", tags=["ML"])
    def predict_aqi(
        pm25: float = Query(..., ge=0, le=500, description="PM2.5 µg/m³"),
        pm10: float = Query(..., ge=0, le=800, description="PM10 µg/m³"),
        no2:  float = Query(..., ge=0, le=300, description="NO2 µg/m³"),
        co:   float = Query(..., ge=0, le=10,  description="CO mg/m³"),
    ):
        """
        Predict AQI from raw pollutant readings using the trained Random Forest.
        Returns predicted AQI, category, and policy recommendation.
        """
        input_arr  = np.array([[pm25, pm10, no2, co]])
        scaled_arr = scaler.transform(input_arr)
        predicted  = float(rf_model.predict(scaled_arr)[0])
        predicted  = round(max(0.0, min(500.0, predicted)), 1)

        cat_info = aqi_category(predicted)

        return {
            "predicted_aqi": predicted,
            "inputs": {"PM2.5": pm25, "PM10": pm10, "NO2": no2, "CO": co},
            **cat_info,
        }

    # ── GET /forecast ──────────────────────────────────────────────────────
    @app.get("/forecast", tags=["ML"])
    def get_forecast(days: int = Query(default=14, ge=3, le=30)):
        """
        Return next `days` AQI predictions using EWMA-based forecasting.
        """
        from datetime import datetime, timedelta

        last_date  = df_clean["date"].max()
        aqi_series = df_clean["AQI"]

        forecasted_values = simple_forecast(aqi_series, steps=days)

        results = []
        for i, val in enumerate(forecasted_values):
            future_date = last_date + timedelta(days=i + 1)
            cat_info    = aqi_category(val)
            results.append({
                "date":     future_date.strftime("%Y-%m-%d"),
                "forecast_aqi": val,
                "category": cat_info["category"],
                "color":    cat_info["color"],
            })

        return {
            "forecast": results,
            "last_known_date": last_date.strftime("%Y-%m-%d"),
            "last_known_aqi":  round(float(aqi_series.iloc[-1]), 1),
        }

    # ── GET /stats ─────────────────────────────────────────────────────────
    @app.get("/stats", tags=["Data"])
    def get_stats():
        """Summary statistics and location-wise average AQI for the map."""
        stats = {}
        for col in ["PM2.5", "PM10", "NO2", "CO", "AQI"]:
            stats[col] = {
                "mean":   round(float(df_clean[col].mean()), 2),
                "max":    round(float(df_clean[col].max()), 2),
                "min":    round(float(df_clean[col].min()), 2),
                "median": round(float(df_clean[col].median()), 2),
            }

        # Location-wise AQI averages with lat/lng for map
        location_coords = {
            "Anand Vihar":      {"lat": 28.6469, "lng": 77.3152},
            "Dwarka":           {"lat": 28.5921, "lng": 77.0460},
            "ITO":              {"lat": 28.6289, "lng": 77.2414},
            "Rohini":           {"lat": 28.7495, "lng": 77.0660},
            "Punjabi Bagh":     {"lat": 28.6726, "lng": 77.1313},
            "Mandir Marg":      {"lat": 28.6361, "lng": 77.1990},
            "RK Puram":         {"lat": 28.5638, "lng": 77.1742},
            "Lodhi Road":       {"lat": 28.5923, "lng": 77.2290},
            "Noida Sector 62":  {"lat": 28.6278, "lng": 77.3649},
            "Gurugram":         {"lat": 28.4595, "lng": 77.0266},
        }

        loc_aqi = (
            df_clean.groupby("location")["AQI"]
            .mean()
            .round(1)
            .reset_index()
            .rename(columns={"AQI": "avg_aqi"})
        )

        locations_data = []
        for _, row in loc_aqi.iterrows():
            loc  = row["location"]
            avg  = float(row["avg_aqi"])
            info = aqi_category(avg)
            coord = location_coords.get(loc, {"lat": 28.6139, "lng": 77.2090})
            locations_data.append({
                "location": loc,
                "avg_aqi": avg,
                "category": info["category"],
                "color":    info["color"],
                **coord,
            })

        return {
            "statistics": stats,
            "locations": locations_data,
            "date_range": {
                "start": df_clean["date"].min().strftime("%Y-%m-%d"),
                "end":   df_clean["date"].max().strftime("%Y-%m-%d"),
            }
        }


# ══════════════════════════════════════════════════════════════════════════════
# 7.  ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    if __name__ == "__main__":
    print("Run using: uvicorn main:app --host 0.0.0.0 --port 10000")
=======
# ══════════════════════════════════════════════
# MODEL
# ══════════════════════════════════════════════
def train_model(df):
    X = df[FEATURES]
    y = df[TARGET]

    split = int(len(df) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    model = RandomForestRegressor(n_estimators=100)
    model.fit(X_train, y_train)

    pred = model.predict(X_test)

    return model, scaler, {
        "mae": round(mean_absolute_error(y_test, pred), 2),
        "r2": round(r2_score(y_test, pred), 2)
    }


# ══════════════════════════════════════════════
# STARTUP
# ══════════════════════════════════════════════
print("Loading data...")
df = load_and_preprocess()

print("Training model...")
model, scaler, metrics = train_model(df)

print("Model ready:", metrics)


# ══════════════════════════════════════════════
# FASTAPI
# ══════════════════════════════════════════════
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "API Running 🚀"}


@app.get("/health")
def health():
    return {"status": "ok", "metrics": metrics}


@app.get("/predict")
def predict(pm25: float, pm10: float, no2: float, co: float):
    data = np.array([[pm25, pm10, no2, co]])
    data = scaler.transform(data)
    pred = model.predict(data)[0]

    return {"predicted_aqi": round(float(pred), 2)}


# ══════════════════════════════════════════════
# ENTRY POINT (FIXED FOR RENDER)
# ══════════════════════════════════════════════
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # IMPORTANT

    print(f"🚀 Server running on port {port}")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",   # IMPORTANT FIX
        port=port,
        reload=False
    )
>>>>>>> 1a7b081191bda78c0a336a23014ac432b3eed2c2
