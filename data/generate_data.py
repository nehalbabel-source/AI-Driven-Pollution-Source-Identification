"""Generate a realistic synthetic Delhi AQI dataset for 2 years"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

np.random.seed(42)

# Generate 730 days of hourly-ish daily readings
n = 730
dates = [datetime(2022, 1, 1) + timedelta(days=i) for i in range(n)]

# Seasonal patterns: winter (Nov-Feb) is worst for Delhi pollution
def seasonal_factor(date):
    month = date.month
    if month in [11, 12, 1, 2]:   # Winter - severe
        return 1.8
    elif month in [3, 4]:          # Spring - moderate
        return 1.1
    elif month in [5, 6]:          # Pre-monsoon - moderate-high
        return 1.3
    elif month in [7, 8, 9]:       # Monsoon - better
        return 0.6
    else:                          # Post-monsoon Oct
        return 1.4

# Base pollutant generation
pm25_base  = np.array([np.random.normal(60, 20) * seasonal_factor(d) for d in dates])
pm10_base  = np.array([np.random.normal(100, 30) * seasonal_factor(d) for d in dates])
no2_base   = np.array([np.random.normal(40, 15) * seasonal_factor(d) for d in dates])
co_base    = np.array([np.random.normal(1.5, 0.5) * seasonal_factor(d) for d in dates])
so2_base   = np.array([np.random.normal(10, 5) * seasonal_factor(d) for d in dates])
o3_base    = np.array([np.random.normal(35, 12) for d in dates])

# Add noise & clip to realistic minimums
pm25 = np.clip(pm25_base + np.random.normal(0, 10, n), 5, 500)
pm10 = np.clip(pm10_base + np.random.normal(0, 15, n), 10, 800)
no2  = np.clip(no2_base  + np.random.normal(0, 8, n),  5, 300)
co   = np.clip(co_base   + np.random.normal(0, 0.3, n), 0.1, 10)
so2  = np.clip(so2_base  + np.random.normal(0, 3, n),  1, 100)
o3   = np.clip(o3_base   + np.random.normal(0, 8, n),  5, 200)

# AQI calculation (simplified India NAAQS-based)
def calc_aqi(pm25_val):
    if pm25_val <= 30:    return pm25_val * (50/30)
    elif pm25_val <= 60:  return 50 + (pm25_val - 30) * (50/30)
    elif pm25_val <= 90:  return 100 + (pm25_val - 60) * (100/30)
    elif pm25_val <= 120: return 200 + (pm25_val - 90) * (100/30)
    elif pm25_val <= 250: return 300 + (pm25_val - 120) * (100/130)
    else:                 return 400 + (pm25_val - 250) * (100/130)

aqi = np.array([calc_aqi(v) for v in pm25])
aqi = np.clip(aqi + np.random.normal(0, 10, n), 0, 500)

# Introduce ~2% missing values randomly
def add_missing(arr, pct=0.02):
    result = arr.copy().astype(float)
    idx = np.random.choice(len(result), int(len(result)*pct), replace=False)
    result[idx] = np.nan
    return result

locations = ['Anand Vihar', 'Dwarka', 'ITO', 'Rohini', 'Punjabi Bagh',
             'Mandir Marg', 'RK Puram', 'Lodhi Road', 'Noida Sector 62', 'Gurugram']

df = pd.DataFrame({
    'date': [d.strftime('%Y-%m-%d') for d in dates],
    'location': np.random.choice(locations, n),
    'PM2.5': add_missing(pm25),
    'PM10':  add_missing(pm10),
    'NO2':   add_missing(no2),
    'CO':    add_missing(co),
    'SO2':   add_missing(so2),
    'O3':    add_missing(o3),
    'AQI':   add_missing(aqi)
})

df.to_csv('/home/claude/delhi-aqi/data/raw_data.csv', index=False)
print(f"Generated {len(df)} rows")
print(df.describe())
