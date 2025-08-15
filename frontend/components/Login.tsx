"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Leaf } from "lucide-react"
import axios from "axios"
import { getApiUrl } from '@/lib/utils';

interface LoginProps {
  onLogin: (username: string) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
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
      const endpoint = isLogin ? "/auth/login" : "/auth/signup"
      const response = await axios.post(getApiUrl(endpoint), formData)
      localStorage.setItem("token", response.data.access_token)
      localStorage.setItem("username", formData.username)
      onLogin(formData.username)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed")
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

export default Login;
