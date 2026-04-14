"""
Delhi AQI Pollution Dashboard - FastAPI Backend
"""

import os
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent
DATA_PATH  = BASE_DIR / "data" / "raw_data.csv"

FEATURES = ["PM2.5", "PM10", "NO2", "CO"]
TARGET   = "AQI"


# ══════════════════════════════════════════════
# DATA
# ══════════════════════════════════════════════
def load_and_preprocess():
    df = pd.read_csv(DATA_PATH)

    numeric_cols = ["PM2.5", "PM10", "NO2", "CO", "SO2", "O3", "AQI"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            df[col] = df[col].fillna(df[col].median())

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"]).sort_values("date")

    return df


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
