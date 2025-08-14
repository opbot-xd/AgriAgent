"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Leaf } from "lucide-react"

interface HeaderProps {
  username: string
  onLogout: () => void
  onBack?: () => void
}

const Header: React.FC<HeaderProps> = ({ username, onLogout, onBack }) => {
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

export default Header;
