"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import axios from "axios"
import "./App.css"

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000"
axios.defaults.baseURL = API_BASE_URL

// Set auth token from localStorage
const token = localStorage.getItem("token")
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
}

// Define prop types for Login component
interface LoginProps {
  onLogin: (token: string) => void;
}

// Login Component
const Login = ({ onLogin }: LoginProps) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    language_preference: "en",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register"
      const response = await axios.post(endpoint, formData)

      localStorage.setItem("token", response.data.access_token)
      localStorage.setItem("username", formData.username)
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`

      onLogin(formData.username)
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">AgriAgent</h1>
          <p className="text-gray-600">Your AI Agricultural Advisor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
              <select
                value={formData.language_preference}
                onChange={(e) => setFormData({ ...formData, language_preference: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="bn">Bengali</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="mr">Marathi</option>
                <option value="gu">Gujarati</option>
                <option value="pa">Punjabi</option>
              </select>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-green-600 hover:text-green-800 font-medium">
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component
const Dashboard = ({ username, onLogout }) => {
  const [activeMode, setActiveMode] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const modes = [
    {
      id: "chat",
      title: "Chat",
      description: "Ask farming questions in any language",
      icon: "💬",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "image",
      title: "Image Upload",
      description: "Upload crop images for disease detection",
      icon: "📸",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "voice",
      title: "Voice Search",
      description: "Record voice queries in any language",
      icon: "🎤",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ]

  if (activeMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          username={username}
          onLogout={onLogout}
          onBack={() => {
            setActiveMode(null)
            setResult(null)
          }}
        />
        <div className="container mx-auto px-4 py-8">
          {activeMode === "chat" && <ChatInterface onResult={setResult} setLoading={setLoading} loading={loading} />}
          {activeMode === "image" && <ImageInterface onResult={setResult} setLoading={setLoading} loading={loading} />}
          {activeMode === "voice" && <VoiceInterface onResult={setResult} setLoading={setLoading} loading={loading} />}

          {result && <ResultDisplay result={result} />}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header username={username} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to AgriAgent</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your intelligent agricultural advisor powered by AI. Get expert guidance for farming decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {modes.map((mode) => (
            <div
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{mode.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{mode.title}</h3>
                <p className="text-gray-600 mb-6">{mode.description}</p>
                <button className={`${mode.color} text-white px-6 py-3 rounded-lg font-medium transition-colors`}>
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">🌾</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Multilingual Support</h4>
                <p className="text-gray-600">Communicate in Hindi, Bengali, Tamil, Telugu, and more</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">AI-Powered Analysis</h4>
                <p className="text-gray-600">Advanced disease detection and crop recommendations</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">🌤️</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Weather Integration</h4>
                <p className="text-gray-600">Real-time weather data for better farming decisions</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Market Insights</h4>
                <p className="text-gray-600">Current market prices and trends for better sales timing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Header Component
const Header = ({ username, onLogout, onBack }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button onClick={onBack} className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50">
              ← Back
            </button>
          )}
          <h1 className="text-2xl font-bold text-green-800">AgriAgent</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">Welcome, {username}</span>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

// Chat Interface Component
const ChatInterface = ({ onResult, setLoading, loading }) => {
  const [message, setMessage] = useState("")
  const [language, setLanguage] = useState("en")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    try {
      const response = await axios.post("/chat", {
        message: message.trim(),
        language: language,
      })
      onResult(response.data)
    } catch (error) {
      onResult({
        error: error.response?.data?.detail || "Failed to process chat query",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">💬 Chat with AgriAgent</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
              <option value="pa">Punjabi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Question</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask any farming-related question..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Ask AgriAgent"}
          </button>
        </form>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Sample Questions:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• When should I water my wheat crop?</li>
              <li>• What fertilizer is best for tomatoes?</li>
              <li>• How to prevent pest attacks?</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Features:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Weather-based recommendations</li>
              <li>• Market price insights</li>
              <li>• Voice response available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Image Interface Component
const ImageInterface = ({ onResult, setLoading, loading }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [language, setLanguage] = useState("en")
  const [preview, setPreview] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setLoading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("language", language)

    try {
      const response = await axios.post("/image-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      onResult(response.data)
    } catch (error) {
      onResult({
        error: error.response?.data?.detail || "Failed to process image",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">📸 Crop Disease Detection</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
              <option value="pa">Punjabi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Crop Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Preview" className="max-w-full h-64 object-contain mx-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null)
                      setSelectedFile(null)
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-gray-600 mb-4">Drag and drop an image here, or click to select</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                  >
                    Select Image
                  </label>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing Image..." : "Analyze Crop Image"}
          </button>
        </form>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">📋 Tips for Best Results:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Take clear, well-lit photos of affected plant parts</li>
            <li>• Include close-ups of symptoms (spots, discoloration, etc.)</li>
            <li>• Ensure the image is in focus and not blurry</li>
            <li>• Include healthy parts for comparison if possible</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Voice Interface Component
const VoiceInterface = ({ onResult, setLoading, loading }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [language, setLanguage] = useState("en")
  const [audioBlob, setAudioBlob] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setAudioBlob(blob)
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      alert("Failed to access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!audioBlob) return

    setLoading(true)

    try {
      // Convert audio blob to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1]

        try {
          const response = await axios.post("/voice-search", {
            audio_data: base64Audio,
            language: language,
          })
          onResult(response.data)
        } catch (error) {
          onResult({
            error: error.response?.data?.detail || "Failed to process voice query",
          })
        } finally {
          setLoading(false)
        }
      }
      reader.readAsDataURL(audioBlob)
    } catch (error) {
      onResult({
        error: "Failed to process audio recording",
      })
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">🎤 Voice Search</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
              <option value="pa">Punjabi</option>
            </select>
          </div>

          <div className="text-center py-12">
            {!isRecording && !audioBlob && (
              <div>
                <div className="text-8xl mb-6">🎤</div>
                <p className="text-gray-600 mb-6">Click to start recording your question</p>
                <button
                  type="button"
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors"
                >
                  Start Recording
                </button>
              </div>
            )}

            {isRecording && (
              <div>
                <div className="text-8xl mb-6 animate-pulse">🔴</div>
                <p className="text-red-600 mb-6 font-medium">Recording in progress...</p>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors"
                >
                  Stop Recording
                </button>
              </div>
            )}

            {audioBlob && !isRecording && (
              <div>
                <div className="text-8xl mb-6">✅</div>
                <p className="text-green-600 mb-6 font-medium">Recording complete!</p>
                <div className="space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAudioBlob(null)
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Re-record
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Process Voice Query"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🎯 Voice Recording Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Ask specific farming questions</li>
            <li>• Use your preferred language naturally</li>
            <li>• Ensure quiet environment for best results</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Result Display Component
const ResultDisplay = ({ result }) => {
  const [playingAudio, setPlayingAudio] = useState(false)

  const playAudio = () => {
    if (result.audio_response) {
      const audio = new Audio(`data:audio/mp3;base64,${result.audio_response}`)
      setPlayingAudio(true)
      audio.play()
      audio.onended = () => setPlayingAudio(false)
    }
  }

  if (result.error) {
    return (
      <div className="mt-8 bg-red-50 border border-red-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
        <p className="text-red-700">{result.error}</p>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-gray-800">📋 AgriAgent Response</h3>
          {result.audio_response && (
            <button
              onClick={playAudio}
              disabled={playingAudio}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <span>{playingAudio ? "🔊" : "🔊"}</span>
              <span>{playingAudio ? "Playing..." : "Play Audio"}</span>
            </button>
          )}
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Your Query:</h4>
          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{result.query}</p>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-2">AI Response:</h4>
          <p className="text-gray-800 leading-relaxed">{result.response}</p>
        </div>

        {result.confidence && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Confidence Score:</h4>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${result.confidence * 100}%` }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{Math.round(result.confidence * 100)}%</p>
          </div>
        )}

        {result.recommendations && result.recommendations.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Recommendations:</h4>
            <ul className="list-disc list-inside space-y-1">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {result.weather_data && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-4 flex items-center">🌤️ Weather Information</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Temperature:</span> {result.weather_data.temperature}°C
              </p>
              <p>
                <span className="font-medium">Humidity:</span> {result.weather_data.humidity}%
              </p>
              <p>
                <span className="font-medium">Condition:</span> {result.weather_data.description}
              </p>
              <p>
                <span className="font-medium">Wind Speed:</span> {result.weather_data.wind_speed} m/s
              </p>
            </div>
          </div>
        )}

        {result.market_data && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-4 flex items-center">💰 Market Information</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Crop:</span> {result.market_data.crop}
              </p>
              <p>
                <span className="font-medium">Price:</span> ₹{result.market_data.price_per_quintal}/quintal
              </p>
              <p>
                <span className="font-medium">Market:</span> {result.market_data.market}
              </p>
              <p>
                <span className="font-medium">Trend:</span> {result.market_data.trend}
              </p>
            </div>
          </div>
        )}
      </div>

      {result.sources && result.sources.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">📚 Sources:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {result.sources.map((source, index) => (
              <li key={index}>• {source}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Main App Component
const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const username = localStorage.getItem("username")

    if (token && username) {
      setUser(username)
    }
    setLoading(false)
  }, [])

  const handleLogin = (username) => {
    setUser(username)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🌾</div>
          <p className="text-gray-600">Loading AgriAgent...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={user ? <Dashboard username={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
