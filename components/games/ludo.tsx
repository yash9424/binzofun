"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Piece {
  id: number
  player: number
  position: number
  isHome: boolean
}

export function LudoGame() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(50)
  const [gameActive, setGameActive] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [diceValue, setDiceValue] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null)
  const [playerScores, setPlayerScores] = useState([0, 0, 0, 0])
  const [playerKills, setPlayerKills] = useState([0, 0, 0, 0])

  const players = ["You (Red)", "Bot 1 (Blue)", "Bot 2 (Yellow)", "Bot 3 (Green)"]
  const playerColors = ["text-red-400", "text-blue-400", "text-yellow-400", "text-green-400"]

  const initializePieces = () => {
    const newPieces: Piece[] = []
    for (let player = 0; player < 4; player++) {
      for (let i = 0; i < 4; i++) {
        newPieces.push({
          id: player * 4 + i,
          player,
          position: -1,
          isHome: true
        })
      }
    }
    setPieces(newPieces)
  }

  const startGame = () => {
    if (balance < betAmount) return
    setBalance(prev => prev - betAmount)
    setGameActive(true)
    setGameResult(null)
    setCurrentPlayer(0)
    setDiceValue(null)
    initializePieces()
  }

  const rollDice = () => {
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
          if (currentPlayer > 0) {
            botMove(finalValue)
          }
        }, 500)
      }
    }, 150)
  }

  const botMove = (roll: number) => {
    const botPieces = pieces.filter(p => p.player === currentPlayer)
    const movablePieces = botPieces.filter(piece => {
      if (piece.isHome && roll === 6) return true
      if (!piece.isHome) return true
      return false
    })
    
    if (movablePieces.length > 0) {
      const randomPiece = movablePieces[Math.floor(Math.random() * movablePieces.length)]
      setTimeout(() => movePiece(randomPiece.id, roll), 1000)
    } else {
      setTimeout(() => nextTurn(), 1000)
    }
  }

  const movePiece = (pieceId: number, roll?: number) => {
    const moveRoll = roll || diceValue
    if (!moveRoll) return
    
    const piece = pieces.find(p => p.id === pieceId)
    if (!piece || piece.player !== currentPlayer) return
    
    if (piece.isHome && moveRoll !== 6) return
    
    const newPieces = [...pieces]
    const pieceIndex = newPieces.findIndex(p => p.id === pieceId)
    
    if (piece.isHome) {
      newPieces[pieceIndex] = {
        ...piece,
        position: 0,
        isHome: false
      }
    } else {
      const newPosition = piece.position + moveRoll
      if (newPosition >= 52) {
        const finishedPieces = newPieces.filter(p => p.player === currentPlayer && p.position >= 52).length
        if (finishedPieces >= 3) {
          endGame(currentPlayer === 0 ? "win" : "lose")
          return
        }
      }
      
      newPieces[pieceIndex] = {
        ...piece,
        position: newPosition % 52
      }
    }
    
    setPieces(newPieces)
    
    setTimeout(() => {
      if (moveRoll === 6) {
        setDiceValue(null)
      } else {
        nextTurn()
      }
    }, 500)
  }

  const nextTurn = () => {
    setCurrentPlayer((prev) => (prev + 1) % 4)
    setDiceValue(null)
  }

  const endGame = (result: "win" | "lose") => {
    setGameResult(result)
    setGameActive(false)
    
    if (result === "win") {
      setBalance(prev => prev + betAmount * 4)
    }
    
    setTimeout(() => {
      setGameResult(null)
    }, 3000)
  }

  useEffect(() => {
    if (gameActive && currentPlayer > 0 && !diceValue) {
      setTimeout(() => {
        rollDice()
      }, 1000)
    }
  }, [currentPlayer, gameActive])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 lg:space-y-6">
          {/* Top Section: Game Board + Bet Controls */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
            {/* Ludo Board */}
            <div className="xl:col-span-3 order-1">
            <div className="flex justify-center">
              <div className="inline-block bg-white border-4 sm:border-6 lg:border-8 border-gradient-to-br from-amber-800 via-amber-600 to-amber-900 relative" style={{borderImage: 'linear-gradient(45deg, #92400e, #d97706, #451a03) 1', boxShadow: 'inset 0 0 20px rgba(146, 64, 14, 0.3), 0 8px 16px rgba(0, 0, 0, 0.3)'}}>
                <div className="grid grid-cols-15 grid-rows-15 gap-0 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px]">
                  
                  {/* Red Home (Top Left) */}
                  <div className="col-span-6 row-span-6 bg-red-500 p-3">
                    <div className="bg-white rounded-lg p-2 h-full">
                      <div className="grid grid-cols-2 gap-2 h-full">
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-red-300 to-red-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-red-400 to-red-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-red-500 to-red-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-red-300 to-red-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-red-400 to-red-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-red-500 to-red-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-red-300 to-red-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-red-400 to-red-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-red-500 to-red-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-red-300 to-red-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-red-400 to-red-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-red-500 to-red-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Top Path */}
                  <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6">
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-blue-400 border border-black"></div>
                    <div className="bg-blue-400 border border-black"></div>
                    <div className="bg-white border border-black relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-black rounded-full"></div>
                      </div>
                    </div>
                    <div className="bg-blue-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-blue-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-blue-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-blue-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                  </div>
                  
                  {/* Blue Home (Top Right) */}
                  <div className="col-span-6 row-span-6 bg-blue-500 p-3">
                    <div className="bg-white rounded-lg p-2 h-full">
                      <div className="grid grid-cols-2 gap-2 h-full">
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-blue-300 to-blue-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-blue-400 to-blue-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-blue-500 to-blue-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-blue-300 to-blue-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-blue-400 to-blue-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-blue-500 to-blue-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-blue-300 to-blue-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-blue-400 to-blue-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-blue-500 to-blue-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-blue-300 to-blue-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-blue-400 to-blue-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-blue-500 to-blue-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Left Path */}
                  <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3">
                    <div className="bg-white border border-black"></div>
                    <div className="bg-red-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-red-400 border border-black"></div>
                    <div className="bg-red-400 border border-black"></div>
                    <div className="bg-red-400 border border-black"></div>
                    <div className="bg-red-400 border border-black"></div>
                    <div className="bg-red-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-black rounded-full"></div>
                      </div>
                    </div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                  </div>
                  
                  {/* Center Cross */}
                  <div className="col-span-3 row-span-3 bg-white border border-black relative">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <polygon points="0,0 100,0 100,100 0,100" fill="none" stroke="black" strokeWidth="2"/>
                      <polygon points="0,0 100,0 50,50" fill="#3b82f6" stroke="black" strokeWidth="1"/>
                      <polygon points="100,0 100,100 50,50" fill="#eab308" stroke="black" strokeWidth="1"/>
                      <polygon points="100,100 0,100 50,50" fill="#22c55e" stroke="black" strokeWidth="1"/>
                      <polygon points="0,100 0,0 50,50" fill="#ef4444" stroke="black" strokeWidth="1"/>
                    </svg>
                  </div>
                  
                  {/* Right Path */}
                  <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3">
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-black rounded-full"></div>
                      </div>
                    </div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-yellow-400 border border-black"></div>
                    <div className="bg-yellow-400 border border-black"></div>
                    <div className="bg-yellow-400 border border-black"></div>
                    <div className="bg-yellow-400 border border-black"></div>
                    <div className="bg-yellow-400 border border-black"></div>
                    <div className="bg-yellow-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-yellow-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                  </div>

                  {/* Green Home (Bottom Left) */}
                  <div className="col-span-6 row-span-6 bg-green-500 p-3">
                    <div className="bg-white rounded-lg p-2 h-full">
                      <div className="grid grid-cols-2 gap-2 h-full">
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-green-300 to-green-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-green-400 to-green-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-green-500 to-green-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-green-300 to-green-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-green-400 to-green-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-green-500 to-green-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-green-300 to-green-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-green-400 to-green-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-green-500 to-green-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-green-300 to-green-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-green-400 to-green-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-green-500 to-green-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Path */}
                  <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6">
                    <div className="bg-white border border-black"></div>
                    <div className="bg-green-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-green-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-green-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-green-400 border border-black"></div>
                    <div className="bg-white border border-black relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-black rounded-full"></div>
                      </div>
                    </div>
                    <div className="bg-green-400 border border-black"></div>
                    <div className="bg-green-400 border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                    <div className="bg-white border border-black"></div>
                  </div>
                  
                  {/* Yellow Home (Bottom Right) */}
                  <div className="col-span-6 row-span-6 bg-yellow-500 p-3">
                    <div className="bg-white rounded-lg p-2 h-full">
                      <div className="grid grid-cols-2 gap-2 h-full">
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-yellow-400 to-yellow-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-yellow-500 to-yellow-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-yellow-400 to-yellow-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-yellow-500 to-yellow-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-yellow-400 to-yellow-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-yellow-500 to-yellow-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                        <div className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-6 h-8 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-md"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-yellow-400 to-yellow-700"></div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gradient-to-b from-yellow-500 to-yellow-800 shadow-lg" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                            <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {gameResult && (
                  <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-lg ${
                    gameResult === "win" ? "bg-green-500/20" : "bg-red-500/20"
                  }`}>
                    <div className="text-center text-white">
                      <div className={`text-4xl font-bold mb-4 ${
                        gameResult === "win" ? "text-green-400" : "text-red-400"
                      }`}>
                        {gameResult === "win" ? "🎉 YOU WON!" : "😞 YOU LOST!"}
                      </div>
                      <div className="text-xl">
                        {gameResult === "win" 
                          ? `Won ₹${(betAmount * 4)}` 
                          : `Lost ₹${betAmount}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
            
          {/* Bet Controls */}
          <div className="xl:col-span-1 order-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-400">₹{balance}</div>
                    <div className="text-xs sm:text-sm text-slate-400">Balance</div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-slate-400 mb-2 block">Bet Amount</label>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      {[50, 100, 200].map(amount => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount(amount)}
                          className={`${betAmount === amount ? 'bg-green-600' : 'bg-slate-700'} border-slate-600 text-xs sm:text-sm px-2 py-1`}
                          disabled={gameActive}
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-slate-400">Players:</div>
                    {players.map((player, i) => {
                      const activePieces = pieces.filter(p => p.player === i && !p.isHome).length
                      return (
                        <div key={i} className={`flex justify-between text-xs sm:text-sm ${i === currentPlayer ? `${playerColors[i]} font-bold` : 'text-slate-400'}`}>
                          <span>{player}</span>
                          <span>{activePieces}/4 out</span>
                        </div>
                      )
                    })}
                  </div>

                  {!gameActive ? (
                    <Button
                      onClick={startGame}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={balance < betAmount}
                    >
                      Start Game ₹{betAmount}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-center text-xs sm:text-sm">
                        <div className="font-bold">{players[currentPlayer]}'s Turn</div>
                      </div>
                      
                      {diceValue && (
                        <div className="text-center">
                          <div className="text-3xl sm:text-4xl mb-2">🎲</div>
                          <div className="text-lg sm:text-xl font-bold">{diceValue}</div>
                        </div>
                      )}
                      
                      {currentPlayer === 0 && !diceValue && (
                        <Button
                          onClick={rollDice}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={isRolling}
                        >
                          {isRolling ? "Rolling..." : "Roll Dice"}
                        </Button>
                      )}
                      
                      {currentPlayer > 0 && !diceValue && (
                        <div className="text-center text-xs sm:text-sm text-slate-400">
                          Bot is thinking...
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
          </div>
        </div>

        {/* Bottom Section: Leaderboard */}
          <div className="w-full">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-base sm:text-lg font-bold text-white text-center">Leaderboard</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-600">
                          <th className="text-left p-1 sm:p-2">Rank</th>
                          <th className="text-left p-1 sm:p-2">Player</th>
                          <th className="text-center p-1 sm:p-2">Kills</th>
                          <th className="text-center p-1 sm:p-2">Qualified</th>
                          <th className="text-center p-1 sm:p-2">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((player, i) => {
                          const finishedPieces = pieces.filter(p => p.player === i && p.position >= 52).length
                          const activePieces = pieces.filter(p => p.player === i && !p.isHome && p.position < 52).length
                          const kills = playerKills[i]
                          const score = finishedPieces * 10 + activePieces * 2 + kills * 5
                          return { player, score, index: i, kills, finishedPieces }
                        })
                        .sort((a, b) => b.score - a.score)
                        .map((playerData, rank) => (
                          <tr key={playerData.index} className={`${playerData.index === currentPlayer ? `${playerColors[playerData.index]} font-bold` : 'text-slate-400'} border-b border-slate-700`}>
                            <td className="p-1 sm:p-2">#{rank + 1}</td>
                            <td className="p-1 sm:p-2">{playerData.player.split(' ')[0]}</td>
                            <td className="text-center p-1 sm:p-2">{playerData.kills}</td>
                            <td className="text-center p-1 sm:p-2">{playerData.finishedPieces}/4</td>
                            <td className="text-center p-1 sm:p-2">{playerData.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}