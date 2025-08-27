"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"

export function ColorPredictionGame() {
  const [balance, setBalance] = useState(2000)
  const [betAmount, setBetAmount] = useState(100)
  const [selectedBet, setSelectedBet] = useState<"green" | "violet" | "red" | number | null>(null)
  const [gameState, setGameState] = useState<"betting" | "result">("betting")
  const [result, setResult] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(6)
  const [currentPeriod] = useState(312089)

  const getNumberColor = (num: number) => {
    if (num === 0) return "red-violet"
    if (num === 5) return "green-violet"
    if ([1, 3, 7, 9].includes(num)) return "green"
    if ([2, 4, 6, 8].includes(num)) return "red"
    return "violet"
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            const gameResult = Math.floor(Math.random() * 10)
            setResult(gameResult)
            setGameState("result")
            
            let won = false
            if (typeof selectedBet === "number" && selectedBet === gameResult) {
              won = true
              setBalance(b => b + betAmount * 9)
            } else if (typeof selectedBet === "string") {
              const resultColor = getNumberColor(gameResult)
              if (
                (selectedBet === "green" && (resultColor === "green" || resultColor === "green-violet")) ||
                (selectedBet === "red" && (resultColor === "red" || resultColor === "red-violet")) ||
                (selectedBet === "violet" && resultColor.includes("violet"))
              ) {
                won = true
                const multiplier = selectedBet === "violet" ? 4.5 : 2.0
                setBalance(b => b + betAmount * multiplier)
              }
            }
            
            setTimeout(() => {
              setGameState("betting")
              setResult(null)
              setSelectedBet(null)
              return 6
            }, 3000)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [countdown, selectedBet, betAmount])

  const placeBet = (bet: "green" | "violet" | "red" | number) => {
    if (gameState !== "betting" || betAmount > balance) return
    setSelectedBet(bet)
    setBalance(b => b - betAmount)
  }

  return (
    <div className="min-h-screen bg-black text-white space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="text-white hover:bg-gray-800">
          <Link href="/games">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Link>
        </Button>
        <div>
          <h1 className="font-work-sans font-bold text-2xl md:text-3xl text-white">Color Prediction</h1>
          <p className="text-gray-400">Predict colors and numbers to win</p>
        </div>
        <div></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className={`rounded-lg p-8 text-center relative ${
              result !== null 
                ? getNumberColor(result) === "green" 
                  ? "bg-green-500" 
                  : getNumberColor(result) === "red" 
                    ? "bg-red-500" 
                    : getNumberColor(result).includes("violet") 
                      ? "bg-gradient-to-br from-red-500 to-purple-500" 
                      : "bg-purple-500"
                : "bg-gray-700"
            }`}>
              {result !== null ? (
                <div className="text-6xl font-bold text-white">{result}</div>
              ) : (
                <div className="text-6xl font-bold text-white">?</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Countdown</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-gray-800 border-2 border-gray-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {countdown}
            </div>
            <div className="flex justify-center space-x-4 text-xs">
              <div>
                <div className="text-gray-300">Min</div>
                <div className="text-white">100</div>
              </div>
              <div>
                <div className="text-gray-300">Max</div>
                <div className="text-white">2K</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => placeBet("green")}
                disabled={gameState !== "betting"}
                className={`h-16 bg-green-500 hover:bg-green-600 text-white font-bold ${
                  selectedBet === "green" ? "ring-2 ring-yellow-400" : ""
                }`}
              >
                <div>
                  <div>Green</div>
                  <div className="text-xs">x2.0 or x1.6</div>
                </div>
              </Button>
              <Button
                onClick={() => placeBet("violet")}
                disabled={gameState !== "betting"}
                className={`h-16 bg-purple-500 hover:bg-purple-600 text-white font-bold ${
                  selectedBet === "violet" ? "ring-2 ring-yellow-400" : ""
                }`}
              >
                <div>
                  <div>Violet</div>
                  <div className="text-xs">x4.5</div>
                </div>
              </Button>
              <Button
                onClick={() => placeBet("red")}
                disabled={gameState !== "betting"}
                className={`h-16 bg-red-500 hover:bg-red-600 text-white font-bold ${
                  selectedBet === "red" ? "ring-2 ring-yellow-400" : ""
                }`}
              >
                <div>
                  <div>Red</div>
                  <div className="text-xs">x2.0 or x1.6</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const colorClass = getNumberColor(num) === "green" ? "bg-green-500" :
                                  getNumberColor(num) === "red" ? "bg-red-500" :
                                  getNumberColor(num).includes("violet") ? "bg-gradient-to-br from-red-500 to-purple-500" :
                                  "bg-purple-500"
                
                return (
                  <Button
                    key={num}
                    onClick={() => placeBet(num)}
                    disabled={gameState !== "betting"}
                    className={`h-12 ${colorClass} hover:opacity-80 text-white font-bold ${
                      selectedBet === num ? "ring-2 ring-yellow-400" : ""
                    }`}
                  >
                    {num}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Game Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Balance: {balance}</span>
              <span>WIN: 0</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Button 
                onClick={() => {
                  setSelectedBet(null)
                  setCountdown(6)
                  setGameState("betting")
                  setResult(null)
                }}
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => setBetAmount(Math.max(10, betAmount - 50))}
                  size="sm" 
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  -
                </Button>
                <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded min-w-[80px] text-center">
                  <div className="text-xs text-gray-300">Bet</div>
                  <div className="font-bold">{betAmount}</div>
                </div>
                <Button 
                  onClick={() => setBetAmount(betAmount + 50)}
                  size="sm" 
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  +
                </Button>
              </div>
              
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Game Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-xs text-center">
              <div>
                <div className="text-gray-400">Period</div>
                <div className="text-white">{currentPeriod}</div>
              </div>
              <div>
                <div className="text-gray-400">Result</div>
                <div className="text-white">{result ?? "?"}</div>
              </div>
              <div>
                <div className="text-gray-400">Time</div>
                <div className="text-white">11:18</div>
              </div>
              <div>
                <div className="text-gray-400">Fairness</div>
                <div className="text-white">⚖️</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}