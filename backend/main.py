from fastapi import FastAPI
from routes.upload import router as upload_router
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="AgriAgent API")
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

# DB initialization
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def startup_event():
    await init_db()


@app.get("/")
async def root():
    return {"message": "AgriAgent backend is running"}
