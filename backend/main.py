from fastapi import FastAPI
from routes.upload import router as upload_router
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.forecast import router as forecast_router
from database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from services import forecast_service

# Global variable to store locations (loaded once at startup)
LOCATIONS_CACHE = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - Load locations data once
    global LOCATIONS_CACHE
    print("🚀 Starting AgriAgent API...")
    
    # Initialize database first
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database initialized")
    
    # Load locations data
    try:
        print("📊 Loading locations data at startup...")
        df = forecast_service.load_dataset()
        
        print(f"🔄 Processing {len(df)} records...")
        states = sorted(df['STATE'].unique())
        
        districts = {}
        crops = {}
        
        for state in states:
            state_df = df[df['STATE'] == state]
            districts[state] = sorted(state_df['District Name'].unique())
            crops[state] = {}
            
            for district in districts[state]:
                district_df = state_df[state_df['District Name'] == district]
                crops[state][district] = sorted(district_df['Commodity'].unique())
        
        LOCATIONS_CACHE = {
            "states": states,
            "districts": districts,
            "crops": crops
        }
        
        print(f"✅ Locations cache loaded successfully!")
        print(f"   📍 States: {len(states)}")
        print(f"   🏘️  Total Districts: {sum(len(d) for d in districts.values())}")
        print(f"   🌾 Total Crops: {len(df['Commodity'].unique())}")
        print(f"   ⚡ Ready for instant responses!")
        
    except Exception as e:
        print(f"❌ Failed to load locations cache: {e}")
        raise
    
    yield
    
    # Shutdown cleanup
    print("🔄 Shutting down AgriAgent API...")

# Create FastAPI app with lifespan
app = FastAPI(
    title="AgriAgent API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router, prefix="/upload", tags=["Upload"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(forecast_router, prefix="/forecast", tags=["Forecast"])

@app.get("/")
async def root():
    return {"message": "AgriAgent backend is running"}

# Export the cache for use in routes
def get_locations_cache():
    """Get the pre-loaded locations cache"""
    return LOCATIONS_CACHE