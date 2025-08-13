from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import jwt, bcrypt, uvicorn, os, io, json, base64, asyncio, aiofiles, tempfile
from datetime import datetime, timedelta

import requests
from PIL import Image

# --- Speech / NLP ---
import whisper
import gtts

# --- RAG: LangChain + Postgres (pgvector) ---
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import CSVLoader, PyPDFLoader
from langchain_postgres.vectorstores import PGVector
from langchain_huggingface import HuggingFaceEmbeddings

# --- DB / Cache ---
import redis
import psycopg2
from psycopg2.extras import RealDictCursor

# --- Vision: YOLOv8 (Ultralytics) ---
from ultralytics import YOLO

# -----------------------------------------------------------------------------
# App + CORS
# -----------------------------------------------------------------------------
app = FastAPI(title="AgriAgent API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Config (ENV)
# -----------------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/agriagent")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# YOLO model (OPTION A: classification weights, OPTION B: detection weights)
YOLO_WEIGHTS = os.getenv("YOLO_WEIGHTS", "./weights/plant_pest_cls.pt")  # e.g., trained on IP102 as classifier
# YOLO_WEIGHTS = os.getenv("YOLO_WEIGHTS", "./weights/plant_pest_det.pt")  # detection head

# Embeddings model (fast, small)
EMBED_MODEL = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# PGVector collection/table names
PGVECTOR_COLLECTION = os.getenv("PGVECTOR_COLLECTION", "agri_kb")

# -----------------------------------------------------------------------------
# Services / Models
# -----------------------------------------------------------------------------
security = HTTPBearer()
redis_client = redis.from_url(REDIS_URL)
whisper_model = whisper.load_model("base")

embeddings = HuggingFaceEmbeddings(model_name=EMBED_MODEL)

# Ultralytics YOLO model load
yolo_model = YOLO(YOLO_WEIGHTS)  # supports .predict on PIL bytes or path

# -----------------------------------------------------------------------------
# Pydantic
# -----------------------------------------------------------------------------
class UserCreate(BaseModel):
    username: str
    password: str
    language_preference: str = "en"

class UserLogin(BaseModel):
    username: str
    password: str

class ChatQuery(BaseModel):
    message: str
    language: str = "en"

class VoiceQuery(BaseModel):
    audio_data: str  # base64 audio
    language: str = "en"

class AgriResponse(BaseModel):
    query: str
    response: str
    confidence: float
    sources: List[str]
    weather_data: Optional[dict] = None
    market_data: Optional[dict] = None
    recommendations: List[str]
    audio_response: Optional[str] = None

# -----------------------------------------------------------------------------
# DB helpers
# -----------------------------------------------------------------------------
def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def ensure_pgvector():
    # Enable extension once
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    conn.commit(); conn.close()

ensure_pgvector()

# -----------------------------------------------------------------------------
# Auth helpers
# -----------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# -----------------------------------------------------------------------------
# Weather / Market
# -----------------------------------------------------------------------------
async def get_weather_data(location: str = "Delhi"):
    key = f"weather:{location}"
    cached = redis_client.get(key)
    if cached: return json.loads(cached)

    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={WEATHER_API_KEY}&units=metric"
        data = requests.get(url, timeout=8).json()
        info = {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"],
            "pressure": data["main"]["pressure"],
        }
        redis_client.setex(key, 1800, json.dumps(info))
        return info
    except Exception as e:
        return {"error": f"Weather data unavailable: {e}"}

async def get_market_data(crop: str = "wheat"):
    key = f"market:{crop}"
    cached = redis_client.get(key)
    if cached: return json.loads(cached)
    info = {
        "crop": crop, "price_per_quintal": 2100, "market": "APMC Delhi",
        "date": datetime.now().isoformat(), "trend": "rising", "demand": "high"
    }
    redis_client.setex(key, 3600, json.dumps(info))
    return info

# -----------------------------------------------------------------------------
# Translation (placeholder – NLLB client can be plugged here if needed)
# -----------------------------------------------------------------------------
def translate_text(text: str, target_lang: str = "en", source_lang: str = "hi"):
    return text if target_lang == source_lang else text  # stub to keep flow stable

# -----------------------------------------------------------------------------
# Vision: YOLO inference
# -----------------------------------------------------------------------------
async def detect_disease_or_pest(image_bytes: bytes):
    try:
        # YOLO expects a path/ndarray/PIL; we'll create a temp file for stability
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=True) as tf:
            tf.write(image_bytes); tf.flush()
            results = yolo_model.predict(source=tf.name, verbose=False)
        # Parse best result for first image
        r = results[0]

        # OPTION A: classification head
        if hasattr(r, "probs") and r.probs is not None:
            top_idx = int(r.probs.top1)
            label = r.names[top_idx]
            conf  = float(r.probs.top1conf)
            return {
                "detected_condition": label,
                "confidence": conf,
                "recommendations": [
                    "Remove affected leaves/parts",
                    "Consider targeted bio/chemical control per label",
                    "Improve field sanitation & airflow",
                    "Monitor leaf wetness + forecast alerts",
                ],
            }

        # OPTION B: detection head
        boxes = []
        if hasattr(r, "boxes") and r.boxes is not None:
            for b in r.boxes:
                cls_id = int(b.cls[0].item()); score = float(b.conf[0].item())
                boxes.append({"label": r.names[cls_id], "confidence": score})
        primary = max(boxes, key=lambda x: x["confidence"]) if boxes else {"label": "Unknown", "confidence": 0.0}
        return {
            "detected_condition": primary["label"],
            "confidence": primary["confidence"],
            "detections": boxes,
            "recommendations": [
                "Scout nearby plants for spread",
                "Use pheromone/sticky traps if insect",
                "Follow recommended IPM schedule",
            ],
        }
    except Exception as e:
        return {"error": f"YOLO inference failed: {e}"}

