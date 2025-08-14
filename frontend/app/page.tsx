"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Camera,
  Mic,
  Leaf,
  CloudRain,
  TrendingUp,
  Bot,
  ArrowLeft,
  Play,
  RotateCcw,
  Upload,
  CheckCircle,
  AlertCircle,
  Sun,
  Droplets,
  Wind,
  DollarSign,
  BookOpen,
  Users,
  Award,
  Zap,
} from "lucide-react"

// Mock API functions (replace with actual API calls)
const mockAPI = {
  login: async (credentials: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { access_token: "mock-token", user: credentials.username }
  },
  register: async (userData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { access_token: "mock-token", user: userData.username }
  },
  chat: async (data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return {
      query: data.message,
      response:
        "Based on your query about crop irrigation, I recommend watering your wheat crop early morning (6-8 AM) when temperatures are cooler. This reduces water loss through evaporation and allows better absorption. Monitor soil moisture at 6-inch depth - water when it feels dry.",
      confidence: 0.92,
      recommendations: [
        "Water early morning or late evening",
        "Check soil moisture before watering",
        "Use drip irrigation for efficiency",
        "Monitor weather forecast for rain",
      ],
      weather_data: {
        temperature: 28,
        humidity: 65,
        description: "Partly cloudy",
        wind_speed: 12,
      },
      audio_response: null,
    }
  },
  imageUpload: async (formData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return {
      query: "Crop disease analysis",
      response:
        "The uploaded image shows signs of early blight on tomato leaves. This fungal disease appears as dark spots with concentric rings. Immediate treatment is recommended to prevent spread.",
      confidence: 0.87,
      recommendations: [
        "Apply copper-based fungicide spray",
        "Remove affected leaves immediately",
        "Improve air circulation around plants",
        "Avoid overhead watering",
      ],
    }
  },
  voiceSearch: async (data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 2500))
    return {
      query: "Voice query about fertilizer timing",
      response:
        "For optimal fertilizer application, apply nitrogen-rich fertilizer during the vegetative growth stage, typically 3-4 weeks after planting. Split the application into 2-3 doses for better nutrient uptake.",
      confidence: 0.89,
      recommendations: [
        "Apply during early morning",
        "Water thoroughly after application",
        "Split fertilizer doses for better uptake",
        "Test soil pH before application",
      ],
    }
  },
}

