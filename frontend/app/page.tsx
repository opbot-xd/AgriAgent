"use client"
import React, { useState, useEffect } from "react"
import Dashboard from "@/components/Dashboard"
import Login from "@/components/Login"
import AuthForm from "@/components/AuthForm"

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
            {/* You can use a logo or icon here */}
          </div>
          <p className="text-gray-600 text-lg">Loading AgriAgent...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {user ? (
        <Dashboard username={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  )
}

