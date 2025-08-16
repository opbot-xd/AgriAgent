# AgriAgent - Multimodal AI Agricultural Advisor

A comprehensive AI-powered agricultural advisory system that provides farmers with expert guidance through chat, image analysis, and voice queries in multiple Indian languages.

## 🌾 Features

- **Multilingual Chat**: Ask farming questions in Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, and English
- **Image Analysis**: Upload crop images for disease detection and treatment recommendations
- **Voice Queries**: Record voice messages in any supported language for hands-free interaction
- **Weather Integration**: Real-time weather data for location-specific advice
- **Market Insights**: Current market prices and trends
- **AI-Powered Responses**: Advanced machine learning models for accurate recommendations
- **Text-to-Speech**: Audio responses in the user's preferred language
- **Price Prediction** : Predict future crop prices using trained ML models.

## 🚀 Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- OpenAI API key (optional but recommended)
- Weather API key (OpenWeatherMap)

### 1. Clone the Repository

```bash
git clone https://github.com/opbot-xd/AgriAgent.git
cd agriagent
```

### 2. Create Environment File

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=sqlite+aiosqlite:///./agriagent.db

# Security
SECRET_KEY=your_super_secret_key

# Token
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Google Gemini/Generative AI
GOOGLE_API_KEY=your_google_api_key
GEMINI_API_KEY=your_gemini_api_key

# Dhenu AI
DHENU_API_KEY=your_dhenu_api_key

# Weather API
WEATHER_API_KEY=your_weather_api_key

# CORS
FRONTEND_URL=http://localhost:3000

#huggingface
HF_TOKEN=your_huggingface_token
HF_API_URL=https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_10_224-plant-disease-identification

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 3. Start the Application

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Manual Setup (Development)

### Backend Setup

1. **Create Virtual Environment**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**

```bash
pip install -r requirements.txt
```

5. **Create a .env file**

```bash
# Database
DATABASE_URL=sqlite+aiosqlite:///./agriagent.db

# Security
SECRET_KEY=your_super_secret_key

# Token
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Google Gemini/Generative AI
GOOGLE_API_KEY=your_google_api_key
GEMINI_API_KEY=your_gemini_api_key

# Dhenu AI
DHENU_API_KEY=your_dhenu_api_key

# Weather API
WEATHER_API_KEY=your_weather_api_key

# CORS
FRONTEND_URL=http://localhost:3000

#huggingface
HF_TOKEN=your_huggingface_token
HF_API_URL=https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

6. **Start Backend Server**

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install Node.js Dependencies**

```bash
cd frontend
npm install
```

2. **Configure Environment**

Create `.env` in frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

4. **Start Frontend Server**

```bash
npm start
```

## 📁 Project Structure

```
AgriAgent/
├── backend/ # FastAPI backend
│ ├── dataset/ # Training / data files
│ ├── models/ # AI/ML models
│ ├── routes/ # API route definitions
│ ├── schemas/ # Pydantic schemas
│ ├── services/ # Business logic and services
│ ├── utils/ # Utility/helper functions
│ ├── venv/ # Python virtual environment (local only, not in Docker)
│ ├── agriagent.db # SQLite database (dev)
│ ├── database.py # Database connection setup
│ ├── Dockerfile # Backend Docker configuration
│ ├── main.py # FastAPI entry point
│ ├── requirements.txt # Python dependencies
│ ├── schema.sql # Database schema (optional if using migrations)
│ ├── .env # Environment variables (local)
│ ├── .env.sample # Example environment file
│ └── README.md # Backend documentation
│
├── frontend/ # Next.js frontend
│ ├── app/ # App router (Next.js 13+)
│ ├── components/ # UI components
│ ├── lib/ # Utility libraries
│ ├── public/ # Static assets
│ ├── .next/ # Next.js build output (ignored in git)
│ ├── Dockerfile # Frontend Docker configuration
│ ├── package.json # Node.js dependencies
│ ├── package-lock.json # Lockfile
│ ├── tsconfig.json # TypeScript configuration
│ ├── next.config.ts # Next.js config
│ ├── eslint.config.mjs # ESLint config
│ ├── postcss.config.mjs # PostCSS config
│ ├── tailwind.config.js # Tailwind CSS configuration
│ ├── components.json # ShadCN components registry
│ ├── .env # Frontend environment variables
│ ├── .env.sample # Example environment file
│ └── README.md # Frontend documentation
│
├── docker-compose.yml # Docker services configuration
├── README.md # Main project documentation
└── .gitignore # Git ignore file
```
## 🔧 Configuration – API Keys

AgriAgent requires several API keys for different features.  
All keys should be added in the `.env` file located in the `backend/` directory.

### 1. Database
- **DATABASE_URL**  
  Default: `sqlite+aiosqlite:///./agriagent.db`  
  You can change this to PostgreSQL, MySQL, etc. if required.

---

### 2. Security
- **SECRET_KEY** – Any random secure string for JWT tokens.  
- **ALGORITHM** – Default: `HS256`  
- **ACCESS_TOKEN_EXPIRE_MINUTES** – Token validity in minutes (default: `60`).

