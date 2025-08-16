import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

dataset: Optional[pd.DataFrame] = None

def load_dataset() -> pd.DataFrame:
    possible_paths = [
        "dataset/Agriculture_price_dataset.csv",
    ]
    dataset_path = None
    for path in possible_paths:
        if Path(path).exists():
            dataset_path = path
            break
    if not dataset_path:
        logger.error("Dataset file not found in expected locations")
        raise FileNotFoundError("Agriculture_price_dataset.csv not found")
    logger.info(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    df = df.dropna(subset=['STATE', 'District Name', 'Commodity', 'Price Date'])
    price_columns = ['Min_Price', 'Modal_Price', 'Max_Price']
    for col in price_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    df['Price Date'] = pd.to_datetime(df['Price Date'], errors='coerce')
    df = df.dropna(subset=['Price Date'])
    df = df.sort_values('Price Date')
    logger.info(f"Dataset loaded successfully: {len(df)} records")
    logger.info(f"Date range: {df['Price Date'].min()} to {df['Price Date'].max()}")
    logger.info(f"States: {df['STATE'].nunique()}")
    logger.info(f"Districts: {df['District Name'].nunique()}")
    logger.info(f"Crops: {df['Commodity'].nunique()}")
    return df

def calculate_linear_regression(x_values, y_values):
    n = len(x_values)
    if n < 2:
        return 0, y_values[0] if y_values else 0
    sum_x = sum(x_values)
    sum_y = sum(y_values)
    sum_xy = sum(x * y for x, y in zip(x_values, y_values))
    sum_xx = sum(x * x for x in x_values)
    denominator = n * sum_xx - sum_x * sum_x
    if denominator == 0:
        return 0, sum_y / n
    slope = (n * sum_xy - sum_x * sum_y) / denominator
    intercept = (sum_y - slope * sum_x) / n
    return slope, intercept

def calculate_mape(actual, predicted):
    if len(actual) != len(predicted) or len(actual) == 0:
        return 0
    errors = []
    for a, p in zip(actual, predicted):
        if a != 0:
            errors.append(abs((a - p) / a))
    return (sum(errors) / len(errors)) * 100 if errors else 0

def generate_forecast(data, price_type, forecast_days):
    if len(data) < 10:
        raise ValueError("Need at least 10 data points for forecasting")
    prices = data[price_type].values
    dates = data['date'].values
    x_values = list(range(len(prices)))
    slope, intercept = calculate_linear_regression(x_values, prices)
    window_size = min(30, len(prices))
    recent_prices = prices[-window_size:]
    moving_avg = np.mean(recent_prices)
    volatility = np.std(recent_prices)
    last_date = pd.to_datetime(dates[-1])
    forecast_data = []
    for i in range(1, forecast_days + 1):
        forecast_date = last_date + timedelta(days=i)
        trend_value = slope * (len(prices) + i) + intercept
        forecast_price = (moving_avg * 0.7) + (trend_value * 0.3)
        seasonal_factor = 1 + 0.1 * np.sin(2 * np.pi * i / 365)
        adjusted_price = max(0, forecast_price * seasonal_factor)
        forecast_data.append({
            'date': forecast_date.strftime('%Y-%m-%d'),
            'min_price': adjusted_price * 0.95,
            'modal_price': adjusted_price,
            'max_price': adjusted_price * 1.05,
            'is_forecast': True,
            'confidence_upper': adjusted_price + 1.96 * volatility,
            'confidence_lower': max(0, adjusted_price - 1.96 * volatility)
        })
    test_predictions = [slope * i + intercept for i in range(max(0, len(prices) - 30), len(prices))]
    test_actual = prices[-len(test_predictions):] if len(test_predictions) <= len(prices) else prices
    mape = calculate_mape(test_actual, test_predictions[:len(test_actual)])
    metrics = {
        'trend': 'Increasing' if slope > 0 else 'Decreasing',
        'avg_price': float(moving_avg),
        'volatility': float(volatility),
        'mape': float(mape),
        'data_points': len(data),
        'date_range': f"{dates[0]} to {dates[-1]}"
    }
    return forecast_data, metrics