# -----------------------------------------------------------------------------
# LLM response (placeholder – swap with your Agri-LLaVA/GPT call)
# -----------------------------------------------------------------------------
async def generate_ai_response(query: str, context: dict):
    resp = (
        f"Based on '{query}', considering weather={context.get('weather',{})} "
        f"and market={context.get('market',{})}, follow region best practices and IPM."
    )
    return {"response": resp, "confidence": 0.85,
            "sources": ["Agri KB (pgvector)", "Weather API", "Market Data"]}

# -----------------------------------------------------------------------------
# TTS
# -----------------------------------------------------------------------------
def text_to_speech(text: str, language: str = "en"):
    try:
        tts = gtts.gTTS(text=text, lang=language, slow=False)
        buf = io.BytesIO(); tts.write_to_fp(buf); buf.seek(0)
        return base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return None

# -----------------------------------------------------------------------------
# Routes: Auth
# -----------------------------------------------------------------------------
@app.post("/auth/register")
async def register(user: UserCreate):
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute("SELECT username FROM users WHERE username = %s", (user.username,))
        if cur.fetchone(): raise HTTPException(status_code=400, detail="Username already exists")
        cur.execute(
            "INSERT INTO users (username, password_hash, language_preference) VALUES (%s, %s, %s)",
            (user.username, hash_password(user.password), user.language_preference)
        )
        conn.commit()
        token = create_access_token({"sub": user.username})
        return {"access_token": token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'conn' in locals(): conn.close()

@app.post("/auth/login")
async def login(user: UserLogin):
    try:
        conn = get_db_connection(); cur = conn.cursor()
        cur.execute("SELECT username, password_hash FROM users WHERE username = %s", (user.username,))
        db_user = cur.fetchone()
        if not db_user or not verify_password(user.password, db_user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_access_token({"sub": user.username})
        return {"access_token": token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'conn' in locals(): conn.close()

# -----------------------------------------------------------------------------
# Routes: Chat / Voice / Image
# -----------------------------------------------------------------------------
async def _handle_chat(query_text: str, language: str):
    english_query = translate_text(query_text, "en", language)
    weather_data = await get_weather_data()
    market_data = await get_market_data()
    ctx = {"weather": weather_data, "market": market_data}
    ai = await generate_ai_response(english_query, ctx)
    audio = text_to_speech(ai["response"], language)
    return AgriResponse(
        query=query_text, response=ai["response"], confidence=ai["confidence"],
        sources=ai["sources"], weather_data=weather_data, market_data=market_data,
        recommendations=["Monitor weather alerts", "Check mandi prices", "Follow IPM schedule"],
        audio_response=audio
    )

@app.post("/chat", response_model=AgriResponse)
async def chat_query(q: ChatQuery, username: str = Depends(verify_token)):
    return await _handle_chat(q.message, q.language)

@app.post("/image-upload", response_model=AgriResponse)
async def upload_image(file: UploadFile = File(...), language: str = Form("en"),
                       username: str = Depends(verify_token)):
    try:
        image_bytes = await file.read()
        disease_info = await detect_disease_or_pest(image_bytes)
        weather_data = await get_weather_data(); market_data = await get_market_data()

        if "error" in disease_info:
            text = f"Image analysis failed: {disease_info['error']}"
            conf = 0.0; recs = []
        else:
            text = f"Detected: {disease_info.get('detected_condition','Unknown')}"
            recs = disease_info.get("recommendations", [])
            conf = float(disease_info.get("confidence", 0.0))

        audio = text_to_speech(text, language)
        return AgriResponse(
            query="Image upload for disease/pest detection",
            response=text, confidence=conf,
            sources=["YOLOv8 model", "Agri Knowledge Base"],
            weather_data=weather_data, market_data=market_data,
            recommendations=recs, audio_response=audio
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice-search", response_model=AgriResponse)
async def voice_search(q: VoiceQuery, username: str = Depends(verify_token)):
    try:
        audio_bytes = base64.b64decode(q.audio_data)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tf:
            tf.write(audio_bytes); tf.flush()
            result = whisper_model.transcribe(tf.name)
        return await _handle_chat(result["text"], q.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# -----------------------------------------------------------------------------
# RAG ingestion endpoint (CSV/PDF)
# -----------------------------------------------------------------------------
@app.post("/ingest")
async def ingest_knowledge(files: List[UploadFile] = File(...), username: str = Depends(verify_token)):
    """
    Upload CSV/PDF datasets (ICRISAT, MoSPI, price sheets, etc.)
    We: load -> split -> embed -> upsert into pgvector (collection=PGVECTOR_COLLECTION)
    """
    try:
        vectorstore = PGVector(
            embeddings=embeddings,
            collection_name=PGVECTOR_COLLECTION,
            connection_string=DATABASE_URL,
        )

        docs_all = []
        for f in files:
            suffix = os.path.splitext(f.filename.lower())[-1]
            path = f"/tmp/{datetime.utcnow().timestamp()}_{f.filename}"
            async with aiofiles.open(path, "wb") as out:
                content = await f.read(); await out.write(content)

            if suffix == ".csv":
                loader = CSVLoader(file_path=path, encoding="utf-8")
            elif suffix == ".pdf":
                loader = PyPDFLoader(path)
            else:
                # Fallback: treat as text
                async with aiofiles.open(path, "r", encoding="utf-8") as rf:
                    raw = await rf.read()
                from langchain_core.documents import Document
                docs_all.extend([Document(page_content=raw, metadata={"source": f.filename})])
                continue

            docs = loader.load()
            for d in docs:
                d.metadata = {**(d.metadata or {}), "source": f.filename}
            docs_all.extend(docs)

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        chunks = splitter.split_documents(docs_all)
        vectorstore.add_documents(chunks)  # upsert into Postgres (pgvector)
        return {"inserted": len(chunks), "collection": PGVECTOR_COLLECTION}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
