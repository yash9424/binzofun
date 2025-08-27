"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

interface WheelSegment {
  label: string
  value: number
  color: string
  probability: number
}

export default function Wheel() {
  const [gameState, setGameState] = useState<"waiting" | "spinning" | "result">("waiting")
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<WheelSegment | null>(null)
  const [history, setHistory] = useState<{ bet: number; result: string; win: number }[]>([])

  const segments: WheelSegment[] = [
    { label: "2x", value: 2, color: "bg-red-500", probability: 0.3 },
    { label: "3x", value: 3, color: "bg-blue-500", probability: 0.25 },
    { label: "5x", value: 5, color: "bg-green-500", probability: 0.2 },
    { label: "10x", value: 10, color: "bg-yellow-500", probability: 0.15 },
    { label: "20x", value: 20, color: "bg-purple-500", probability: 0.08 },
    { label: "50x", value: 50, color: "bg-pink-500", probability: 0.02 },
  ]

  const spinWheel = () => {
    if (bet > balance) return

    setGameState("spinning")
    setBalance((prev) => prev - bet)

    // Determine result based on probability
    const random = Math.random()
    let cumulative = 0
    let selectedSegment = segments[0]

    for (const segment of segments) {
      cumulative += segment.probability
      if (random <= cumulative) {
        selectedSegment = segment
        break
      }
    }

    // Calculate rotation (multiple full spins + final position)
    const segmentAngle = 360 / segments.length
    const segmentIndex = segments.indexOf(selectedSegment)
    const finalAngle = segmentIndex * segmentAngle + segmentAngle / 2
    const spins = 5 + Math.random() * 3 // 5-8 full spins
    const totalRotation = rotation + spins * 360 + (360 - finalAngle)

    setRotation(totalRotation)

    setTimeout(() => {
      const winAmount = bet * selectedSegment.value
      setBalance((prev) => prev + winAmount)
      setResult(selectedSegment)
      setHistory((prev) => [
        ...prev.slice(-4),
        {
          bet,
          result: selectedSegment.label,
          win: winAmount,
        },
      ])
      setGameState("result")
    }, 3000)
  }

  const resetGame = () => {
    setGameState("waiting")
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-800/80 border-slate-600 text-white"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Games
        </Button>
      </div>
      
      <Card className="w-full max-w-2xl mx-auto bg-slate-900/50 border-slate-700 mt-16">
        <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-white">Wheel of Fortune</CardTitle>
        <div className="flex justify-between items-center">
          <Badge variant="secondary">Balance: ${balance}</Badge>
          <Badge variant="outline">Bet: ${bet}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wheel */}
        <div className="relative flex justify-center">
          <div className="relative w-64 h-64">
            {/* Wheel segments */}
            <div
              className="w-full h-full rounded-full border-4 border-white relative overflow-hidden transition-transform duration-3000 ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {segments.map((segment, index) => {
                const angle = (360 / segments.length) * index
                return (
                  <div
                    key={index}
                    className={`absolute w-full h-full ${segment.color} flex items-center justify-center text-white font-bold text-lg`}
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(((angle + 60) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((angle + 60) * Math.PI) / 180)}%)`,
                      transform: `rotate(${angle}deg)`,
                    }}
                  >
                    <span style={{ transform: `rotate(${30}deg)` }}>{segment.label}</span>
                  </div>
                )
              })}
            </div>

            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white" />
            </div>
          </div>
        </div>

        {/* Controls */}
        {gameState === "waiting" && (
          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {[50, 100, 250, 500].map((amount) => (
                <Button
                  key={amount}
                  variant={bet === amount ? "default" : "outline"}
                  onClick={() => setBet(amount)}
                  disabled={amount > balance}
                  className="text-sm"
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <div className="text-center">
              <Button
                onClick={spinWheel}
                disabled={bet > balance}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-2"
              >
                Spin Wheel
              </Button>
            </div>
          </div>
        )}

        {gameState === "spinning" && (
          <div className="text-center">
            <p className="text-xl text-white animate-pulse">Spinning...</p>
          </div>
        )}

        {gameState === "result" && result && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-2">Result: {result.label}</h3>
              <p className="text-green-400">You won ${bet * result.value}!</p>
            </div>
            <Button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700">
              Spin Again
            </Button>
          </div>
        )}

        {/* Game History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-300">Recent Spins</h4>
            <div className="space-y-1">
              {history.slice(-3).map((game, index) => (
                <div key={index} className="flex justify-between text-sm text-slate-400 bg-slate-800 p-2 rounded">
                  <span>Bet: ${game.bet}</span>
                  <span>Result: {game.result}</span>
                  <span className="text-green-400">Won: ${game.win}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Probability Info */}
        <div className="text-xs text-slate-500 space-y-1">
          <p className="font-semibold">Winning Probabilities:</p>
          <div className="grid grid-cols-3 gap-2">
            {segments.map((segment) => (
              <div key={segment.label} className="flex justify-between">
                <span>{segment.label}:</span>
                <span>{(segment.probability * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}
