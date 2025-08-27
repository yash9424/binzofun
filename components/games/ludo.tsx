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
    // Center cross design
    if (row >= 3 && row <= 5 && col >= 3 && col <= 5) {
      // Center star
      if (row === 4 && col === 4) return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black flex items-center justify-center font-bold text-black text-xs sm:text-lg">★</div>
      // Colored triangles around center
      if (row === 3 && col === 4) return <div key={`${row}-${col}`} className="aspect-square bg-yellow-400 border border-black" />
      if (row === 4 && col === 5) return <div key={`${row}-${col}`} className="aspect-square bg-blue-400 border border-black" />
      if (row === 5 && col === 4) return <div key={`${row}-${col}`} className="aspect-square bg-red-400 border border-black" />
      if (row === 4 && col === 3) return <div key={`${row}-${col}`} className="aspect-square bg-green-400 border border-black" />
      // Corner squares
      return <div key={`${row}-${col}`} className="aspect-square bg-gray-200 border border-black" />
    }
    
    // Vertical paths
    if (col === 4 && (row < 3 || row > 5)) {
      if (row === 0) return <div key={`${row}-${col}`} className="aspect-square bg-yellow-400 border border-black flex items-center justify-center"><div className="text-yellow-700 font-bold text-xs sm:text-xl">★</div></div>
      if (row === 8) return <div key={`${row}-${col}`} className="aspect-square bg-red-400 border border-black flex items-center justify-center"><div className="text-red-700 font-bold text-xs sm:text-xl">★</div></div>
      if (row >= 1 && row <= 2) return <div key={`${row}-${col}`} className="aspect-square bg-yellow-400 border border-black" />
      if (row >= 6 && row <= 7) return <div key={`${row}-${col}`} className="aspect-square bg-red-400 border border-black" />
      return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black" />
    }
    
    // Horizontal paths
    if (row === 4 && (col < 3 || col > 5)) {
      if (col === 0) return <div key={`${row}-${col}`} className="aspect-square bg-green-400 border border-black flex items-center justify-center"><div className="text-green-700 font-bold text-xs sm:text-xl">★</div></div>
      if (col === 8) return <div key={`${row}-${col}`} className="aspect-square bg-blue-400 border border-black flex items-center justify-center"><div className="text-blue-700 font-bold text-xs sm:text-xl">★</div></div>
      if (col >= 1 && col <= 2) return <div key={`${row}-${col}`} className="aspect-square bg-green-400 border border-black" />
      if (col >= 6 && col <= 7) return <div key={`${row}-${col}`} className="aspect-square bg-blue-400 border border-black" />
      return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black" />
    }
    
    // Player starting positions (compact corners)
    if (row === 1 && col === 1) return <div key={`${row}-${col}`} className="aspect-square bg-green-500 border border-black flex items-center justify-center"><div className="w-3 h-3 sm:w-6 sm:h-6 bg-green-700 rounded-full" /></div>
    if (row === 1 && col === 7) return <div key={`${row}-${col}`} className="aspect-square bg-yellow-500 border border-black flex items-center justify-center"><div className="w-3 h-3 sm:w-6 sm:h-6 bg-yellow-700 rounded-full" /></div>
    if (row === 7 && col === 1) return <div key={`${row}-${col}`} className="aspect-square bg-red-500 border border-black flex items-center justify-center"><div className="w-3 h-3 sm:w-6 sm:h-6 bg-red-700 rounded-full" /></div>
    if (row === 7 && col === 7) return <div key={`${row}-${col}`} className="aspect-square bg-blue-500 border border-black flex items-center justify-center"><div className="w-3 h-3 sm:w-6 sm:h-6 bg-blue-700 rounded-full" /></div>
    
    // Safe zones
    if ((row === 1 && col === 4) || (row === 4 && col === 1) || (row === 4 && col === 7) || (row === 7 && col === 4)) {
      return <div key={`${row}-${col}`} className="aspect-square bg-gray-300 border border-black flex items-center justify-center"><div className="w-1 h-1 sm:w-2 sm:h-2 bg-gray-600 rounded-full" /></div>
    }
    
    return <div key={`${row}-${col}`} className="aspect-square bg-white border border-black" />
  }

  return (
    <div className="min-h-screen bg-black text-white space-y-3 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-gray-800 p-1 sm:p-2">
            <Link href="/games">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Games</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="font-work-sans font-bold text-xl sm:text-2xl md:text-3xl text-white">Ludo</h1>
            <p className="text-gray-400 text-sm sm:text-base hidden sm:block">Classic 4-player board game with AI bots</p>
          </div>
        </div>
        <Badge variant="outline" className="px-2 sm:px-3 py-1 border-gray-600 text-gray-300 text-xs sm:text-sm">
          <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          Board Game
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-6">
        <div className="xl:col-span-2 space-y-3 sm:space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2 sm:pb-6">
              <CardTitle className="text-white text-lg sm:text-xl">Ludo Board</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="aspect-square max-w-xs sm:max-w-lg mx-auto bg-yellow-100 rounded-lg border-2 sm:border-4 border-yellow-800 p-1 sm:p-2">
                <div className="grid grid-cols-9 gap-0 h-full text-xs sm:text-base">
                  {Array.from({ length: 9 }, (_, row) => 
                    Array.from({ length: 9 }, (_, col) => renderSquare(row, col))
                  ).flat()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2 sm:pb-6">
              <CardTitle className="text-white text-lg sm:text-xl">Game Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              {!gameStarted ? (
                <div className="text-center space-y-3 sm:space-y-4">
                  <p className="text-gray-400 text-sm sm:text-base">Ready to start a new game of Ludo?</p>
                  <Button onClick={startGame} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base">
                    🎮 Start New Game
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-center">
                    <div className={`text-base sm:text-lg font-semibold ${players[currentPlayer].textColor}`}>
                      {players[currentPlayer].name}'s Turn
                    </div>
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 ${players[currentPlayer].color} rounded-full mx-auto mt-2`} />
                  </div>
                  <div className="text-center space-y-3 sm:space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 sm:border-4 border-gray-800 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                        {diceValue ? (
                          <div className="text-2xl sm:text-3xl font-bold text-black">{diceValue}</div>
                        ) : (
                          <Dice6 className="h-8 w-8 sm:h-10 sm:w-10 text-gray-600" />
                        )}
                      </div>
                    </div>
                    {currentPlayer === 0 ? (
                      <Button 
                        onClick={rollDice} 
                        disabled={isRolling} 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                      >
                        <Dice6 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        {isRolling ? "Rolling..." : "Roll Dice"}
                      </Button>
                    ) : (
                      <div className="text-center">
                        <div className="text-gray-400 mb-2 text-sm sm:text-base">{players[currentPlayer].name} is thinking...</div>
                        <div className="flex justify-center">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 ${players[currentPlayer].color} rounded-full animate-pulse`} />
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={resetGame} 
                    variant="outline" 
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    🔄 Reset Game
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 sm:space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2 sm:pb-6">
              <CardTitle className="text-white text-lg sm:text-xl">Players</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                      currentPlayer === index && gameStarted ? "bg-gray-700" : "bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 ${player.color} rounded-full`} />
                      <span className="font-medium text-white text-sm sm:text-base">{player.name}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">{index === 0 ? "Human" : "AI Bot"}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2 sm:pb-6">
              <CardTitle className="text-white text-lg sm:text-xl">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300 p-3 sm:p-6">
              <p>• Roll the dice to move your pieces</p>
              <p>• Get all 4 pieces to the center to win</p>
              <p>• Roll a 6 to get an extra turn</p>
              <p>• Land on opponents to send them home</p>
              <p>• Safe squares protect your pieces</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2 sm:pb-6">
              <CardTitle className="text-white text-lg sm:text-xl">Game Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 text-gray-300 text-xs sm:text-sm p-3 sm:p-6">
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