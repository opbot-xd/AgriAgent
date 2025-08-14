// app/components/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';
import { speakText } from '@/lib/tts';
import { getApiUrl } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  const [response, setResponse] = useState('');
  const [responseLang, setResponseLang] = useState('en');
  const [userMessage, setUserMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !crop.trim() || !location || loading) return;
    setUserMessage(message);
    setMessage('');
    setCrop('');
    setLoading(true);
    setResponse('');
    setResponseLang('en');
    try {
      const response = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          crop_name: crop,
          location: location,
          language: navigator.language.split('-')[0],
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setResponse(data.response);
      setResponseLang(data.lang || navigator.language.split('-')[0] || 'en');
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, I encountered an error. Please try again.');
      setResponseLang('en');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUserMessage('');
    setResponse('');
    setResponseLang('en');
    setMessage('');
    setCrop('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-3xl mx-auto p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={() => speakText(response, responseLang)}
          disabled={!response}
          aria-label="Speak latest response"
          className="mr-2 text-2xl"
          type="button"
        >
          🔊
        </button>
        <span className="font-semibold">Latest Response Speaker</span>
      </div>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {!userMessage && !response ? (
          <div className="text-center text-gray-500 mt-10">
            Ask me anything about your {crop || 'crop'} and I'll help you!
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-lg p-3 bg-blue-500 text-white">
                {userMessage}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                {response}
              </div>
            </div>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      {!response ? (
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
            <Button type="submit" disabled={!message.trim() || !crop.trim() || !location || loading} className="ml-2">
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