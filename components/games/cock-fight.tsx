"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function CockFightGame() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(100)
  const [selectedBet, setSelectedBet] = useState<"red" | "blue" | "tie" | null>(null)
  const [gameState, setGameState] = useState<"betting" | "fighting" | "result">("betting")
  const [winner, setWinner] = useState<"red" | "blue" | "tie" | null>(null)
  const [countdown, setCountdown] = useState(20)
  const [multiplier, setMultiplier] = useState(1.0)
  const [history, setHistory] = useState<string[]>(["R", "B", "R", "T", "B", "R", "B", "R"])

  const odds = {
    red: 1.95,
    blue: 1.95,
    tie: 8.0
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState === "betting" && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState("fighting")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    if (gameState === "fighting") {
      let progress = 0
      interval = setInterval(() => {
        progress += 1
        setMultiplier(1 + progress * 0.1)
        
        if (progress >= 30) {
          const random = Math.random()
          let result: "red" | "blue" | "tie"
          
          if (random < 0.45) result = "red"
          else if (random < 0.90) result = "blue" 
          else result = "tie"
          
          setWinner(result)
          setGameState("result")
          
          if (selectedBet === result) {
            const winnings = betAmount * odds[selectedBet]
            setBalance(b => b + winnings)
          }
          
          setHistory(prev => [result === "red" ? "R" : result === "blue" ? "B" : "T", ...prev.slice(0, 7)])
          
          setTimeout(() => {
            setGameState("betting")
            setCountdown(20)
            setSelectedBet(null)
            setWinner(null)
            setMultiplier(1.0)
          }, 5000)
        }
      }, 100)
    }

    return () => clearInterval(interval)
  }, [gameState, countdown, selectedBet, betAmount])

  const placeBet = (type: "red" | "blue" | "tie") => {
    if (gameState !== "betting" || betAmount > balance) return
    setSelectedBet(type)
    setBalance(b => b - betAmount)
  }

  return (
    <div className="min-h-screen bg-black text-white space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Games
        </Button>
        <div>
          <h1 className="font-work-sans font-bold text-2xl md:text-3xl text-white">Cock Fight</h1>
          <p className="text-gray-400">Bet on fighting roosters</p>
        </div>
        <div className="text-green-400 font-bold text-lg">₱{balance.toFixed(2)}</div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-yellow-400 font-bold">HISTORY:</span>
            {history.map((result, index) => (
              <div key={index} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                result === "R" ? "bg-red-600" : result === "B" ? "bg-blue-600" : "bg-green-600"
              }`}>
                {result}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
          {gameState === "betting" && (
            <div className="text-3xl font-bold text-yellow-400">
              BETTING TIME: {countdown}s
            </div>
          )}
          {gameState === "fighting" && (
            <div className="text-3xl font-bold text-red-400 animate-pulse">
              FIGHT! {multiplier.toFixed(1)}x
            </div>
          )}
          {gameState === "result" && (
            <div className="text-3xl font-bold text-green-400">
              WINNER: {winner === "red" ? "RED" : winner === "blue" ? "BLUE" : "TIE"}!
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-yellow-600/10 to-transparent"></div>
          
          <div className="relative z-10 grid grid-cols-3 gap-8 items-center">
            <div className="text-center">
              <div className={`relative ${gameState === "fighting" ? "animate-bounce" : ""}`}>
                <div className="text-9xl filter drop-shadow-lg transform scale-x-[-1]">🐓</div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-red-600 rounded-full opacity-50"></div>
              </div>
              <div className="mt-4 bg-red-600/80 rounded-lg p-4 border-2 border-red-400">
                <div className="text-2xl font-bold text-white">RED</div>
                <div className="text-lg text-red-200">{odds.red}x</div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-4 border-yellow-300 mx-auto">
                <span className="text-4xl font-bold text-black">VS</span>
              </div>
            </div>

            <div className="text-center">
              <div className={`relative ${gameState === "fighting" ? "animate-bounce" : ""}`}>
                <div className="text-9xl filter drop-shadow-lg">🐓</div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-blue-600 rounded-full opacity-50"></div>
              </div>
              <div className="mt-4 bg-blue-600/80 rounded-lg p-4 border-2 border-blue-400">
                <div className="text-2xl font-bold text-white">BLUE</div>
                <div className="text-lg text-blue-200">{odds.blue}x</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Button
              onClick={() => placeBet("red")}
              disabled={gameState !== "betting" || betAmount > balance}
              className={`h-20 text-xl font-bold transition-all ${
                selectedBet === "red" 
                  ? "bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <div>
                <div>RED</div>
                <div className="text-sm">{odds.red}x</div>
              </div>
            </Button>

            <Button
              onClick={() => placeBet("tie")}
              disabled={gameState !== "betting" || betAmount > balance}
              className={`h-20 text-xl font-bold transition-all ${
                selectedBet === "tie" 
                  ? "bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400" 
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <div>
                <div>TIE</div>
                <div className="text-sm">{odds.tie}x</div>
              </div>
            </Button>

            <Button
              onClick={() => placeBet("blue")}
              disabled={gameState !== "betting" || betAmount > balance}
              className={`h-20 text-xl font-bold transition-all ${
                selectedBet === "blue" 
                  ? "bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <div>
                <div>BLUE</div>
                <div className="text-sm">{odds.blue}x</div>
              </div>
            </Button>
          </div>

          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mt-6">
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-yellow-400 mb-2">BET AMOUNT</div>
              <div className="flex items-center justify-center space-x-4">
                <Button 
                  onClick={() => setBetAmount(Math.max(10, betAmount - 50))}
                  className="bg-gray-700 hover:bg-gray-600 w-12 h-12 text-xl"
                  disabled={gameState !== "betting"}
                >
                  -
                </Button>
                <div className="text-3xl font-bold text-yellow-400 min-w-[120px]">₱{betAmount}</div>
                <Button 
                  onClick={() => setBetAmount(betAmount + 50)}
                  className="bg-gray-700 hover:bg-gray-600 w-12 h-12 text-xl"
                  disabled={gameState !== "betting"}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map(amount => (
                <Button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                  disabled={gameState !== "betting"}
                >
                  ₱{amount}
                </Button>
              ))}
            </div>
          </div>

          {selectedBet && (
            <div className="mt-4 bg-gray-800 border border-gray-600 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-yellow-400">
                YOUR BET: {selectedBet.toUpperCase()} - ₱{betAmount}
              </div>
              <div className="text-lg text-white">
                Potential Win: ₱{(betAmount * odds[selectedBet]).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}