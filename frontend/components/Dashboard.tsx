"use client"

import React, { useState } from "react"
import Header from "./Header"
import ChatInterface from "@/components/ChatInterface"
import ImageInterface from "@/components/ImageInterface"
import VoiceInterface from "./VoiceInterface"
import ResultDisplay from "@/components/ResultDisplay"
import CropPriceForecasting from "./CropPriceForecasting"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Users, Bot, CloudRain, TrendingUp } from "lucide-react"

interface DashboardProps {
  username: string
  onLogout: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
  const [activeMode, setActiveMode] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const modes = [
    {
      id: "chat",
      title: "Smart Chat",
      description: "Ask farming questions in any language",
      icon: Zap,
      color: "bg-blue-500 hover:bg-blue-600",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "image",
      title: "Disease Detection",
      description: "Upload crop images for AI analysis",
      icon: CloudRain,
      color: "bg-green-500 hover:bg-green-600",
      gradient: "from-green-500 to-green-600",
    },
    {
      id: "voice",
      title: "Voice Assistant",
      description: "Record voice queries in any language",
      icon: Users,
      color: "bg-purple-500 hover:bg-purple-600",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      id: "forecast",
      title: "Price Prediction",
      description: "Forecast crop prices for your region",
      icon: TrendingUp,
      color: "bg-orange-500 hover:bg-orange-600",
      gradient: "from-orange-500 to-orange-600",
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
          {activeMode === "chat" && <ChatInterface setLoading={setLoading} loading={loading} />}
          {activeMode === "image" && <ImageInterface />}
          {activeMode === "voice" && <VoiceInterface onResult={setResult} setLoading={setLoading} loading={loading} />}
          {activeMode === "forecast" && <CropPriceForecasting />}
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
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
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
                  <div className="mt-4">
                    <Button
                      className={`w-full ${mode.color} text-white font-medium py-6 text-base rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                    >
                      Get Started
                    </Button>
                  </div>
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

export default Dashboard;