---

### 3. Google Gemini / Generative AI
- **GOOGLE_API_KEY**  
  - Sign up at [Google AI Studio](https://ai.google.dev/)  
  - Generate an API key  
  - Add it here.  

- **GEMINI_API_KEY**  
  - Alternative Gemini key (if using a different project setup).  

---

### 4. Dhenu AI
- **DHENU_API_KEY**  
  - Required if using [Dhenu AI](https://dhenu.ai/) services.  

---

### 5. Weather API
- **WEATHER_API_KEY**  
  - Sign up at [OpenWeather](https://openweathermap.org/api)  
  - Generate a free API key  
  - Add it here.  

---

### 6. CORS
- **FRONTEND_URL**  
  - The URL of your frontend app.  
  - Example: `http://localhost:3000`

---

### 7. Hugging Face
- **HF_TOKEN**  
  - Get token from [Hugging Face](https://huggingface.co/settings/tokens)  
  - Required for model access.  

- **HF_API_URL**  
  - Default:  
    ```
    https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification
    ```  
  - Used for plant disease detection.

---

### 8. OpenAI
- **OPENAI_API_KEY**  
  - Sign up at [OpenAI](https://platform.openai.com/)  
  - Generate API key  
  - Add it here.  

---

## 🌐 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login

### Core Features
- `POST /chat` - Text chat queries and also voice queries
- `POST /upload` - Image analysis
- `POST /forecast` - predict future rates of your crop


### API Documentation
Visit http://localhost:8000/docs for interactive API documentation.

## 🌍 Supported Languages

- English (en)
- Hindi (hi)
- Bengali (bn)
- Tamil (ta)
- Telugu (te)
- Marathi (mr)
- Gujarati (gu)
- Punjabi (pa)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- HTTPS support (configure in production)
- Input validation and sanitization
- Rate limiting (Redis-based)

## 🚀 Deployment

### Production Deployment with Docker

1. **Update Environment Variables**

```env
# Use strong secrets in production
SECRET_KEY=your-very-strong-secret-key-here
DATABASE_URL=postgresql://user:pass@prod-db:5432/agriagent

# Enable HTTPS
HTTPS_ENABLED=true
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/key.pem
```

2. **Build Production Images**

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### Cloud Deployment Options

#### AWS Deployment
- Use ECS/EKS for container orchestration
- RDS for PostgreSQL
- ElastiCache for Redis
- S3 for file storage

#### Google Cloud Platform
- Cloud Run for serverless deployment
- Cloud SQL for PostgreSQL
- Memorystore for Redis
- Cloud Storage for files

#### Azure Deployment
- Azure Container Instances
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure Blob Storage

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

### End-to-End Testing

```bash
# Install testing dependencies
pip install selenium pytest-selenium

# Run E2E tests
pytest tests/e2e/
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL configuration
   - Verify user permissions

2. **Redis Connection Error**
   - Ensure Redis server is running
   - Check REDIS_URL configuration

3. **AI Model Loading Issues**
   - Ensure sufficient disk space (models can be large)
   - Check internet connection for model downloads
   - Verify write permissions in models directory

4. **Audio Processing Issues**
   - Install ffmpeg: `sudo apt-get install ffmpeg`
   - Check microphone permissions in browser

### Performance Optimization

1. **Database Optimization**
   - Create appropriate indexes
   - Regular VACUUM and ANALYZE
   - Connection pooling

2. **Caching Strategy**
   - Redis for API responses
   - CDN for static assets
   - Browser caching headers

3. **Model Optimization**
   - Use quantized models for faster inference
   - Implement model caching
   - Consider GPU acceleration for production

## 📊 Monitoring and Logging

### Application Monitoring

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Monitor resource usage
docker stats
```

### Health Checks

The application includes health check endpoints:
- Backend: http://localhost:8000/health
- Database connectivity check
- Redis connectivity check

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check documentation at `/docs` endpoint
- Review troubleshooting section above

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic chat functionality
- ✅ Image upload and analysis
- ✅ Voice query processing
- ✅ Multi-language support

### Phase 2 (Planned)
- [ ] Advanced disease detection models
- [ ] SMS/WhatsApp integration
- [ ] Mobile application
- [ ] Offline mode improvements

### Phase 3 (Future)
- [ ] IoT sensor integration
- [ ] Advanced analytics dashboard
- [ ] Farmer community features
- [ ] Government scheme integration

## 🙏 Acknowledgments

- **[OpenAI](https://platform.openai.com/)** and **[Google Gemini](https://ai.google.dev/)** for providing powerful AI language models.  
- **[Hugging Face](https://huggingface.co/)** for open-source transformer models and APIs.  
- **Weather APIs** (for real-time weather and climate data integration).  
- **[Dhenu](https://github.com/your-dhenu-link-or-source)** – cattle dataset & resources for livestock-related insights.  
- The **agricultural research community** for datasets, insights, and continued innovation.  
- **Open-source contributors** whose projects, tools, and libraries made this work possible.  


---

**AgriAgent**