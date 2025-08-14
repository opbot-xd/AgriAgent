"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, CheckCircle, Play, RotateCcw } from "lucide-react"
import axios from "axios"
import { getApiUrl } from '@/lib/utils';

interface VoiceInterfaceProps {
  onResult: (result: any) => void
  setLoading: (loading: boolean) => void
  loading: boolean
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onResult, setLoading, loading }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recognizedText, setRecognizedText] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const recognitionRef = useRef<any>(null)

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          setLocation({ lat: 0, lng: 0 })
        }
      )
    } else {
      setLocation({ lat: 0, lng: 0 })
    }
  }, [])

  const startRecording = async () => {
    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        alert("Speech Recognition API not supported in this browser.")
        return
      }
      const recognition = new SpeechRecognition()
      recognition.lang = 'en'
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript
        setRecognizedText(transcript)
        setIsRecording(false)
        setLoading(true)
        try {
          // Detect language from backend
          const langRes = await fetch(getApiUrl('/api/detect-language'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: transcript })
          })
          const langData = await langRes.json()
          const detectedLanguage = langData.language || 'en'
          const res = await fetch(getApiUrl('/api/chat'), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: transcript,
              location: location,
              language: detectedLanguage,
            }),
          })
          const data = await res.json()
          onResult(data)
        } catch (error: any) {
          onResult({ error: error.message || "Failed to process voice query" })
        } finally {
          setLoading(false)
        }
      }
      recognition.onerror = (event: any) => {
        setIsRecording(false)
        onResult({ error: event.error || "Speech recognition error" })
      }
      recognition.onend = () => {
        setIsRecording(false)
      }
      recognitionRef.current = recognition
      setIsRecording(true)
      recognition.start()
    } catch (error) {
      alert("Failed to start speech recognition.")
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
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
          <div className="text-center py-12">
            {!isRecording && (
              <div>
                <Mic className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                <p className="text-gray-600 mb-6 text-lg">Click to start recording your question</p>
                <Button
                  type="button"
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg font-medium"
                  disabled={loading}
                >
                  Start Voice Query
                </Button>
              </div>
            )}
            {isRecording && (
              <div>
                <div className="w-24 h-24 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center recording-pulse">
                  <Mic className="w-12 h-12 text-white animate-pulse" />
                </div>
                <p className="text-red-600 mb-6 font-medium text-lg">Listening...</p>
                <Button
                  type="button"
                  onClick={stopRecording}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-full text-lg font-medium"
                >
                  Stop
                </Button>
              </div>
            )}
          </div>
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

export default VoiceInterface;
