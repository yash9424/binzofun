"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Gamepad2, History } from "lucide-react"
import Link from "next/link"

interface Position {
  x: number
  y: number
}

interface Obstacle {
  x: number
  y: number
  type: "car" | "truck" | "log"
  speed: number
  direction: "up" | "down"
  lane: number
}

interface BetHistory {
  id: number
  amount: number
  result: "win" | "lose"
  score: number
  winAmount: number
  timestamp: Date
}

export function ChickenRoadGame() {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 5 })
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(50)
  const [customBet, setCustomBet] = useState("")
  const [betHistory, setBetHistory] = useState<BetHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [currentBet, setCurrentBet] = useState(0)

  const GRID_WIDTH = 11
  const GRID_HEIGHT = 10

  const resetGame = () => {
    setPlayerPos({ x: 0, y: 5 })
    setObstacles([])
    setScore(0)
    setGameOver(false)
    setIsPlaying(false)
    setCurrentBet(0)
  }

  const startGame = () => {
    if (balance < betAmount) return
    setBalance(prev => prev - betAmount)
    setCurrentBet(betAmount)
    resetGame()
    setIsPlaying(true)
  }

  const movePlayer = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (!isPlaying || gameOver) return

      setPlayerPos((prev) => {
        let newX = prev.x
        let newY = prev.y

        switch (direction) {
          case "up":
            newY = Math.max(0, prev.y - 1)
            break
          case "down":
            newY = Math.min(GRID_HEIGHT - 1, prev.y + 1)
            break
          case "left":
            newX = Math.max(0, prev.x - 1)
            break
          case "right":
            newX = Math.min(GRID_WIDTH - 1, prev.x + 1)
            break
        }

        if (newX === GRID_WIDTH - 1) {
          setScore((prev) => {
            const newScore = prev + 100
            // Check for win condition (reaching certain score)
            if (newScore >= 500) {
              const multiplier = Math.floor(newScore / 100)
              const winAmount = currentBet * multiplier
              setBalance(prevBalance => prevBalance + winAmount)
              
              // Add to bet history - win
              const newHistoryEntry: BetHistory = {
                id: Date.now() + Math.random(),
                amount: currentBet,
                result: "win",
                score: newScore,
                winAmount: winAmount,
                timestamp: new Date()
              }
              setBetHistory(prevHistory => [newHistoryEntry, ...prevHistory.slice(0, 9)])
              
              setGameOver(true)
              setIsPlaying(false)
              setHighScore((prevHigh) => Math.max(prevHigh, newScore))
            }
            return newScore
          })
          return { x: 0, y: 5 }
        }

        return { x: newX, y: newY }
      })
    },
    [isPlaying, gameOver],
  )

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault()
          movePlayer("up")
          break
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault()
          movePlayer("down")
          break
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault()
          movePlayer("left")
          break
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault()
          movePlayer("right")
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [movePlayer])

  useEffect(() => {
    if (!isPlaying || gameOver) return

    const gameLoop = setInterval(() => {
      setObstacles((prev) => {
        const updated = prev
          .map((obstacle) => {
            const newY = obstacle.direction === "down" 
              ? obstacle.y + obstacle.speed 
              : obstacle.y - obstacle.speed
            return {
              ...obstacle,
              y: newY,
            }
          })
          .filter((obstacle) => obstacle.y > -3 && obstacle.y < GRID_HEIGHT + 3)

        // Realistic traffic spawning with lane-specific patterns
        if (Math.random() < 0.4) {
          const speedRound = Math.floor(score / 500) + 1
          const speedMultiplier = 1 + (speedRound - 1) * 0.2
          
          // Define realistic lane patterns for all road lanes
          const laneConfigs = [
            { lane: 1, direction: "down", types: ["car", "truck"], baseSpeed: 0.4 },
            { lane: 2, direction: "down", types: ["car", "truck"], baseSpeed: 0.4 },
            { lane: 3, direction: "down", types: ["car", "log"], baseSpeed: 0.5 },
            { lane: 4, direction: "up", types: ["car", "truck"], baseSpeed: 0.3 },
            { lane: 5, direction: "up", types: ["car", "log"], baseSpeed: 0.4 },
            { lane: 6, direction: "down", types: ["truck", "car"], baseSpeed: 0.35 },
            { lane: 7, direction: "down", types: ["car", "log"], baseSpeed: 0.45 },
            { lane: 8, direction: "up", types: ["car", "truck"], baseSpeed: 0.4 },
            { lane: 9, direction: "up", types: ["car", "log"], baseSpeed: 0.45 },
          ]
          
          const config = laneConfigs[Math.floor(Math.random() * laneConfigs.length)]
          const vehicleType = config.types[Math.floor(Math.random() * config.types.length)] as "car" | "truck" | "log"
          
          // Realistic speed variations
          let speed = config.baseSpeed * speedMultiplier
          if (vehicleType === "car") speed *= (0.8 + Math.random() * 0.4) // 0.8x to 1.2x variation
          if (vehicleType === "truck") speed *= (0.7 + Math.random() * 0.3) // Slower, less variation
          if (vehicleType === "log") speed *= (1.2 + Math.random() * 0.3) // Faster
          
          // Prevent spawning too close to existing vehicles in same lane
          const laneOccupied = updated.some(obs => 
            obs.x === config.lane && 
            obs.direction === config.direction &&
            ((config.direction === "down" && obs.y < 2) || 
             (config.direction === "up" && obs.y > GRID_HEIGHT - 3))
          )
          
          if (!laneOccupied) {
            updated.push({
              x: config.lane,
              y: config.direction === "down" ? -1 : GRID_HEIGHT,
              type: vehicleType,
              speed: speed,
              direction: config.direction,
              lane: config.lane,
            })
          }
        }

        return updated
      })

      setObstacles((current) => {
        const collision = current.some((obstacle) => {
          const obstacleGridY = Math.round(obstacle.y)
          return obstacle.x === playerPos.x && obstacleGridY === playerPos.y
        })

        if (collision) {
          setGameOver(true)
          setIsPlaying(false)
          setHighScore((prev) => Math.max(prev, score))
          
          // Add to bet history - loss
          const newHistoryEntry: BetHistory = {
            id: Date.now() + Math.random(),
            amount: currentBet,
            result: "lose",
            score: score,
            winAmount: 0,
            timestamp: new Date()
          }
          setBetHistory(prev => [newHistoryEntry, ...prev.slice(0, 9)])
        }

        return current
      })

      setScore((prev) => prev + 1)
    }, 80)

    return () => clearInterval(gameLoop)
  }, [isPlaying, gameOver, playerPos, score])

  const renderGrid = () => {
    const grid = []

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        let cellContent = ""
        let cellClass = "w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center text-lg sm:text-2xl md:text-3xl lg:text-4xl relative "
        let hasObstacle = false

        if (x === 0) {
          // Left grass area (start)
          cellClass += "bg-green-500 "
          if (y === 5) cellContent = "🐥"
        } else if (x === 1) {
          // Left road lane
          cellClass += "bg-gray-800 "
        } else if (x === 9) {
          // Right road lane
          cellClass += "bg-gray-800 "
        } else if (x === 10) {
          // Right grass area (goal)
          cellClass += "bg-green-500 "
          if (y === 5) cellContent = "🏁"
        } else {
          // Road without borders
          cellClass += "bg-gray-800 "
        }

        if (playerPos.x === x && playerPos.y === y) {
          cellContent = "🐔"
          cellClass += "text-xl sm:text-3xl md:text-4xl lg:text-5xl z-20 relative transform scale-x-[-1] "
        }
 
        obstacles.forEach((obstacle) => {
          const obstacleGridY = Math.round(obstacle.y)
          if (obstacle.x === x && obstacleGridY === y) {
            hasObstacle = true
            const rotation = obstacle.direction === "down" ? "-rotate-90" : "rotate-90"
            switch (obstacle.type) {
              case "car":
                cellContent = "🚗"
                cellClass += `transform ${rotation} text-lg sm:text-2xl md:text-3xl lg:text-4xl `
                break
              case "truck":
                cellContent = "🚛"
                cellClass += `transform ${rotation} text-xl sm:text-3xl md:text-4xl lg:text-5xl `
                break
              case "log":
                cellContent = "🚐"
                cellClass += `transform ${rotation} text-lg sm:text-2xl md:text-3xl lg:text-4xl `
                break
            }
          }
        })

        grid.push(
          <div 
            key={`${x}-${y}`} 
            className={cellClass}
          >
            {cellContent}
            {/* Lane markings and road details */}
            {x >= 1 && x <= 9 && y % 2 === 0 && (
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-yellow-400 opacity-60 transform -translate-y-1/2"></div>
            )}
            {/* Traffic direction arrows */}
            {x === 2 && y === 1 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-30">↓</div>
            )}
            {x === 3 && y === 1 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-30">↓</div>
            )}
            {x === 4 && y === 8 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-30">↑</div>
            )}
            {x === 5 && y === 8 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-30">↑</div>
            )}
            {x === 6 && y === 1 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-30">↓</div>
            )}
            {x === 7 && y === 1 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-30">↓</div>
            )}
          </div>,
        )
      }
    }

    return grid
  }

  return (
    <div className="min-h-screen bg-black text-white space-y-4 p-2 sm:p-4 lg:p-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-gray-800">
            <Link href="/games">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="text-center flex-1">
            <h1 className="font-bold text-xl sm:text-2xl text-white drop-shadow-lg">
              🐔 Chicken Road
            </h1>
          </div>
          <div className="text-white font-bold text-right text-sm sm:text-base">
            <div>Score: {score}</div>
            <div className="text-xs sm:text-sm text-yellow-400">Speed Round: {Math.floor(score / 500) + 1}</div>
          </div>
        </div>

        <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-1 sm:p-2 shadow-xl overflow-hidden">
          <div className="grid grid-cols-11 gap-0 rounded overflow-hidden max-w-full">{renderGrid()}</div>
          
          {/* Multiplier circles on road - properly centered */}
          <div className="absolute inset-0 pointer-events-none" >
            {[1.01, 1.03, 1.06, 1.10, 1.15, 1.19, 1.24, 1.30, 1.75].map((mult, i) => {
              const cellX = 1 + i
              const cellY = 5
              return (
                <div 
                  key={i}
                  className="absolute bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white font-bold z-10"
                  style={{
                    width: 'clamp(16px, 4vw, 44px)',
                    height: 'clamp(16px, 4vw, 44px)',
                    fontSize: 'clamp(6px, 1.5vw, 14px)',
                    left: `${(cellX * 100) / 11}%`,
                    top: `${(cellY * 100) / 10}%`,
                    transform: 'translate(50%, 50%)'
                  }}
                >
                  {mult}x
                </div>
              )
            })}
          </div>

          {gameOver && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded z-50">
              <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg text-center">
                <div className={`text-2xl font-bold mb-2 ${
                  score >= 500 ? "text-green-500" : "text-red-500"
                }`}>
                  {score >= 500 ? "🎉 You Won!" : "Game Over!"}
                </div>
                <div className="text-white mb-2">Final Score: {score}</div>
                {score >= 500 && (
                  <div className="text-green-400 mb-4">
                    Won: ₹{Math.floor(score / 100) * currentBet}
                  </div>
                )}
                <Button onClick={() => setGameOver(false)} className="bg-green-600 hover:bg-green-700">
                  Play Again
                </Button>
              </div>
            </div>
          )}

          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded z-50">
              <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg text-center">
                <div className="text-white mb-4">
                  <div className="text-lg font-bold mb-2">🐔 Chicken Road</div>
                  <div className="text-sm">Set your bet below and start playing!</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Touch Controls */}
        <div className="mt-4 grid grid-cols-3 gap-2 max-w-xs mx-auto sm:hidden">
          <div></div>
          <Button 
            onClick={() => movePlayer("up")} 
            className="bg-gray-700 hover:bg-gray-600 text-2xl p-4"
            disabled={!isPlaying || gameOver}
          >
            ⬆️
          </Button>
          <div></div>
          <Button 
            onClick={() => movePlayer("left")} 
            className="bg-gray-700 hover:bg-gray-600 text-2xl p-4"
            disabled={!isPlaying || gameOver}
          >
            ⬅️
          </Button>
          <Button 
            onClick={() => movePlayer("down")} 
            className="bg-gray-700 hover:bg-gray-600 text-2xl p-4"
            disabled={!isPlaying || gameOver}
          >
            ⬇️
          </Button>
          <Button 
            onClick={() => movePlayer("right")} 
            className="bg-gray-700 hover:bg-gray-600 text-2xl p-4"
            disabled={!isPlaying || gameOver}
          >
            ➡️
          </Button>
        </div>
        
        {/* Betting Section */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">₹{balance}</div>
                  <div className="text-sm text-gray-400">Balance</div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Quick Bet</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 100, 200].map(amount => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount(amount)}
                        className={`${
                          betAmount === amount ? 'bg-green-600 border-green-600' : 'bg-gray-700 border-gray-600'
                        } text-white hover:bg-green-700`}
                        disabled={isPlaying}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Custom Bet</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customBet}
                      onChange={(e) => setCustomBet(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      disabled={isPlaying}
                    />
                    <Button
                      onClick={() => {
                        const amount = parseInt(customBet)
                        if (amount > 0 && amount <= balance) {
                          setBetAmount(amount)
                          setCustomBet("")
                        }
                      }}
                      disabled={isPlaying || !customBet || parseInt(customBet) <= 0 || parseInt(customBet) > balance}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Set
                    </Button>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-white mb-2">Current Bet: ₹{betAmount}</div>
                  {!isPlaying && !gameOver && (
                    <Button
                      onClick={startGame}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                      disabled={balance < betAmount}
                    >
                      🎮 Start Game - Bet ₹{betAmount}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <History className="h-5 w-5" />
                Bet History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {betHistory.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">No bets yet</div>
                ) : (
                  betHistory.map((bet) => (
                    <div key={bet.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <div>
                        <div className={`font-bold ${
                          bet.result === 'win' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {bet.result === 'win' ? '🎉 WIN' : '💥 LOSE'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Score: {bet.score}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">₹{bet.amount}</div>
                        {bet.result === 'win' && (
                          <div className="text-green-400 text-xs">+₹{bet.winAmount}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-4 text-center text-white">
          <p className="text-xs sm:text-sm opacity-80">
            <span className="hidden sm:inline">Use WASD or Arrow Keys to move • </span>
            <span className="sm:hidden">Use touch controls above • </span>
            Avoid vehicles • Reach 500 points to win!
          </p>
        </div>
      </div>
    </div>
  )
}