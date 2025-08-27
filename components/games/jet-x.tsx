"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plane, TrendingUp } from "lucide-react"
import Link from "next/link"

export function JetXGame() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [multiplier, setMultiplier] = useState(1.0)
  const [bet, setBet] = useState(10)
  const [balance, setBalance] = useState(1000)
  const [crashed, setCrashed] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [cashOutMultiplier, setCashOutMultiplier] = useState(0)
  const [gameHistory, setGameHistory] = useState<number[]>([])
  const [autoCashOut, setAutoCashOut] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showDemoCrash, setShowDemoCrash] = useState(true)
  const [speed, setSpeed] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  const crashPoint = useRef(0)

  const startGame = () => {
    if (bet > balance) return

    setShowDemoCrash(false)
    setCrashed(false)
    setCashedOut(false)
    setMultiplier(1.0)
    setSpeed(0)
    crashPoint.current = Math.random() * 3 + 2.0
    setBalance((prev) => prev - bet)
    setIsPlaying(true)
    
    // Start animation immediately
    animateJet()
  }

  const cashOut = () => {
    if (!isPlaying || crashed || cashedOut) return

    setCashedOut(true)
    setCashOutMultiplier(multiplier)
    const winnings = Math.floor(bet * multiplier)
    setBalance((prev) => prev + winnings)
    setIsPlaying(false)
  }

  const animateJet = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let startTime = Date.now()
    let crashed = false

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const currentMultiplier = 1 + elapsed * 0.5
      const currentSpeed = Math.floor(200 + elapsed * 50)

      setMultiplier(currentMultiplier)
      setSpeed(currentSpeed)

      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Jet position with wobble animation
      const progress = Math.min(elapsed * 0.4, 1)
      const jetX = 100 + progress * 500
      const jetY = 350 - progress * 200 + Math.sin(elapsed * 8) * 3

      // Crash at predetermined point
      if (currentMultiplier >= crashPoint.current && !crashed) {
        crashed = true
        setCrashed(true)
        setIsPlaying(false)
        
        // Add exact crash point to history
        setGameHistory((prev) => [crashPoint.current, ...prev.slice(0, 9)])
        
        // Draw fire explosion
        for (let i = 0; i < 40; i++) {
          const angle = Math.random() * Math.PI * 2
          const distance = Math.random() * 80
          const x = jetX + Math.cos(angle) * distance
          const y = jetY + Math.sin(angle) * distance
          
          // Fire colors
          const colors = ['#ff4400', '#ff6600', '#ff8800', '#ffaa00']
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
          ctx.beginPath()
          ctx.arc(x, y, Math.random() * 15, 0, 2 * Math.PI)
          ctx.fill()
        }
        
        // Draw smoke/fog
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2
          const distance = Math.random() * 100
          const x = jetX + Math.cos(angle) * distance
          const y = jetY + Math.sin(angle) * distance - 20
          
          ctx.fillStyle = `rgba(100, 100, 100, ${Math.random() * 0.5})`
          ctx.beginPath()
          ctx.arc(x, y, Math.random() * 25, 0, 2 * Math.PI)
          ctx.fill()
        }
        return
      }

      // Draw perfect airplane with enhanced details
      ctx.save()
      ctx.translate(jetX, jetY)
      
      // Engine exhaust with realistic glow and particles
      const exhaustGlow = 12 + Math.sin(elapsed * 10) * 4
      ctx.fillStyle = '#ff6600'
      ctx.shadowColor = '#ff6600'
      ctx.shadowBlur = 20
      ctx.beginPath()
      ctx.ellipse(-40, 0, exhaustGlow/2, 4, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      // Exhaust particles
      for(let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(255, 100, 0, ${0.3 + Math.random() * 0.4})`
        ctx.beginPath()
        ctx.arc(-45 - i * 8, Math.sin(elapsed * 15 + i) * 2, 2, 0, 2 * Math.PI)
        ctx.fill()
      }
      ctx.shadowBlur = 0
      
      // Main fuselage with enhanced gradient
      const gradient = ctx.createLinearGradient(0, -8, 0, 8)
      gradient.addColorStop(0, '#f8f8f8')
      gradient.addColorStop(0.3, '#ffffff')
      gradient.addColorStop(0.7, '#f0f0f0')
      gradient.addColorStop(1, '#d8d8d8')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(0, 0, 30, 8, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      // Fuselage panel lines
      ctx.strokeStyle = '#cccccc'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(-20, -6)
      ctx.lineTo(20, -6)
      ctx.moveTo(-20, 6)
      ctx.lineTo(20, 6)
      ctx.stroke()
      
      // Cockpit with reflection
      const cockpitGrad = ctx.createLinearGradient(0, -5, 0, 5)
      cockpitGrad.addColorStop(0, '#87ceeb')
      cockpitGrad.addColorStop(0.5, '#4682b4')
      cockpitGrad.addColorStop(1, '#1e90ff')
      ctx.fillStyle = cockpitGrad
      ctx.beginPath()
      ctx.ellipse(18, 0, 8, 5, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      // Cockpit reflection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.beginPath()
      ctx.ellipse(20, -2, 3, 2, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      // Enhanced wings with gradient
      const wingGrad = ctx.createLinearGradient(0, -20, 0, 20)
      wingGrad.addColorStop(0, '#e8e8e8')
      wingGrad.addColorStop(0.5, '#d8d8d8')
      wingGrad.addColorStop(1, '#c8c8c8')
      ctx.fillStyle = wingGrad
      
      ctx.beginPath()
      ctx.moveTo(-5, -20)
      ctx.lineTo(20, -15)
      ctx.lineTo(25, -12)
      ctx.lineTo(15, -8)
      ctx.closePath()
      ctx.fill()
      
      ctx.beginPath()
      ctx.moveTo(-5, 20)
      ctx.lineTo(20, 15)
      ctx.lineTo(25, 12)
      ctx.lineTo(15, 8)
      ctx.closePath()
      ctx.fill()
      
      // Wing details and rivets
      ctx.fillStyle = '#b8b8b8'
      for(let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.arc(5 + i * 3, -12, 1, 0, 2 * Math.PI)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(5 + i * 3, 12, 1, 0, 2 * Math.PI)
        ctx.fill()
      }
      
      // Animated navigation lights
      const lightIntensity = 0.5 + 0.5 * Math.sin(elapsed * 8)
      ctx.fillStyle = `rgba(255, 0, 0, ${lightIntensity})`
      ctx.shadowColor = '#ff0000'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(22, -13, 2, 0, 2 * Math.PI)
      ctx.fill()
      
      ctx.fillStyle = `rgba(0, 255, 0, ${lightIntensity})`
      ctx.shadowColor = '#00ff00'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(22, 13, 2, 0, 2 * Math.PI)
      ctx.fill()
      ctx.shadowBlur = 0
      
      // Enhanced nose cone with metallic gradient
      const noseGrad = ctx.createRadialGradient(28, -2, 0, 28, 0, 6)
      noseGrad.addColorStop(0, '#ffff00')
      noseGrad.addColorStop(0.7, '#ffd700')
      noseGrad.addColorStop(1, '#daa520')
      ctx.fillStyle = noseGrad
      ctx.beginPath()
      ctx.ellipse(28, 0, 6, 4, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      // Vertical tail with markings
      ctx.fillStyle = '#c8c8c8'
      ctx.beginPath()
      ctx.moveTo(-25, 0)
      ctx.lineTo(-15, -15)
      ctx.lineTo(-10, -12)
      ctx.lineTo(-20, 0)
      ctx.closePath()
      ctx.fill()
      
      // Tail marking
      ctx.fillStyle = '#ff0000'
      ctx.beginPath()
      ctx.moveTo(-18, -8)
      ctx.lineTo(-15, -10)
      ctx.lineTo(-12, -8)
      ctx.lineTo(-15, -6)
      ctx.closePath()
      ctx.fill()
      
      // Enhanced horizontal stabilizers
      ctx.fillStyle = '#d0d0d0'
      ctx.beginPath()
      ctx.ellipse(-20, -8, 8, 3, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      ctx.beginPath()
      ctx.ellipse(-20, 8, 8, 3, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      // Engine intake with depth
      const intakeGrad = ctx.createRadialGradient(-28, 0, 0, -28, 0, 4)
      intakeGrad.addColorStop(0, '#202020')
      intakeGrad.addColorStop(1, '#404040')
      ctx.fillStyle = intakeGrad
      ctx.beginPath()
      ctx.ellipse(-28, 0, 4, 3, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      ctx.restore()

      if (!crashed) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  const drawStaticJet = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Static perfect airplane
    const jetX = 50
    const jetY = 350

    ctx.save()
    ctx.translate(jetX, jetY)
    
    // Main fuselage with gradient
    const gradient = ctx.createLinearGradient(0, -8, 0, 8)
    gradient.addColorStop(0, '#f0f0f0')
    gradient.addColorStop(0.5, '#ffffff')
    gradient.addColorStop(1, '#e0e0e0')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(0, 0, 30, 8, 0, 0, 2 * Math.PI)
    ctx.fill()
    
    // Cockpit
    ctx.fillStyle = '#87ceeb'
    ctx.beginPath()
    ctx.ellipse(18, 0, 8, 5, 0, 0, 2 * Math.PI)
    ctx.fill()
    
    // Wings
    ctx.fillStyle = '#d8d8d8'
    ctx.beginPath()
    ctx.moveTo(-5, -20)
    ctx.lineTo(20, -15)
    ctx.lineTo(25, -12)
    ctx.lineTo(15, -8)
    ctx.closePath()
    ctx.fill()
    
    ctx.beginPath()
    ctx.moveTo(-5, 20)
    ctx.lineTo(20, 15)
    ctx.lineTo(25, 12)
    ctx.lineTo(15, 8)
    ctx.closePath()
    ctx.fill()
    
    // Navigation lights
    ctx.fillStyle = '#ff0000'
    ctx.beginPath()
    ctx.arc(22, -13, 2, 0, 2 * Math.PI)
    ctx.fill()
    
    ctx.fillStyle = '#00ff00'
    ctx.beginPath()
    ctx.arc(22, 13, 2, 0, 2 * Math.PI)
    ctx.fill()
    
    // Nose
    ctx.fillStyle = '#ffd700'
    ctx.beginPath()
    ctx.ellipse(28, 0, 6, 4, 0, 0, 2 * Math.PI)
    ctx.fill()
    
    // Tail
    ctx.fillStyle = '#c8c8c8'
    ctx.beginPath()
    ctx.moveTo(-25, 0)
    ctx.lineTo(-15, -15)
    ctx.lineTo(-10, -12)
    ctx.lineTo(-20, 0)
    ctx.closePath()
    ctx.fill()
    
    ctx.restore()
  }

  useEffect(() => {
    setMounted(true)
    setGameHistory([3.47, 1.23, 7.89, 2.56, 1.78, 5.34, 2.91, 4.12, 1.67, 8.45])
    crashPoint.current = Math.random() * 6 + 2.0
    // Show demo crash for 3 seconds
    const timer = setTimeout(() => {
      setShowDemoCrash(false)
      // Draw static jet after demo
      setTimeout(() => drawStaticJet(), 100)
    }, 3000)
    return () => {
      clearTimeout(timer)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-blue-800/30 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-blue-800/30">
            <Link href="/games">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="font-bold text-2xl md:text-3xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                <Plane className="inline h-8 w-8 mr-2 text-cyan-400" />
                Jet-X
              </h1>

            </div>
            <p className="text-blue-200">Watch the jet soar and cash out before it crashes!</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1 border-cyan-400/50 text-cyan-300">
            <TrendingUp className="h-4 w-4 mr-1" />
            Crash Game
          </Badge>
          <Badge className="bg-yellow-500/90 text-black px-2 py-1 text-xs font-bold">
            🔥 LIVE
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Recent Crashes */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-blue-900/50 border-cyan-500/30 backdrop-blur-sm mb-6">
          <h3 className="text-xl font-bold mb-4 text-cyan-300">🎯 Recent Crashes</h3>
          <div className="flex flex-wrap gap-2">
            {gameHistory.map((crash, index) => (
              <div
                key={index}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 ${
                  crash < 1.5
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : crash < 3
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : crash < 6
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {crash.toFixed(2)}x
              </div>
            ))}
          </div>
        </Card>
        {/* Game Canvas */}
        <Card className="p-0 bg-gradient-to-br from-slate-800/50 to-blue-900/50 border-cyan-500/30 mb-6 overflow-hidden backdrop-blur-sm shadow-2xl shadow-cyan-500/20">
          <div className="relative">
            {/* Demo Mode Overlay */}

            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-80 md:h-96 rounded-lg"
            />

            {/* Demo Crash Display */}
            {showDemoCrash && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-5xl font-black text-red-500 animate-pulse mb-4">
                    CRASHED
                  </div>
                  <div className="text-3xl text-red-400 mb-2">
                    Previous: 4.73x
                  </div>
                  <div className="text-cyan-300 text-lg animate-bounce">
                    Starting new round...
                  </div>
                </div>
              </div>
            )}

            {/* Multiplier Display */}
            <div className="absolute top-6 left-6">
              {crashed ? (
                <div className="text-center">
                  <div className="text-4xl font-black text-red-500 animate-pulse mb-2">
                    CRASHED
                  </div>
                  <div className="text-2xl text-red-400">
                    at {crashPoint.current.toFixed(2)}x
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className={`text-2xl font-black ${isPlaying ? "text-green-400 animate-pulse" : "text-white"} drop-shadow-lg font-mono`}>
                    {multiplier.toFixed(2)}x
                  </div>
                  {isPlaying && (
                    <div className="text-cyan-300 text-lg animate-bounce">
                      ${(bet * multiplier).toFixed(0)} potential win
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Speed Display */}
            {isPlaying && (
              <div className="absolute top-6 right-6">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-cyan-400 text-sm font-bold">
                    🚀 Speed: {speed} km/h
                  </div>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {cashedOut && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-emerald-500 text-white px-8 py-4 rounded-xl text-2xl font-bold animate-bounce shadow-2xl">
                  🎉 Cashed Out at {cashOutMultiplier.toFixed(2)}x!
                  <div className="text-lg">Won ${(bet * cashOutMultiplier).toFixed(0)}</div>
                </div>
              </div>
            )}

            {!isPlaying && !crashed && !showDemoCrash && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="text-cyan-400 text-lg animate-pulse">
                  🎮 Ready for flight...
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Game Controls */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-blue-900/50 border-cyan-500/30 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 text-cyan-300">💰 Place Bet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">Bet Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-gray-500 focus:outline-none"
                    disabled={isPlaying}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Button onClick={() => setBet(10)} disabled={isPlaying} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">$10</Button>
                <Button onClick={() => setBet(50)} disabled={isPlaying} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">$50</Button>
                <Button onClick={() => setBet((prev) => Math.max(1, prev / 2))} disabled={isPlaying} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">1/2</Button>
                <Button onClick={() => setBet((prev) => prev * 2)} disabled={isPlaying} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">2x</Button>
              </div>
              <div className="text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <span className="font-bold text-emerald-400">${balance}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-blue-900/50 border-cyan-500/30 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 text-cyan-300">🎮 Game Controls</h3>
            <div className="space-y-4">
              {!isPlaying ? (
                <Button
                  onClick={startGame}
                  disabled={bet > balance}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold py-4 text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all"
                >
                  🚀 Start Flight (${bet})
                </Button>
              ) : (
                <Button
                  onClick={cashOut}
                  disabled={crashed || cashedOut}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 text-lg rounded-lg shadow-lg animate-pulse"
                >
                  💰 Cash Out ({multiplier.toFixed(2)}x)
                </Button>
              )}
              <div>
                <label className="block text-sm mb-2 text-gray-300">Auto Cash Out</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1.1"
                    value={autoCashOut || ''}
                    onChange={(e) => setAutoCashOut(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 2.5"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-gray-500 focus:outline-none"
                    disabled={isPlaying}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">x</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-blue-900/50 border-cyan-500/30 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 text-cyan-300">📊 Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Games Played:</span>
                <span className="text-white font-bold">{gameHistory.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Highest Crash:</span>
                <span className="text-emerald-400 font-bold">{mounted && gameHistory.length > 0 ? Math.max(...gameHistory).toFixed(2) : '0.00'}x</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Average Crash:</span>
                <span className="text-blue-400 font-bold">{mounted && gameHistory.length > 0 ? (gameHistory.reduce((a, b) => a + b, 0) / gameHistory.length).toFixed(2) : '0.00'}x</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current Streak:</span>
                <span className="text-yellow-400 font-bold">3 wins</span>
              </div>
            </div>
          </Card>
        </div>


      </div>
    </div>
  )
}