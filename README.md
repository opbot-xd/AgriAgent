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

## 🚀 Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- OpenAI API key (optional but recommended)
- Weather API key (OpenWeatherMap)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd agriagent
```

### 2. Create Environment File

Create a `.env` file in the root directory:

```env
# API Keys
OPENAI_API_KEY=your_openai_api_key_here
WEATHER_API_KEY=your_openweather_api_key_here

# Database Configuration
POSTGRES_DB=agriagent
POSTGRES_USER=agriuser
POSTGRES_PASSWORD=agripass123

# Security
SECRET_KEY=your-very-secret-key-change-this-in-production

# Optional: AWS S3 for file storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_bucket_name
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
- **ChromaDB**: http://localhost:8100

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

3. **Setup PostgreSQL**

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE agriagent;
CREATE USER agriuser WITH PASSWORD 'agripass123';
GRANT ALL PRIVILEGES ON DATABASE agriagent TO agriuser;

-- Connect to agriagent database and run schema
\c agriagent;
\i schema.sql
```

4. **Setup Redis**

```bash
# Install Redis (Ubuntu/Debian)
sudo apt-get install redis-server
sudo systemctl start redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:alpine
```

5. **Configure Environment**

```bash
export DATABASE_URL="postgresql://agriuser:agripass123@localhost:5432/agriagent"
export REDIS_URL="redis://localhost:6379"
export SECRET_KEY="your-secret-key"
export OPENAI_API_KEY="your-openai-key"
export WEATHER_API_KEY="your-weather-key"
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

2. **Install Tailwind CSS**

```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography
npx tailwindcss init -p
```

3. **Configure Environment**

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
agriagent/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── schema.sql           # Database schema
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # Backend Docker configuration
│   └── models/             # AI model storage
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── App.css         # Tailwind CSS styles
│   │   └── index.js        # React entry point
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   ├── tailwind.config.js  # Tailwind configuration
│   └── Dockerfile          # Frontend Docker configuration
├── docker-compose.yml       # Docker services configuration
├── .env                    # Environment variables
└── README.md              # This file
```

## 🔧 Configuration

### API Keys Setup

1. **OpenAI API Key** (Recommended)
   - Sign up at https://platform.openai.com/
   - Generate API key
   - Add to `.env` file

2. **Weather API Key** (Required)
   - Sign up at https://openweathermap.org/api
   - Generate free API key
   - Add to `.env` file

### Database Configuration

The application uses PostgreSQL for structured data and Redis for caching. ChromaDB is used for vector storage (RAG functionality).

### Model Configuration

The system downloads and caches AI models automatically:
- **Whisper**: For speech-to-text conversion
- **Sentence Transformers**: For text embeddings
- **ResNet-50**: For image classification (as placeholder for disease detection)

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Core Features
- `POST /chat` - Text chat queries
- `POST /image-upload` - Image analysis
- `POST /voice-search` - Voice query processing
- `GET /health` - Health check

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

- OpenAI for GPT models and Whisper
- Hugging Face for transformer models
- The agricultural research community
- Open source contributors

---

**AgriAgent**