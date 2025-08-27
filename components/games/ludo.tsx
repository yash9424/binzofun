"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Gamepad2, Dice6 } from "lucide-react"
import Link from "next/link"

<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
/>

export function LudoGame() {
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [diceValue, setDiceValue] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const players = [
    { name: "You", color: "bg-red-500", textColor: "text-red-500" },
    { name: "Bot 1", color: "bg-blue-500", textColor: "text-blue-500" },
    { name: "Bot 2", color: "bg-green-500", textColor: "text-green-500" },
    { name: "Bot 3", color: "bg-yellow-500", textColor: "text-yellow-500" },
  ]

  const rollDice = async () => {
    setIsRolling(true)
    let rollCount = 0
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1)
      rollCount++
      if (rollCount >= 8) {
        clearInterval(rollInterval)
        const finalValue = Math.floor(Math.random() * 6) + 1
        setDiceValue(finalValue)
        setIsRolling(false)
        setTimeout(() => {
          setCurrentPlayer((prev) => (prev + 1) % 4)
          setDiceValue(null)
        }, 2000)
      }
    }, 150)
  }

  const startGame = () => {
    setGameStarted(true)
    setCurrentPlayer(0)
    setDiceValue(null)
  }

  const resetGame = () => {
    setGameStarted(false)
    setCurrentPlayer(0)
    setDiceValue(null)
    setIsRolling(false)
  }

  const renderSquare = (row: number, col: number) => {
    // Green Home (top-left)
    if (row < 6 && col < 6) {
      if ((row >= 1 && row <= 4) && (col >= 1 && col <= 4)) {
        // Green player pieces in specific positions
        if ((row === 2 && col === 2) || (row === 2 && col === 3) || (row === 3 && col === 2) || (row === 3 && col === 3)) {
          return <div key={`${row}-${col}`} className="aspect-square bg-white border border-gray-300 flex items-center justify-center"><div className="w-6 h-6 bg-green-500 rounded-full border-2 border-green-700" /></div>
        }
        return <div key={`${row}-${col}`} className="aspect-square bg-white border border-gray-300" />
      }
      return <div key={`${row}-${col}`} className="aspect-square bg-green-600" />
    }
    
    // Yellow Home (top-right)
    if (row < 6 && col > 8) {
      if ((row >= 1 && row <= 4) && (col >= 10 && col <= 13)) {
        // Yellow player pieces in specific positions
        if ((row === 2 && col === 11) || (row === 2 && col === 12) || (row === 3 && col === 11) || (row === 3 && col === 12)) {
          return <div key={`${row}-${col}`} className="aspect-square bg-white border border-gray-300 flex items-center justify-center"><div className="w-6 h-6 bg-yellow-500 rounded-full border-2 border-yellow-700" /></div>
        }
        return <div key={`${row}-${col}`} className="aspect-square bg-white border border-gray-300" />
      }
      return <div key={`${row}-${col}`} className="aspect-square bg-yellow-500" />
    }
    
    // Red Home (bottom-left)
    if (row > 8 && col < 6) {
      if ((row >= 10 && row <= 13) && (col >= 1 && col <= 4)) {
        // Red player pieces in specific positions
        if ((row === 11 && col === 2) || (row === 11 && col === 3) || (row === 12 && col === 2) || (row === 12 && col === 3)) {
          return <div key={`${row}-${col}`} className="aspect-square bg-white border border-gray-300 flex items-center justify-center"><div className="w-6 h-6 bg-red-500 rounded-full border-2 border-red-700" /></div>
        }
        return <div key={`${row}-${col}`} className="aspect-square bg-white border border-gray-300" />
      }
      return <div key={`${row}-${col}`} className="aspect-square bg-red-600" />
    }
    
    // Blue Home (bottom-right)
    if (row > 8 && col > 8) {
      if ((row >= 10 && row <= 13) && (col >= 10 && col <= 13)) {
        // Blue player pieces in specific positions
        if ((row === 11 && col === 11) || (row === 11 && col === 12) || (row === 12 && col === 11) || (row === 12 && col === 12)) {
          return <div key={`${row}-${col}`} className="aspect-square bg-white border border-gray-300 flex items-center justify-center"><div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-blue-700" /></div>
        }
        return <div key={`${row}-${col}`} className="aspect-square bg-white border border-gray-300" />
      }
      return <div key={`${row}-${col}`} className="aspect-square bg-blue-600" />
    }
    
    // Center - Real Ludo board design
    if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
      // yellow triangle (top)
      if (row === 6 && col === 7 || row ===  6 && col === 8) return <div key={`${row}-${col}`} className="aspect-square bg-yellow-400 border border-yellow" />
      // blue triangle (right)
      if (row === 7 && col === 8 || row === 8 && col === 8) return <div key={`${row}-${col}`} className="aspect-square bg-blue-400 border border-blue" />
      // Red triangle (bottom)
      if (row === 8 && col === 7 || row === 8 && col === 6) return <div key={`${row}-${col}`} className="aspect-square bg-red-400 border border-red" />
      // green triangle (left)
      if (row === 7 && col === 6 ||  row === 6  &&  col ===6) return <div key={`${row}-${col}`} className="aspect-square bg-green-400 border-1 border-green" />
      // Center square
      if (row === 7 && col === 7) return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black flex items-center justify-center font-bold text-black text-lg">★</div>
      // Corner squares
     // return <div key={`${row}-${col}`} className="aspect-square bg-gray-200 border border-black" />
    }
    
    // Vertical paths
    if ((col === 6 || col === 7 || col === 8) && (row < 6 || row > 8)) {
      if (row === 1 && col === 8) return <div key={`${row}-${col}`} className="aspect-square bg-yellow-400 border border-black flex items-center justify-center"><div className="text-yellow-700 font-bold text-xl">★</div></div>
      if (row === 13 && col === 6) return <div key={`${row}-${col}`} className="aspect-square bg-red-400 border border-black flex items-center justify-center"><div className="text-red-700 font-bold text-xl">★</div></div>
      if (col === 7 && row >= 1 && row <= 5) return <div key={`${row}-${col}`} className="aspect-square bg-yellow-400 border border-black" />
      if (col === 7 && row >= 9 && row <= 13) return <div key={`${row}-${col}`} className="aspect-square bg-red-400 border border-black" />
      if (row === 12 && col === 8) return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black flex items-center justify-center"><div className="text-gray-700 font-bold text-xl">★</div></div>
      if (row === 2 && col === 6) return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black flex items-center justify-center"><div className="text-gray-700 font-bold text-xl">★</div></div>
      return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black" />
    }
    
    // Horizontal paths
    if ((row === 6 || row === 7 || row === 8) && (col < 6 || col > 8)) {
      if (row === 6 && col === 1) return <div key={`${row}-${col}`} className="aspect-square bg-green-400 border border-black flex items-center justify-center"><div className="text-green-700 font-bold text-xl">★</div></div>
      if (row === 8 && col === 13) return <div key={`${row}-${col}`} className="aspect-square bg-blue-400 border border-black flex items-center justify-center"><div className="text-blue-700 font-bold text-xl">★</div></div>
      if (row === 7 && col >= 1 && col <= 5) return <div key={`${row}-${col}`} className="aspect-square bg-green-400 border border-black" />
      if (row === 7 && col >= 9 && col <= 13) return <div key={`${row}-${col}`} className="aspect-square bg-blue-400 border border-black" />
      if (row ===  8 && col === 2) return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black flex items-center justify-center"><div className="text-gray-700 font-bold text-xl">★</div></div>
      if (row ===  6 && col === 12) return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black flex items-center justify-center"><div className="text-gray-700 font-bold text-xl">★</div></div>
      return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black" />
    }
    
    // Safe zones around the board perimeter
    if ((row === 0 && col === 6) || (row === 0 && col === 8) || (row === 2 && col === 14) || (row === 5 && col === 14) ||
        (row === 8 && col === 14) || (row === 12 && col === 14) || (row === 14 && col === 8) || (row === 14 && col === 6) ||
        (row === 12 && col === 0) || (row === 9 && col === 0) || (row === 6 && col === 0) || (row === 2 && col === 0)) {
      return <div key={`${row}-${col}`} className="aspect-square bg-gray-300 border border-black flex items-center justify-center"><div className="w-2 h-2 bg-gray-600 rounded-full" /></div>
    }
    
    return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black" />
  }

  return (
    <div className="min-h-screen bg-black text-white space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-gray-800">
            <Link href="/games">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Link>
          </Button>
          <div>
            <h1 className="font-work-sans font-bold text-2xl md:text-3xl text-white">Ludo</h1>
            <p className="text-gray-400">Classic 4-player board game with AI bots</p>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1 border-gray-600 text-gray-300">
          <Gamepad2 className="h-4 w-4 mr-1" />
          Board Game
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Ludo Board</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square max-w-lg mx-auto bg-yellow-100 rounded-lg border-4 border-yellow-800 p-2">
                <div className="grid grid-cols-15 gap-0 h-full">
                  {Array.from({ length: 15 }, (_, row) => 
                    Array.from({ length: 15 }, (_, col) => renderSquare(row, col))
                  ).flat()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Game Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!gameStarted ? (
                <div className="text-center space-y-4">
                  <p className="text-gray-400">Ready to start a new game of Ludo?</p>
                  <Button onClick={startGame} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    🎮 Start New Game
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${players[currentPlayer].textColor}`}>
                      {players[currentPlayer].name}'s Turn
                    </div>
                    <div className={`w-4 h-4 ${players[currentPlayer].color} rounded-full mx-auto mt-2`} />
                  </div>
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-white border-4 border-gray-800 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                        {diceValue ? (
                          <div className="text-3xl font-bold text-black">{diceValue}</div>
                        ) : (
                          <Dice6 className="h-10 w-10 text-gray-600" />
                        )}
                      </div>
                    </div>
                    {currentPlayer === 0 ? (
                      <Button 
                        onClick={rollDice} 
                        disabled={isRolling} 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <Dice6 className="h-4 w-4 mr-2" />
                        {isRolling ? "Rolling..." : "Roll Dice"}
                      </Button>
                    ) : (
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">{players[currentPlayer].name} is thinking...</div>
                        <div className="flex justify-center">
                          <div className={`w-4 h-4 ${players[currentPlayer].color} rounded-full animate-pulse`} />
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={resetGame} 
                    variant="outline" 
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    🔄 Reset Game
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      currentPlayer === index && gameStarted ? "bg-gray-700" : "bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${player.color} rounded-full`} />
                      <span className="font-medium text-white">{player.name}</span>
                    </div>
                    <div className="text-sm text-gray-400">{index === 0 ? "Human" : "AI Bot"}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-300">
              <p>• Roll the dice to move your pieces</p>
              <p>• Get all 4 pieces to the center to win</p>
              <p>• Roll a 6 to get an extra turn</p>
              <p>• Land on opponents to send them home</p>
              <p>• Safe squares protect your pieces</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Game Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-300">
              <div className="flex justify-between">
                <span>Game Status:</span>
                <span className="font-semibold text-white">{gameStarted ? "In Progress" : "Not Started"}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Turn:</span>
                <span className={`font-semibold ${gameStarted ? players[currentPlayer].textColor : "text-white"}`}>
                  {gameStarted ? players[currentPlayer].name : "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Roll:</span>
                <span className="font-semibold text-white">{diceValue || "None"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}