// Enhanced Login Component
const Login = ({ onLogin }: { onLogin: (username: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    language_preference: "en",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = isLogin ? await mockAPI.login(formData) : await mockAPI.register(formData)

      localStorage.setItem("token", response.access_token)
      localStorage.setItem("username", formData.username)
      onLogin(formData.username)
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen agriculture-gradient agriculture-pattern flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 rounded-full blur-3xl floating-animation"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime-400/20 rounded-full blur-3xl floating-animation"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <Card className="w-full max-w-md leaf-shadow grow-animation relative z-10 border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-2">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-serif font-bold text-green-800">AgriAgent</CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              Empowering Your Farm with Smart Insights
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="h-12"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                  Preferred Language
                </Label>
                <Select
                  value={formData.language_preference}
                  onValueChange={(value) => setFormData({ ...formData, language_preference: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="bn">Bengali</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                    <SelectItem value="gu">Gujarati</SelectItem>
                    <SelectItem value="pa">Punjabi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced Dashboard Component
const Dashboard = ({ username, onLogout }: { username: string; onLogout: () => void }) => {
  const [activeMode, setActiveMode] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const modes = [
    {
      id: "chat",
      title: "Smart Chat",
      description: "Ask farming questions in any language",
      icon: MessageCircle,
      color: "bg-blue-500 hover:bg-blue-600",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "image",
      title: "Disease Detection",
      description: "Upload crop images for AI analysis",
      icon: Camera,
      color: "bg-green-500 hover:bg-green-600",
      gradient: "from-green-500 to-green-600",
    },
    {
      id: "voice",
      title: "Voice Assistant",
      description: "Record voice queries in any language",
      icon: Mic,
      color: "bg-purple-500 hover:bg-purple-600",
      gradient: "from-purple-500 to-purple-600",
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
    <div className="min-h-screen agriculture-gradient agriculture-pattern">
      <Header username={username} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div
              className="absolute top-20 right-1/3 w-1 h-1 bg-lime-400 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-32 left-1/2 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Agricultural Intelligence
          </div>

          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-800 mb-6 leading-tight">
            Empowering Your Farm with{" "}
            <span className="bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent">
              Smart Insights
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get personalized crop advice, real-time weather updates, and tailored irrigation guidance powered by
            advanced AI technology designed specifically for modern farmers.
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {modes.map((mode, index) => {
            const IconComponent = mode.icon
            return (
              <Card
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className="cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 bg-white/90 backdrop-blur-sm leaf-shadow group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-serif font-bold text-gray-800 mb-3">{mode.title}</CardTitle>
                  <CardDescription className="text-gray-600 mb-6 text-base leading-relaxed">
                    {mode.description}
                  </CardDescription>
                  <Button
                    className={`${mode.color} text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 group-hover:shadow-lg`}
                  >
                    Start Now for a Greener Tomorrow
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Section */}
        <Card className="max-w-6xl mx-auto border-0 bg-white/90 backdrop-blur-sm leaf-shadow">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-serif font-bold text-gray-800 mb-4">Why Choose AgriAgent?</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Advanced features designed to revolutionize your farming experience
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8 p-8">
            {[
              {
                icon: Users,
                title: "Multilingual Support",
                description: "Communicate in Hindi, Bengali, Tamil, Telugu, and 5+ more languages",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: Bot,
                title: "AI-Powered Analysis",
                description: "Advanced disease detection and personalized crop recommendations",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: CloudRain,
                title: "Weather Integration",
                description: "Real-time weather data for smarter farming decisions",
                color: "bg-yellow-100 text-yellow-600",
              },
              {
                icon: TrendingUp,
                title: "Market Insights",
                description: "Current market prices and trends for optimal sales timing",
                color: "bg-purple-100 text-purple-600",
              },
            ].map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="flex items-start gap-4 group">
                  <div
                    className={`p-3 rounded-xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-gray-800 text-lg mb-2">{feature.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Enhanced Header Component
const Header = ({ username, onLogout, onBack }: { username: string; onLogout: () => void; onBack?: () => void }) => {
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-green-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="text-green-600 hover:text-green-800 hover:bg-green-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-green-800">AgriAgent</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-medium text-sm">{username.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-gray-700 font-medium">Welcome, {username}</span>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

// Enhanced Chat Interface
const ChatInterface = ({ onResult, setLoading, loading }: any) => {
  const [message, setMessage] = useState("")
  const [language, setLanguage] = useState("en")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    try {
      const response = await mockAPI.chat({
        message: message.trim(),
        language: language,
      })
      onResult(response)
    } catch (error: any) {
      onResult({
        error: error.message || "Failed to process chat query",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 leaf-shadow bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-serif font-bold text-gray-800">Smart Chat Assistant</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Ask any farming question and get expert AI-powered advice
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                Select Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                  <SelectItem value="gu">Gujarati</SelectItem>
                  <SelectItem value="pa">Punjabi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                Your Question
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask any farming-related question..."
                rows={6}
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Getting Smart Insights...
                </div>
              ) : (
                "Ask AgriAgent"
              )}
            </Button>
          </form>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h4 className="font-serif font-bold text-green-800 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Sample Questions
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• When should I water my wheat crop?</li>
                  <li>• What fertilizer is best for tomatoes?</li>
                  <li>• How to prevent pest attacks naturally?</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-serif font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  AI Features
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Weather-based recommendations</li>
                  <li>• Market price insights</li>
                  <li>• Voice response available</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced Image Interface
const ImageInterface = ({ onResult, setLoading, loading }: any) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [language, setLanguage] = useState("en")
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setLoading(true)
    try {
      const response = await mockAPI.imageUpload(selectedFile)
      onResult(response)
    } catch (error: any) {
      onResult({
        error: error.message || "Failed to process image",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 leaf-shadow bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-serif font-bold text-gray-800">AI Disease Detection</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Upload crop images for instant AI-powered disease analysis
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                Select Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                  <SelectItem value="gu">Gujarati</SelectItem>
                  <SelectItem value="pa">Punjabi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Upload Crop Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-full h-64 object-contain mx-auto rounded-lg shadow-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPreview(null)
                        setSelectedFile(null)
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4 text-lg">Drag and drop an image here, or click to select</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-green-700 transition-colors font-medium"
                    >
                      <Camera className="w-4 h-4" />
                      Select Image
                    </Label>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing Image...
                </div>
              ) : (
                "Analyze Crop Image"
              )}
            </Button>
          </form>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h4 className="font-serif font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Tips for Best Results
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Take clear, well-lit photos of affected plant parts</li>
                <li>• Include close-ups of symptoms (spots, discoloration, etc.)</li>
                <li>• Ensure the image is in focus and not blurry</li>
                <li>• Include healthy parts for comparison if possible</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced Voice Interface
const VoiceInterface = ({ onResult, setLoading, loading }: any) => {
  const [isRecording, setIsRecording] = useState(false)
  const [language, setLanguage] = useState("en")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioBlob) return

    setLoading(true)
    try {
      const response = await mockAPI.voiceSearch({ audioBlob, language })
      onResult(response)
    } catch (error: any) {
      onResult({
        error: error.message || "Failed to process voice query",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 leaf-shadow bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-serif font-bold text-gray-800">Voice Assistant</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Speak naturally and get instant farming advice in your language
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                Select Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                  <SelectItem value="gu">Gujarati</SelectItem>
                  <SelectItem value="pa">Punjabi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-center py-12">
              {!isRecording && !audioBlob && (
                <div>
                  <Mic className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                  <p className="text-gray-600 mb-6 text-lg">Click to start recording your question</p>
                  <Button
                    type="button"
                    onClick={startRecording}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg font-medium"
                  >
                    Start Recording
                  </Button>
                </div>
              )}

              {isRecording && (
                <div>
                  <div className="w-24 h-24 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center recording-pulse">
                    <Mic className="w-12 h-12 text-white animate-pulse" />
                  </div>
                  <p className="text-red-600 mb-6 font-medium text-lg">Recording in progress...</p>
                  <Button
                    type="button"
                    onClick={stopRecording}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-full text-lg font-medium"
                  >
                    Stop Recording
                  </Button>
                </div>
              )}

              {audioBlob && !isRecording && (
                <div>
                  <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-500" />
                  <p className="text-green-600 mb-6 font-medium text-lg">Recording complete!</p>
                  <div className="flex gap-4 justify-center">
                    <Button type="button" variant="outline" onClick={() => setAudioBlob(null)} className="px-6 py-3">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Re-record
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Process Voice Query
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-serif font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Voice Recording Tips
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Ask specific farming questions</li>
                <li>• Use your preferred language naturally</li>
                <li>• Ensure quiet environment for best results</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced Result Display
const ResultDisplay = ({ result }: { result: any }) => {
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
      <Card className="mt-8 border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-lg font-serif font-bold">Error</h3>
          </div>
          <p className="text-red-700">{result.error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-8 space-y-6">
      <Card className="border-0 leaf-shadow bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-serif font-bold text-gray-800">AgriAgent Response</CardTitle>
                {result.confidence && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {Math.round(result.confidence * 100)}% Confidence
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            {result.audio_response && (
              <Button
                onClick={playAudio}
                disabled={playingAudio}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                <Play className="w-4 h-4 mr-2" />
                {playingAudio ? "Playing..." : "Play Audio"}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {result.query && (
            <div>
              <h4 className="font-serif font-bold text-gray-700 mb-2">Your Query:</h4>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">{result.query}</p>
            </div>
          )}

          <div>
            <h4 className="font-serif font-bold text-gray-700 mb-2">AI Response:</h4>
            <p className="text-gray-800 leading-relaxed text-lg">{result.response}</p>
          </div>

          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <h4 className="font-serif font-bold text-gray-700 mb-3">Recommendations:</h4>
              <div className="grid gap-2">
                {result.recommendations.map((rec: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {result.weather_data && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <CloudRain className="w-5 h-5" />
                Weather Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">
                    <span className="font-medium">Temperature:</span> {result.weather_data.temperature}°C
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">
                    <span className="font-medium">Humidity:</span> {result.weather_data.humidity}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Condition:</span> {result.weather_data.description}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Wind:</span> {result.weather_data.wind_speed} m/s
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result.market_data && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Market Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Crop:</span> {result.market_data.crop}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Price:</span> ₹{result.market_data.price_per_quintal}/quintal
                </p>
                <p className="text-sm">
                  <span className="font-medium">Market:</span> {result.market_data.market}
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm">
                    <span className="font-medium">Trend:</span> {result.market_data.trend}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {result.sources && result.sources.length > 0 && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-serif font-bold text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Sources
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {result.sources.map((source: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{source}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Main App Component
export default function AgricultureApp() {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const username = localStorage.getItem("username")

    if (token && username) {
      setUser(username)
    }
    setLoading(false)
  }, [])

  const handleLogin = (username: string) => {
    setUser(username)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center agriculture-gradient">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-2xl flex items-center justify-center">
            <Leaf className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg">Loading AgriAgent...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {user ? <Dashboard username={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
    </div>
  )
}
