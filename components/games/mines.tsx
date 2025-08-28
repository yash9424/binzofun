"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Bomb, Gem } from "lucide-react"
import Link from "next/link"

export function MinesGame() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(10)
  const [mineCount, setMineCount] = useState(3)
  const [gameMode, setGameMode] = useState<"manual" | "auto">("manual")
  const [gameState, setGameState] = useState<"betting" | "playing" | "ended">("betting")
  const [grid, setGrid] = useState<Array<{ revealed: boolean; isMine: boolean; index: number }>>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [currentMultiplier, setCurrentMultiplier] = useState(1)
  const [gameHistory, setGameHistory] = useState<
    Array<{ gems: number; multiplier: number; won: boolean; timestamp: number }>
  >([])

  const GRID_SIZE = 25

  useEffect(() => {
    initializeGrid()
  }, [])

  const initializeGrid = () => {
    const newGrid = Array.from({ length: GRID_SIZE }, (_, index) => ({
      revealed: false,
      isMine: false,
      index,
    }))
    setGrid(newGrid)
  }

  const startGame = () => {
    if (betAmount > balance || betAmount < 1) return

    setBalance((prev) => prev - betAmount)
    setGameState("playing")
    setRevealedCount(0)
    setCurrentMultiplier(1)

    // Place mines randomly
    const newGrid = Array.from({ length: GRID_SIZE }, (_, index) => ({
      revealed: false,
      isMine: false,
      index,
    }))

    const minePositions = new Set<number>()
    while (minePositions.size < mineCount) {
      minePositions.add(Math.floor(Math.random() * GRID_SIZE))
    }

    minePositions.forEach((pos) => {
      newGrid[pos].isMine = true
    })

    setGrid(newGrid)
  }

  const revealTile = (index: number) => {
    if (gameState !== "playing" || grid[index].revealed) return

    const newGrid = [...grid]
    newGrid[index].revealed = true

    if (newGrid[index].isMine) {
      // Game over - reveal all mines
      newGrid.forEach((tile) => {
        if (tile.isMine) tile.revealed = true
      })
      setGrid(newGrid)
      setGameState("ended")

      // Add to history
      setGameHistory((prev) => [
        { gems: revealedCount, multiplier: currentMultiplier, won: false, timestamp: Date.now() },
        ...prev.slice(0, 9),
      ])
    } else {
      // Safe tile
      const newRevealedCount = revealedCount + 1
      const safeSpaces = GRID_SIZE - mineCount
      const newMultiplier = Math.pow(1.2, newRevealedCount)

      setGrid(newGrid)
      setRevealedCount(newRevealedCount)
      setCurrentMultiplier(newMultiplier)

      // Check if all safe tiles are revealed
      if (newRevealedCount === safeSpaces) {
        setGameState("ended")
        const winnings = Math.floor(betAmount * newMultiplier)
        setBalance((prev) => prev + winnings)

        setGameHistory((prev) => [
          { gems: newRevealedCount, multiplier: newMultiplier, won: true, timestamp: Date.now() },
          ...prev.slice(0, 9),
        ])
      }
    }
  }

  const cashOut = () => {
    if (gameState !== "playing" || revealedCount === 0) return

    const winnings = Math.floor(betAmount * currentMultiplier)
    setBalance((prev) => prev + winnings)
    setGameState("ended")

    // Add to history
    setGameHistory((prev) => [
      { gems: revealedCount, multiplier: currentMultiplier, won: true, timestamp: Date.now() },
      ...prev.slice(0, 9),
    ])
  }

  const resetGame = () => {
    setGameState("betting")
    initializeGrid()
    setRevealedCount(0)
    setCurrentMultiplier(1)
  }

  const resetBalance = () => {
    setBalance(1000)
    setGameHistory([])
    resetGame()
  }

  const adjustBetAmount = (multiplier: number) => {
    setBetAmount((prev) => Math.max(1, Math.min(balance, Math.floor(prev * multiplier))))
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-2 sm:p-4 lg:p-6 border-b border-slate-700 flex-wrap gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Link href="/games">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Link>
          </Button>
          <div>
            <h1 className="font-work-sans font-bold text-xl sm:text-2xl text-white">Mines</h1>
            <p className="text-slate-400 text-sm sm:text-base hidden sm:block">Navigate the grid and avoid hidden bombs!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right text-sm sm:text-base font-bold text-green-400">
            ₹{balance}
          </div>
          <Badge variant="outline" className="px-2 sm:px-3 py-1 border-slate-600 text-slate-300 text-xs sm:text-sm">
            <Bomb className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Strategy Game</span>
            <span className="sm:hidden">Game</span>
          </Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* Controls - Top on mobile, Left sidebar on desktop */}
        <div className="w-full lg:w-80 bg-slate-800 p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 border-b lg:border-b-0 lg:border-r border-slate-700 order-2 lg:order-1">
          <div className="flex bg-slate-700 rounded-lg p-1">
            <Button
              variant={gameMode === "manual" ? "default" : "ghost"}
              size="sm"
              className={`flex-1 ${gameMode === "manual" ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white"}`}
              onClick={() => setGameMode("manual")}
            >
              Manual
            </Button>
            <Button
              variant={gameMode === "auto" ? "default" : "ghost"}
              size="sm"
              className={`flex-1 ${gameMode === "auto" ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white"}`}
              onClick={() => setGameMode("auto")}
            >
              Auto
            </Button>
          </div>

          {/* Balance Display */}
          <div className="text-right">
            <div className="text-slate-400 text-sm">Balance</div>
            <div className="text-2xl font-bold text-white">${balance.toFixed(2)}</div>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">Bet Amount</label>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex-1 relative">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  min="1"
                  max={balance}
                  className="bg-slate-700 border-slate-600 text-white pr-16"
                  step="0.01"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 text-sm">$</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-700 border-slate-600 text-slate-300 hover:text-white px-3"
                onClick={() => adjustBetAmount(0.5)}
                disabled={gameState === "playing"}
              >
                ½
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-700 border-slate-600 text-slate-300 hover:text-white px-3"
                onClick={() => adjustBetAmount(2)}
                disabled={gameState === "playing"}
              >
                2×
              </Button>
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">Mines</label>
            <Select value={mineCount.toString()} onValueChange={(value) => setMineCount(Number.parseInt(value))}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()} className="text-white hover:bg-slate-600">
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Game Controls */}
          {gameState === "betting" && (
            <Button
              onClick={startGame}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg"
              disabled={betAmount > balance || betAmount < 1}
            >
              Bet
            </Button>
          )}

          {gameState === "playing" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gems Found</span>
                  <span className="text-green-400 font-semibold">{revealedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Multiplier</span>
                  <span className="text-blue-400 font-semibold">{currentMultiplier.toFixed(2)}×</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Potential Win</span>
                  <span className="text-yellow-400 font-semibold">${Math.floor(betAmount * currentMultiplier)}</span>
                </div>
              </div>
              <Button
                onClick={cashOut}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                disabled={revealedCount === 0}
              >
                Cash Out (${Math.floor(betAmount * currentMultiplier)})
              </Button>
              <Button
                onClick={resetGame}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:text-white bg-transparent"
              >
                New Game
              </Button>
            </div>
          )}

          {gameState === "ended" && (
            <div className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-slate-700">
                {gameHistory[0]?.won ? (
                  <div className="text-green-400 font-semibold">
                    🎉 You Won!
                    <br />${Math.floor(betAmount * gameHistory[0].multiplier)}
                  </div>
                ) : (
                  <div className="text-red-400 font-semibold">
                    💥 Hit a Mine!
                    <br />
                    Lost ${betAmount}
                  </div>
                )}
              </div>
              <Button
                onClick={resetGame}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
              >
                Play Again
              </Button>
            </div>
          )}

          <Button
            onClick={resetBalance}
            variant="outline"
            size="sm"
            className="w-full border-slate-600 text-slate-400 hover:text-white bg-transparent"
          >
            Reset Balance
          </Button>
        </div>

        {/* Game Grid */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-8 order-1 lg:order-2">
          <div className="w-full max-w-lg lg:max-w-2xl">
            <div className="grid grid-cols-5 gap-1 sm:gap-2 lg:gap-3 mx-auto">
              {grid.map((tile) => (
                <Button
                  key={tile.index}
                  variant="outline"
                  className={`aspect-square p-0 text-sm sm:text-lg font-semibold border border-2 sm:border-2 transition-all duration-200 min-h-[40px] sm:min-h-[60px] lg:min-h-[80px] ${
                    tile.revealed
                      ? tile.isMine
                        ? "bg-red-600 border-red-500 hover:bg-red-700"
                        : "bg-green-600 border-green-500 hover:bg-green-700"
                      : "bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500"
                  }`}
                  onClick={() => revealTile(tile.index)}
                  disabled={gameState !== "playing" || tile.revealed}
                >
                  {tile.revealed ? (
                    tile.isMine ? (
                      <div className="text-lg sm:text-3xl lg:text-4xl animate-pulse" style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))' }}>
                        💣
                      </div>
                    ) : (
                      <div className="text-xl sm:text-4xl lg:text-5xl" style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))' }}>
                        💎
                      </div>
                    )
                  ) : null}
                </Button>
              ))}
            </div>

            {gameState === "betting" && (
              <div className="text-center mt-3 sm:mt-4 lg:mt-6 text-slate-400 text-xs sm:text-sm lg:text-base">Click "Bet" to start the game and reveal tiles</div>
            )}

            {gameState === "playing" && (
              <div className="text-center mt-3 sm:mt-4 lg:mt-6 text-slate-300 text-xs sm:text-sm lg:text-base">
                Click tiles to reveal gems. Avoid the {mineCount} hidden mines!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
