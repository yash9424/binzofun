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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-red-500 font-bold text-xl italic">Aviator</div>
        </div>
        <div className="text-green-400 font-bold text-lg">{balance.toFixed(2)} USD</div>
        <div className="text-white">≡</div>
      </div>

      {/* Multiplier History Bar */}
      <div className="bg-gray-800 px-4 py-2 overflow-x-auto">
        <div className="flex space-x-2 text-sm">
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
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-900 border-r border-gray-700">
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
        <div className="flex-1 relative">
          {/* FUN MODE Banner */}
          <div className="absolute top-0 left-0 right-0 bg-orange-500 text-center py-2 font-bold text-white text-sm z-50">
            FUN MODE
          </div>

          <div className="relative h-full bg-gradient-to-br from-gray-900 via-blue-900 to-red-900 pt-10">
            {/* Radial Background */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-900/20 to-black/60"></div>

            {/* Flight Path */}
            {gameState === "flying" && (
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 5 95% Q ${planePosition.x * 0.8}% ${planePosition.y + 10}% ${planePosition.x}% ${planePosition.y}%`}
                  stroke="url(#pathGradient)"
                  strokeWidth="6"
                  fill="url(#pathGradient)"
                  fillOpacity="0.3"
                />
              </svg>
            )}

            {/* Multiplier Display */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div
                className={`text-8xl md:text-9xl font-black font-mono text-center drop-shadow-2xl ${
                  gameState === "flying" ? "text-white" : 
                  gameState === "crashed" ? "text-red-400" : 
                  gameState === "flew_away" ? "text-green-400" : "text-gray-400"
                }`}
              >
                {currentMultiplier.toFixed(2)}x
              </div>
              {gameState === "flew_away" && (
                <div className="text-center text-green-400 text-2xl font-bold mt-4 animate-pulse">
                  FLEW AWAY!
                </div>
              )}
            </div>

            {/* Red Aviator Plane */}
            <div
              className={`absolute z-20 ${
                gameState === "flying" ? "transition-all duration-75" : 
                gameState === "flew_away" ? "" : "transition-all duration-100"
              }`}
              style={{
                left: `${planePosition.x}%`,
                top: `${planePosition.y}%`,
                transform: gameState === "crashed" ? "rotate(45deg) scale(1.3)" : 
                          gameState === "flew_away" ? "rotate(-30deg) scale(0.6)" : "rotate(-10deg)",
              }}
            >
              <svg width="80" height="40" viewBox="0 0 80 40" className="drop-shadow-2xl">
                <ellipse cx="8" cy="20" rx="6" ry="3" fill="#ff6600" opacity="0.9">
                  <animate attributeName="rx" values="3;8;3" dur="0.2s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="35" cy="20" rx="25" ry="6" fill="#dc2626" />
                <ellipse cx="35" cy="20" rx="22" ry="4" fill="#ef4444" />
                <polygon points="25,10 45,12 55,15 40,17" fill="#dc2626" />
                <polygon points="25,30 45,28 55,25 40,23" fill="#dc2626" />
                <polygon points="28,12 42,14 50,16 38,18" fill="#ef4444" />
                <polygon points="28,28 42,26 50,24 38,22" fill="#ef4444" />
                <ellipse cx="50" cy="20" rx="6" ry="3" fill="#1e40af" opacity="0.8" />
                <ellipse cx="60" cy="20" rx="4" ry="3" fill="#fbbf24" />
                {(gameState === "flying" || gameState === "flew_away") && (
                  <ellipse cx="65" cy="20" rx="3" ry="12" fill="#ffffff" opacity="0.4">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values="0 65 20;360 65 20"
                      dur={gameState === "flew_away" ? "0.05s" : "0.08s"}
                      repeatCount="indefinite"
                    />
                  </ellipse>
                )}
              </svg>
            </div>

            {/* Crash Effect */}
            {gameState === "crashed" && (
              <div
                className="absolute z-30"
                style={{ left: `${Math.min(planePosition.x, 75)}%`, top: `${Math.max(Math.min(planePosition.y, 70), 15)}%` }}
              >
                <div className="relative">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"
                      style={{
                        left: `${Math.cos((i * 30) * Math.PI / 180) * 20}px`,
                        top: `${Math.sin((i * 30) * Math.PI / 180) * 20}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                  <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse opacity-75"></div>
                </div>
              </div>
            )}

            {/* Waiting State */}
            {gameState === "waiting" && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
                <div className="text-6xl font-bold text-white mb-4">
                  {countdown}
                </div>
                <div className="text-white text-lg">
                  Next round starts in...
                </div>
              </div>
            )}

            {/* Flew Away Effect */}
            {gameState === "flew_away" && (
              <div className="absolute top-20 right-10 z-30">
                <div className="text-green-400 text-xl font-bold animate-bounce">
                  ✈️ FLEW AWAY!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div className="bg-gray-900 border-t border-gray-700">
        <div className="flex">
          {/* Bet Panel 1 */}
          <div className="flex-1 p-4 border-r border-gray-700">
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
                className="w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 text-lg font-bold"
              >
                -
              </button>
              <div className="mx-4 text-2xl font-bold text-white min-w-[100px] text-center">
                {betAmount1.toFixed(2)}
              </div>
              <button 
                onClick={() => setBetAmount1(betAmount1 + 0.1)}
                disabled={hasBet1}
                className="w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 text-lg font-bold"
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
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg transition-colors text-lg"
              >
                Bet<br/>
                <span className="text-sm">{betAmount1.toFixed(2)} USD</span>
              </button>
            ) : cashedOut1 ? (
              <button
                disabled
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg text-lg"
              >
                Cashed Out!<br/>
                <span className="text-sm">{(betAmount1 * currentMultiplier).toFixed(2)} USD</span>
              </button>
            ) : (
              <button
                onClick={() => cashOut(1)}
                disabled={gameState !== "flying"}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg transition-colors text-lg animate-pulse"
              >
                Cash Out<br/>
                <span className="text-sm">{(betAmount1 * currentMultiplier).toFixed(2)} USD</span>
              </button>
            )}
          </div>

          {/* Bet Panel 2 */}
          <div className="flex-1 p-4">
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
                className="w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 text-lg font-bold"
              >
                -
              </button>
              <div className="mx-4 text-2xl font-bold text-white min-w-[100px] text-center">
                {betAmount2.toFixed(2)}
              </div>
              <button 
                onClick={() => setBetAmount2(betAmount2 + 0.1)}
                disabled={hasBet2}
                className="w-10 h-10 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 text-lg font-bold"
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
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg transition-colors text-lg"
              >
                Bet<br/>
                <span className="text-sm">{betAmount2.toFixed(2)} USD</span>
              </button>
            ) : cashedOut2 ? (
              <button
                disabled
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg text-lg"
              >
                Cashed Out!<br/>
                <span className="text-sm">{(betAmount2 * currentMultiplier).toFixed(2)} USD</span>
              </button>
            ) : (
              <button
                onClick={() => cashOut(2)}
                disabled={gameState !== "flying"}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg transition-colors text-lg animate-pulse"
              >
                Cash Out<br/>
                <span className="text-sm">{(betAmount2 * currentMultiplier).toFixed(2)} USD</span>
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