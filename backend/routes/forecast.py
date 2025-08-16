from fastapi import APIRouter, Query, HTTPException
from services import forecast_service
from schemas.forecast import ForecastRequest, ForecastResponse, LocationInfo, PriceData
import requests
import pandas as pd

router = APIRouter(tags=["Forecast"])

@router.post("", response_model=ForecastResponse)
async def get_forecast(request: ForecastRequest):
    try:
        df = forecast_service.load_dataset()
        
        # Debug: Print available columns
        print(f"Available columns: {list(df.columns)}")
        
        # Try district-level data first
        data = df[(df['STATE'] == request.state) & (df['District Name'] == request.district) & (df['Commodity'] == request.crop)].copy()
        if data.empty:
            # Fallback to state-level data if district not found
            data = df[(df['STATE'] == request.state) & (df['Commodity'] == request.crop)].copy()
        if data.empty:
            raise ValueError(f"No data found for crop '{request.crop}' in state '{request.state}' and district '{request.district}'")
        
        # Debug: Print columns in filtered data
        print(f"Filtered data columns: {list(data.columns)}")
        
        # Rename columns to match your exact CSV structure
        data = data.rename(columns={
            'Price Date': 'date',
            'Min_Price': 'min_price',
            'Modal_Price': 'modal_price', 
            'Max_Price': 'max_price',
        })
        
        # Select and sort data
        data = data[['date', 'min_price', 'modal_price', 'max_price']].sort_values('date')
        
        # Convert date column to datetime if it's not already
        if data['date'].dtype == 'object':
            data['date'] = pd.to_datetime(data['date'])
        
        historical = [PriceData(
            date=row['date'].strftime('%Y-%m-%d'),
            min_price=float(row['min_price']),
            modal_price=float(row['modal_price']),
            max_price=float(row['max_price']),
            is_forecast=False
        ) for _, row in data.iterrows()]
        
        forecast_data, metrics = forecast_service.generate_forecast(data, request.price_type.lower(), request.forecast_days)
        forecast = [PriceData(**item) for item in forecast_data]
        
        summary = {
            "trend": metrics.get("trend"), 
            "avg_price": metrics.get("avg_price"), 
            "volatility": metrics.get("volatility"), 
            "mape": metrics.get("mape")
        }
        
        return ForecastResponse(
            historical_data=historical[-30:],
            forecast_data=forecast,
            metrics=metrics,
            summary=summary
        )
        
    except Exception as e:
        print(f"Forecast error: {str(e)}")
        # Return proper error response that matches the schema
        raise HTTPException(status_code=400, detail=str(e))

# Ultra-fast locations endpoint using startup cache
@router.get("/locations", response_model=LocationInfo)
async def get_forecast_locations():
    """Get all available locations and crops - instant response!"""
    # Import here to avoid circular imports
    from main import get_locations_cache
    
    locations_cache = get_locations_cache()
    if locations_cache is None:
        raise HTTPException(status_code=503, detail="Location data not loaded yet, please try again in a moment")
    
    return LocationInfo(**locations_cache)

# Optional: Health check endpoint to verify cache status
@router.get("/locations/health")
async def locations_health():
    """Check if location cache is loaded and ready"""
    from main import get_locations_cache
    
    locations_cache = get_locations_cache()
    return {
        "status": "ready" if locations_cache is not None else "loading",
        "states_count": len(locations_cache["states"]) if locations_cache else 0,
        "districts_count": sum(len(d) for d in locations_cache["districts"].values()) if locations_cache else 0,
        "message": "Location data loaded and ready for instant responses" if locations_cache else "Still loading..."
    }

@router.get("/reverse-geocode")
async def reverse_geocode(lat: float = Query(...), lon: float = Query(...)):
    """Reverse geocode lat/lon to district and state using Nominatim."""
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
        headers = {
            "User-Agent": "AgriAgent/1.0 (your-email@example.com)"
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        address = data.get('address', {})
        # Try to get the most specific district name available
        district = address.get('county') or address.get('state_district') or address.get('city_district') or address.get('city') or ''
        state = address.get('state') or ''
        
        return {"district": district, "state": state}
    except Exception as e:
        return {"error": str(e)}