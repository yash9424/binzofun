"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Mountain, ArrowLeft } from "lucide-react"
import { TreesIcon as ChristmasTree } from "lucide-react"

const RealisticTruck = ({ crashed, gameActive }: { crashed: boolean; gameActive: boolean }) => {
  return (
    <div className="relative">
      <svg width="80" height="48" viewBox="0 0 80 48" className="drop-shadow-2xl" style={{ transform: "scaleX(-1)" }}>
        {/* Truck Body */}
        <rect x="20" y="15" width="45" height="20" rx="2" fill="#E53E3E" stroke="#C53030" strokeWidth="1" />

        {/* Cargo Area */}
        <rect x="25" y="12" width="35" height="18" rx="1" fill="#FF6B35" stroke="#E53E3E" strokeWidth="1" />

        {/* Cargo Details */}
        <rect x="27" y="14" width="8" height="6" rx="1" fill="#FFD700" stroke="#FFA500" strokeWidth="0.5" />
        <rect x="37" y="14" width="8" height="6" rx="1" fill="#32CD32" stroke="#228B22" strokeWidth="0.5" />
        <rect x="47" y="14" width="8" height="6" rx="1" fill="#FF69B4" stroke="#FF1493" strokeWidth="0.5" />
        <rect x="32" y="22" width="8" height="6" rx="1" fill="#00CED1" stroke="#008B8B" strokeWidth="0.5" />
        <rect x="42" y="22" width="8" height="6" rx="1" fill="#FFD700" stroke="#FFA500" strokeWidth="0.5" />

        {/* Truck Cab */}
        <rect x="5" y="18" width="20" height="17" rx="2" fill="#DC2626" stroke="#B91C1C" strokeWidth="1" />

        {/* Windshield */}
        <rect
          x="7"
          y="20"
          width="16"
          height="8"
          rx="1"
          fill="#87CEEB"
          stroke="#4682B4"
          strokeWidth="0.5"
          opacity="0.8"
        />

        {/* Driver */}
        <circle cx="15" cy="24" r="3" fill="#8B4513" />
        <circle cx="15" cy="22" r="2" fill="#DEB887" />
        <rect x="13" y="26" width="4" height="6" fill="#4B0082" />

        {/* Driver Details (beard and hair) */}
        <path d="M13 24 Q15 26 17 24" fill="#654321" stroke="#4A4A4A" strokeWidth="0.3" />
        <path d="M13 20 Q15 18 17 20" fill="#2F4F4F" strokeWidth="0.3" />

        {/* Headlights */}
        <circle cx="8" cy="25" r="2" fill="#FFFF00" stroke="#FFD700" strokeWidth="0.5" />
        <circle cx="8" cy="30" r="1.5" fill="#FF4500" stroke="#FF6347" strokeWidth="0.5" />

        {/* Front Bumper */}
        <rect x="3" y="32" width="4" height="3" rx="1" fill="#C0C0C0" stroke="#A9A9A9" strokeWidth="0.5" />

        {/* Wheels */}
        <circle cx="15" cy="38" r="6" fill="#2F2F2F" stroke="#1A1A1A" strokeWidth="1" />
        <circle cx="15" cy="38" r="4" fill="#4A4A4A" stroke="#2F2F2F" strokeWidth="0.5" />
        <circle cx="15" cy="38" r="2" fill="#C0C0C0" />

        <circle cx="50" cy="38" r="6" fill="#2F2F2F" stroke="#1A1A1A" strokeWidth="1" />
        <circle cx="50" cy="38" r="4" fill="#4A4A4A" stroke="#2F2F2F" strokeWidth="0.5" />
        <circle cx="50" cy="38" r="2" fill="#C0C0C0" />

        <circle cx="60" cy="38" r="6" fill="#2F2F2F" stroke="#1A1A1A" strokeWidth="1" />
        <circle cx="60" cy="38" r="4" fill="#4A4A4A" stroke="#2F2F2F" strokeWidth="0.5" />
        <circle cx="60" cy="38" r="2" fill="#C0C0C0" />

        {/* Wheel Spokes */}
        <g stroke="#808080" strokeWidth="0.5" fill="none">
          <line x1="13" y1="36" x2="17" y2="40" />
          <line x1="17" y1="36" x2="13" y2="40" />
          <line x1="48" y1="36" x2="52" y2="40" />
          <line x1="52" y1="36" x2="48" y2="40" />
          <line x1="58" y1="36" x2="62" y2="40" />
          <line x1="62" y1="36" x2="58" y2="40" />
        </g>

        {/* Exhaust Smoke (when active) */}
        {gameActive && !crashed && (
          <g opacity="0.6">
            <circle cx="2" cy="28" r="1" fill="#D3D3D3" className="animate-ping" />
            <circle cx="0" cy="26" r="1.5" fill="#C0C0C0" className="animate-pulse" />
            <circle cx="-2" cy="24" r="1" fill="#B0B0B0" className="animate-ping" />
          </g>
        )}

        {/* Crash Effects */}
        {crashed && (
          <g>
            <text x="35" y="10" fontSize="8" fill="#FF0000" className="animate-bounce">
              💥
            </text>
            <text x="45" y="8" fontSize="6" fill="#FF4500" className="animate-pulse">
              💨
            </text>
          </g>
        )}
      </svg>

      {/* Additional Effects */}
      {gameActive && !crashed && (
        <>
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full opacity-60 animate-ping"></div>
          <div className="absolute -bottom-1 -right-2 w-3 h-3 bg-gray-500 rounded-full opacity-40 animate-pulse"></div>
          <div className="absolute top-1/2 -left-4 w-2 h-2 bg-gray-400 rounded-full opacity-50 animate-bounce"></div>
        </>
      )}
    </div>
  )
}

