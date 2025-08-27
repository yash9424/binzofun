"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function AviatorGame() {
  const [balance, setBalance] = useState(3000)
  const [betAmount1, setBetAmount1] = useState(1.0)
  const [betAmount2, setBetAmount2] = useState(1.0)
  const [gameState, setGameState] = useState<"waiting" | "flying" | "crashed" | "flew_away">("waiting")
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0)
  const [crashPoint, setCrashPoint] = useState(0)
  const [hasBet1, setHasBet1] = useState(false)
  const [hasBet2, setHasBet2] = useState(false)
  const [cashedOut1, setCashedOut1] = useState(false)
  const [cashedOut2, setCashedOut2] = useState(false)
  const [planePosition, setPlanePosition] = useState({ x: 20, y: 85 })
  const [countdown, setCountdown] = useState(5)
  const [multiplierHistory, setMultiplierHistory] = useState([7.20, 1.19, 1.76, 1.87, 3.54, 1.31, 3.76, 1.07, 1.01, 1.16, 1.19, 1.26, 1.51, 1.18, 1.20, 18.74, 8.86, 3.49, 5.52, 2.59, 1.11, 17.1])
  const [bettingHistory] = useState([
    { player: "d***6", bet: 7.75, multiplier: null, win: null },
    { player: "d***6", bet: 3.87, multiplier: null, win: null }
  ])
  const intervalRef = useRef<NodeJS.Timeout>()
  const countdownRef = useRef<NodeJS.Timeout>()
  const timeoutRef = useRef<NodeJS.Timeout>()

  const cleanup = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const startNewRound = () => {
    cleanup()
    setCountdown(5)
    setGameState("waiting")
    setCashedOut1(false) 
    setCashedOut2(false)
    setCurrentMultiplier(1.0)
    setPlanePosition({ x: 20, y: 85 })
    
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          startFlight()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startFlight = () => {
    cleanup()
    const random = Math.random()
    const willFlyAway = random > 0.9
    let newCrashPoint = willFlyAway ? 50 + Math.random() * 100 :
                      random < 0.6 ? 1.01 + Math.random() * 1.5 :
                      random < 0.85 ? 2.5 + Math.random() * 5 :
                      7.5 + Math.random() * 42.5
    setCrashPoint(newCrashPoint)
    setGameState("flying")

    intervalRef.current = setInterval(() => {
      setCurrentMultiplier((prev) => {
        const next = prev + 0.02

        if (next >= newCrashPoint) {
          clearInterval(intervalRef.current!)
          const finalMultiplier = parseFloat(next.toFixed(2))
          if (willFlyAway) {
            setGameState("flew_away")
            // Fast fly away animation
            let flyProgress = 0
            const flyInterval = setInterval(() => {
              flyProgress += 0.1
              setPlanePosition({
                x: Math.min(120, 85 + flyProgress * 50),
                y: Math.max(-20, 15 - flyProgress * 40)
              })
              if (flyProgress >= 1) clearInterval(flyInterval)
            }, 30)
          } else {
            setGameState("crashed")
          }
          setMultiplierHistory(h => [finalMultiplier, ...h.slice(0, 21)])
          timeoutRef.current = setTimeout(() => {
            setHasBet1(false)
            setHasBet2(false)
            startNewRound()
          }, 2000)
          return next
        }

        setPlanePosition(() => {
          const progress = Math.min((next - 1.0) / 10, 1)
          return {
            x: Math.min(85, 20 + progress * 65),
            y: Math.max(15, 85 - progress * 70)
          }
        })

        return next
      })
    }, 80)
  }

  useEffect(() => {
    startNewRound()
    return cleanup
  }, [])

  const placeBet = (betNumber: 1 | 2) => {
    const amount = betNumber === 1 ? betAmount1 : betAmount2
    if (amount > balance || amount < 0.01 || gameState === "flying") return
    setBalance((prev) => prev - amount)
    if (betNumber === 1) {
      setHasBet1(true)
    } else {
      setHasBet2(true)
    }
  }

  const cashOut = (betNumber: 1 | 2) => {
    const hasBet = betNumber === 1 ? hasBet1 : hasBet2
    const cashedOut = betNumber === 1 ? cashedOut1 : cashedOut2
    const amount = betNumber === 1 ? betAmount1 : betAmount2

    if (!hasBet || cashedOut || gameState !== "flying") return

    const winnings = amount * currentMultiplier
    setBalance((prev) => prev + winnings)

    if (betNumber === 1) {
      setCashedOut1(true)
      setHasBet1(false)
    } else {
      setCashedOut2(true)
      setHasBet2(false)
    }
  }

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800 p-1"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="text-red-500 font-bold text-lg italic">Aviator</div>
        </div>
        <div className="text-green-400 font-bold text-sm">{balance.toFixed(2)} USD</div>
        <div className="text-white text-lg">≡</div>
      </div>

      {/* Multiplier History Bar */}
      <div className="bg-gray-800 px-2 py-1 overflow-x-auto flex-shrink-0">
        <div className="flex space-x-1 text-xs">
          {multiplierHistory.map((mult, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                mult < 2 ? "text-red-400" : mult < 10 ? "text-blue-400" : "text-purple-400"
              }`}
            >
              {mult}x
            </span>
          ))}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Left Sidebar */}
        <div className="w-full lg:w-72 xl:w-80 bg-gray-900 border-b lg:border-b-0 lg:border-r border-gray-700 max-h-40 lg:max-h-none overflow-y-auto flex-shrink-0">
          {/* Sidebar Header */}
          <div className="flex border-b border-gray-700">
            <button className="flex-1 py-3 px-4 bg-gray-800 text-white font-medium text-sm">
              All Bets
            </button>
            <button className="flex-1 py-3 px-4 text-gray-400 font-medium text-sm hover:bg-gray-800">
              Previous
            </button>
            <button className="flex-1 py-3 px-4 text-gray-400 font-medium text-sm hover:bg-gray-800">
              Top
            </button>
          </div>

          {/* Balance Display */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-xs font-bold">
                  $
                </div>
                <span className="text-white font-medium">0.00</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">2/2 Bets</div>
                <div className="text-xs text-gray-400">Total win USD</div>
              </div>
            </div>
          </div>

          {/* Betting History */}
          <div className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Player</span>
                <span>Bet USD</span>
                <span>X</span>
                <span>Win USD</span>
              </div>
              {bettingHistory.map((bet, index) => (
                <div key={index} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-xs font-bold">
                      $
                    </div>
                    <span className="text-white">{bet.player}</span>
                  </div>
                  <span className="text-white">{bet.bet}</span>
                  <span className="text-gray-400">-</span>
                  <span className="text-gray-400">-</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex-1 relative min-h-0 min-w-0 overflow-hidden">
          {/* FUN MODE Banner */}
          <div className="absolute top-0 left-0 right-0 bg-orange-500 text-center py-1 font-bold text-white text-xs z-50">
            FUN MODE
          </div>

          <div className="relative h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-6 overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="60" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-800/30 to-slate-900/80"></div>

            {/* Flight Path */}
            {gameState === "flying" && (
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#059669" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="1" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d={`M 10 90% Q ${planePosition.x * 0.7}% ${planePosition.y + 15}% ${planePosition.x}% ${planePosition.y}%`}
                  stroke="url(#pathGradient)"
                  strokeWidth="4"
                  fill="none"
                  filter="url(#glow)"
                  className="animate-pulse"
                />
              </svg>
            )}

            {/* Stats Display */}
            <div className="absolute top-8 left-4 z-20 text-slate-300 text-xs space-y-1">
              <div>Round: #{Math.floor(Math.random() * 10000)}</div>
              <div>Players: {Math.floor(Math.random() * 500) + 100}</div>
            </div>
            
            {/* Speed Indicator */}
            {gameState === "flying" && (
              <div className="absolute top-8 right-4 z-20 text-slate-300 text-xs">
                <div>Speed: {(currentMultiplier * 50).toFixed(0)} km/h</div>
                <div>Altitude: {((currentMultiplier - 1) * 1000).toFixed(0)}m</div>
              </div>
            )}

            {/* Multiplier Display */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <div
                  className={`font-black font-mono drop-shadow-2xl transition-all duration-300 ${
                    gameState === "flying" ? "text-white animate-pulse" : 
                    gameState === "crashed" ? "text-red-400" : 
                    gameState === "flew_away" ? "text-emerald-400" : "text-slate-400"
                  }`}
                  style={{
                    fontSize: `clamp(2rem, ${Math.min(8, 2 + currentMultiplier * 0.5)}vw, 8rem)`,
                    textShadow: gameState === "flying" ? '0 0 20px rgba(255,255,255,0.5)' : 'none'
                  }}
                >
                  {currentMultiplier.toFixed(2)}x
                </div>
                {gameState === "flew_away" && (
                  <div className="text-emerald-400 font-bold mt-2 animate-bounce" style={{ fontSize: 'clamp(1rem, 3vw, 2rem)' }}>
                    🚀 FLEW AWAY!
                  </div>
                )}
                {gameState === "crashed" && (
                  <div className="text-red-400 font-bold mt-2 animate-pulse" style={{ fontSize: 'clamp(1rem, 3vw, 2rem)' }}>
                    💥 CRASHED!
                  </div>
                )}
              </div>
            </div>

            {/* Parimatch Style Plane */}
            <div
              className={`absolute z-20 ${
                gameState === "flying" ? "transition-all duration-100 ease-linear" : 
                gameState === "flew_away" ? "transition-all duration-1000 ease-out" : 
                gameState === "crashed" ? "transition-all duration-300" : "transition-all duration-200"
              }`}
              style={{
                left: `${planePosition.x}%`,
                top: `${planePosition.y}%`,
                transform: gameState === "crashed" ? "rotate(45deg) scale(0.8)" : 
                          gameState === "flew_away" ? "rotate(-15deg) scale(0.3)" : 
                          `rotate(${-10 + (planePosition.x - 20) * 0.3}deg) scale(${Math.min(1.2, 0.8 + currentMultiplier * 0.1)})`,
                filter: gameState === "crashed" ? "brightness(0.3) contrast(1.5) saturate(0)" : 
                       gameState === "flying" ? "drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))" : "none",
                opacity: gameState === "crashed" ? 0.7 : 1,
                transition: gameState === "flying" ? "all 0.1s linear" : "all 0.3s ease-out"
              }}
            >
              <div className="relative">
                {/* Engine Fire/Exhaust */}
                {gameState === "flying" && (
                  <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-2 bg-gradient-to-r from-orange-500 via-yellow-400 to-transparent opacity-90 animate-pulse rounded-full"></div>
                    <div className="w-4 h-1 bg-gradient-to-r from-red-500 via-orange-400 to-transparent opacity-80 animate-pulse mt-0.5 rounded-full"></div>
                    <div className="w-3 h-0.5 bg-gradient-to-r from-blue-400 to-transparent opacity-60 animate-pulse mt-0.5 rounded-full"></div>
                  </div>
                )}
                
                {/* Realistic Plane SVG */}
                <svg width="100" height="60" viewBox="0 0 50 30" className="drop-shadow-lg transform scale-150">
                  <defs>
                    <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d1d5db" />
                      <stop offset="50%" stopColor="#f3f4f6" />
                      <stop offset="100%" stopColor="#e5e7eb" />
                    </linearGradient>
                    <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e5e7eb" />
                      <stop offset="100%" stopColor="#f9fafb" />
                    </linearGradient>
                  </defs>
                  
                  {/* Main Wings */}
                  <ellipse cx="30" cy="15" rx="16" ry="3" fill="url(#wingGradient)" stroke="#9ca3af" strokeWidth="0.3" />
                  
                  {/* Fuselage */}
                  <ellipse cx="25" cy="15" rx="20" ry="2.5" fill="url(#planeGradient)" stroke="#6b7280" strokeWidth="0.3" />
                  
                  {/* Nose */}
                  <ellipse cx="42" cy="15" rx="3" ry="1.8" fill="url(#planeGradient)" stroke="#6b7280" strokeWidth="0.3" />
                  
                  {/* Cockpit Windows */}
                  <ellipse cx="35" cy="15" rx="4" ry="1.5" fill="#3b82f6" opacity="0.7" />
                  <ellipse cx="37" cy="15" rx="2" ry="1" fill="#1d4ed8" opacity="0.8" />
                  
                  {/* Tail Wings */}
                  <path d="M10 12 L7 10 L5 15 L7 20 L10 18 Z" fill="url(#wingGradient)" stroke="#9ca3af" strokeWidth="0.3" />
                  
                  {/* Vertical Stabilizer */}
                  <path d="M7 15 L10 8 L5 10 L3 15 Z" fill="url(#wingGradient)" stroke="#9ca3af" strokeWidth="0.3" />
                  
                  {/* Engine */}
                  <ellipse cx="45" cy="15" rx="2" ry="1.2" fill="#374151" />
                  
                  {/* Propeller */}
                  {gameState === "flying" && (
                    <g>
                      <ellipse cx="47" cy="15" rx="0.5" ry="6" fill="#ffffff" opacity="0.3">
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          values="0 47 15;360 47 15"
                          dur="0.03s"
                          repeatCount="indefinite"
                        />
                      </ellipse>
                      <circle cx="47" cy="15" r="0.8" fill="#1f2937" />
                    </g>
                  )}
                  
                  {/* Engine Exhaust */}
                  {gameState === "flying" && (
                    <g>
                      <ellipse cx="2" cy="15" rx="4" ry="1.2" fill="#fbbf24" opacity="0.8">
                        <animate attributeName="rx" values="3;5;3" dur="0.15s" repeatCount="indefinite" />
                      </ellipse>
                      <ellipse cx="1" cy="15" rx="2" ry="0.8" fill="#f59e0b" opacity="0.6">
                        <animate attributeName="rx" values="1;3;1" dur="0.1s" repeatCount="indefinite" />
                      </ellipse>
                    </g>
                  )}
                  
                  {/* Wing Details */}
                  <line x1="20" y1="13" x2="40" y2="13" stroke="#9ca3af" strokeWidth="0.2" />
                  <line x1="20" y1="17" x2="40" y2="17" stroke="#9ca3af" strokeWidth="0.2" />
                  
                  {/* Fuselage Details */}
                  <line x1="15" y1="15" x2="40" y2="15" stroke="#6b7280" strokeWidth="0.2" />
                </svg>
              </div>
            </div>

            {/* Realistic Crash Effect */}
            {gameState === "crashed" && (
              <div
                className="absolute z-30"
                style={{ left: `${Math.min(planePosition.x, 75)}%`, top: `${Math.max(Math.min(planePosition.y, 70), 15)}%` }}
              >
                <div className="relative">
                  {/* Main explosion */}
                  <div className="absolute inset-0 w-20 h-20 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-full h-full bg-gradient-radial from-white via-yellow-300 to-orange-600 rounded-full animate-ping opacity-90"></div>
                    <div className="absolute inset-2 w-16 h-16 bg-gradient-radial from-yellow-200 via-orange-400 to-red-600 rounded-full animate-pulse"></div>
                    <div className="absolute inset-4 w-12 h-12 bg-gradient-radial from-white via-yellow-400 to-transparent rounded-full animate-bounce"></div>
                  </div>
                  
                  {/* Debris particles */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30) * Math.PI / 180
                    const distance = 20 + Math.random() * 15
                    return (
                      <div
                        key={i}
                        className="absolute w-1 h-3 bg-gray-800 opacity-80"
                        style={{
                          left: `${Math.cos(angle) * distance}px`,
                          top: `${Math.sin(angle) * distance}px`,
                          transform: `rotate(${i * 30}deg)`,
                          animation: `debris-fall 1.5s ease-out ${i * 0.05}s forwards`
                        }}
                      />
                    )
                  })}
                  
                  {/* Smoke clouds */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-8 h-8 bg-gray-700 rounded-full opacity-40"
                      style={{
                        left: `${Math.cos((i * 45) * Math.PI / 180) * (10 + i * 2)}px`,
                        top: `${Math.sin((i * 45) * Math.PI / 180) * (10 + i * 2)}px`,
                        animation: `smoke-rise 2s ease-out ${i * 0.1}s forwards`
                      }}
                    />
                  ))}
                  
                  {/* Fire trails */}
                  <div className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-full h-full bg-gradient-to-t from-red-700 via-orange-500 to-yellow-300 rounded-full opacity-70 animate-pulse"></div>
                    <div className="absolute inset-2 w-12 h-12 bg-gradient-to-t from-orange-600 via-yellow-400 to-white rounded-full opacity-60 animate-ping"></div>
                  </div>
                  
                  {/* Ground impact effect */}
                  <div className="absolute top-8 left-0 w-24 h-2 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-50 animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Waiting State */}
            {gameState === "waiting" && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="font-bold text-white mb-2 animate-pulse" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}>
                    {countdown}
                  </div>
                  <div className="text-slate-300" style={{ fontSize: 'clamp(0.875rem, 2vw, 1.25rem)' }}>
                    Next round starts in...
                  </div>
                  <div className="mt-4 w-16 h-1 bg-slate-600 rounded-full mx-auto overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div className="bg-gray-900 border-t border-gray-700 flex-shrink-0">
        <div className="flex">
          {/* Bet Panel 1 */}
          <div className="flex-1 p-2 sm:p-4 border-b sm:border-b-0 sm:border-r border-gray-700">
            <div className="flex justify-center mb-3">
              <div className="flex bg-gray-800 rounded-full p-1">
                <button className={`px-4 py-1 rounded-full text-sm font-medium ${
                  !hasBet1 ? "bg-gray-600 text-white" : "text-gray-400"
                }`}>
                  Bet
                </button>
                <button className="px-4 py-1 rounded-full text-sm font-medium text-gray-400">
                  Auto
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-3">
              <button 
                onClick={() => setBetAmount1(Math.max(0.01, betAmount1 - 0.1))}
                disabled={hasBet1}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 text-sm sm:text-lg font-bold"
              >
                -
              </button>
              <div className="mx-2 sm:mx-4 text-lg sm:text-2xl font-bold text-white min-w-[80px] sm:min-w-[100px] text-center">
                {betAmount1.toFixed(2)}
              </div>
              <button 
                onClick={() => setBetAmount1(betAmount1 + 0.1)}
                disabled={hasBet1}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 text-sm sm:text-lg font-bold"
              >
                +
              </button>
            </div>

            {/* Quick Bet Buttons */}
            <div className="flex justify-center space-x-2 mb-3">
              {[1, 2, 5, 10].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount1(amount)}
                  disabled={hasBet1}
                  className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  {amount}
                </button>
              ))}
            </div>

            {!hasBet1 ? (
              <button
                onClick={() => placeBet(1)}
                disabled={betAmount1 > balance}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 sm:py-4 rounded-lg transition-colors text-sm sm:text-lg"
              >
                Bet<br/>
                <span className="text-xs sm:text-sm">{betAmount1.toFixed(2)} USD</span>
              </button>
            ) : cashedOut1 ? (
              <button
                disabled
                className="w-full bg-blue-600 text-white font-bold py-3 sm:py-4 rounded-lg text-sm sm:text-lg"
              >
                Cashed Out!<br/>
                <span className="text-xs sm:text-sm">{(betAmount1 * currentMultiplier).toFixed(2)} USD</span>
              </button>
            ) : (
              <button
                onClick={() => cashOut(1)}
                disabled={gameState !== "flying"}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 sm:py-4 rounded-lg transition-colors text-sm sm:text-lg animate-pulse"
              >
                Cash Out<br/>
                <span className="text-xs sm:text-sm">{(betAmount1 * currentMultiplier).toFixed(2)} USD</span>
              </button>
            )}
          </div>

          {/* Bet Panel 2 */}
          <div className="flex-1 p-2 sm:p-4">
            <div className="flex justify-center mb-3">
              <div className="flex bg-gray-800 rounded-full p-1">
                <button className={`px-4 py-1 rounded-full text-sm font-medium ${
                  !hasBet2 ? "bg-gray-600 text-white" : "text-gray-400"
                }`}>
                  Bet
                </button>
                <button className="px-4 py-1 rounded-full text-sm font-medium text-gray-400">
                  Auto
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-3">
              <button 
                onClick={() => setBetAmount2(Math.max(0.01, betAmount2 - 0.1))}
                disabled={hasBet2}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 text-sm sm:text-lg font-bold"
              >
                -
              </button>
              <div className="mx-2 sm:mx-4 text-lg sm:text-2xl font-bold text-white min-w-[80px] sm:min-w-[100px] text-center">
                {betAmount2.toFixed(2)}
              </div>
              <button 
                onClick={() => setBetAmount2(betAmount2 + 0.1)}
                disabled={hasBet2}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 text-sm sm:text-lg font-bold"
              >
                +
              </button>
            </div>

            {/* Quick Bet Buttons */}
            <div className="flex justify-center space-x-2 mb-3">
              {[1, 2, 5, 10].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount2(amount)}
                  disabled={hasBet2}
                  className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  {amount}
                </button>
              ))}
            </div>

            {!hasBet2 ? (
              <button
                onClick={() => placeBet(2)}
                disabled={betAmount2 > balance}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 sm:py-4 rounded-lg transition-colors text-sm sm:text-lg"
              >
                Bet<br/>
                <span className="text-xs sm:text-sm">{betAmount2.toFixed(2)} USD</span>
              </button>
            ) : cashedOut2 ? (
              <button
                disabled
                className="w-full bg-blue-600 text-white font-bold py-3 sm:py-4 rounded-lg text-sm sm:text-lg"
              >
                Cashed Out!<br/>
                <span className="text-xs sm:text-sm">{(betAmount2 * currentMultiplier).toFixed(2)} USD</span>
              </button>
            ) : (
              <button
                onClick={() => cashOut(2)}
                disabled={gameState !== "flying"}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 sm:py-4 rounded-lg transition-colors text-sm sm:text-lg animate-pulse"
              >
                Cash Out<br/>
                <span className="text-xs sm:text-sm">{(betAmount2 * currentMultiplier).toFixed(2)} USD</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <span>🎲</span>
            <span>Probably Fair Game</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Powered by SPRIBE</span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-black text-xs font-bold">$</div>
              <span>1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}