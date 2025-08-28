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
  const [planePosition, setPlanePosition] = useState({ x: 5, y: 80 })
  const [countdown, setCountdown] = useState(5)
  const [multiplierHistory, setMultiplierHistory] = useState([7.20, 1.19, 1.76, 1.87, 3.54, 1.31, 3.76, 1.07, 1.01, 1.16, 1.19, 1.26, 1.51, 1.18, 1.20, 18.74, 8.86, 3.49, 5.52, 2.59, 1.11, 17.1])
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
    setPlanePosition({ x: 5, y: 80 })
    
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
            x: Math.min(85, 5 + progress * 80),
            y: Math.max(15, 80 - progress * 65)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-800"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Games
        </Button>
        <h1 className="text-2xl font-bold text-red-400">✈️ Aviator</h1>
        <div className="text-green-400 font-bold">₹{balance.toFixed(2)}</div>
      </div>

      {/* History */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Recent Results</h3>
        <div className="flex flex-wrap gap-2">
          {multiplierHistory.slice(0, 10).map((mult, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                mult < 2 ? "bg-red-500/20 text-red-400" : 
                mult < 10 ? "bg-blue-500/20 text-blue-400" : 
                "bg-purple-500/20 text-purple-400"
              }`}
            >
              {mult}x
            </span>
          ))}
        </div>
      </div>

      {/* Game Canvas */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg p-8 mb-6 min-h-[400px] relative overflow-hidden">
        {/* Multiplier Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-5xl font-bold ${
              gameState === "flying" ? "text-green-400 animate-pulse" : 
              gameState === "crashed" ? "text-red-400" : 
              gameState === "flew_away" ? "text-emerald-400" : "text-gray-400"
            }`}>
              {currentMultiplier.toFixed(2)}x
            </div>
            {gameState === "waiting" && (
              <div className="text-2xl text-gray-300 mt-4">
                Next round in {countdown}s
              </div>
            )}
            {gameState === "crashed" && (
              <div className="text-2xl text-red-400 mt-4 animate-pulse">
                💥 CRASHED!
              </div>
            )}
            {gameState === "flew_away" && (
              <div className="text-2xl text-emerald-400 mt-4 animate-bounce">
                🚀 FLEW AWAY!
              </div>
            )}
          </div>
        </div>

        {/* Airplane */}
        <div
          className="absolute transition-all duration-100"
          style={{
            left: `${planePosition.x}%`,
            top: `${planePosition.y}%`,
            opacity: gameState === "crashed" ? 0 : 1,
            transform: gameState === "crashed" ? "scale(0)" : "scale(1)"
          }}
        >
          <img 
            src="/Airplane.gif"
            alt="Airplane"
            style={{ width: 150, height: 150 }}
            className="object-contain"
          />
        </div>
      </div>

      {/* Betting Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bet 1 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">Bet 1</span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setBetAmount1(Math.max(0.01, betAmount1 - 0.1))}
                disabled={hasBet1}
                className="w-8 h-8 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
              >
                -
              </button>
              <input
                type="number"
                value={betAmount1.toFixed(2)}
                onChange={(e) => setBetAmount1(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                disabled={hasBet1}
                className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-center text-white font-bold disabled:opacity-50"
                min="0.01"
                step="0.01"
              />
              <button 
                onClick={() => setBetAmount1(betAmount1 + 0.1)}
                disabled={hasBet1}
                className="w-8 h-8 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
          
          {!hasBet1 ? (
            <button
              onClick={() => placeBet(1)}
              disabled={betAmount1 > balance}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg"
            >
              Place Bet
            </button>
          ) : cashedOut1 ? (
            <button
              disabled
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg"
            >
              Cashed Out! ₹{(betAmount1 * currentMultiplier).toFixed(2)}
            </button>
          ) : (
            <button
              onClick={() => cashOut(1)}
              disabled={gameState !== "flying"}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg animate-pulse"
            >
              Cash Out ₹{(betAmount1 * currentMultiplier).toFixed(2)}
            </button>
          )}
        </div>

        {/* Bet 2 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">Bet 2</span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setBetAmount2(Math.max(0.01, betAmount2 - 0.1))}
                disabled={hasBet2}
                className="w-8 h-8 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
              >
                -
              </button>
              <input
                type="number"
                value={betAmount2.toFixed(2)}
                onChange={(e) => setBetAmount2(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                disabled={hasBet2}
                className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-center text-white font-bold disabled:opacity-50"
                min="0.01"
                step="0.01"
              />
              <button 
                onClick={() => setBetAmount2(betAmount2 + 0.1)}
                disabled={hasBet2}
                className="w-8 h-8 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
          
          {!hasBet2 ? (
            <button
              onClick={() => placeBet(2)}
              disabled={betAmount2 > balance}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg"
            >
              Place Bet
            </button>
          ) : cashedOut2 ? (
            <button
              disabled
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg"
            >
              Cashed Out! ₹{(betAmount2 * currentMultiplier).toFixed(2)}
            </button>
          ) : (
            <button
              onClick={() => cashOut(2)}
              disabled={gameState !== "flying"}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg animate-pulse"
            >
              Cash Out ₹{(betAmount2 * currentMultiplier).toFixed(2)}
            </button>
          )}
        </div>
      </div>

      {/* Betting Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* My Recent Bets */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">My Recent Bets</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div className="flex justify-between text-sm"><span>₹50.00</span><span className="text-green-400">2.45x</span><span className="text-green-400">+₹122.50</span></div>
            <div className="flex justify-between text-sm"><span>₹25.00</span><span className="text-red-400">1.12x</span><span className="text-red-400">-₹25.00</span></div>
            <div className="flex justify-between text-sm"><span>₹100.00</span><span className="text-green-400">5.67x</span><span className="text-green-400">+₹567.00</span></div>
            <div className="flex justify-between text-sm"><span>₹75.00</span><span className="text-red-400">1.05x</span><span className="text-red-400">-₹75.00</span></div>
            <div className="flex justify-between text-sm"><span>₹200.00</span><span className="text-green-400">3.21x</span><span className="text-green-400">+₹642.00</span></div>
            <div className="flex justify-between text-sm"><span>₹30.00</span><span className="text-green-400">1.89x</span><span className="text-green-400">+₹56.70</span></div>
            <div className="flex justify-between text-sm"><span>₹150.00</span><span className="text-red-400">1.01x</span><span className="text-red-400">-₹150.00</span></div>
            <div className="flex justify-between text-sm"><span>₹80.00</span><span className="text-green-400">4.56x</span><span className="text-green-400">+₹364.80</span></div>
            <div className="flex justify-between text-sm"><span>₹60.00</span><span className="text-green-400">2.78x</span><span className="text-green-400">+₹166.80</span></div>
            <div className="flex justify-between text-sm"><span>₹40.00</span><span className="text-red-400">1.23x</span><span className="text-red-400">-₹40.00</span></div>
          </div>
        </div>

        {/* All Users Bets */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Live Bets</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div className="flex justify-between text-sm"><span>Player123</span><span>₹75.00</span><span className="text-yellow-400">Flying...</span></div>
            <div className="flex justify-between text-sm"><span>Winner99</span><span>₹200.00</span><span className="text-green-400">3.21x</span></div>
            <div className="flex justify-between text-sm"><span>Lucky777</span><span>₹150.00</span><span className="text-red-400">Crashed</span></div>
            <div className="flex justify-between text-sm"><span>AceFlyer</span><span>₹300.00</span><span className="text-green-400">2.45x</span></div>
            <div className="flex justify-between text-sm"><span>SkyHigh</span><span>₹50.00</span><span className="text-yellow-400">Flying...</span></div>
            <div className="flex justify-between text-sm"><span>JetPilot</span><span>₹125.00</span><span className="text-red-400">Crashed</span></div>
            <div className="flex justify-between text-sm"><span>FlyBoy88</span><span>₹80.00</span><span className="text-green-400">4.12x</span></div>
            <div className="flex justify-between text-sm"><span>WingMan</span><span>₹180.00</span><span className="text-yellow-400">Flying...</span></div>
            <div className="flex justify-between text-sm"><span>AirForce</span><span>₹220.00</span><span className="text-green-400">1.89x</span></div>
            <div className="flex justify-between text-sm"><span>TopGun</span><span>₹350.00</span><span className="text-red-400">Crashed</span></div>
          </div>
        </div>

        {/* Top Winners */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🏆 Top Winners</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div className="flex justify-between text-sm"><span>🥇 BigWinner</span><span className="text-yellow-400">₹15,420</span></div>
            <div className="flex justify-between text-sm"><span>🥈 LuckyAce</span><span className="text-gray-300">₹8,750</span></div>
            <div className="flex justify-between text-sm"><span>🥉 FlyHigh</span><span className="text-orange-400">₹6,230</span></div>
            <div className="flex justify-between text-sm"><span>4. SkyKing</span><span className="text-blue-400">₹5,890</span></div>
            <div className="flex justify-between text-sm"><span>5. JetMaster</span><span className="text-purple-400">₹4,560</span></div>
            <div className="flex justify-between text-sm"><span>6. AirChamp</span><span className="text-green-400">₹4,120</span></div>
            <div className="flex justify-between text-sm"><span>7. WinPilot</span><span className="text-cyan-400">₹3,780</span></div>
            <div className="flex justify-between text-sm"><span>8. FlyWinner</span><span className="text-pink-400">₹3,450</span></div>
            <div className="flex justify-between text-sm"><span>9. AviatorPro</span><span className="text-indigo-400">₹3,210</span></div>
            <div className="flex justify-between text-sm"><span>10. SoarHigh</span><span className="text-teal-400">₹2,980</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}