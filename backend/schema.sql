-- AgriAgent Database Schema
-- Run this script to set up the PostgreSQL database

-- Create database (run this separately if needed)
-- CREATE DATABASE agriagent;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    language_preference VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Queries table to store user interactions
CREATE TABLE IF NOT EXISTS queries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    query_type VARCHAR(20) NOT NULL, -- 'chat', 'image', 'voice'
    original_query TEXT NOT NULL,
    translated_query TEXT,
    response TEXT NOT NULL,
    confidence_score REAL,
    language VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Image uploads table
CREATE TABLE IF NOT EXISTS image_uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    query_id INTEGER REFERENCES queries(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    file_path TEXT,
    file_size INTEGER,
    disease_detected VARCHAR(255),
    confidence_score REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice queries table
CREATE TABLE IF NOT EXISTS voice_queries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    query_id INTEGER REFERENCES queries(id) ON DELETE CASCADE,
    audio_filename VARCHAR(255),
    audio_path TEXT,
    transcribed_text TEXT,
    original_language VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather data cache table
CREATE TABLE IF NOT EXISTS weather_cache (
    id SERIAL PRIMARY KEY,
    location VARCHAR(100),
    temperature REAL,
    humidity REAL,
    description VARCHAR(255),
    wind_speed REAL,
    pressure REAL,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Market data cache table
CREATE TABLE IF NOT EXISTS market_cache (
    id SERIAL PRIMARY KEY,
    crop VARCHAR(100),
    price_per_quintal REAL,
    market VARCHAR(255),
    date DATE,
    trend VARCHAR(20),
    demand VARCHAR(20),
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Agricultural knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100), -- 'pest', 'disease', 'crop', 'weather', 'soil'
    title VARCHAR(255),
    content TEXT,
    keywords TEXT[], -- Array of keywords for search
    language VARCHAR(10) DEFAULT 'en',
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    query_id INTEGER REFERENCES queries(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_queries_user_id ON queries(user_id);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at);
CREATE INDEX IF NOT EXISTS idx_image_uploads_user_id ON image_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_queries_user_id ON voice_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_location ON weather_cache(location);
CREATE INDEX IF NOT EXISTS idx_market_crop ON market_cache(crop);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_keywords ON knowledge_base USING GIN(keywords);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion
INSERT INTO knowledge_base (category, title, content, keywords, language, source) VALUES
('pest', 'Aphid Management', 'Aphids are small sap-sucking insects that can cause significant damage to crops. Early detection and integrated pest management approaches are recommended.', ARRAY['aphid', 'pest', 'insect', 'sap', 'management'], 'en', 'Agricultural Extension Manual'),
('disease', 'Late Blight in Potatoes', 'Late blight is a devastating disease affecting potato crops. Symptoms include brown spots on leaves and stems. Preventive fungicide application is crucial.', ARRAY['late blight', 'potato', 'fungus', 'disease', 'prevention'], 'en', 'Plant Pathology Guide'),
('crop', 'Wheat Variety Selection', 'Choose wheat varieties based on local climate conditions, soil type, and market demand. High-yielding varieties with disease resistance are preferred.', ARRAY['wheat', 'variety', 'selection', 'climate', 'yield'], 'en', 'Crop Production Manual'),
('weather', 'Irrigation Scheduling', 'Proper irrigation scheduling based on weather forecasts can save water and improve crop yields. Monitor soil moisture and weather patterns.', ARRAY['irrigation', 'weather', 'water', 'scheduling', 'moisture'], 'en', 'Water Management Guide'),
('soil', 'Soil pH Management', 'Most crops prefer slightly acidic to neutral soil pH (6.0-7.0). Regular soil testing and appropriate amendments are necessary for optimal growth.', ARRAY['soil', 'pH', 'acid', 'neutral', 'testing'], 'en', 'Soil Science Manual');

-- Create views for common queries
-- Drop old views if they exist
DROP VIEW IF EXISTS user_activity;
CREATE VIEW user_activity AS
SELECT 
    u.username,
    u.language_preference,
    COUNT(q.id) AS total_queries,
    COUNT(CASE WHEN q.query_type = 'chat' THEN 1 END) AS chat_queries,
    COUNT(CASE WHEN q.query_type = 'image' THEN 1 END) AS image_queries,
    COUNT(CASE WHEN q.query_type = 'voice' THEN 1 END) AS voice_queries,
    AVG(q.confidence_score) AS avg_confidence,
    u.created_at AS user_since
FROM users u
LEFT JOIN queries q ON u.id = q.user_id
GROUP BY u.id, u.username, u.language_preference, u.created_at;

DROP VIEW IF EXISTS recent_queries;
CREATE VIEW recent_queries AS
SELECT 
    u.username,
    q.query_type,
    q.original_query,
    q.confidence_score,
    q.created_at
FROM queries q
JOIN users u ON q.user_id = u.id
ORDER BY q.created_at DESC
LIMIT 100;

-- CREATE VIEW IF NOT EXISTS user_activity AS
-- SELECT 
--     u.username,
--     u.language_preference,
--     COUNT(q.id) as total_queries,
--     COUNT(CASE WHEN q.query_type = 'chat' THEN 1 END) as chat_queries,
--     COUNT(CASE WHEN q.query_type = 'image' THEN 1 END) as image_queries,
--     COUNT(CASE WHEN q.query_type = 'voice' THEN 1 END) as voice_queries,
--     AVG(q.confidence_score) as avg_confidence,
--     u.created_at as user_since
-- FROM users u
-- LEFT JOIN queries q ON u.id = q.user_id
-- GROUP BY u.id, u.username, u.language_preference, u.created_at;

-- CREATE VIEW IF NOT EXISTS recent_queries AS
-- SELECT 
--     u.username,
--     q.query_type,
--     q.original_query,
--     q.confidence_score,
--     q.created_at
-- FROM queries q
-- JOIN users u ON q.user_id = u.id
-- ORDER BY q.created_at DESC
-- LIMIT 100;