"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Car {
  x: number
  y: number
  speed: number
}

interface Obstacle {
  x: number
  y: number
  width: number
  height: number
}

export default function Racing() {
  const [gameState, setGameState] = useState<"waiting" | "playing" | "gameOver">("waiting")
  const [playerCar, setPlayerCar] = useState<Car>({ x: 375, y: 300, speed: 0 })
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [score, setScore] = useState(0)
  const [speed, setSpeed] = useState(2)
  const [distance, setDistance] = useState(0)

  const initializeGame = () => {
    setPlayerCar({ x: 375, y: 300, speed: 0 })
    setObstacles([])
    setScore(0)
    setSpeed(2)
    setDistance(0)
    setGameState("playing")
  }

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (gameState !== "playing") return

      setPlayerCar((prev) => {
        let newX = prev.x
        if (event.code === "ArrowLeft") {
          newX = Math.max(250, prev.x - 15)
        }
        if (event.code === "ArrowRight") {
          newX = Math.min(500, prev.x + 15)
        }
        return { ...prev, x: newX }
      })
    },
    [gameState],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    if (gameState !== "playing") return

    const gameLoop = setInterval(() => {
      // Move obstacles down
      setObstacles((prev) => {
        const newObstacles = prev
          .map((obstacle) => ({ ...obstacle, y: obstacle.y + speed }))
          .filter((obstacle) => obstacle.y < 400)

        // Add new obstacles randomly
        if (Math.random() < 0.02) {
          const lanes = [275, 325, 375, 425, 475]
          const lane = lanes[Math.floor(Math.random() * lanes.length)]
          newObstacles.push({
            x: lane,
            y: -50,
            width: 30,
            height: 50,
          })
        }

        return newObstacles
      })

      // Update score and speed
      setScore((prev) => prev + 1)
      setDistance((prev) => prev + speed)
      setSpeed((prev) => Math.min(8, prev + 0.001))

      // Check collisions
      setObstacles((currentObstacles) => {
        const collision = currentObstacles.some(
          (obstacle) =>
            playerCar.x < obstacle.x + obstacle.width &&
            playerCar.x + 30 > obstacle.x &&
            playerCar.y < obstacle.y + obstacle.height &&
            playerCar.y + 40 > obstacle.y,
        )

        if (collision) {
          setGameState("gameOver")
        }

        return currentObstacles
      })
    }, 16)

    return () => clearInterval(gameLoop)
  }, [gameState, speed, playerCar.x, playerCar.y])

  return (
    <Card className="w-full max-w-2xl mx-auto bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-white">Highway Racing</CardTitle>
        <div className="flex justify-between items-center">
          <Badge variant="secondary">Score: {score}</Badge>
          <Badge variant="outline">Speed: {speed.toFixed(1)}</Badge>
          <Badge variant="default">Distance: {Math.floor(distance)}m</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === "waiting" && (
          <div className="text-center space-y-4">
            <p className="text-slate-300">Use LEFT and RIGHT arrow keys to avoid obstacles!</p>
            <p className="text-slate-400 text-sm">The longer you survive, the faster you go!</p>
            <Button onClick={initializeGame} className="bg-red-600 hover:bg-red-700">
              Start Racing
            </Button>
          </div>
        )}

        {(gameState === "playing" || gameState === "gameOver") && (
          <div className="relative">
            {/* Game Canvas */}
            <div className="relative w-full h-96 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg overflow-hidden">
              {/* Road */}
              <div className="absolute inset-0 bg-gray-700">
                {/* Road lines */}
                <div className="absolute left-1/4 top-0 w-1 h-full bg-white opacity-50" />
                <div className="absolute left-2/4 top-0 w-1 h-full bg-yellow-400" />
                <div className="absolute left-3/4 top-0 w-1 h-full bg-white opacity-50" />

                {/* Lane dividers */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-8 bg-white opacity-30"
                    style={{
                      left: "50%",
                      top: `${i * 50 - (distance % 50)}px`,
                      transform: "translateX(-50%)",
                    }}
                  />
                ))}
              </div>

              {/* Obstacles */}
              {obstacles.map((obstacle, index) => (
                <div
                  key={index}
                  className="absolute bg-blue-600 rounded"
                  style={{
                    left: `${obstacle.x}px`,
                    top: `${obstacle.y}px`,
                    width: `${obstacle.width}px`,
                    height: `${obstacle.height}px`,
                  }}
                />
              ))}

              {/* Player Car */}
              <div
                className="absolute w-8 h-10 bg-red-500 rounded transition-all duration-100"
                style={{
                  left: `${playerCar.x}px`,
                  top: `${playerCar.y}px`,
                }}
              />
            </div>

            {gameState === "gameOver" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-red-400">Crash!</h3>
                  <p className="text-slate-300">Distance: {Math.floor(distance)}m</p>
                  <p className="text-slate-300">Final Score: {score}</p>
                  <Button onClick={initializeGame} className="bg-red-600 hover:bg-red-700">
                    Race Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center text-sm text-slate-400">
          <p>Controls: ← → Arrow Keys to steer</p>
        </div>
      </CardContent>
    </Card>
  )
}
