"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"

interface Ball {
  id: number
  x: number
  y: number
  isActive: boolean
  trail: Array<{ x: number; y: number }>
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

interface PegHit {
  id: number
  x: number
  y: number
  timestamp: number
}

export function PlinkoGame() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(10)
  const [isDropping, setIsDropping] = useState(false)
  const [gameMode, setGameMode] = useState<"manual" | "auto">("manual")
  const [risk, setRisk] = useState("medium")
  const [rows, setRows] = useState(16)
  const [balls, setBalls] = useState<Ball[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [pegHits, setPegHits] = useState<PegHit[]>([])
  const [gameHistory, setGameHistory] = useState<Array<{ multiplier: number; winnings: number; timestamp: number }>>([])
  const [winAnimation, setWinAnimation] = useState<{ slot: number; multiplier: number } | null>(null)
  const ballIdRef = useRef(0)
  const particleIdRef = useRef(0)
  const pegHitIdRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.5, // gravity
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0),
      )

      setPegHits((prev) => prev.filter((hit) => Date.now() - hit.timestamp < 300))
    }, 16)

    return () => clearInterval(interval)
  }, [])

  const getMultipliers = (riskLevel: string, rowCount: number) => {
    const multiplierSets = {
      low: [1.5, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.5],
      medium: [5.6, 2.1, 1.1, 1, 0.5, 0.3, 0.5, 1, 1.1, 2.1, 5.6],
      high: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    }
    return multiplierSets[riskLevel as keyof typeof multiplierSets] || multiplierSets.medium
  }

  const multipliers = getMultipliers(risk, rows)

  const getSlotColor = (multiplier: number) => {
    if (multiplier >= 50) return "bg-red-500"
    if (multiplier >= 10) return "bg-orange-500"
    if (multiplier >= 3) return "bg-yellow-500"
    if (multiplier >= 1) return "bg-green-500"
    return "bg-blue-500"
  }

  const createParticles = (x: number, y: number, color: string, count = 8) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        life: 30 + Math.random() * 20,
        color,
      })
    }
    setParticles((prev) => [...prev, ...newParticles])
  }

  const createPegHit = (x: number, y: number) => {
    setPegHits((prev) => [
      ...prev,
      {
        id: pegHitIdRef.current++,
        x,
        y,
        timestamp: Date.now(),
      },
    ])
    createParticles(x, y, "#60a5fa", 4)
  }

  const dropBall = async () => {
    if (betAmount > balance || betAmount < 1 || isDropping) return

    setIsDropping(true)
    setBalance((prev) => prev - betAmount)

    const newBallId = ballIdRef.current++
    const newBall: Ball = {
      id: newBallId,
      x: 50, // Start exactly in center
      y: 0,
      isActive: true,
      trail: [],
    }

    setBalls((prev) => [...prev, newBall])

    let currentX = newBall.x
    let currentY = 0
    let velocityX = 0
    const animationSteps = rows * 3 + 10
    const stepDelay = 80

    for (let step = 0; step < animationSteps; step++) {
      await new Promise((resolve) => setTimeout(resolve, stepDelay))

      const rowProgress = (currentY / 80) * rows // Adjusted for actual peg area
      const currentRow = Math.floor(rowProgress)

      const triangleWidth = (currentRow + 1) * 6 // Width increases with each row
      const triangleCenter = 50 // Center of triangle
      const leftBoundary = triangleCenter - triangleWidth / 2
      const rightBoundary = triangleCenter + triangleWidth / 2

      // Simulate peg collisions with more realistic physics
      if (currentRow < rows && step % 3 === 0) {
        const pegSpacing = triangleWidth / (currentRow + 1)
        const relativeX = currentX - leftBoundary
        const pegIndex = Math.round(relativeX / pegSpacing)
        const pegX = leftBoundary + pegIndex * pegSpacing

        if (Math.abs(currentX - pegX) < 2.5 && pegIndex >= 0 && pegIndex <= currentRow) {
          // Peg hit! Create visual effect
          createPegHit(currentX, currentY)

          // Bounce off peg with realistic physics
          const bounceDirection = Math.random() < 0.5 ? -1 : 1
          velocityX += bounceDirection * (1.5 + Math.random() * 2)
          currentX += bounceDirection * (0.8 + Math.random() * 1.2)
        }
      }

      // Apply physics
      velocityX *= 0.92 // Air resistance
      currentX += velocityX + (Math.random() - 0.5) * 0.3
      currentY += (80 / animationSteps) * (1 + Math.random() * 0.2) // Adjusted for peg area height

      if (currentX < leftBoundary) {
        currentX = leftBoundary + 1
        velocityX = Math.abs(velocityX) * 0.7
      }
      if (currentX > rightBoundary) {
        currentX = rightBoundary - 1
        velocityX = -Math.abs(velocityX) * 0.7
      }

      setBalls((prev) =>
        prev.map((ball) =>
          ball.id === newBallId
            ? {
                ...ball,
                x: currentX,
                y: currentY,
                trail: [...ball.trail.slice(-8), { x: currentX, y: currentY }],
              }
            : ball,
        ),
      )
    }

    const finalTriangleWidth = rows * 6
    const finalLeftBoundary = 50 - finalTriangleWidth / 2
    const finalRightBoundary = 50 + finalTriangleWidth / 2
    const relativePosition = (currentX - finalLeftBoundary) / finalTriangleWidth
    const slotIndex = Math.floor(relativePosition * multipliers.length)
    const finalSlot = Math.max(0, Math.min(multipliers.length - 1, slotIndex))
    const multiplier = multipliers[finalSlot]
    const winnings = Math.floor(betAmount * multiplier)

    // Create landing explosion
    const slotX = (finalSlot + 0.5) * (100 / multipliers.length)
    const explosionColor =
      multiplier >= 10 ? "#ef4444" : multiplier >= 3 ? "#f97316" : multiplier >= 1 ? "#22c55e" : "#3b82f6"
    createParticles(slotX, 95, explosionColor, multiplier >= 10 ? 20 : 12)

    // Win animation
    setWinAnimation({ slot: finalSlot, multiplier })
    setTimeout(() => setWinAnimation(null), 2000)

    // Add to history
    setGameHistory((prev) => [{ multiplier, winnings, timestamp: Date.now() }, ...prev.slice(0, 9)])

    // Update balance with animation
    setBalance((prev) => prev + winnings)

    // Remove ball after landing
    setTimeout(() => {
      setBalls((prev) => prev.filter((ball) => ball.id !== newBallId))
      setIsDropping(false)
    }, 1500)
  }

  const adjustBetAmount = (multiplier: number) => {
    setBetAmount((prev) => Math.max(1, Math.min(balance, Math.floor(prev * multiplier))))
  }

  const resetGame = () => {
    setBalance(1000)
    setGameHistory([])
    setBalls([])
    setParticles([])
    setPegHits([])
    setIsDropping(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-2 sm:p-4 border-b border-slate-700 flex-wrap gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/games">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Link>
          </Button>
          <div>
            <h1 className="font-work-sans font-bold text-xl sm:text-2xl">Plinko</h1>
            <p className="text-slate-400 text-sm sm:text-base hidden sm:block">Drop balls and watch them bounce to victory!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right text-sm sm:text-base font-bold text-green-400">
            ₹{balance}
          </div>
          <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Arcade Game</span>
            <span className="sm:hidden">Game</span>
          </Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        <div className="w-full lg:w-80 bg-slate-800 p-3 lg:p-6 space-y-3 lg:space-y-6 order-2 lg:order-1">
          {/* Manual/Auto Toggle */}
          <div className="flex bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setGameMode("manual")}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                gameMode === "manual" ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setGameMode("auto")}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                gameMode === "auto" ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              Auto
            </button>
          </div>

          {/* Bet Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-medium text-slate-300">Bet Amount</label>
              <span className="text-xs sm:text-sm text-slate-400">₹0.00</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="flex-1 bg-slate-700 border-slate-600 text-white text-sm"
                disabled={isDropping}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustBetAmount(0.5)}
                disabled={isDropping}
                className="bg-orange-500 hover:bg-orange-600 border-orange-500 text-white px-2 sm:px-3 text-xs sm:text-sm"
              >
                ½
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustBetAmount(2)}
                disabled={isDropping}
                className="bg-orange-500 hover:bg-orange-600 border-orange-500 text-white px-2 sm:px-3 text-xs sm:text-sm"
              >
                2×
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-1 lg:space-y-4">
            {/* Risk Level */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-300 mb-2 block">Risk</label>
              <Select value={risk} onValueChange={setRisk}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rows */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-300 mb-2 block">Rows</label>
              <Select value={rows.toString()} onValueChange={(value) => setRows(Number(value))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bet Button */}
          <Button
            onClick={dropBall}
            disabled={betAmount > balance || betAmount < 1 || isDropping}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 sm:py-3 text-sm sm:text-base"
          >
            {isDropping ? "Dropping..." : "Drop Ball"}
          </Button>

          {/* Balance - Hidden on mobile since it's in header */}
          <div className="text-center hidden lg:block">
            <div className="text-xl sm:text-2xl font-bold text-green-400">₹{balance}</div>
            <div className="text-xs sm:text-sm text-slate-400">Current Balance</div>
          </div>
        </div>

        <div className="flex-1 p-2 lg:p-6 order-1 lg:order-2">
          <div className="relative bg-slate-800 rounded-lg h-80 sm:h-96 md:h-[500px] lg:h-full overflow-hidden">
            {/* Ball trails */}
            {balls.map((ball) =>
              ball.trail.map((point, index) => (
                <div
                  key={`${ball.id}-trail-${index}`}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-30"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    transform: "translate(-50%, -50%)",
                    opacity: (index / ball.trail.length) * 0.5,
                  }}
                />
              )),
            )}

            {/* Balls with glow effect */}
            {balls.map((ball) => (
              <div
                key={ball.id}
                className="absolute w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-white rounded-full shadow-lg transition-all duration-75 z-10"
                style={{
                  left: `${ball.x}%`,
                  top: `${ball.y}%`,
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 0 6px rgba(255, 255, 255, 0.8), 0 0 12px rgba(255, 255, 255, 0.4)",
                }}
              />
            ))}

            {/* Particles */}
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-1 h-1 rounded-full z-20"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  backgroundColor: particle.color,
                  opacity: particle.life / 50,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}

            {/* Peg hit effects */}
            {pegHits.map((hit) => (
              <div
                key={hit.id}
                className="absolute w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 border border-blue-400 sm:border-2 rounded-full animate-ping z-15"
                style={{
                  left: `${hit.x}%`,
                  top: `${hit.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}

            <div className="absolute inset-0 pt-8">
              {Array.from({ length: rows }, (_, row) => {
                const pegsInRow = row + 3 // Row 0: 3 pegs, Row 1: 4 pegs, etc.
                const maxPegs = rows + 2 // Maximum pegs in bottom row
                const rowSpacing = 80 / rows // Vertical spacing between rows

                return (
                  <div
                    key={row}
                    className="absolute flex justify-center items-center w-full"
                    style={{
                      top: `${8 + row * rowSpacing}%`,
                    }}
                  >
                    <div
                      className="flex justify-between items-center"
                      style={{
                        width: `${(pegsInRow / maxPegs) * 80}%`, // Scale width based on pegs in row
                      }}
                    >
                      {Array.from({ length: pegsInRow }, (_, col) => (
                        <div
                          key={col}
                          className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-white rounded-full shadow-sm"
                          style={{
                            boxShadow: "0 0 2px rgba(255, 255, 255, 0.3)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Enhanced multiplier slots with win animation */}
            <div className="absolute bottom-0 left-0 right-0 flex">
              {multipliers.map((multiplier, index) => (
                <div
                  key={index}
                  className={`flex-1 h-8 sm:h-10 lg:h-12 ${getSlotColor(multiplier)} flex items-center justify-center text-white font-bold text-xs sm:text-sm border border-slate-600 relative transition-all duration-300 ${
                    winAnimation?.slot === index ? "animate-pulse scale-110 z-30" : ""
                  }`}
                  style={{
                    boxShadow: winAnimation?.slot === index ? "0 0 20px rgba(255, 255, 255, 0.8)" : "none",
                  }}
                >
                  <span className="text-xs sm:text-sm">{multiplier}×</span>
                  {winAnimation?.slot === index && (
                    <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold animate-bounce text-xs sm:text-sm">
                      +₹{Math.floor(betAmount * multiplier)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
