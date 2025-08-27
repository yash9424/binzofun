import { notFound } from "next/navigation"
import { ColorPredictionGame } from "@/components/games/color-prediction"
import { DiceGame } from "@/components/games/dice"
import { PlinkoGame } from "@/components/games/plinko"
import { MinesGame } from "@/components/games/mines"
import { AviatorGame } from "@/components/games/aviator"
import { LudoGame } from "@/components/games/ludo"
import { BalloonsGame } from "@/components/games/balloons"
import { CockFightGame } from "@/components/games/cock-fight"
import { JetXGame } from "@/components/games/jet-x"
import { ChickenRoadGame } from "@/components/games/chicken-road"
import { PushpaGame } from "@/components/games/pushpa"
import Puzzle from "@/components/games/puzzle"
import Racing from "@/components/games/racing"
import Wheel from "@/components/games/wheel"

const gameComponents = {
  "color-prediction": ColorPredictionGame,
  dice: DiceGame,
  plinko: PlinkoGame,
  mines: MinesGame,
  aviator: AviatorGame,
  ludo: LudoGame,
  balloons: BalloonsGame,
  "cock-fight": CockFightGame,
  "jet-x": JetXGame,
  "chicken-road": ChickenRoadGame,
  pushpa: PushpaGame,
  puzzle: Puzzle,
  racing: Racing,
  wheel: Wheel,
}

export default async function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params
  const GameComponent = gameComponents[gameId as keyof typeof gameComponents]

  if (!GameComponent) {
    notFound()
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <GameComponent />
      </div>
    </div>
  )
}
