"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TrendingUp } from "lucide-react"
import Link from "next/link"

interface GameRound {
  betAmount: number
  multiplier: number
  result: "win" | "loss"
  timestamp: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

export function BalloonsGame() {
  const [betAmount, setBetAmount] = useState(10)
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0)
  const [targetMultiplier, setTargetMultiplier] = useState<number | null>(null)
  const [balloonSize, setBalloonSize] = useState(120)
  const [balloonPosition, setBalloonPosition] = useState(15) // percentage from bottom - much lower
  const [gameActive, setGameActive] = useState(false)
  const [gameMode, setGameMode] = useState<"manual" | "auto">("manual")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("hard")
  const [balance, setBalance] = useState(1000)
  const [gameHistory, setGameHistory] = useState<GameRound[]>([])
  const [balloonPopped, setBalloonPopped] = useState(false)
  const [gameResult, setGameResult] = useState<"win" | "loss" | null>(null)
  const [pumpCount, setPumpCount] = useState(0)
  const [popChance, setPopChance] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [showBlast, setShowBlast] = useState(false)
  const [screenShake, setScreenShake] = useState(false)

  const difficultySettings = {
    easy: { basePopChance: 0.02, popIncrease: 0.03, maxMultiplier: 5.0 },
    medium: { basePopChance: 0.03, popIncrease: 0.05, maxMultiplier: 10.0 },
    hard: { basePopChance: 0.05, popIncrease: 0.08, maxMultiplier: 20.0 },
  }

  const quickMultipliers = [1.0, 1.23, 1.55, 1.98, 2.56, 3.36, 4.48]

  const calculateMultiplier = (pumps: number) => {
    return 1.0 + pumps * 0.15 + pumps * pumps * 0.02
  }

  useEffect(() => {
    if (gameActive && targetMultiplier && currentMultiplier >= targetMultiplier) {
      console.log("[v0] Auto cash-out triggered at target multiplier:", targetMultiplier)
      cashOut()
    }
  }, [currentMultiplier, targetMultiplier, gameActive])

  const selectTargetMultiplier = (multiplier: number) => {
    if (gameActive) return

    setTargetMultiplier(multiplier)
    const adjustedBet = Math.max(10, Math.floor(betAmount * (multiplier / 2)))
    setBetAmount(Math.min(adjustedBet, balance))
    console.log("[v0] Selected target multiplier:", multiplier, "Adjusted bet to:", adjustedBet)
  }

  const startGame = () => {
    console.log("[v0] Starting game with bet:", betAmount, "Balance:", balance, "Target multiplier:", targetMultiplier)

    if (balance < betAmount || betAmount <= 0) {
      console.log("[v0] Cannot start game - insufficient balance or invalid bet")
      return
    }

    setGameActive(true)
    setBalloonPopped(false)
    setCurrentMultiplier(1.0)
    setBalloonSize(120)
    setBalloonPosition(15) // Move up only 1% per pump, start at 15%
    setGameResult(null)
    setPumpCount(0)
    setPopChance(difficultySettings[difficulty].basePopChance)
    setBalance((prev) => prev - betAmount)

    console.log("[v0] Game started! Initial pop chance:", difficultySettings[difficulty].basePopChance)
  }

  const pump = () => {
    if (!gameActive || balloonPopped) return

    const settings = difficultySettings[difficulty]
    const currentPopChance = popChance

    console.log("[v0] Pumping... Current pop chance:", currentPopChance.toFixed(3))

    if (Math.random() < currentPopChance) {
      console.log("[v0] Balloon popped!")
      popBalloon()
      return
    }

    const newPumpCount = pumpCount + 1
    const newMultiplier = calculateMultiplier(newPumpCount)
    const newPopChance = settings.basePopChance + newPumpCount * settings.popIncrease

    setPumpCount(newPumpCount)
    setCurrentMultiplier(newMultiplier)
    setPopChance(newPopChance)
    setBalloonSize(120 + newPumpCount * 15)
    setBalloonPosition(15 + newPumpCount * 1) // Move up only 1% per pump, start at 15%

    console.log(
      "[v0] Successful pump!",
      "Count:",
      newPumpCount,
      "Multiplier:",
      newMultiplier.toFixed(2),
      "New pop chance:",
      newPopChance.toFixed(3),
      "Position:",
      (15 + newPumpCount * 1).toFixed(1) + "%",
    )
  }

