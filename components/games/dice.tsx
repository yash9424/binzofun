"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Dice6 } from "lucide-react"
import Link from "next/link"

export function DiceGame() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(10)
  const [profitOnWin, setProfitOnWin] = useState(0)
  const [target, setTarget] = useState([50.5])
  const [isOver, setIsOver] = useState(true)
  const [isRolling, setIsRolling] = useState(false)
  const [diceResult, setDiceResult] = useState<number | null>(null)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [autoRolls, setAutoRolls] = useState(10)
  const [currentAutoRoll, setCurrentAutoRoll] = useState(0)
  const [gameHistory, setGameHistory] = useState<
    Array<{
      result: number
      target: number
      isOver: boolean
      won: boolean
      multiplier: number
      winAmount: number
      timestamp: number
    }>
  >([])

  const winChance = isOver ? 100 - target[0] : target[0] - 1
  const multiplier = winChance > 0 ? 99 / winChance : 1
  const rollOver = isOver ? target[0] : target[0]

  useEffect(() => {
    setProfitOnWin(betAmount * (multiplier - 1))
  }, [betAmount, multiplier])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoMode && currentAutoRoll < autoRolls && !isRolling) {
      interval = setTimeout(() => {
        rollDice()
      }, 1000)
    } else if (currentAutoRoll >= autoRolls) {
      setIsAutoMode(false)
      setCurrentAutoRoll(0)
    }
    return () => clearTimeout(interval)
  }, [isAutoMode, currentAutoRoll, autoRolls, isRolling])

  const rollDice = async () => {
    if (betAmount <= 0) {
      alert("Please enter a valid bet amount!")
      return
    }
    if (betAmount > balance) {
      alert("Insufficient balance!")
      return
    }

    setIsRolling(true)
    setBalance((prev) => prev - betAmount)

    let rollCount = 0
    const rollInterval = setInterval(() => {
      setDiceResult(Math.random() * 99 + 1)
      rollCount++

      if (rollCount >= 12) {
        clearInterval(rollInterval)

        const finalResult = Math.random() * 99 + 1
        setDiceResult(finalResult)

        const won = isOver ? finalResult > target[0] : finalResult < target[0]
        const winAmount = won ? betAmount * multiplier : 0

        setGameHistory((prev) => [
          {
            result: finalResult,
            target: target[0],
            isOver,
            won,
            multiplier,
            winAmount,
            timestamp: Date.now(),
          },
          ...prev.slice(0, 19),
        ])

        if (won) {
          setBalance((prev) => prev + winAmount)
        }

        if (isAutoMode) {
          setCurrentAutoRoll((prev) => prev + 1)
        }

        setIsRolling(false)
      }
    }, 80)
  }

  const resetGame = () => {
    setBalance(1000)
    setGameHistory([])
    setDiceResult(null)
    setIsRolling(false)
    setIsAutoMode(false)
    setCurrentAutoRoll(0)
  }

  const startAutoMode = () => {
    setIsAutoMode(true)
    setCurrentAutoRoll(0)
  }

  const stopAutoMode = () => {
    setIsAutoMode(false)
    setCurrentAutoRoll(0)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 border-b border-slate-700 gap-3 sm:gap-0">
        <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white self-start">
          <Link href="/games">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Link>
        </Button>
        <Badge variant="outline" className="px-3 py-1 border-slate-600 text-slate-300">
          <Dice6 className="h-4 w-4 mr-1" />
          Provably Fair
        </Badge>
      </div>

      <div className="flex justify-center min-h-[calc(100vh-80px)]">
        <div className="flex flex-col lg:flex-row max-w-7xl w-full">
          <div className="w-full lg:w-80 bg-slate-800 border-r border-slate-700 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 order-2 lg:order-1">
            <div className="flex bg-slate-700 rounded-lg p-1">
              <Button
                variant={!isAutoMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsAutoMode(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-sm sm:text-base touch-manipulation"
              >
                Manual
              </Button>
              <Button
                variant={isAutoMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsAutoMode(true)}
                className="flex-1 text-slate-300 hover:bg-slate-600 text-sm sm:text-base touch-manipulation"
              >
                Auto
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm text-slate-300">Bet Amount</label>
                <span className="text-xs sm:text-sm text-slate-400">₹{betAmount.toFixed(2)}</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(0, Number.parseFloat(e.target.value) || 0))}
                  min="0"
                  step="0.01"
                  className="bg-slate-700 border-slate-600 text-white text-base sm:text-lg font-mono pr-16 sm:pr-20"
                  placeholder="10.00"
                  disabled={isRolling || isAutoMode}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBetAmount((prev) => Math.max(0.01, prev / 2))}
                    disabled={isRolling || isAutoMode}
                    className="h-6 w-6 p-0 text-orange-400 hover:bg-slate-600 touch-manipulation"
                  >
                    ½
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBetAmount((prev) => Math.min(balance, prev * 2))}
                    disabled={isRolling || isAutoMode}
                    className="h-6 w-6 p-0 text-orange-400 hover:bg-slate-600 touch-manipulation"
                  >
                    2x
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm text-slate-300">Profit on Win</label>
                <span className="text-xs sm:text-sm text-slate-400">₹{profitOnWin.toFixed(2)}</span>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  value={profitOnWin.toFixed(2)}
                  readOnly
                  className="bg-slate-700 border-slate-600 text-white text-base sm:text-lg font-mono pr-8"
                  placeholder="0.00"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
                </div>
              </div>
            </div>

            <Button
              onClick={rollDice}
              disabled={betAmount > balance || betAmount <= 0 || isRolling}
              className="w-full h-12 sm:h-14 bg-green-500 hover:bg-green-600 text-white font-bold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {isRolling ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Rolling...
                </>
              ) : (
                "Bet"
              )}
            </Button>

            <div className="text-center p-3 sm:p-4 bg-slate-700 rounded-lg">
              <div className="text-xs sm:text-sm text-slate-400">Balance</div>
              <div className="text-xl sm:text-2xl font-bold text-white">₹{balance.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex-1 p-3 sm:p-4 lg:p-6 flex items-center justify-center order-1 lg:order-2">
            <div className="w-full max-w-3xl space-y-4 sm:space-y-6 lg:space-y-8">
              {gameHistory.length > 0 && (
                <div className="text-center">
                  <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2">
                    {gameHistory.slice(0, 6).map((game, index) => (
                      <div
                        key={game.timestamp}
                        className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold font-mono flex-shrink-0 ${
                          game.won ? "bg-green-500 text-white" : "bg-slate-600 text-slate-300"
                        }`}
                      >
                        {game.result.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between text-xs sm:text-sm text-slate-400 px-2 sm:px-4">
                <span>1</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>

              <div className="relative px-2 sm:px-4">
                {diceResult !== null && !isRolling && (
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10"
                    style={{ left: `${((diceResult - 1) / 99) * 100}%` }}
                  >
                    <div className="relative bg-white border-2 border-gray-300 shadow-lg px-1 sm:px-2 py-1 rounded-md">
                      <div className="text-xs font-bold text-gray-800 font-mono whitespace-nowrap">
                        {diceResult.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-6 sm:h-8 bg-slate-700 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-red-500"
                    style={{
                      width: isOver ? `${((target[0] - 1) / 99) * 100}%` : `${((100 - target[0]) / 99) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-0 h-full bg-green-500"
                    style={{
                      left: isOver ? `${((target[0] - 1) / 99) * 100}%` : "0%",
                      width: isOver ? `${((100 - target[0]) / 99) * 100}%` : `${((target[0] - 1) / 99) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded border-2 border-white shadow-lg cursor-pointer"
                    style={{ left: `${((target[0] - 1) / 99) * 100}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="1"
                  max="100"
                  step="0.01"
                  value={target[0]}
                  onChange={(e) => setTarget([Number.parseFloat(e.target.value)])}
                  disabled={isRolling || isAutoMode}
                  className="absolute top-0 left-2 right-2 sm:left-4 sm:right-4 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] h-6 sm:h-8 opacity-0 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
                <div className="text-center bg-slate-800 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                  <div className="text-xs sm:text-sm text-slate-400 mb-1">Multiplier</div>
                  <div className="text-lg sm:text-xl font-bold text-white flex items-center justify-center">
                    {multiplier.toFixed(4)} <span className="ml-1 text-base sm:text-lg">×</span>
                  </div>
                </div>
                <div className="text-center bg-slate-800 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                  <div className="text-xs sm:text-sm text-slate-400 mb-1">Roll {isOver ? "Over" : "Under"}</div>
                  <div className="text-lg sm:text-xl font-bold text-white flex items-center justify-center">
                    {rollOver.toFixed(2)} <span className="ml-1 text-sm">🔄</span>
                  </div>
                </div>
                <div className="text-center bg-slate-800 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                  <div className="text-xs sm:text-sm text-slate-400 mb-1">Win Chance</div>
                  <div className="text-lg sm:text-xl font-bold text-white flex items-center justify-center">
                    {winChance.toFixed(4)} <span className="ml-1 text-base sm:text-lg">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
