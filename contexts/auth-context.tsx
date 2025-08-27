"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  username: string
  avatar?: string
  joinedAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("gameHub_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem("gameHub_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Demo mode - allow any email with any password
    if (email && password) {
      const username = email.split('@')[0] || 'Player'
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        username: username.charAt(0).toUpperCase() + username.slice(1),
        joinedAt: new Date().toISOString(),
      }
      setUser(mockUser)
      localStorage.setItem("gameHub_user", JSON.stringify(mockUser))
      setIsLoading(false)
      return { success: true }
    }

    setIsLoading(false)
    return { success: false, error: "Please enter email and password" }
  }

  const signup = async (
    email: string,
    password: string,
    username: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem("gameHub_users") || "[]")
    const userExists = existingUsers.some((u: any) => u.email === email || u.username === username)

    if (userExists) {
      setIsLoading(false)
      return { success: false, error: "User with this email or username already exists" }
    }

    // Create new user
    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      email,
      username,
      password,
      joinedAt: new Date().toISOString(),
    }

    // Save to localStorage (for demo purposes)
    existingUsers.push(newUser)
    localStorage.setItem("gameHub_users", JSON.stringify(existingUsers))

    // Set current user (without password)
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("gameHub_user", JSON.stringify(userWithoutPassword))

    setIsLoading(false)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("gameHub_user")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
