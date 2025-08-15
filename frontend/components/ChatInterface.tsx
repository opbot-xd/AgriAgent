// app/components/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, CheckCircle, User, Bot, CloudRain, Sun, Droplets, Wind } from 'lucide-react';
import { speakText } from '@/lib/tts';
import { getApiUrl } from '@/lib/utils';

interface ResultDisplayProps {
  response?: string;
  recommendations?: string[];
  audio_response?: string;
  weather_data?: {
    temperature: number;
    humidity: number;
    description: string;
    wind_speed: number;
  };
  lang?: string;
}

interface Location {
  lat: number;
  lng: number;
}

interface ChatInterfaceProps {
  onResult: (result: any) => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

export default function ChatInterface({ onResult, setLoading, loading }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [crop, setCrop] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [response, setResponse] = useState<ResultDisplayProps>({});
  const [responseLang, setResponseLang] = useState('en');
  const [userMessage, setUserMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [audioPlayer, setAudioPlayer] = useState(null);

  const playAudio = () => {
    if (!response?.audio_response) return;
  
    // If backend sends base64-encoded audio
    if (response.audio_response.startsWith("data:audio") || /^[A-Za-z0-9+/]+=*$/.test(response.audio_response.slice(0, 20))) {
      const audioUrl = response.audio_response.startsWith("data:audio")
        ? response.audio_response
        : `data:audio/mp3;base64,${response.audio_response}`;
      new Audio(audioUrl).play();
    } else {
      // If backend sends direct URL
      new Audio(response.audio_response).play();
    }
  };
  
  // Get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Using default location.');
          setLocation({ lat: 0, lng: 0 });
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setLocation({ lat: 0, lng: 0 });
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userMessage, response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !crop.trim() || !location || loading) return;
    setUserMessage(message);
    setMessage('');
    setCrop('');
    setLoading(true);
    setResponse({});
    setResponseLang('en');
    try {
      const res = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          crop_name: crop,
          location: location,
          language: navigator.language.split('-')[0],
        }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setResponse(data);
      console.log(data);
      setResponseLang(data.lang || navigator.language.split('-')[0] || 'en');
    } catch (error) {
      console.error('Error:', error);
      setResponse({});
      setResponseLang('en');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUserMessage('');
    setResponse({});
    setResponseLang('en');
    setMessage('');
    setCrop('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-3xl mx-auto p-4">
      {/* Speaker */}
      {response?.audio_response && (
  <div className="flex items-center mb-4">
    <button
      onClick={()=>playAudio()}
      aria-label="Play latest response"
      className="mr-2 text-2xl"
      type="button"
    >
      🔊
    </button>
    <span className="font-semibold">Latest Response Speaker</span>
  </div>
)}


      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {!userMessage && !response?.response ? (
          <div className="text-center text-gray-500 mt-10">
            Ask me anything about your {crop || 'crop'} and I'll help you!
          </div>
        ) : (
          <>
            {/* User Message */}
            {userMessage && (
              <div className="flex justify-end items-start gap-2">
                <div className="max-w-[80%] rounded-lg p-3 bg-blue-500 text-white">
                  {userMessage}
                </div>
                <User className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              </div>
            )}

            {/* Assistant Message */}
            {response?.response && (
              <div className="flex justify-start items-start gap-2">
                <Bot className="w-6 h-6 text-gray-500 flex-shrink-0 mt-1" />
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-50 border border-gray-200 space-y-4">
                  
                  {/* AI Response */}
                  <div>
                    <h4 className="font-serif font-bold text-gray-700 mb-2">AI Response:</h4>
                    <p className="text-gray-800 leading-relaxed text-lg">{response.response}</p>
                  </div>

                  {/* Recommendations */}
                  {response?.recommendations && response.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-serif font-bold text-gray-700 mb-3">Recommendations:</h4>
                      <div className="grid gap-2">
                        {response.recommendations.map((rec: string, index: number) => (
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

                  {/* Weather Information */}
                  {response?.weather_data && (
                    <div className="border border-blue-200 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 p-3 border-b border-blue-200">
                        <CloudRain className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-blue-800">Weather Information</span>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-orange-500" />
                          <span>
                            <span className="font-medium">Temperature:</span> {response.weather_data.temperature}°C
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span>
                            <span className="font-medium">Humidity:</span> {response.weather_data.humidity}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CloudRain className="w-4 h-4 text-gray-500" />
                          <span>
                            <span className="font-medium">Condition:</span> {response.weather_data.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-gray-500" />
                          <span>
                            <span className="font-medium">Wind:</span> {response.weather_data.wind_speed} m/s
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Form / New Query Toggle */}
      {!response?.response ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crop">Crop Name</Label>
            <Input
              id="crop"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="Enter crop name (e.g., Tomato, Rice)"
              required
              disabled={loading}
            />
          </div>
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your question here..."
              className="flex-1"
              disabled={loading}
              required
            />
            <Button
              type="submit"
              disabled={!message.trim() || !crop.trim() || !location || loading}
              className="ml-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!location && (
            <div className="text-sm text-yellow-600">
              Getting your location...
            </div>
          )}
        </form>
      ) : (
        <Button onClick={handleReset} className="mt-4" type="button">
          New Query
        </Button>
      )}
    </div>
  );
}
