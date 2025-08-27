"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, User, Settings, LogOut, Gamepad2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex justify-between h-16" suppressHydrationWarning>
          <div className="flex items-center" suppressHydrationWarning>
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-white">
              <Gamepad2 className="h-6 w-6 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Binzo fun
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-4" suppressHydrationWarning>
            <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Games
            </Link>
            {user && (
              <Link href="/profile" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Profile
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-sm font-medium">
                  Welcome, {user.username}!
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-white border-gray-600 hover:bg-red-600 hover:border-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2" suppressHydrationWarning>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-blue-800 hover:border-blue-800">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="lg:hidden flex items-center" suppressHydrationWarning>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-3 pt-2 pb-3 space-y-1 sm:px-4 bg-slate-800 border-t border-slate-700">
            <Link
              href="/"
              className="text-gray-300 hover:text-white hover:bg-slate-700 block px-3 py-3 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              🎮 Games
            </Link>
            {user && (
              <Link
                href="/profile"
                className="text-gray-300 hover:text-white hover:bg-slate-700 block px-3 py-3 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                👤 Profile
              </Link>
            )}
            
            {user ? (
              <div className="px-3 py-3 space-y-3 border-t border-slate-600 mt-2">
                <div className="text-green-400 text-sm font-medium bg-slate-700/50 px-3 py-2 rounded-md">
                  👋 Welcome, {user.username}!
                </div>
                <Button 
                  variant="outline" 
                  size="default" 
                  onClick={handleLogout}
                  className="text-white border-gray-600 hover:bg-red-600 hover:border-red-600 w-full py-3"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="px-3 py-3 space-y-3 border-t border-slate-600 mt-2">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="default" className="text-white border-gray-600 hover:bg-blue-800 hover:border-blue-800 w-full py-3">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button size="default" className="bg-blue-600 hover:bg-blue-700 w-full py-3">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}