"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function CockFightGame() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(100)
  const [selectedBet, setSelectedBet] = useState<"red" | "blue" | "tie" | null>(null)
  const [gameState, setGameState] = useState<"betting" | "fighting" | "result">("betting")
  const [winner, setWinner] = useState<"red" | "blue" | "tie" | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [fightProgress, setFightProgress] = useState(0)
  const [redCock, setRedCock] = useState({ x: -300, y: 0, z: 0, health: 100, action: "idle", wingsOpen: false, flying: false, rotX: 0, rotY: 0, rotZ: 0 })
  const [blueCock, setBlueCock] = useState({ x: 300, y: 0, z: 0, health: 100, action: "idle", wingsOpen: false, flying: false, rotX: 0, rotY: 0, rotZ: 0 })
  const [history, setHistory] = useState<string[]>(["R", "B", "R", "T", "B", "R", "B", "R"])

  const odds = { red: 1.95, blue: 1.95, tie: 8.0 }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState === "betting" && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState("fighting")
            startFight()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameState, countdown])

  const startFight = () => {
    setFightProgress(0)
    setRedCock({ x: -300, y: 0, z: 0, health: 100, action: "ready", wingsOpen: true, flying: false, rotX: 0, rotY: 0, rotZ: 0 })
    setBlueCock({ x: 300, y: 0, z: 0, health: 100, action: "ready", wingsOpen: true, flying: false, rotX: 0, rotY: 0, rotZ: 0 })
    
    const fightInterval = setInterval(() => {
      setFightProgress(prev => {
        const newProgress = prev + 1
        
        const redAttack = Math.random() > 0.6
        const blueAttack = Math.random() > 0.6
        const redFly = Math.random() > 0.8
        const blueFly = Math.random() > 0.8
        
        setRedCock(pos => {
          let newAction = "idle"
          let newX = pos.x
          let newY = pos.y
          let newZ = pos.z
          let flying = pos.flying
          let rotX = pos.rotX
          let rotY = pos.rotY
          let rotZ = pos.rotZ
          
          if (redFly) {
            newAction = "flying"
            flying = true
            newY = 40 + Math.sin(newProgress * 0.3) * 20
            newZ = Math.cos(newProgress * 0.4) * 15
            newX = Math.min(0, pos.x + 30)
            rotX = -15 + Math.sin(newProgress * 0.5) * 10
            rotZ = Math.sin(newProgress * 0.6) * 15
          } else if (redAttack) {
            newAction = "attack"
            newX = Math.min(-20, pos.x + 25)
            newY = flying ? pos.y : 15 + Math.sin(newProgress * 0.5) * 10
            rotY = 15
            rotZ = 10
          } else {
            newX = Math.max(-300, pos.x + 2)
            newY = flying ? Math.max(0, pos.y - 5) : 0
            flying = pos.y <= 0 ? false : flying
            rotX = flying ? -5 : 0
            rotY = 0
            rotZ = 0
          }
          
          return {
            ...pos,
            x: newX,
            y: newY,
            z: newZ,
            action: newAction,
            flying: flying,
            rotX: rotX,
            rotY: rotY,
            rotZ: rotZ,
            wingsOpen: gameState === "fighting" ? Math.sin(newProgress * 1.2) > -0.3 : true,
            health: blueAttack ? Math.max(0, pos.health - (flying ? 2 : 4) - Math.random() * 3) : pos.health
          }
        })
        
        setBlueCock(pos => {
          let newAction = "idle"
          let newX = pos.x
          let newY = pos.y
          let newZ = pos.z
          let flying = pos.flying
          let rotX = pos.rotX
          let rotY = pos.rotY
          let rotZ = pos.rotZ
          
          if (blueFly) {
            newAction = "flying"
            flying = true
            newY = 40 + Math.sin(newProgress * 0.3 + 1) * 20
            newZ = Math.cos(newProgress * 0.4 + 1) * 15
            newX = Math.max(0, pos.x - 30)
            rotX = -15 + Math.sin(newProgress * 0.5 + 1) * 10
            rotZ = Math.sin(newProgress * 0.6 + 1) * -15
          } else if (blueAttack) {
            newAction = "attack"
            newX = Math.max(20, pos.x - 25)
            newY = flying ? pos.y : 15 + Math.sin(newProgress * 0.5) * 10
            rotY = -15
            rotZ = -10
          } else {
            newX = Math.min(300, pos.x - 2)
            newY = flying ? Math.max(0, pos.y - 5) : 0
            flying = pos.y <= 0 ? false : flying
            rotX = flying ? -5 : 0
            rotY = 0
            rotZ = 0
          }
          
          return {
            ...pos,
            x: newX,
            y: newY,
            z: newZ,
            action: newAction,
            flying: flying,
            rotX: rotX,
            rotY: rotY,
            rotZ: rotZ,
            wingsOpen: gameState === "fighting" ? Math.sin(newProgress * 1.2 + 1) > -0.3 : true,
            health: redAttack ? Math.max(0, pos.health - (flying ? 2 : 4) - Math.random() * 3) : pos.health
          }
        })
        
        if (newProgress >= 60) {
          clearInterval(fightInterval)
          endFight()
        }
        return newProgress
      })
    }, 100)
  }
  
  const endFight = () => {
    let result: "red" | "blue" | "tie"
    const healthDiff = Math.abs(redCock.health - blueCock.health)
    const random = Math.random()
    
    if (healthDiff < 5 && random < 0.15) {
      result = "tie"
    } else if (redCock.health > blueCock.health) {
      result = "red"
    } else if (blueCock.health > redCock.health) {
      result = "blue"
    } else {
      result = random < 0.5 ? "red" : "blue"
    }
    
    setWinner(result)
    setGameState("result")
    
    // Move winner to center and hide loser
    if (result === "red") {
      setRedCock(pos => ({ ...pos, x: 0, y: 20, action: "victory", wingsOpen: true }))
      setBlueCock(pos => ({ ...pos, action: "defeated" }))
    } else if (result === "blue") {
      setBlueCock(pos => ({ ...pos, x: 0, y: 20, action: "victory", wingsOpen: true }))
      setRedCock(pos => ({ ...pos, action: "defeated" }))
    }
    
    if (selectedBet === result) {
      const winnings = betAmount * odds[selectedBet]
      setBalance(b => b + winnings)
    }
    
    setHistory(prev => [result === "red" ? "R" : result === "blue" ? "B" : "T", ...prev.slice(0, 7)])
    
    setTimeout(() => {
      setGameState("betting")
      setCountdown(5)
      setSelectedBet(null)
      setWinner(null)
      setFightProgress(0)
      setRedCock({ x: -300, y: 0, z: 0, health: 100, action: "idle", wingsOpen: false, flying: false, rotX: 0, rotY: 0, rotZ: 0 })
      setBlueCock({ x: 300, y: 0, z: 0, health: 100, action: "idle", wingsOpen: false, flying: false, rotX: 0, rotY: 0, rotZ: 0 })
    }, 5000)
  }

  const placeBet = (type: "red" | "blue" | "tie") => {
    if (gameState !== "betting" || betAmount > balance) return
    setSelectedBet(type)
    setBalance(b => b - betAmount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white p-2 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800 text-xs sm:text-sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Back to Games
        </Button>
        <div className="text-center">
          <h1 className="font-bold text-lg sm:text-2xl lg:text-3xl text-white">🎮 3D Cock Fight Arena</h1>
          <p className="text-gray-400 text-xs sm:text-sm lg:text-base">Ultra Realistic Combat</p>
        </div>
        <div className="text-green-400 font-bold text-sm sm:text-lg">₹{balance.toFixed(2)}</div>
      </div>

      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
        <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-lg p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span className="text-yellow-400 font-bold text-xs sm:text-sm lg:text-base">HISTORY:</span>
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
              {history.map((result, index) => (
                <div key={index} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${
                  result === "R" ? "bg-red-600" : result === "B" ? "bg-blue-600" : "bg-green-600"
                }`}>
                  {result}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-lg p-2 sm:p-4 text-center">
          {gameState === "betting" && (
            <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-yellow-400 animate-pulse">
              BETTING TIME: {countdown}s
            </div>
          )}
          {gameState === "fighting" && (
            <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-400 animate-pulse">
              🥊 EPIC BATTLE! Round {Math.floor(fightProgress / 10) + 1}
            </div>
          )}
          {gameState === "result" && (
            <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-400">
              🏆 WINNER: {winner === "red" ? "RED CHAMPION" : winner === "blue" ? "BLUE CHAMPION" : "EPIC TIE"}!
            </div>
          )}
        </div>

        <div 
          className="relative border-4 border-yellow-600 rounded-xl p-8 overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/cock bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
          <div className="absolute inset-0 bg-gradient-radial from-yellow-600/10 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-amber-900/80 to-transparent"></div>
          <div className="absolute top-4 left-4 text-amber-700 opacity-30">🏚️</div>
          <div className="absolute top-4 right-4 text-amber-700 opacity-30">🏚️</div>
          <div className="absolute top-1/4 left-2 text-amber-600 opacity-40">🪵</div>
          <div className="absolute top-1/4 right-2 text-amber-600 opacity-40">🪵</div>
          <div className="absolute bottom-4 left-8 text-amber-800 opacity-50">🌾</div>
          <div className="absolute bottom-4 right-8 text-amber-800 opacity-50">🌾</div>
          <div className="absolute top-8 left-1/4 text-gray-600 opacity-30">👥</div>
          <div className="absolute top-8 right-1/4 text-gray-600 opacity-30">👥</div>
          
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px]" style={{perspective: '1200px'}}>
            <div 
              className="absolute inset-x-4 bottom-8 h-8 rounded-lg opacity-60"
              style={{
                background: 'linear-gradient(45deg, #8B4513 25%, #A0522D 25%, #A0522D 50%, #8B4513 50%, #8B4513 75%, #A0522D 75%)',
                backgroundSize: '20px 20px',
                transform: 'rotateX(75deg) translateZ(-10px)'
              }}
            ></div>
            <div 
              className="absolute inset-x-8 bottom-12 h-4 border-2 border-yellow-700/50 rounded-full"
              style={{
                transform: 'rotateX(85deg) translateZ(-5px)'
              }}
            ></div>
            <div 
              className={`absolute transition-all duration-500 ease-out ${
                redCock.action === 'attack' ? 'animate-pulse' : 
                redCock.action === 'flying' ? 'animate-bounce' : 
                redCock.action === 'victory' ? 'animate-bounce' : ''
              }`}
              style={{
                left: `calc(50% + ${redCock.x}px)`,
                bottom: `${50 + redCock.y}px`,
                opacity: redCock.action === 'defeated' ? 0 : 1,
                transform: `
                  scaleX(-1) 
                  translateZ(${redCock.z}px)
                  rotateX(${redCock.rotX}deg)
                  rotateY(${redCock.rotY}deg)
                  rotateZ(${redCock.rotZ}deg)
                  scale(${
                    redCock.action === 'victory' ? 1.6 :
                    redCock.action === 'attack' ? 1.4 : 
                    redCock.action === 'flying' ? 1.3 : 
                    redCock.action === 'jump' ? 1.2 : 
                    redCock.action === 'defeated' ? 0.5 : 1
                  })
                `,
                filter: `
                  ${redCock.action === 'victory' ? 'brightness(1.8) drop-shadow(0 0 40px gold)' :
                    redCock.action === 'attack' ? 'brightness(1.5) drop-shadow(0 0 20px red)' : 
                    redCock.flying ? 'brightness(1.2) drop-shadow(0 15px 30px rgba(0,0,0,0.7))' : 
                    'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'}
                `,
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="relative">
                <div 
                  className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl transition-all duration-100 ${
                    redCock.action === 'attack' ? 'animate-pulse' : 
                    redCock.action === 'jump' ? 'animate-bounce' : ''
                  }`}
                  style={{
                    textShadow: '0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.4)'
                  }}
                >
                  🐓
                </div>
                
                {redCock.wingsOpen && (
                  <>
                    <div className={`absolute -left-4 sm:-left-6 lg:-left-8 top-1/2 transform -translate-y-1/2 text-lg sm:text-2xl lg:text-3xl transition-all duration-200 ${redCock.action === 'attack' ? 'animate-ping opacity-90' : 'animate-pulse opacity-70'}`}>🪶</div>
                    <div className={`absolute -right-4 sm:-right-6 lg:-right-8 top-1/2 transform -translate-y-1/2 text-lg sm:text-2xl lg:text-3xl transition-all duration-200 ${redCock.action === 'attack' ? 'animate-ping opacity-90' : 'animate-pulse opacity-70'}`}>🪶</div>
                    <div className={`absolute -left-3 sm:-left-4 lg:-left-6 top-1/3 transform -translate-y-1/2 text-sm sm:text-xl lg:text-2xl transition-all duration-300 ${redCock.wingsOpen ? 'animate-bounce opacity-60' : 'opacity-0'}`}>🪶</div>
                    <div className={`absolute -right-3 sm:-right-4 lg:-right-6 top-1/3 transform -translate-y-1/2 text-sm sm:text-xl lg:text-2xl transition-all duration-300 ${redCock.wingsOpen ? 'animate-bounce opacity-60' : 'opacity-0'}`}>🪶</div>
                  </>
                )}
                
                {redCock.action === 'attack' && (
                  <>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-2xl sm:text-3xl lg:text-4xl animate-ping">💥</div>
                    <div className="absolute top-1/4 right-0 text-lg sm:text-xl lg:text-2xl animate-bounce">⚡</div>
                  </>
                )}
                
                <div className="absolute -top-2 sm:-top-3 lg:-top-4 left-1/2 transform -translate-x-1/2 w-12 sm:w-16 lg:w-20 h-2 sm:h-2.5 lg:h-3 bg-gray-800 rounded-full border border-red-400">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-300 rounded-full transition-all"
                    style={{ width: `${redCock.health}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div 
              className={`absolute transition-all duration-500 ease-out ${
                blueCock.action === 'attack' ? 'animate-pulse' : 
                blueCock.action === 'flying' ? 'animate-bounce' : 
                blueCock.action === 'victory' ? 'animate-bounce' : ''
              }`}
              style={{
                left: `calc(50% + ${blueCock.x}px)`,
                bottom: `${50 + blueCock.y}px`,
                opacity: blueCock.action === 'defeated' ? 0 : 1,
                transform: `
                  translateZ(${blueCock.z}px)
                  rotateX(${blueCock.rotX}deg)
                  rotateY(${blueCock.rotY}deg)
                  rotateZ(${blueCock.rotZ}deg)
                  scale(${
                    blueCock.action === 'victory' ? 1.6 :
                    blueCock.action === 'attack' ? 1.4 : 
                    blueCock.action === 'flying' ? 1.3 : 
                    blueCock.action === 'jump' ? 1.2 : 
                    blueCock.action === 'defeated' ? 0.5 : 1
                  })
                `,
                filter: `
                  ${blueCock.action === 'victory' ? 'brightness(1.8) drop-shadow(0 0 40px gold)' :
                    blueCock.action === 'attack' ? 'brightness(1.5) drop-shadow(0 0 20px blue)' : 
                    blueCock.flying ? 'brightness(1.2) drop-shadow(0 15px 30px rgba(0,0,0,0.7))' : 
                    'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'}
                `,
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="relative">
                <div 
                  className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl transition-all duration-100 ${
                    blueCock.action === 'attack' ? 'animate-pulse' : 
                    blueCock.action === 'jump' ? 'animate-bounce' : ''
                  }`}
                  style={{
                    textShadow: '0 0 30px rgba(0, 100, 255, 0.8), 0 0 60px rgba(0, 100, 255, 0.4)'
                  }}
                >
                  🐓
                </div>
                
                {blueCock.wingsOpen && (
                  <>
                    <div className={`absolute -left-8 top-1/2 transform -translate-y-1/2 text-3xl transition-all duration-200 ${blueCock.action === 'attack' ? 'animate-ping opacity-90' : 'animate-pulse opacity-70'}`}>🪶</div>
                    <div className={`absolute -right-8 top-1/2 transform -translate-y-1/2 text-3xl transition-all duration-200 ${blueCock.action === 'attack' ? 'animate-ping opacity-90' : 'animate-pulse opacity-70'}`}>🪶</div>
                    <div className={`absolute -left-6 top-1/3 transform -translate-y-1/2 text-2xl transition-all duration-300 ${blueCock.wingsOpen ? 'animate-bounce opacity-60' : 'opacity-0'}`}>🪶</div>
                    <div className={`absolute -right-6 top-1/3 transform -translate-y-1/2 text-2xl transition-all duration-300 ${blueCock.wingsOpen ? 'animate-bounce opacity-60' : 'opacity-0'}`}>🪶</div>
                  </>
                )}
                
                {blueCock.action === 'attack' && (
                  <>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-4xl animate-ping">💥</div>
                    <div className="absolute top-1/4 left-0 text-2xl animate-bounce">⚡</div>
                  </>
                )}
                
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-3 bg-gray-800 rounded-full border border-blue-400">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full transition-all"
                    style={{ width: `${blueCock.health}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {gameState === "fighting" && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 text-3xl animate-ping opacity-60">💨</div>
                <div className="absolute top-3/4 right-1/4 text-3xl animate-bounce opacity-60">💫</div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl animate-pulse opacity-40">⚔️</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mt-3 sm:mt-4 lg:mt-6">
            <div className="bg-red-600/20 backdrop-blur border-2 border-red-400 rounded-lg p-2 sm:p-3 lg:p-4">
              <div className="text-sm sm:text-lg lg:text-xl font-bold text-white">RED FIGHTER</div>
              <div className="text-xs sm:text-sm lg:text-base text-red-200">{odds.red}x odds</div>
              <div className="text-xs sm:text-sm lg:text-base text-red-100">HP: {redCock.health}%</div>
              <div className="text-xs text-red-300">Action: {redCock.action}</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-2 sm:border-3 lg:border-4 border-yellow-300 mx-auto shadow-2xl">
                <span className="text-sm sm:text-lg lg:text-2xl font-bold text-black">VS</span>
              </div>
            </div>
            <div className="bg-blue-600/20 backdrop-blur border-2 border-blue-400 rounded-lg p-2 sm:p-3 lg:p-4">
              <div className="text-sm sm:text-lg lg:text-xl font-bold text-white">BLUE FIGHTER</div>
              <div className="text-xs sm:text-sm lg:text-base text-blue-200">{odds.blue}x odds</div>
              <div className="text-xs sm:text-sm lg:text-base text-blue-100">HP: {blueCock.health}%</div>
              <div className="text-xs text-blue-300">Action: {blueCock.action}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-lg p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
            <Button
              onClick={() => placeBet("red")}
              disabled={gameState !== "betting" || betAmount > balance}
              className={`h-12 sm:h-16 lg:h-20 text-sm sm:text-lg lg:text-xl font-bold transition-all transform hover:scale-105 ${
                selectedBet === "red" 
                  ? "bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400 shadow-2xl" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <div>
                <div>🐓 RED</div>
                <div className="text-xs sm:text-sm">{odds.red}x</div>
              </div>
            </Button>

            <Button
              onClick={() => placeBet("tie")}
              disabled={gameState !== "betting" || betAmount > balance}
              className={`h-20 text-xl font-bold transition-all transform hover:scale-105 ${
                selectedBet === "tie" 
                  ? "bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400 shadow-2xl" 
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <div>
                <div>🤝 TIE</div>
                <div className="text-sm">{odds.tie}x</div>
              </div>
            </Button>

            <Button
              onClick={() => placeBet("blue")}
              disabled={gameState !== "betting" || betAmount > balance}
              className={`h-20 text-xl font-bold transition-all transform hover:scale-105 ${
                selectedBet === "blue" 
                  ? "bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400 shadow-2xl" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <div>
                <div>🐓 BLUE</div>
                <div className="text-sm">{odds.blue}x</div>
              </div>
            </Button>
          </div>

          <div className="bg-gray-800/50 backdrop-blur border border-gray-600 rounded-lg p-2 sm:p-3 lg:p-4">
            <div className="text-center mb-2 sm:mb-3 lg:mb-4">
              <div className="text-sm sm:text-base lg:text-lg font-bold text-yellow-400 mb-1 sm:mb-2">💰 BET AMOUNT</div>
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 lg:space-x-4">
                <Button 
                  onClick={() => setBetAmount(Math.max(10, betAmount - 50))}
                  className="bg-gray-700 hover:bg-gray-600 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-sm sm:text-lg lg:text-xl"
                  disabled={gameState !== "betting"}
                >
                  -
                </Button>
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-yellow-400 min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]">₹{betAmount}</div>
                <Button 
                  onClick={() => setBetAmount(betAmount + 50)}
                  className="bg-gray-700 hover:bg-gray-600 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-sm sm:text-lg lg:text-xl"
                  disabled={gameState !== "betting"}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
              {[50, 100, 250, 500].map(amount => (
                <Button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base transform hover:scale-105 transition-all"
                  disabled={gameState !== "betting"}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
          </div>

          {selectedBet && (
            <div className="mt-2 sm:mt-3 lg:mt-4 bg-gray-800/50 backdrop-blur border border-gray-600 rounded-lg p-2 sm:p-3 lg:p-4 text-center">
              <div className="text-sm sm:text-lg lg:text-xl font-bold text-yellow-400">
                🎯 YOUR BET: {selectedBet.toUpperCase()} - ₹{betAmount}
              </div>
              <div className="text-xs sm:text-base lg:text-lg text-white">
                💎 Potential Win: ₹{(betAmount * odds[selectedBet]).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}