  const createBlastParticles = () => {
    const newParticles: Particle[] = []
    // Create more particles for a bigger explosion
    for (let i = 0; i < 35; i++) {
      const angle = (Math.PI * 2 * i) / 35
      const speed = 150 + Math.random() * 200
      newParticles.push({
        id: Math.random(),
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 2 + Math.random() * 4,
        color: ['#ef4444', '#f97316', '#eab308', '#fbbf24', '#fb923c', '#dc2626'][Math.floor(Math.random() * 6)]
      })
    }
    setParticles(newParticles)
    setShowBlast(true)
    setScreenShake(true)
    
    // Screen shake effect
    setTimeout(() => setScreenShake(false), 300)
    
    // Animate particles
    const animateParticles = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx * 0.016,
        y: p.y + p.vy * 0.016 + 150 * 0.016, // gravity
        vx: p.vx * 0.98, // air resistance
        vy: p.vy * 0.98,
        life: p.life - 0.015,
        size: p.size * 0.99
      })).filter(p => p.life > 0))
    }
    
    const interval = setInterval(animateParticles, 16)
    setTimeout(() => {
      clearInterval(interval)
      setParticles([])
      setShowBlast(false)
    }, 2000)
  }

  const popBalloon = () => {
    console.log("[v0] Balloon popped! Multiplier was:", currentMultiplier)
    setBalloonPopped(true)
    createBlastParticles()
    setGameActive(false)
    setGameResult("loss")
    setTargetMultiplier(null)

    const round: GameRound = {
      betAmount,
      multiplier: currentMultiplier,
      result: "loss",
      timestamp: Date.now(),
    }
    setGameHistory((prev) => [round, ...prev.slice(0, 9)])
  }

  const cashOut = () => {
    if (balloonPopped || !gameActive) return

    const winAmount = betAmount * currentMultiplier
    console.log("[v0] Cashed out! Won:", winAmount, "Multiplier:", currentMultiplier)
    setBalance((prev) => prev + winAmount)
    setGameActive(false)
    setGameResult("win")
    setTargetMultiplier(null)

    const round: GameRound = {
      betAmount,
      multiplier: currentMultiplier,
      result: "win",
      timestamp: Date.now(),
    }
    setGameHistory((prev) => [round, ...prev.slice(0, 9)])
  }

  const adjustBetAmount = (multiplier: number) => {
    setBetAmount((prev) => Math.max(1, prev * multiplier))
  }

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value) || 0
    setBetAmount(Math.max(1, value))
  }

  const setQuickBet = (amount: number) => {
    setBetAmount(amount)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <style jsx>{`
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        @keyframes blast {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
          100% { transform: scale(3) rotate(360deg); opacity: 0; }
        }
        .animate-blast {
          animation: blast 0.6s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px) translateY(1px); }
          75% { transform: translateX(2px) translateY(-1px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 2s ease-out;
        }
      `}</style>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-800"></div>
      </div>

      <div className="relative z-10 p-2 sm:p-4">
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
          <Button asChild variant="ghost" size="sm" className="hover:bg-slate-700 text-white">
            <Link href="/games">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Link>
          </Button>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Badge variant="outline" className="px-2 sm:px-3 py-1 border-green-500/30 text-green-400 text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />₹{balance.toFixed(2)}
            </Badge>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs sm:text-sm">
              Fairness
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div>
                    <div className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">
                      Pump
                      {targetMultiplier && (
                        <span className="ml-2 text-green-400 font-mono text-xs sm:text-sm">Target: {targetMultiplier.toFixed(2)}x</span>
                      )}
                    </div>
                    {!gameActive ? (
                      <Button
                        onClick={startGame}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-3 text-sm sm:text-lg"
                        disabled={balance < betAmount || betAmount <= 0}
                      >
                        Bet ₹{betAmount.toFixed(0)}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          onClick={pump}
                          className={`w-full font-semibold py-2 sm:py-3 text-xs sm:text-sm ${
                            balloonPosition >= 90
                              ? "bg-red-600 hover:bg-red-700 animate-pulse"
                              : popChance > 0.3
                                ? "bg-red-600 hover:bg-red-700 animate-pulse"
                                : popChance > 0.15
                                  ? "bg-orange-600 hover:bg-orange-700"
                                  : "bg-blue-600 hover:bg-blue-700"
                          }`}
                          disabled={balloonPopped}
                        >
                          {balloonPopped
                            ? "💥 POPPED"
                            : balloonPosition >= 90
                              ? "🚨 CRITICAL - Pump"
                              : popChance > 0.3
                                ? "⚠️ HIGH RISK - Pump"
                                : popChance > 0.15
                                  ? "🔶 MEDIUM RISK - Pump"
                                  : "🔵 Pump"}
                        </Button>
                        <Button
                          onClick={cashOut}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 text-xs sm:text-sm"
                          disabled={balloonPopped || pumpCount === 0}
                        >
                          Cash Out ₹{(betAmount * currentMultiplier).toFixed(2)}
                        </Button>
                      </div>
                    )}
                    {gameActive && (
                      <div className="mt-2 text-center text-xs sm:text-sm text-slate-400">
                        <div className="sm:hidden">
                          Pumps: {pumpCount} | Risk: {(popChance * 100).toFixed(1)}%
                        </div>
                        <div className="hidden sm:block">
                          Pumps: {pumpCount} | Pop Risk: {(popChance * 100).toFixed(1)}% | Height: {balloonPosition.toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant={gameMode === "manual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGameMode("manual")}
                      className={`flex-1 text-xs sm:text-sm ${gameMode === "manual" ? "bg-slate-600 text-white" : "bg-slate-700 text-slate-300 hover:text-white active:text-white border-slate-600 transition-colors"}`}
                    >
                      Manual
                    </Button>
                    <Button
                      variant={gameMode === "auto" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGameMode("auto")}
                      className={`flex-1 text-xs sm:text-sm ${gameMode === "auto" ? "bg-slate-600 text-white" : "bg-slate-700 text-slate-300 hover:text-white active:text-white border-slate-600 transition-colors"}`}
                    >
                      Auto
                    </Button>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-slate-400 mb-2 block">Bet Amount</label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={handleBetAmountChange}
                      step="1"
                      min="1"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 sm:px-3 py-2 sm:py-3 text-center font-mono text-white text-sm sm:text-lg focus:outline-none focus:border-slate-500"
                      placeholder="10"
                      disabled={gameActive}
                    />
                    <div className="flex space-x-1 sm:space-x-2 mt-2 sm:mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustBetAmount(0.5)}
                        className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:text-white active:text-white transition-colors text-xs sm:text-sm"
                        disabled={gameActive}
                      >
                        ½
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustBetAmount(2)}
                        className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:text-white active:text-white transition-colors text-xs sm:text-sm"
                        disabled={gameActive}
                      >
                        2×
                      </Button>
                    </div>
                    <div className="flex space-x-1 sm:space-x-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setQuickBet(10)}
                        className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:text-white active:text-white transition-colors text-xs"
                        disabled={gameActive}
                      >
                        ₹10
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setQuickBet(50)}
                        className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:text-white active:text-white transition-colors text-xs"
                        disabled={gameActive}
                      >
                        ₹50
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setQuickBet(100)}
                        className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:text-white active:text-white transition-colors text-xs"
                        disabled={gameActive}
                      >
                        ₹100
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-slate-400 mb-2 block">Difficulty</label>
                    <Select
                      value={difficulty}
                      onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3 order-1 lg:order-2">
              <div className="flex justify-center flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4 lg:mb-6">
                {quickMultipliers.map((mult) => (
                  <Button
                    key={mult}
                    variant="outline"
                    size="sm"
                    onClick={() => selectTargetMultiplier(mult)}
                    disabled={gameActive}
                    className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 font-mono transition-all cursor-pointer text-xs sm:text-sm flex-shrink-0 ${
                      targetMultiplier === mult
                        ? "bg-green-600 text-white border-green-500 shadow-lg"
                        : currentMultiplier >= mult
                          ? "bg-slate-600 text-white border-slate-500"
                          : "bg-slate-700 text-slate-300 border-slate-600 hover:text-white active:text-white"
                    }`}
                  >
                    {mult.toFixed(2)}x
                  </Button>
                ))}
              </div>

              {!gameActive && (
                <div className="text-center text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4">
                  Click a multiplier above to set your target cash-out point
                </div>
              )}

              <div className={`relative h-80 sm:h-96 md:h-[32rem] lg:h-[40rem] bg-slate-800/30 rounded-xl border border-slate-700 transition-transform duration-75 ${screenShake ? 'animate-pulse' : ''}`} style={{transform: screenShake ? 'translate(2px, 1px)' : 'none', overflow: 'visible'}}>
                <div className="absolute inset-0 flex items-end justify-center" style={{paddingBottom: '10%'}}>
                  <div
                    className="relative transition-all duration-300 ease-in-out"
                    style={{
                      transform: `translateY(-${balloonPosition}%)`,
                    }}
                  >
                    {!balloonPopped ? (
                      <>
                        <div
                          className="rounded-full transition-all duration-200 ease-out flex items-center justify-center text-white font-bold shadow-2xl bg-red-500 animate-pulse"
                          style={{
                            width: `${Math.min(balloonSize, typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.3, 180) : 120)}px`,
                            height: `${Math.min(balloonSize * 1.2, typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.36, 216) : 144)}px`,
                            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                            fontSize: `${Math.min(balloonSize / 6, typeof window !== 'undefined' && window.innerWidth < 640 ? 14 : 18)}px`,
                            boxShadow: "0 0 20px rgba(239, 68, 68, 0.6)",
                          }}
                        >
                          {`${currentMultiplier.toFixed(2)}x`}
                        </div>
                        <div className="absolute top-full left-1/2 w-0.5 h-8 sm:h-12 bg-slate-600 transform -translate-x-1/2" />
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-6 sm:translate-y-10">
                          <div className="w-8 h-4 sm:w-12 sm:h-6 bg-slate-700 rounded-lg border border-slate-600"></div>
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-slate-600 rounded-full mx-auto -mt-1"></div>
                        </div>
                      </>
                    ) : (
                      <div className="relative flex items-center justify-center" style={{width: `${Math.min(balloonSize, typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.4, 200) : 150)}px`, height: `${Math.min(balloonSize, typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.4, 200) : 150)}px`}}>
                        {/* Blast Effect - Always show when balloon is popped */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            {/* Shockwave rings - responsive sizes */}
                            <div className="absolute rounded-full border-2 sm:border-4 border-red-400 animate-ping" style={{width: typeof window !== 'undefined' && window.innerWidth < 640 ? '80px' : '120px', height: typeof window !== 'undefined' && window.innerWidth < 640 ? '80px' : '120px', left: typeof window !== 'undefined' && window.innerWidth < 640 ? '-40px' : '-60px', top: typeof window !== 'undefined' && window.innerWidth < 640 ? '-40px' : '-60px'}} />
                            <div className="absolute rounded-full border-2 border-orange-400 animate-ping animation-delay-100" style={{width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100px' : '160px', height: typeof window !== 'undefined' && window.innerWidth < 640 ? '100px' : '160px', left: typeof window !== 'undefined' && window.innerWidth < 640 ? '-50px' : '-80px', top: typeof window !== 'undefined' && window.innerWidth < 640 ? '-50px' : '-80px'}} />
                            <div className="absolute rounded-full border-2 border-yellow-400 animate-ping animation-delay-200" style={{width: typeof window !== 'undefined' && window.innerWidth < 640 ? '120px' : '200px', height: typeof window !== 'undefined' && window.innerWidth < 640 ? '120px' : '200px', left: typeof window !== 'undefined' && window.innerWidth < 640 ? '-60px' : '-100px', top: typeof window !== 'undefined' && window.innerWidth < 640 ? '-60px' : '-100px'}} />
                            
                            {/* Central explosion - responsive size */}
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-radial from-white via-yellow-400 to-red-600 rounded-full animate-pulse" style={{marginLeft: typeof window !== 'undefined' && window.innerWidth < 640 ? '-24px' : '-32px', marginTop: typeof window !== 'undefined' && window.innerWidth < 640 ? '-24px' : '-32px'}} />
                            
                            {/* Smoke clouds - responsive sizes */}
                            <div className="absolute w-16 h-16 sm:w-20 sm:h-20 bg-gray-600 rounded-full opacity-60 animate-ping" style={{left: typeof window !== 'undefined' && window.innerWidth < 640 ? '-32px' : '-40px', top: typeof window !== 'undefined' && window.innerWidth < 640 ? '-32px' : '-40px', animationDelay: '0.2s'}} />
                            <div className="absolute w-20 h-20 sm:w-24 sm:h-24 bg-gray-500 rounded-full opacity-40 animate-ping" style={{left: typeof window !== 'undefined' && window.innerWidth < 640 ? '-40px' : '-48px', top: typeof window !== 'undefined' && window.innerWidth < 640 ? '-40px' : '-48px', animationDelay: '0.4s'}} />
                            
                            {/* Flash effect - responsive size */}
                            <div className="absolute w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full opacity-80 animate-ping" style={{left: typeof window !== 'undefined' && window.innerWidth < 640 ? '-48px' : '-64px', top: typeof window !== 'undefined' && window.innerWidth < 640 ? '-48px' : '-64px', animationDuration: '0.3s'}} />
                            
                            {/* Explosion text - responsive size */}
                            <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-6xl animate-bounce">
                              💥
                            </div>
                            
                            {/* Debris pieces */}
                            <div className="absolute w-1 h-3 bg-red-800 rotate-45 animate-spin" style={{left: '20px', top: '-10px'}} />
                            <div className="absolute w-2 h-2 bg-red-700 rotate-12 animate-bounce" style={{left: '-25px', top: '15px'}} />
                            <div className="absolute w-1 h-2 bg-red-900 -rotate-45 animate-pulse" style={{left: '15px', top: '20px'}} />
                          </div>
                        </div>
                        
                        {/* Particles */}
                        {particles.map(particle => (
                          <div
                            key={particle.id}
                            className="absolute rounded-full shadow-lg"
                            style={{
                              left: `${particle.x}px`,
                              top: `${particle.y}px`,
                              width: `${particle.size}px`,
                              height: `${particle.size}px`,
                              backgroundColor: particle.color,
                              opacity: particle.life,
                              transform: 'translate(-50%, -50%)',
                              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {gameResult && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm ${
                        gameResult === "win" ? "bg-green-500/20" : "bg-red-500/20"
                      }`}
                    >
                      <div className="text-center text-white px-4">
                        <div
                          className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 ${
                            gameResult === "win" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {gameResult === "win" ? "🎉 WIN!" : "💥 POPPED!"}
                        </div>
                        <div className="text-base sm:text-lg md:text-xl">
                          {gameResult === "win"
                            ? `Won ₹${(betAmount * currentMultiplier).toFixed(2)}`
                            : `Lost ₹${betAmount.toFixed(0)}`}
                        </div>
                        <div className="text-sm sm:text-base md:text-lg text-slate-300 mt-2">Multiplier: {currentMultiplier.toFixed(2)}x</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
