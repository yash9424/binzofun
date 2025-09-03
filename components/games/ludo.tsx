'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function LudoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [diceValue, setDiceValue] = useState<number>(0)
  const [currentPlayer, setCurrentPlayer] = useState<string>('Green')
  const [gameStatus, setGameStatus] = useState<string>('Roll dice to start')
  const [canRoll, setCanRoll] = useState<boolean>(true)
  const [tokenPositions, setTokenPositions] = useState({
    Green: [{r:2,c:2}, {r:2,c:4}, {r:4,c:2}, {r:4,c:4}],
    Yellow: [{r:2,c:11}, {r:2,c:13}, {r:4,c:11}, {r:4,c:13}],
    Red: [{r:11,c:2}, {r:11,c:4}, {r:13,c:2}, {r:13,c:4}],
    Blue: [{r:11,c:11}, {r:11,c:13}, {r:13,c:11}, {r:13,c:13}]
  })
  const [selectedToken, setSelectedToken] = useState<number | null>(null)
  const [moveCount, setMoveCount] = useState<number>(0)
  const [winner, setWinner] = useState<string | null>(null)
  const [tokensInHome, setTokensInHome] = useState({
    Green: 0, Yellow: 0, Red: 0, Blue: 0
  })
  const [gameMode, setGameMode] = useState<'human' | 'ai'>('human')
  const [gameHistory, setGameHistory] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [lastCapture, setLastCapture] = useState<string | null>(null)
  const [tournamentMode, setTournamentMode] = useState(false)
  const [playerScores, setPlayerScores] = useState({Green: 0, Yellow: 0, Red: 0, Blue: 0})
  const [gameTime, setGameTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [savedGames, setSavedGames] = useState<any[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [achievements, setAchievements] = useState<string[]>([])
  const [streakCount, setStreakCount] = useState(0)
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState<'classic' | 'modern' | 'neon'>('classic')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [isOnline, setIsOnline] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [connectedPlayers, setConnectedPlayers] = useState<string[]>([])
  const [gameReplay, setGameReplay] = useState<any[]>([])
  const [customRules, setCustomRules] = useState({
    doubleRollOn6: true,
    captureBonus: false,
    fastMode: false,
    powerUps: false
  })
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [spectatorMode, setSpectatorMode] = useState(false)
  const [chatMessages, setChatMessages] = useState<string[]>([])
  const [playerRatings, setPlayerRatings] = useState({Green: 1200, Yellow: 1200, Red: 1200, Blue: 1200})
  const [particles, setParticles] = useState<any[]>([])
  const [lightingEffects, setLightingEffects] = useState(true)
  const [cinematicMode, setCinematicMode] = useState(false)
  const [animationFrame, setAnimationFrame] = useState(0)
  
  // Define correct Ludo paths with proper connections
  const getPlayerPath = (player: string) => {
    // Authentic Ludo circuit with blocked positions removed
    const fullCircuit = [
      {r:6,c:1}, {r:6,c:2}, {r:6,c:3}, {r:6,c:4}, {r:6,c:5}, {r:6,c:6}, {r:5,c:6}, {r:4,c:6}, {r:3,c:6}, {r:2,c:6}, {r:1,c:6}, {r:0,c:6}, {r:0,c:7}, {r:0,c:8}, {r:1,c:8}, {r:2,c:8}, {r:3,c:8}, {r:4,c:8}, {r:5,c:8}, {r:6,c:8}, {r:6,c:9}, {r:6,c:10}, {r:6,c:11}, {r:6,c:12}, {r:6,c:13}, {r:6,c:14}, {r:7,c:14}, {r:8,c:14}, {r:8,c:13}, {r:8,c:12}, {r:8,c:11}, {r:8,c:10}, {r:8,c:9}, {r:8,c:8}, {r:9,c:8}, {r:10,c:8}, {r:11,c:8}, {r:12,c:8}, {r:13,c:8}, {r:14,c:8}, {r:14,c:7}, {r:14,c:6}, {r:13,c:6}, {r:12,c:6}, {r:11,c:6}, {r:10,c:6}, {r:9,c:6}, {r:8,c:6}, {r:8,c:5}, {r:8,c:4}, {r:8,c:3}, {r:8,c:2}, {r:8,c:1}, {r:8,c:0}, {r:7,c:0}
    ]
    // Remove blocked positions (5, 19, 33, 47) from circuit
    const blockedIndices = [5, 19, 33, 47]
    const circuit = fullCircuit.filter((_, index) => !blockedIndices.includes(index))
    
    // Home stretch paths (5 squares each)
    const homeStretch = {
      Green: [{r:7,c:1}, {r:7,c:2}, {r:7,c:3}, {r:7,c:4}, {r:7,c:5}],
      Yellow: [{r:1,c:7}, {r:2,c:7}, {r:3,c:7}, {r:4,c:7}, {r:5,c:7}],
      Red: [{r:13,c:7}, {r:12,c:7}, {r:11,c:7}, {r:10,c:7}, {r:9,c:7}],
      Blue: [{r:7,c:13}, {r:7,c:12}, {r:7,c:11}, {r:7,c:10}, {r:7,c:9}]
    }
    
    // Starting positions on circuit (adjusted for each player)
    const startIndices = { Green: 0, Yellow: 12, Red: 36, Blue: 24 }
    const startIndex = startIndices[player as keyof typeof startIndices]
    
    // Build complete path: 52 circuit squares + 5 home stretch = 57 total
    const fullPath = []
    for (let i = 0; i < 52; i++) {
      fullPath.push(circuit[(startIndex + i) % 52])
    }
    fullPath.push(...homeStretch[player as keyof typeof homeStretch])
    
    return fullPath
  }
  
  const getTokenPathPosition = (player: string, token: {r: number, c: number}) => {
    const path = getPlayerPath(player)
    return path.findIndex(pos => pos && pos.r === token.r && pos.c === token.c)
  }

  const players = ['Green', 'Yellow', 'Blue', 'Red']
  const playerColors = {
    Green: '#228B22',
    Yellow: '#FFD700', 
    Red: '#DC143C',
    Blue: '#1E90FF'
  }

  // Particle system management
  const createParticles = (x: number, y: number, color: string, count = 10) => {
    const newParticles = []
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 3 + 1,
        color: color,
        alpha: 1,
        life: 60
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }
  
  // Update particles
  useEffect(() => {
    const updateParticles = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        alpha: p.alpha * 0.95,
        life: p.life - 1
      })).filter(p => p.life > 0 && p.alpha > 0.01))
    }
    
    const interval = setInterval(updateParticles, 16)
    return () => clearInterval(interval)
  }, [])

  const rollDice = () => {
    if (!canRoll || isAnimating) return
    
    setIsAnimating(true)
    const value = Math.floor(Math.random() * 6) + 1
    setDiceValue(value)
    setCanRoll(false)
    
    // Create dice particles
    if (lightingEffects) {
      createParticles(300, 100, playerColors[currentPlayer as keyof typeof playerColors], 15)
    }
    
    // Add to game history
    setGameHistory(prev => [...prev, `${currentPlayer} rolled ${value}`])
    
    // Check if player has any movable tokens
    const currentTokens = tokenPositions[currentPlayer as keyof typeof tokenPositions]
    const hasMovableTokens = currentTokens.some((token, index) => {
      const isInHome = (currentPlayer === 'Green' && token.r >= 1 && token.r <= 4 && token.c >= 1 && token.c <= 4) ||
                      (currentPlayer === 'Yellow' && token.r >= 1 && token.r <= 4 && token.c >= 10 && token.c <= 13) ||
                      (currentPlayer === 'Red' && token.r >= 10 && token.r <= 13 && token.c >= 1 && token.c <= 4) ||
                      (currentPlayer === 'Blue' && token.r >= 10 && token.r <= 13 && token.c >= 10 && token.c <= 13)
      
      if (isInHome) return value === 6
      
      const playerPath = getPlayerPath(currentPlayer)
      const currentPathIndex = getTokenPathPosition(currentPlayer, token)
      return currentPathIndex !== -1 && currentPathIndex + value < playerPath.length
    })
    
    if (!hasMovableTokens) {
      setGameStatus(`${currentPlayer} rolled ${value} - No valid moves!`)
      setTimeout(() => {
        const currentIndex = players.indexOf(currentPlayer)
        const nextPlayer = players[(currentIndex + 1) % 4]
        setCurrentPlayer(nextPlayer)
        setGameStatus(`${nextPlayer}'s turn`)
        setCanRoll(true)
        setSelectedToken(null)
      }, 500)
    } else {
      setGameStatus(`${currentPlayer} rolled ${value} - Select a token to move`)
      setTimeout(() => setCanRoll(false), 1000)
    }
    
    // Enhanced dice sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    audio.volume = 0.4
    audio.play().catch(() => {})
    
    setTimeout(() => setIsAnimating(false), 200)
    
    // AI player logic
    if (gameMode === 'ai' && currentPlayer !== 'Green') {
      setTimeout(() => {
        aiMakeMove(value)
      }, 1500)
    }
  }
  
  const aiMakeMove = (diceValue: number) => {
    const aiTokens = tokenPositions[currentPlayer as keyof typeof tokenPositions]
    const movableTokens = aiTokens.filter((token, index) => {
      const isInHome = (currentPlayer === 'Green' && token.r >= 1 && token.r <= 4 && token.c >= 1 && token.c <= 4) ||
                      (currentPlayer === 'Yellow' && token.r >= 1 && token.r <= 4 && token.c >= 10 && token.c <= 13) ||
                      (currentPlayer === 'Red' && token.r >= 10 && token.r <= 13 && token.c >= 1 && token.c <= 4) ||
                      (currentPlayer === 'Blue' && token.r >= 10 && token.r <= 13 && token.c >= 10 && token.c <= 13)
      return !isInHome || diceValue === 6
    })
    
    if (movableTokens.length > 0) {
      let tokenIndex = 0
      
      // AI difficulty logic
      if (aiDifficulty === 'easy') {
        tokenIndex = aiTokens.indexOf(movableTokens[Math.floor(Math.random() * movableTokens.length)])
      } else if (aiDifficulty === 'medium') {
        // Prefer tokens that can capture opponents
        const captureTokens = movableTokens.filter(token => {
          // Check if this move would capture an opponent
          return Object.values(tokenPositions).some(playerTokens => 
            playerTokens.some(t => Math.abs(t.r - token.r) <= diceValue && Math.abs(t.c - token.c) <= diceValue)
          )
        })
        tokenIndex = aiTokens.indexOf(captureTokens.length > 0 ? captureTokens[0] : movableTokens[0])
      } else { // hard
        // Advanced strategy: prioritize safety and captures
        const strategicToken = movableTokens.reduce((best, current) => {
          const currentScore = calculateTokenScore(current, diceValue)
          const bestScore = calculateTokenScore(best, diceValue)
          return currentScore > bestScore ? current : best
        })
        tokenIndex = aiTokens.indexOf(strategicToken)
      }
      
      setTimeout(() => {
        setSelectedToken(tokenIndex)
        moveToken(tokenIndex)
      }, 1000 / animationSpeed)
    } else {
      setTimeout(() => {
        const currentIndex = players.indexOf(currentPlayer)
        const nextPlayer = players[(currentIndex + 1) % 4]
        setCurrentPlayer(nextPlayer)
        setGameStatus(`${nextPlayer}'s turn`)
        setCanRoll(true)
      }, 1500 / animationSpeed)
    }
  }
  
  const calculateTokenScore = (token: any, diceValue: number) => {
    let score = 0
    // Add scoring logic for AI strategy
    score += Math.random() * 10 // Base randomness
    return score
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (canRoll || !diceValue) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const cell = 600 / 15
    const col = Math.floor(x / cell)
    const row = Math.floor(y / cell)
    
    // Check if clicked on current player's token
    const currentTokens = tokenPositions[currentPlayer as keyof typeof tokenPositions]
    const clickedTokenIndex = currentTokens.findIndex(token => 
      Math.abs(token.r - row) < 0.5 && Math.abs(token.c - col) < 0.5
    )
    
    if (clickedTokenIndex !== -1) {
      const token = currentTokens[clickedTokenIndex]
      
      // Validate if this token can move
      const isInHome = (currentPlayer === 'Green' && token.r >= 1 && token.r <= 4 && token.c >= 1 && token.c <= 4) ||
                      (currentPlayer === 'Yellow' && token.r >= 1 && token.r <= 4 && token.c >= 10 && token.c <= 13) ||
                      (currentPlayer === 'Red' && token.r >= 10 && token.r <= 13 && token.c >= 1 && token.c <= 4) ||
                      (currentPlayer === 'Blue' && token.r >= 10 && token.r <= 13 && token.c >= 10 && token.c <= 13)
      
      const canMove = isInHome ? diceValue === 6 : true
      
      if (canMove) {
        setSelectedToken(clickedTokenIndex)
        setGameStatus(`Moving token ${clickedTokenIndex + 1}...`)
        moveToken(clickedTokenIndex)
      } else {
        setGameStatus(`Token ${clickedTokenIndex + 1} needs a 6 to exit home!`)
      }
    }
  }
  
  const moveToken = (tokenIndex: number) => {
    setMoveCount(prev => prev + 1)
    setGameStatus(`Moving token ${tokenIndex + 1}...`)
    
    let capturedOpponent = false
    
    // Proper path-based movement
    setTokenPositions(prev => {
      const newPositions = { ...prev }
      const currentTokens = [...newPositions[currentPlayer as keyof typeof newPositions]]
      const token = currentTokens[tokenIndex]
      
      // Check if token is in home area (can only move out with 6)
      const isInHome = (currentPlayer === 'Green' && token.r >= 1 && token.r <= 4 && token.c >= 1 && token.c <= 4) ||
                      (currentPlayer === 'Yellow' && token.r >= 1 && token.r <= 4 && token.c >= 10 && token.c <= 13) ||
                      (currentPlayer === 'Red' && token.r >= 10 && token.r <= 13 && token.c >= 1 && token.c <= 4) ||
                      (currentPlayer === 'Blue' && token.r >= 10 && token.r <= 13 && token.c >= 10 && token.c <= 13)
      
      let newR = token.r
      let newC = token.c
      
      if (isInHome && diceValue === 6) {
        // Move to correct starting position on circuit
        const startPositions = {
          Green: {r: 6, c: 1},
          Yellow: {r: 1, c: 8},
          Red: {r: 13, c: 6},
          Blue: {r: 8, c: 13}
        }
        const startPos = startPositions[currentPlayer as keyof typeof startPositions]
        newR = startPos.r
        newC = startPos.c
      } else if (!isInHome) {
        const playerPath = getPlayerPath(currentPlayer)
        const currentPathIndex = getTokenPathPosition(currentPlayer, token)
        
        if (currentPathIndex !== -1) {
          let newPathIndex = currentPathIndex + diceValue
          
          // Circuit length is 48 after removing blocked positions
          const circuitLength = 48
          
          // Check if token is at home entry point for their color
          const homeEntryPoints = {
            Green: circuitLength - 1, // Last position before home stretch
            Yellow: circuitLength - 1,
            Blue: circuitLength - 1, 
            Red: circuitLength - 1
          }
          
          const homeEntryPoint = homeEntryPoints[currentPlayer as keyof typeof homeEntryPoints]
          
          if (newPathIndex >= playerPath.length) {
            // Token reaches center (winning position)
            newR = 7; newC = 7
            setTokensInHome(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer as keyof typeof prev] + 1 }))
          } else if (newPathIndex < playerPath.length) {
            const newPos = playerPath[newPathIndex]
            if (newPos) {
              newR = newPos.r; newC = newPos.c
            }
          }
        }
        
        // Check for captures (not in safe zones or home stretch)
        const safeZones = [{r:6,c:2}, {r:2,c:8}, {r:8,c:12}, {r:12,c:6}]
        const isInSafeZone = safeZones.some(safe => safe.r === newR && safe.c === newC)
        const isInHomeStretch = currentPathIndex >= 52
        
        if (!isInHomeStretch && !isInSafeZone && newR !== 7 && newC !== 7) {
          Object.entries(newPositions).forEach(([otherPlayer, otherTokens]) => {
            if (otherPlayer !== currentPlayer) {
              otherTokens.forEach((otherToken, otherIndex) => {
                if (otherToken.r === newR && otherToken.c === newC) {
                  // Send opponent token back to home
                  const homePositions = {
                    Green: [{r:2,c:2}, {r:2,c:4}, {r:4,c:2}, {r:4,c:4}],
                    Yellow: [{r:2,c:11}, {r:2,c:13}, {r:4,c:11}, {r:4,c:13}],
                    Red: [{r:11,c:2}, {r:11,c:4}, {r:13,c:2}, {r:13,c:4}],
                    Blue: [{r:11,c:11}, {r:11,c:13}, {r:13,c:11}, {r:13,c:13}]
                  }
                  const playerHomes = homePositions[otherPlayer as keyof typeof homePositions]
                  const emptyHome = playerHomes.find(pos => 
                    !otherTokens.some(t => t.r === pos.r && t.c === pos.c)
                  )
                  if (emptyHome) {
                    newPositions[otherPlayer as keyof typeof newPositions][otherIndex] = emptyHome
                    setLastCapture(`${currentPlayer} captured ${otherPlayer}'s token!`)
                    setGameHistory(prev => [...prev, `${currentPlayer} captured ${otherPlayer}'s token!`])
                    capturedOpponent = true
                    
                    // Create capture particles
                    if (lightingEffects) {
                      const cell = 600 / 15
                      createParticles(newC * cell + cell/2, newR * cell + cell/2, '#ff4444', 20)
                    }
                    
                    // Capture sound effect
                    const captureAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
                    captureAudio.volume = 0.6
                    captureAudio.play().catch(() => {})
                  }
                }
              })
            }
          })
        }
      }
      
      currentTokens[tokenIndex] = { r: newR, c: newC }
      newPositions[currentPlayer as keyof typeof newPositions] = currentTokens
      
      return newPositions
    })
    
    setTimeout(() => {
      setGameStatus(`${currentPlayer} moved ${diceValue} steps`)
      setSelectedToken(null)
      
      // Check for win condition (all 4 tokens in center)
      const homePositions = tokensInHome[currentPlayer as keyof typeof tokensInHome]
      if (homePositions >= 4) {
        setWinner(currentPlayer)
        setGameStatus(`🎉 ${currentPlayer} WINS! 🎉`)
        
        // Update scores in tournament mode
        if (tournamentMode) {
          setPlayerScores(prev => ({
            ...prev,
            [currentPlayer]: prev[currentPlayer as keyof typeof prev] + 1
          }))
        }
        
        // Create victory particles
        if (lightingEffects) {
          createParticles(300, 300, playerColors[currentPlayer as keyof typeof playerColors], 50)
        }
        
        // Update achievements and stats
        setTotalGamesPlayed(prev => prev + 1)
        setStreakCount(prev => prev + 1)
        
        // Check for achievements
        const newAchievements = []
        if (moveCount <= 20) newAchievements.push('Speed Demon')
        if (gameTime <= 300) newAchievements.push('Lightning Fast')
        if (streakCount >= 3) newAchievements.push('Hat Trick')
        if (totalGamesPlayed >= 10) newAchievements.push('Veteran Player')
        
        setAchievements(prev => [...new Set([...prev, ...newAchievements])])
        
        // Update player rating
        setPlayerRatings(prev => ({
          ...prev,
          [currentPlayer]: prev[currentPlayer as keyof typeof prev] + 50
        }))
        
        // Record game replay
        setGameReplay(prev => [...prev, {
          type: 'victory',
          player: currentPlayer,
          timestamp: Date.now(),
          gameState: { tokenPositions, moveCount, gameTime }
        }])
        
        // Victory sound
        if (soundEnabled) {
          const victoryAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
          victoryAudio.volume = 0.8
          victoryAudio.play().catch(() => {})
        }
        return
      }
      
      // Extra turn for rolling 6 or capturing opponent
      if (diceValue === 6 || capturedOpponent) {
        setCanRoll(true)
        setGameStatus(`${currentPlayer} gets another turn!`)
      } else {
        setTimeout(() => {
          const currentIndex = players.indexOf(currentPlayer)
          const nextPlayer = players[(currentIndex + 1) % 4]
          setCurrentPlayer(nextPlayer)
          setGameStatus(`${nextPlayer}'s turn`)
          setCanRoll(true)
        }, 300)
      }
    }, 300)
  }
  
  const resetGame = () => {
    setTokenPositions({
      Green: [{r:2,c:2}, {r:2,c:4}, {r:4,c:2}, {r:4,c:4}],
      Yellow: [{r:2,c:11}, {r:2,c:13}, {r:4,c:11}, {r:4,c:13}],
      Red: [{r:11,c:2}, {r:11,c:4}, {r:13,c:2}, {r:13,c:4}],
      Blue: [{r:11,c:11}, {r:11,c:13}, {r:13,c:11}, {r:13,c:13}]
    })
    setCurrentPlayer('Green')
    setDiceValue(0)
    setCanRoll(true)
    setSelectedToken(null)
    setMoveCount(0)
    setWinner(null)
    setTokensInHome({Green: 0, Yellow: 0, Red: 0, Blue: 0})
    setGameStatus('Roll dice to start')
    setGameHistory([])
    setLastCapture(null)
    setGameTime(0)
    setIsPaused(false)
  }
  
  const saveGame = () => {
    const gameState = {
      tokenPositions, currentPlayer, diceValue, moveCount, gameHistory,
      playerScores, gameTime, timestamp: new Date().toISOString()
    }
    setSavedGames(prev => [...prev, gameState])
    alert('Game saved successfully!')
  }
  
  const loadGame = (gameState: any) => {
    setTokenPositions(gameState.tokenPositions)
    setCurrentPlayer(gameState.currentPlayer)
    setDiceValue(gameState.diceValue)
    setMoveCount(gameState.moveCount)
    setGameHistory(gameState.gameHistory || [])
    setPlayerScores(gameState.playerScores || {Green: 0, Yellow: 0, Red: 0, Blue: 0})
    setGameTime(gameState.gameTime || 0)
    setGameStatus(`${gameState.currentPlayer}'s turn`)
  }
  
  // Game timer
  useEffect(() => {
    if (!isPaused && !winner) {
      const timer = setInterval(() => setGameTime(prev => prev + 1), 1000)
      return () => clearInterval(timer)
    }
  }, [isPaused, winner])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && canRoll) {
        e.preventDefault()
        rollDice()
      } else if (e.code === 'KeyR') {
        resetGame()
      } else if (e.code === 'KeyP') {
        setIsPaused(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [canRoll])
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Animation loop for particles and effects
  useEffect(() => {
    const animate = () => {
      setAnimationFrame(prev => prev + 1)
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 600
    const cell = size / 15
    
    ctx.clearRect(0, 0, size, size)
    
    // Dynamic background based on theme and effects
    if (cinematicMode) {
      // Cinematic dark background with moving lights
      const darkGradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
      darkGradient.addColorStop(0, '#1a1a2e')
      darkGradient.addColorStop(0.7, '#16213e')
      darkGradient.addColorStop(1, '#0f0f23')
      ctx.fillStyle = darkGradient
      ctx.fillRect(0, 0, size, size)
      
      // Moving spotlight effect
      if (lightingEffects) {
        const spotX = size/2 + Math.sin(animationFrame * 0.02) * 100
        const spotY = size/2 + Math.cos(animationFrame * 0.015) * 80
        const spotlight = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 150)
        spotlight.addColorStop(0, 'rgba(255,255,255,0.1)')
        spotlight.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = spotlight
        ctx.fillRect(0, 0, size, size)
      }
    } else {
      // Enhanced background with gradient
      const bgGradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
      bgGradient.addColorStop(0, theme === 'neon' ? '#000011' : '#ffffff')
      bgGradient.addColorStop(0.7, theme === 'neon' ? '#001122' : '#f8f9fa')
      bgGradient.addColorStop(1, theme === 'neon' ? '#000033' : '#e9ecef')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, size, size)
    }
    
    // Particle system
    if (lightingEffects && particles.length > 0) {
      particles.forEach(particle => {
        ctx.globalAlpha = particle.alpha
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI)
        ctx.fill()
      })
      ctx.globalAlpha = 1
    }
    
    // Add subtle texture for non-cinematic mode
    if (!cinematicMode) {
      ctx.globalAlpha = 0.03
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff'
        ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1)
      }
      ctx.globalAlpha = 1
    }

    // Enhanced cell drawing with theme-aware effects
    const drawCell = (r: number, c: number, color: string, border = true, isSpecial = false) => {
      const x = c * cell
      const y = r * cell
      
      // Theme-based adjustments
      let finalColor = color
      if (theme === 'neon') {
        finalColor = adjustBrightness(color, 50)
      } else if (cinematicMode) {
        finalColor = adjustBrightness(color, -30)
      }
      
      // Enhanced shadows for special cells
      if (isSpecial || cinematicMode) {
        ctx.shadowColor = cinematicMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.3)'
        ctx.shadowBlur = cinematicMode ? 12 : 8
        ctx.shadowOffsetX = cinematicMode ? 4 : 2
        ctx.shadowOffsetY = cinematicMode ? 4 : 2
      }
      
      // Create enhanced gradient
      const gradient = ctx.createLinearGradient(x, y, x + cell, y + cell)
      gradient.addColorStop(0, finalColor)
      gradient.addColorStop(0.5, adjustBrightness(finalColor, theme === 'neon' ? 20 : -10))
      gradient.addColorStop(1, adjustBrightness(finalColor, theme === 'neon' ? -20 : -30))
      
      ctx.fillStyle = gradient
      
      // Rounded corners for modern theme
      if (theme === 'modern' || cinematicMode) {
        ctx.beginPath()
        ctx.roundRect(x + 1, y + 1, cell - 2, cell - 2, 3)
        ctx.fill()
      } else {
        ctx.fillRect(x, y, cell, cell)
      }
      
      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      // Enhanced borders
      if (border) {
        ctx.strokeStyle = theme === 'neon' ? '#00ffff' : (cinematicMode ? '#444' : (isSpecial ? '#333' : '#666'))
        ctx.lineWidth = theme === 'neon' ? 1.5 : (isSpecial ? 2 : 0.5)
        
        if (theme === 'neon') {
          ctx.shadowColor = '#00ffff'
          ctx.shadowBlur = 3
        }
        
        if (theme === 'modern' || cinematicMode) {
          ctx.beginPath()
          ctx.roundRect(x + 1, y + 1, cell - 2, cell - 2, 3)
          ctx.stroke()
        } else {
          ctx.strokeRect(x, y, cell, cell)
        }
        
        // Reset glow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        
        // Inner highlight for depth
        if (!cinematicMode) {
          ctx.strokeStyle = theme === 'neon' ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.3)'
          ctx.lineWidth = 1
          ctx.strokeRect(x + 1, y + 1, cell - 2, cell - 2)
        }
      }
    }
    
    // Helper function to adjust color brightness
    const adjustBrightness = (color: string, amount: number) => {
      // Handle rgba colors
      if (color.startsWith('rgba')) {
        return color // Return as-is for rgba colors
      }
      
      // Handle hex colors
      if (!color.startsWith('#')) {
        return color // Return as-is if not hex
      }
      
      const hex = color.replace('#', '')
      if (hex.length !== 6) {
        return color // Return as-is if invalid hex
      }
      
      const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount))
      const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount))
      const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount))
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    // Enhanced home areas with better colors and effects
    // Green home (top-left)
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const isTokenArea = r >= 1 && r <= 4 && c >= 1 && c <= 4
        drawCell(r, c, isTokenArea ? '#98FB98' : '#2E8B57', true, isTokenArea)
      }
    }
    
    // Yellow home (top-right)
    for (let r = 0; r < 6; r++) {
      for (let c = 9; c < 15; c++) {
        const isTokenArea = r >= 1 && r <= 4 && c >= 10 && c <= 13
        drawCell(r, c, isTokenArea ? '#FFFACD' : '#DAA520', true, isTokenArea)
      }
    }
    
    // Red home (bottom-left)
    for (let r = 9; r < 15; r++) {
      for (let c = 0; c < 6; c++) {
        const isTokenArea = r >= 10 && r <= 13 && c >= 1 && c <= 4
        drawCell(r, c, isTokenArea ? '#FFA07A' : '#B22222', true, isTokenArea)
      }
    }
    
    // Blue home (bottom-right)
    for (let r = 9; r < 15; r++) {
      for (let c = 9; c < 15; c++) {
        const isTokenArea = r >= 10 && r <= 13 && c >= 10 && c <= 13
        drawCell(r, c, isTokenArea ? '#B0E0E6' : '#4169E1', true, isTokenArea)
      }
    }

    // Enhanced path with circuit markers
    const drawPathCell = (r: number, c: number, pathIndex = -1) => {
      const isAlternate = (r + c) % 2 === 0
      drawCell(r, c, isAlternate ? '#F8F8FF' : '#FFFFFF', true)
      
      // Mark circuit path positions
      if (pathIndex >= 0) {
        ctx.fillStyle = '#666'
        ctx.font = 'bold 8px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(pathIndex.toString(), c * cell + cell/2, r * cell + 5)
      }
    }
    
    // Use the same circuit from getPlayerPath
    const circuit = [
      {r:6,c:1}, {r:6,c:2}, {r:6,c:3}, {r:6,c:4}, {r:6,c:5}, {r:6,c:6}, {r:5,c:6}, {r:4,c:6}, {r:3,c:6}, {r:2,c:6}, {r:1,c:6}, {r:0,c:6}, {r:0,c:7}, {r:0,c:8}, {r:1,c:8}, {r:2,c:8}, {r:3,c:8}, {r:4,c:8}, {r:5,c:8}, {r:6,c:8}, {r:6,c:9}, {r:6,c:10}, {r:6,c:11}, {r:6,c:12}, {r:6,c:13}, {r:6,c:14}, {r:7,c:14}, {r:8,c:14}, {r:8,c:13}, {r:8,c:12}, {r:8,c:11}, {r:8,c:10}, {r:8,c:9}, {r:8,c:8}, {r:9,c:8}, {r:10,c:8}, {r:11,c:8}, {r:12,c:8}, {r:13,c:8}, {r:14,c:8}, {r:14,c:7}, {r:14,c:6}, {r:13,c:6}, {r:12,c:6}, {r:11,c:6}, {r:10,c:6}, {r:9,c:6}, {r:8,c:6}, {r:8,c:5}, {r:8,c:4}, {r:8,c:3}, {r:8,c:2}, {r:8,c:1}, {r:8,c:0}, {r:7,c:0}
    ]
    
    // Draw path cells with position markers
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if ((r < 6 || r > 8) && (c === 6 || c === 7 || c === 8)) {
          const pathIndex = circuit.findIndex(pos => pos.r === r && pos.c === c)
          drawPathCell(r, c, pathIndex)
        } else if ((c < 6 || c > 8) && (r === 6 || r === 7 || r === 8)) {
          const pathIndex = circuit.findIndex(pos => pos.r === r && pos.c === c)
          drawPathCell(r, c, pathIndex)
        }
      }
    }

    // Enhanced home stretch paths with gradients
    for (let i = 1; i <= 5; i++) {
      drawCell(7, i, '#90EE90', true, true) // Green
      drawCell(i, 7, '#FFFFE0', true, true) // Yellow
      drawCell(14-i, 7, '#FFB6C1', true, true) // Red
      drawCell(7, 14-i, '#ADD8E6', true, true) // Blue
    }

    // Enhanced starting arrows with 3D effect
    const drawStartArrow = (x: number, y: number, color: string, rotation: number) => {
      ctx.save()
      ctx.translate(x + cell/2, y + cell/2)
      ctx.rotate(rotation)
      
      // Arrow shadow
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur = 6
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3
      
      // Arrow background
      const gradient = ctx.createLinearGradient(-cell/3, -cell/3, cell/3, cell/3)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, adjustBrightness(color, -30))
      ctx.fillStyle = gradient
      
      ctx.beginPath()
      ctx.roundRect(-cell/3, -cell/3, (cell*2)/3, (cell*2)/3, 4)
      ctx.fill()
      
      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      // Arrow symbol
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('▶', 0, 6)
      
      ctx.restore()
    }
    
    drawStartArrow(1 * cell, 6 * cell, '#228B22', 0)
    drawStartArrow(8 * cell, 1 * cell, '#DAA520', Math.PI/2)
    drawStartArrow(6 * cell, 13 * cell, '#B22222', -Math.PI/2)
    drawStartArrow(13 * cell, 8 * cell, '#4169E1', Math.PI)
    
    // Draw connections from home to start positions
    const drawConnection = (homeR: number, homeC: number, startR: number, startC: number, color: string) => {
      ctx.strokeStyle = color + '60'
      ctx.lineWidth = 2
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(homeC * cell + cell/2, homeR * cell + cell/2)
      ctx.lineTo(startC * cell + cell/2, startR * cell + cell/2)
      ctx.stroke()
      ctx.setLineDash([])
    }
    
    drawConnection(2.5, 2.5, 6, 1, '#228B22') // Green to (6,1) - index 0
    drawConnection(2.5, 11.5, 1, 8, '#DAA520') // Yellow to (1,8) - index 13
    drawConnection(11.5, 2.5, 13, 6, '#B22222') // Red to (13,6) - matches arrow
    drawConnection(11.5, 11.5, 8, 13, '#4169E1') // Blue to (8,13) - matches arrow

    // Enhanced safe zones with glow effect
    const drawSafeZone = (x: number, y: number) => {
      // Glow effect
      ctx.shadowColor = '#FFD700'
      ctx.shadowBlur = 15
      
      // Safe zone background
      const gradient = ctx.createRadialGradient(x + cell/2, y + cell/2, 0, x + cell/2, y + cell/2, cell/2)
      gradient.addColorStop(0, '#FFFF99')
      gradient.addColorStop(0.7, '#FFFF00')
      gradient.addColorStop(1, '#FFD700')
      ctx.fillStyle = gradient
      
      ctx.beginPath()
      ctx.arc(x + cell/2, y + cell/2, (cell - 8)/2, 0, 2 * Math.PI)
      ctx.fill()
      
      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      
      // Star with gradient
      const starGradient = ctx.createLinearGradient(x, y, x + cell, y + cell)
      starGradient.addColorStop(0, '#FF4500')
      starGradient.addColorStop(1, '#FF0000')
      ctx.fillStyle = starGradient
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('★', x + cell/2, y + cell/2 + 6)
    }
    
    drawSafeZone(6 * cell, 2 * cell)  // Green safe zone
    drawSafeZone(2 * cell, 8 * cell)  // Yellow safe zone  
    drawSafeZone(8 * cell, 12 * cell) // Red safe zone
    drawSafeZone(12 * cell, 6 * cell) // Blue safe zone

    // Enhanced center home with 3D effect
    const centerX = 6 * cell, centerY = 6 * cell, centerSize = 3 * cell
    
    // Center shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 4
    ctx.shadowOffsetY = 4
    
    // Center background with gradient
    const centerGradient = ctx.createLinearGradient(centerX, centerY, centerX + centerSize, centerY + centerSize)
    centerGradient.addColorStop(0, '#FFFFFF')
    centerGradient.addColorStop(1, '#F0F0F0')
    ctx.fillStyle = centerGradient
    ctx.fillRect(centerX, centerY, centerSize, centerSize)
    
    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    // Center border
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.strokeRect(centerX, centerY, centerSize, centerSize)
    
    // Enhanced center triangles with gradients
    const cx = 7.5 * cell, cy = 7.5 * cell, ts = cell * 0.8
    const triangles = [
      {color: '#2E8B57', points: [[cx,cy-ts],[cx-ts,cy],[cx+ts,cy]]},
      {color: '#DAA520', points: [[cx+ts,cy],[cx,cy-ts],[cx,cy+ts]]},
      {color: '#B22222', points: [[cx,cy+ts],[cx-ts,cy],[cx+ts,cy]]},
      {color: '#4169E1', points: [[cx-ts,cy],[cx,cy-ts],[cx,cy+ts]]}
    ]
    
    triangles.forEach(({color, points}) => {
      // Triangle gradient
      const triGradient = ctx.createLinearGradient(points[0][0], points[0][1], points[1][0], points[1][1])
      triGradient.addColorStop(0, color)
      triGradient.addColorStop(1, adjustBrightness(color, -40))
      
      ctx.fillStyle = triGradient
      ctx.beginPath()
      ctx.moveTo(points[0][0], points[0][1])
      points.slice(1).forEach(([x,y]) => ctx.lineTo(x, y))
      ctx.closePath()
      ctx.fill()
      
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 2
      ctx.stroke()
    })
    
    // Add index numbers to home stretch paths
    const homeStretchPositions = [
      {positions: [{r:7,c:1}, {r:7,c:2}, {r:7,c:3}, {r:7,c:4}, {r:7,c:5}], color: '#2E8B57'}, // Green
      {positions: [{r:1,c:7}, {r:2,c:7}, {r:3,c:7}, {r:4,c:7}, {r:5,c:7}], color: '#DAA520'}, // Yellow
      {positions: [{r:13,c:7}, {r:12,c:7}, {r:11,c:7}, {r:10,c:7}, {r:9,c:7}], color: '#B22222'}, // Red
      {positions: [{r:7,c:13}, {r:7,c:12}, {r:7,c:11}, {r:7,c:10}, {r:7,c:9}], color: '#4169E1'} // Blue
    ]
    
    homeStretchPositions.forEach(({positions, color}) => {
      positions.forEach((pos, index) => {
        ctx.fillStyle = color
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText((53 + index).toString(), pos.c * cell + cell/2, pos.r * cell + cell/2 + 3)
      })
    })

    // Show possible moves for current player
    if (diceValue && currentPlayer && !winner) {
      const currentTokens = tokenPositions[currentPlayer as keyof typeof tokenPositions]
      currentTokens.forEach((token, index) => {
        const playerPath = getPlayerPath(currentPlayer)
        const currentPathIndex = getTokenPathPosition(currentPlayer, token)
        
        if (currentPathIndex !== -1) {
          let newPathIndex = currentPathIndex + diceValue
          let targetPos = newPathIndex >= playerPath.length ? {r: 7, c: 7} : playerPath[newPathIndex]
          
          // Only draw if targetPos exists
          if (targetPos && targetPos.r !== undefined && targetPos.c !== undefined) {
            // Draw move indicator
            ctx.strokeStyle = playerColors[currentPlayer as keyof typeof playerColors]
            ctx.lineWidth = 3
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(token.c * cell + cell/2, token.r * cell + cell/2)
            ctx.lineTo(targetPos.c * cell + cell/2, targetPos.r * cell + cell/2)
            ctx.stroke()
            ctx.setLineDash([])
            
            // Draw target indicator
            ctx.fillStyle = playerColors[currentPlayer as keyof typeof playerColors] + '40'
            ctx.beginPath()
            ctx.arc(targetPos.c * cell + cell/2, targetPos.r * cell + cell/2, cell/4, 0, 2*Math.PI)
            ctx.fill()
          }
        }
      })
    }

    // Enhanced tokens with 3D effect and animations
    Object.entries(tokenPositions).forEach(([player, tokens]) => {
      const color = playerColors[player as keyof typeof playerColors]
      tokens.forEach((token, index) => {
        const x = token.c * cell + cell/2
        const y = token.r * cell + cell/2
        const radius = cell/3.2
        const isSelected = player === currentPlayer && selectedToken === index
        const isCurrentPlayer = player === currentPlayer
        
        // Enhanced selection glow with pulsing effect
        if (isSelected) {
          const pulseRadius = radius + 8 + Math.sin(Date.now() * 0.01) * 3
          ctx.beginPath()
          ctx.arc(x, y, pulseRadius, 0, 2*Math.PI)
          const glowGradient = ctx.createRadialGradient(x, y, radius, x, y, pulseRadius)
          glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)')
          glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
          ctx.fillStyle = glowGradient
          ctx.fill()
        }
        
        // Current player highlight
        if (isCurrentPlayer && !isSelected) {
          ctx.beginPath()
          ctx.arc(x, y, radius + 4, 0, 2*Math.PI)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
          ctx.fill()
        }
        
        // Enhanced token shadow
        ctx.shadowColor = 'rgba(0,0,0,0.4)'
        ctx.shadowBlur = 6
        ctx.shadowOffsetX = 3
        ctx.shadowOffsetY = 3
        
        // Token with 3D gradient
        const tokenGradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius)
        tokenGradient.addColorStop(0, adjustBrightness(color, 40))
        tokenGradient.addColorStop(0.7, color)
        tokenGradient.addColorStop(1, adjustBrightness(color, -30))
        
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2*Math.PI)
        ctx.fillStyle = tokenGradient
        ctx.fill()
        
        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        
        // Token border
        ctx.strokeStyle = isSelected ? '#FFD700' : '#333'
        ctx.lineWidth = isSelected ? 4 : 2
        ctx.stroke()
        
        // Inner highlight
        ctx.beginPath()
        ctx.arc(x - radius/4, y - radius/4, radius/3, 0, 2*Math.PI)
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.fill()
        
        // Token number with shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = 2
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText((index + 1).toString(), x, y + 5)
        
        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      })
    })

    // Enhanced winner overlay with effects
    if (winner) {
      // Animated victory background
      const victoryGradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
      const pulse = Math.sin(animationFrame * 0.1) * 0.2 + 0.8
      victoryGradient.addColorStop(0, `rgba(255, 215, 0, ${pulse})`)
      victoryGradient.addColorStop(1, `rgba(255, 140, 0, ${pulse * 0.7})`)
      ctx.fillStyle = victoryGradient
      ctx.fillRect(0, 0, size, size)
      
      // Victory particles
      for (let i = 0; i < 20; i++) {
        const angle = (animationFrame * 0.05 + i * 0.314) % (Math.PI * 2)
        const radius = 100 + Math.sin(animationFrame * 0.03 + i) * 50
        const x = size/2 + Math.cos(angle) * radius
        const y = size/2 + Math.sin(angle) * radius
        
        ctx.fillStyle = `hsl(${(animationFrame + i * 20) % 360}, 70%, 60%)`
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()
      }
      
      // Trophy with glow
      ctx.shadowColor = '#FFD700'
      ctx.shadowBlur = 20
      ctx.fillStyle = '#000'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🏆', size/2, size/2 - 40)
      
      // Winner text with glow
      ctx.shadowBlur = 10
      ctx.font = 'bold 32px Arial'
      ctx.fillText(`${winner} Wins!`, size/2, size/2 + 20)
      
      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    }
    
    // Dynamic lighting effects
    if (lightingEffects && !winner) {
      // Ambient lighting on current player's area
      const playerIndex = players.indexOf(currentPlayer)
      const lightPositions = [
        {x: 3*cell, y: 3*cell}, // Green
        {x: 12*cell, y: 3*cell}, // Yellow  
        {x: 3*cell, y: 12*cell}, // Red
        {x: 12*cell, y: 12*cell} // Blue
      ]
      
      if (lightPositions[playerIndex]) {
        const pos = lightPositions[playerIndex]
        const lightGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, cell * 4)
        const playerColor = playerColors[currentPlayer as keyof typeof playerColors]
        lightGradient.addColorStop(0, `${playerColor}40`)
        lightGradient.addColorStop(1, `${playerColor}00`)
        ctx.fillStyle = lightGradient
        ctx.fillRect(0, 0, size, size)
      }
    }

    // Enhanced outer border with theme effects
    if (theme === 'neon') {
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 6
      ctx.shadowColor = '#00ffff'
      ctx.shadowBlur = 10
      ctx.strokeRect(2, 2, size - 4, size - 4)
      
      // Double border effect
      ctx.strokeStyle = '#ff00ff'
      ctx.lineWidth = 2
      ctx.shadowColor = '#ff00ff'
      ctx.shadowBlur = 5
      ctx.strokeRect(6, 6, size - 12, size - 12)
    } else if (cinematicMode) {
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 8
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 15
      ctx.strokeRect(0, 0, size, size)
    } else {
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 4
      ctx.strokeRect(0, 0, size, size)
    }
    
    // Reset all effects
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }, [tokenPositions, selectedToken, currentPlayer, canRoll, winner, diceValue, isAnimating, lastCapture, animationFrame, theme, lightingEffects, cinematicMode, particles])

  return (
    <div className={`min-h-screen p-4 flex items-center justify-center ${
      theme === 'neon' ? 'bg-gradient-to-br from-black via-purple-900 to-black' :
      theme === 'modern' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' :
      cinematicMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-black' :
      'bg-gradient-to-br from-green-50 via-yellow-50 to-red-50'
    }`}>
      <div className="flex gap-6 items-start max-w-7xl w-full">
        <div className="relative">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={600} 
            className={`shadow-2xl rounded-lg cursor-pointer ${
              theme === 'neon' ? 'border-4 border-cyan-400 shadow-cyan-400/50' :
              theme === 'modern' ? 'border-4 border-gray-600 shadow-gray-600/50' :
              cinematicMode ? 'border-4 border-purple-600 shadow-purple-600/50' :
              'border-4 border-yellow-600 shadow-yellow-600/30'
            }`}
            onClick={handleCanvasClick}
          />
          {isPaused && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-4xl font-bold">⏸️ PAUSED</div>
            </div>
          )}
        </div>
        <div className={`p-6 rounded-lg shadow-xl min-w-80 ${
          theme === 'neon' ? 'bg-black border-2 border-cyan-400 text-cyan-100 shadow-cyan-400/30' :
          theme === 'modern' ? 'bg-gray-800 text-white border-2 border-gray-600 shadow-gray-600/30' :
          cinematicMode ? 'bg-gray-900 text-white border-2 border-purple-600 shadow-purple-600/30' :
          'bg-white border-2 border-yellow-400 shadow-yellow-400/20'
        }`}>
          <h3 className={`text-2xl font-bold mb-4 text-center ${
            theme === 'neon' ? 'text-cyan-400' :
            theme === 'modern' ? 'text-white' :
            cinematicMode ? 'text-purple-400' :
            'text-yellow-800'
          }`}>🎲 ULTIMATE LUDO 🎲</h3>
          
          {/* Current Player */}
          <div className="text-center mb-4">
            <div className={`text-sm mb-1 ${
              theme === 'neon' ? 'text-cyan-300' :
              theme === 'modern' ? 'text-gray-300' :
              cinematicMode ? 'text-purple-300' :
              'text-gray-600'
            }`}>Current Player</div>
            <div 
              className="inline-block px-3 py-1 rounded-full text-white font-bold"
              style={{ backgroundColor: playerColors[currentPlayer as keyof typeof playerColors] }}
            >
              {currentPlayer}
            </div>
          </div>
          
          {/* Dice */}
          <div className="text-center mb-4">
            <div 
              className="w-20 h-20 bg-white border-4 border-gray-800 rounded-lg flex items-center justify-center text-4xl font-bold mb-3 mx-auto shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={rollDice}
            >
              <span className="text-red-600 text-5xl font-black">{diceValue || '🎲'}</span>
            </div>
            <Button 
              onClick={rollDice} 
              className={`w-full transition-all duration-200 ${
                canRoll ? 'hover:scale-105 bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
              }`} 
              size="lg"
              disabled={!canRoll}
            >
              {canRoll ? 'Roll Dice' : 'Wait...'}
            </Button>
          </div>
          
          {/* Game Status */}
          <div className="text-center">
            <div className={`text-sm mb-1 ${
              theme === 'neon' ? 'text-cyan-300' :
              theme === 'modern' ? 'text-gray-300' :
              cinematicMode ? 'text-purple-300' :
              'text-gray-600'
            }`}>Status</div>
            <div className={`text-sm font-medium px-3 py-2 rounded ${
              theme === 'neon' ? 'text-cyan-100 bg-cyan-900/30 border border-cyan-400/30' :
              theme === 'modern' ? 'text-white bg-gray-700 border border-gray-600' :
              cinematicMode ? 'text-purple-100 bg-purple-900/30 border border-purple-400/30' :
              'text-gray-800 bg-yellow-50 border border-yellow-200'
            }`}>
              {gameStatus}
            </div>
          </div>
          
          {/* Game Rules */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs font-semibold text-blue-800 mb-2">Game Rules:</div>
            <div className="text-xs text-blue-700 space-y-1">
              <div>• Roll 6 to get extra turn</div>
              <div>• Click tokens to move them</div>
              <div>• Land on opponents to send them home</div>
              <div>• Safe zones protect your tokens</div>
            </div>
          </div>
          
          {/* Player Stats */}
          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-600 text-center mb-2">Player Status</div>
            {players.map(player => (
              <div key={player} className={`flex items-center justify-between text-xs p-2 rounded ${
                player === currentPlayer ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-50'
              }`}>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: playerColors[player as keyof typeof playerColors] }}
                  ></div>
                  <span className={player === currentPlayer ? 'font-bold' : ''}>{player}</span>
                </div>
                <div className="text-gray-500">
                  {player === currentPlayer ? '👑' : '4 tokens'}
                </div>
              </div>
            ))}
          </div>
          
          {/* Winner Display */}
          {winner && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-center">
              <div className="text-lg font-bold text-white mb-2">🏆 GAME OVER 🏆</div>
              <div className="text-white font-semibold">{winner} Wins!</div>
              <Button 
                onClick={resetGame} 
                className="mt-2 bg-white text-gray-800 hover:bg-gray-100"
                size="sm"
              >
                New Game
              </Button>
            </div>
          )}
          
          {/* Game Stats */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 text-center mb-2">Game Stats</div>
            <div className="text-xs text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>Total Moves:</span>
                <span className="font-semibold">{moveCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Roll:</span>
                <span className="font-semibold">{diceValue || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Game Status:</span>
                <span className="font-semibold">{winner ? 'Finished' : 'Playing'}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4">
            <Button 
              onClick={resetGame} 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              🔄 Reset Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}