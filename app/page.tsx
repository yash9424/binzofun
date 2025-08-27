import Link from "next/link"

export default function HomePage() {
  const games = [
    { id: "ludo", name: "Ludo", icon: "🎲", thumbnail: "/ludo.jpeg" },
    { id: "aviator", name: "Aviator", icon: "✈️", thumbnail: "/aviator.jpeg" },
    { id: "chicken-road", name: "Chicken Road", icon: "🐔", thumbnail: "/chickenroad.jpeg" },
    { id: "color-prediction", name: "Color Prediction", icon: "🎨", thumbnail: "/colorpridiction.webp" },
    { id: "plinko", name: "Plinko", icon: "⬇️", thumbnail: "/plinko2.jpeg" },
    { id: "mines", name: "Mines", icon: "💣", thumbnail: "/mines.jpeg" },
    { id: "balloons", name: "Balloons", icon: "🎈", thumbnail: "/balloon.png" },
    { id: "cock-fight", name: "Cock Fight", icon: "🐓", thumbnail: "/cockfight.webp" },
    { id: "dice", name: "Dice", icon: "🎲", thumbnail: "/Dice.jpeg" },
    { id: "jet-x", name: "Jet-X", icon: "🚀", thumbnail: "/jetx2.jpeg" },
    { id: "pushpa", name: "Pushpa", icon: "🚚", thumbnail: "/pushpa.jpeg" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🎮</span>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              All Games
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {games.map((game) => (
            <Link 
              key={game.id} 
              href={`/games/${game.id.toLowerCase().replace(/\s+/g, '-')}`}
              className="block group"
            >
              <div>
                <div 
                  className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 shadow-xl group-hover:shadow-2xl group-hover:shadow-purple-500/20 transition-all duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${game.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Icon at top-left */}
                  <div className="absolute top-3 left-3 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                    <span className="text-xl">{game.icon}</span>
                  </div>
                  
                  {/* Dark name bar at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm">
                    <h3 className="text-white font-semibold text-sm text-center py-3 px-2">
                      {game.name}
                    </h3>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}