export function PushpaGame() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(100)
  const [multiplier, setMultiplier] = useState(1.0)
  const [gameActive, setGameActive] = useState(false)
  const [crashed, setCrashed] = useState(false)
  const [autoCashout, setAutoCashout] = useState(false)
  const [autoCashoutAt, setAutoCashoutAt] = useState(2.0)
  const [gameHistory, setGameHistory] = useState<number[]>([])

  const [obstacles, setObstacles] = useState([
    { id: 1, type: "tree", position: 25, passed: false },
    { id: 2, type: "rock", position: 45, passed: false },
    { id: 3, type: "tree", position: 65, passed: false },
    { id: 4, type: "rock", position: 85, passed: false },
  ])

  const generateCrashPoint = () => {
    const random = Math.random()
    if (random < 0.3) return 1.0 + Math.random() * 0.5 // 30% chance: 1.0-1.5x
    if (random < 0.6) return 1.5 + Math.random() * 1.0 // 30% chance: 1.5-2.5x
    if (random < 0.85) return 2.5 + Math.random() * 2.5 // 25% chance: 2.5-5.0x
    return 5.0 + Math.random() * 10.0 // 15% chance: 5.0-15.0x
  }

  const [crashPoint, setCrashPoint] = useState(generateCrashPoint())

  const startGame = () => {
    if (balance < betAmount || betAmount <= 0) return

    setBalance((prev) => prev - betAmount)
    setGameActive(true)
    setCrashed(false)
    setMultiplier(1.0)
    setCrashPoint(generateCrashPoint())
    setObstacles((prev) => prev.map((obs) => ({ ...obs, passed: false })))

    console.log("[v0] Game started with crash point:", crashPoint)
  }

  const cashOut = () => {
    if (!gameActive || crashed) return

    const winAmount = betAmount * multiplier
    setBalance((balance) => balance + winAmount)
    setGameActive(false)
    setGameHistory((prevHistory) => [multiplier, ...prevHistory.slice(0, 9)])

    console.log("[v0] Cashed out at:", multiplier, "Won:", winAmount)
  }

  useEffect(() => {
    if (!gameActive || crashed) return

    const interval = setInterval(() => {
      setMultiplier((prev) => {
        const newMultiplier = prev + 0.01
        const truckPosition = Math.min((newMultiplier - 1) * 20, 80)

        setObstacles((prevObstacles) =>
          prevObstacles.map((obstacle) => {
            if (!obstacle.passed && truckPosition > obstacle.position) {
              return { ...obstacle, passed: true }
            }
            return obstacle
          }),
        )

        if (newMultiplier >= crashPoint) {
          setCrashed(true)
          setGameActive(false)
          setGameHistory((prevHistory) => [crashPoint, ...prevHistory.slice(0, 9)])
          console.log("[v0] Game crashed at:", crashPoint)
          return crashPoint
        }

        if (autoCashout && newMultiplier >= autoCashoutAt) {
          const winAmount = betAmount * newMultiplier
          setBalance((balance) => balance + winAmount)
          setGameActive(false)
          setGameHistory((prevHistory) => [newMultiplier, ...prevHistory.slice(0, 9)])
          console.log("[v0] Auto cashed out at:", newMultiplier)
          return newMultiplier
        }

        return newMultiplier
      })
    }, 100)

    return () => clearInterval(interval)
  }, [gameActive, crashed, crashPoint, autoCashout, autoCashoutAt, betAmount, balance])

  const quickBetAmounts = [100, 250, 500, 1000]

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-800/80 border-slate-600 hover:bg-slate-700 text-white text-xs sm:text-sm touch-manipulation"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Back to Games
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-3 sm:py-4">
        <div className="w-full max-w-7xl bg-slate-800/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="text-center mb-4 sm:mb-6">
            <div className={`text-4xl sm:text-6xl lg:text-8xl font-bold mb-2 sm:mb-4 ${crashed ? "text-red-500" : "text-white"}`}>
              {multiplier.toFixed(2)}x
            </div>
            {crashed && <div className="text-red-500 text-xs sm:text-sm font-semibold animate-pulse">CRASHED!</div>}
          </div>

          <div className="relative h-48 sm:h-64 lg:h-80 mb-4 sm:mb-6 overflow-hidden bg-gradient-to-b from-teal-900/40 via-cyan-800/30 to-emerald-700/40 rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-teal-400/20 via-cyan-500/20 to-emerald-400/30"></div>

            {/* Far background - slowest moving mountains */}
            <div
              className={`absolute bottom-20 left-0 w-[300%] flex justify-between items-end ${gameActive && !crashed ? "animate-[scroll_12s_linear_infinite]" : ""}`}
            >
              {[...Array(12)].map((_, i) => (
                <Mountain
                  key={`far-${i}`}
                  className={`h-${12 + (i % 4) * 2} w-${12 + (i % 4) * 2} text-gray-800 opacity-40`}
                />
              ))}
            </div>

            {/* Artificial Christmas tree-like elements */}
            <div
              className={`absolute bottom-16 left-0 w-[250%] flex justify-between items-end ${gameActive && !crashed ? "animate-[scroll_8s_linear_infinite]" : ""}`}
            >
              {[...Array(15)].map((_, i) => (
                <ChristmasTree
                  key={`tree-${i}`}
                  className={`h-${12 + (i % 4) * 2} w-${12 + (i % 4) * 2} text-green-500 opacity-40`}
                />
              ))}
            </div>

            {/* Moving clouds in sky */}
            <div
              className={`absolute top-4 left-0 w-[400%] flex justify-between ${gameActive && !crashed ? "animate-[scroll_15s_linear_infinite]" : ""}`}
            >
              {[...Array(8)].map((_, i) => (
                <div key={`cloud-${i}`} className="flex">
                  <div className="w-8 h-4 bg-white opacity-30 rounded-full"></div>
                  <div className="w-6 h-3 bg-white opacity-25 rounded-full -ml-2 mt-1"></div>
                  <div className="w-4 h-2 bg-white opacity-20 rounded-full -ml-1 mt-1"></div>
                </div>
              ))}
            </div>

            {/* Moving birds - enhanced */}
            <div
              className={`absolute top-8 left-0 w-[350%] flex justify-between ${gameActive && !crashed ? "animate-[scroll_10s_linear_infinite]" : ""}`}
            >
              {[...Array(12)].map((_, i) => (
                <div key={`bird-${i}`} className="text-gray-700 opacity-90 text-xl animate-pulse">
                  {i % 3 === 0 ? "🦅" : i % 3 === 1 ? "🕊️" : "🐦"}
                </div>
              ))}
            </div>

            {/* Additional birds at different height */}
            <div
              className={`absolute top-12 left-0 w-[300%] flex justify-between ${gameActive && !crashed ? "animate-[scroll_8s_linear_infinite]" : ""}`}
            >
              {[...Array(10)].map((_, i) => (
                <div key={`bird2-${i}`} className="text-gray-600 opacity-85 text-lg">
                  {i % 2 === 0 ? "🦆" : "🐦"}
                </div>
              ))}
            </div>

            {/* Third layer of birds for more dynamic sky */}
            <div
              className={`absolute top-16 left-0 w-[400%] flex justify-between ${gameActive && !crashed ? "animate-[scroll_12s_linear_infinite]" : ""}`}
            >
              {[...Array(8)].map((_, i) => (
                <div key={`bird3-${i}`} className="text-gray-500 opacity-75 text-base animate-pulse">
                  {i % 4 === 0 ? "🦅" : i % 4 === 1 ? "🕊️" : i % 4 === 2 ? "🐦" : "🦆"}
                </div>
              ))}
            </div>

            {/* Roadside grass/bushes */}
            <div
              className={`absolute bottom-12 left-0 w-[180%] flex justify-between ${gameActive && !crashed ? "animate-[scroll_4s_linear_infinite]" : ""}`}
            >
              {[...Array(20)].map((_, i) => (
                <div key={`grass-${i}`} className="w-1 h-3 bg-green-400 opacity-60 rounded-t-full"></div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-b-lg overflow-hidden">
              {/* Base road surface */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>

              {/* Animated road texture */}
              <div className="absolute top-0 left-0 right-0 h-full opacity-30">
                <div className="w-[200%] h-full bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 animate-pulse"></div>
              </div>

              {/* Moving center line */}
              <div
                className={`absolute top-2 left-0 w-[200%] h-1 bg-yellow-300 opacity-80 ${gameActive && !crashed ? "animate-[scroll_6s_linear_infinite]" : ""}`}
              ></div>

              {/* Moving lane dividers - fast speed */}
              <div
                className={`absolute top-6 left-0 w-[300%] flex justify-between ${gameActive && !crashed ? "animate-[scroll_5s_linear_infinite]" : ""}`}
              >
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="w-6 h-1 bg-yellow-300 opacity-70"></div>
                ))}
              </div>

              {/* Moving lane dividers - medium speed */}
              <div
                className={`absolute top-8 left-0 w-[250%] flex justify-between ${gameActive && !crashed ? "animate-[scroll_7s_linear_infinite]" : ""}`}
              >
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-4 h-0.5 bg-white opacity-40"></div>
                ))}
              </div>

              {/* Moving road cracks/details */}
              <div
                className={`absolute top-4 left-0 w-[180%] flex justify-between ${gameActive && !crashed ? "animate-[scroll_8s_linear_infinite]" : ""}`}
              >
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="w-1 h-2 bg-gray-900 opacity-60 rotate-12"></div>
                ))}
              </div>

              {/* Side road markings */}
              <div
                className={`absolute top-1 left-0 w-[200%] h-0.5 bg-white opacity-50 ${gameActive && !crashed ? "animate-[scroll_6.5s_linear_infinite]" : ""}`}
              ></div>
              <div
                className={`absolute bottom-1 left-0 w-[200%] h-0.5 bg-white opacity-50 ${gameActive && !crashed ? "animate-[scroll_7.5s_linear_infinite]" : ""}`}
              ></div>
            </div>

            <div
              className={`absolute bottom-16 transition-all duration-100 z-10`}
              style={{
                left: `${Math.min((multiplier - 1) * 20, 80)}%`,
                transform: crashed ? "rotate(15deg) scale(0.9)" : "rotate(0deg)",
              }}
            >
              <RealisticTruck crashed={crashed} gameActive={gameActive} />
            </div>

            <div className="absolute top-2 sm:top-4 left-3 sm:left-6 right-3 sm:right-6">
              <div className="w-full h-1.5 sm:h-2 bg-gray-800/60 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-100 rounded-full shadow-lg"
                  style={{ width: `${Math.min((multiplier - 1) * 20, 80)}%` }}
                ></div>
              </div>
              <div className="text-xs sm:text-sm text-gray-300 mt-1 sm:mt-2 font-semibold">
                Journey Progress: {Math.min(Math.floor((multiplier - 1) * 20), 80)}%
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 sm:gap-0">
                  <span className="text-xs sm:text-sm">Bet Amount</span>
                  <div className="flex flex-wrap gap-1">
                    {quickBetAmounts.map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 bg-transparent touch-manipulation"
                        onClick={() => setBetAmount(amount)}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-sm sm:text-base"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm">Auto Cashout</span>
                  <Switch checked={autoCashout} onCheckedChange={setAutoCashout} />
                </div>
                <Input
                  type="number"
                  step="0.1"
                  value={autoCashoutAt}
                  onChange={(e) => setAutoCashoutAt(Number(e.target.value))}
                  disabled={!autoCashout}
                  className="bg-slate-700 border-slate-600 text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-row md:flex-col gap-2 md:space-y-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs bg-transparent hover:bg-slate-600 flex-1 md:flex-none touch-manipulation"
                  onClick={() => setBetAmount(Math.min(balance * 0.1, 500))}
                >
                  SELECT
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs bg-transparent hover:bg-slate-600 flex-1 md:flex-none touch-manipulation"
                  onClick={() => setBetAmount(Math.min(balance, 2000))}
                >
                  MAX
                </Button>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              {!gameActive ? (
                <Button
                  onClick={startGame}
                  disabled={balance < betAmount || betAmount <= 0}
                  className={`px-8 sm:px-12 lg:px-16 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-bold rounded-lg transition-all duration-200 touch-manipulation w-full sm:w-auto ${
                    balance < betAmount || betAmount <= 0
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-700 hover:scale-105 text-white shadow-lg hover:shadow-cyan-500/25"
                  }`}
                >
                  BET ₹{betAmount.toFixed(2)}
                </Button>
              ) : (
                <Button
                  onClick={cashOut}
                  disabled={crashed}
                  className={`px-8 sm:px-12 lg:px-16 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-bold rounded-lg transition-all duration-200 touch-manipulation w-full sm:w-auto ${
                    crashed
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 hover:scale-105 text-white shadow-lg hover:shadow-red-500/25 animate-pulse"
                  }`}
                >
                  CASH OUT ₹{(betAmount * multiplier).toFixed(2)}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {gameHistory.length > 0 && (
        <div className="fixed top-16 sm:top-20 right-2 sm:right-4 bg-slate-800/90 rounded-lg p-2 sm:p-4 max-w-xs z-40">
          <h3 className="text-xs sm:text-sm font-semibold mb-2">Recent Results</h3>
          <div className="flex flex-wrap gap-1">
            {gameHistory.map((result, index) => (
              <Badge key={index} variant={result < 2 ? "destructive" : "default"} className="text-xs">
                {result.toFixed(2)}x
              </Badge>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
      `}</style>
    </div>
  )
}
