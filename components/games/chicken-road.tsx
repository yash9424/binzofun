"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Gamepad2 } from "lucide-react"
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
}

export function ChickenRoadGame() {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 5 })
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const GRID_WIDTH = 11
  const GRID_HEIGHT = 10

  const resetGame = () => {
    setPlayerPos({ x: 0, y: 5 })
    setObstacles([])
    setScore(0)
    setGameOver(false)
    setIsPlaying(false)
  }

  const startGame = () => {
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
          setScore((prev) => prev + 100)
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
          .map((obstacle) => ({
            ...obstacle,
            y: obstacle.y + obstacle.speed,
          }))
          .filter((obstacle) => obstacle.y > -2 && obstacle.y < GRID_HEIGHT + 2)

        if (Math.random() < 0.25) {
          const lanes = [2, 3, 4, 5, 6, 7]
          const lane = lanes[Math.floor(Math.random() * lanes.length)]
          const vehicleType = Math.random() < 0.6 ? "car" : Math.random() < 0.85 ? "truck" : "log"
          
          // Speed increases every 500 points
          const speedRound = Math.floor(score / 500) + 1
          const speedMultiplier = 1 + (speedRound - 1) * 0.3
          
          let speed = 0.3 * speedMultiplier
          if (vehicleType === "car") speed = (Math.random() < 0.5 ? 0.4 : 0.5) * speedMultiplier
          if (vehicleType === "truck") speed = 0.3 * speedMultiplier
          if (vehicleType === "log") speed = 0.6 * speedMultiplier

          updated.push({
            x: lane,
            y: -1,
            type: vehicleType,
            speed: speed,
          })
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
        }

        return current
      })

      setScore((prev) => prev + 1)
    }, 100)

    return () => clearInterval(gameLoop)
  }, [isPlaying, gameOver, playerPos, score])

  const renderGrid = () => {
    const grid = []

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        let cellContent = ""
        let cellClass = "w-16 h-16 flex items-center justify-center text-4xl relative "
        let hasObstacle = false

        if (x === 0) {
          // Left grass area (start)
          cellClass += "bg-green-500 "
          if (y === 5) cellContent = "🐥"
        } else if (x === 1) {
          // Left sidewalk
          cellClass += "bg-black-400 "
        } else if (x === 9) {
          // Right sidewalk
          cellClass += "bg-black-400 "
        } else if (x === 10) {
          // Right grass area (goal)
          cellClass += "bg-green-500 "
          if (y === 5) cellContent = "🏁"
        } else {
          // Road with lane markings
          cellClass += "bg-gray-800 border-gray-600 "
          if (x === 5) cellClass += "border-l-2 border-r-2 border-dashed border-yellow-400 "
        }

        if (playerPos.x === x && playerPos.y === y) {
          cellContent = "🐔"
          cellClass += "text-5xl z-20 relative transform scale-x-[-1] "
        }
 
        obstacles.forEach((obstacle) => {
          const obstacleGridY = Math.round(obstacle.y)
          if (obstacle.x === x && obstacleGridY === y) {
            hasObstacle = true
            cellClass += "animate-pulse "
            switch (obstacle.type) {
              case "car":
                cellContent = "🚗"
                cellClass += "transform rotate-[270deg] text-4xl drop-shadow-lg "
                break
              case "truck":
                cellContent = "🚛"
                cellClass += "transform rotate-[270deg] text-5xl drop-shadow-lg "
                break
              case "log":
                cellContent = "🚐"
                cellClass += "transform rotate-[270deg] text-4xl drop-shadow-lg "
                break
            }
          }
        })

        grid.push(
          <div 
            key={`${x}-${y}`} 
            className={cellClass}
            style={{
              background: x > 1 && x < 9 ? 'linear-gradient(180deg, #374151 0%, #1f2937 100%)' : undefined,
              boxShadow: hasObstacle ? '0 4px 8px rgba(0,0,0,0.3)' : undefined
            }}
          >
            {cellContent}
            {x > 1 && x < 9 && y % 2 === 0 && (
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-yellow-400 opacity-60 transform -translate-y-1/2"></div>
            )}
          </div>,
        )
      }
    }

    return grid
  }

  return (
    <div className="min-h-screen bg-black text-white space-y-6 p-6">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-gray-800">
            <Link href="/games">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="font-bold text-2xl text-white drop-shadow-lg">
              🐔 Chicken Road
            </h1>
          </div>
          <div className="text-white font-bold text-right">
            <div>Score: {score}</div>
            <div className="text-sm text-yellow-400">Speed Round: {Math.floor(score / 500) + 1}</div>
          </div>
        </div>

        <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-xl">
          <div className="grid grid-cols-11 gap-0 rounded overflow-hidden ">{renderGrid()}</div>
          
          {/* Multiplier circles on road */}
          <div className="absolute inset-0 pointer-events-none" >
            {[1.01, 1.03, 1.06, 1.10, 1.15, 1.19, 1.24, 1.30, 1.75].map((mult, i) => {
              const cellX = 1 + i // Start from cell 2 (first road cell)
              const cellY = 5 // Middle row
              return (
                <div 
                  key={i}
                  className="absolute w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold animate-pulse z-10"
                  style={{
                    left: `${(cellX * 100) / 11 + 100/22}%`,
                    top: `${(cellY * 100) / 10 + 100/20}%`,
                    transform: 'translate(-50%, -50%)'
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
                <div className="text-2xl font-bold text-red-500 mb-2">Game Over!</div>
                <div className="text-white mb-4">Final Score: {score}</div>
                <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                  Play Again
                </Button>
              </div>
            </div>
          )}

          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded z-50">
              <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg text-center">
                <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8">
                  🎮 Start Game
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-white">
          <p className="text-sm opacity-80">Use WASD or Arrow Keys to move • Avoid vehicles • Reach the right to score!</p>
        </div>
      </div>
    </div>
  )
}