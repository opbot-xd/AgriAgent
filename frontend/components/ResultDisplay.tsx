import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  AlertCircle,
  Bot,
  CheckCircle,
  CloudRain,
  Sun,
  Droplets, 
  Wind,
  DollarSign,
  TrendingUp,
  BookOpen,
  Play
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {Button} from "@/components/ui/button"

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
      {/* AI Response Card */}
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

      {/* Weather & Market */}
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
                  <span className="text-sm"><span className="font-medium">Temperature:</span> {result.weather_data.temperature}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm"><span className="font-medium">Humidity:</span> {result.weather_data.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-gray-500" />
                  <span className="text-sm"><span className="font-medium">Condition:</span> {result.weather_data.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-500" />
                  <span className="text-sm"><span className="font-medium">Wind:</span> {result.weather_data.wind_speed ?? "N/A"} m/s</span>
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
              <p className="text-sm"><span className="font-medium">Crop:</span> {result.market_data.crop}</p>
              <p className="text-sm"><span className="font-medium">Price:</span> ₹{result.market_data.price_per_quintal}/quintal</p>
              <p className="text-sm"><span className="font-medium">Market:</span> {result.market_data.market}</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm"><span className="font-medium">Trend:</span> {result.market_data.trend}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sources */}
      {result.sources && result.sources.length > 0 && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-serif font-bold text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Sources
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

export default ResultDisplay
