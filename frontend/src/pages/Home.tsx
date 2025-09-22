import { useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'

export default function Home() {
  const navigate = useNavigate()
  const { isConnected } = useGame()

  const handlePlayGame = () => {
    navigate('/game')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-12 fade-in max-w-6xl mx-auto">
          {/* Header */}
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <span className="text-4xl text-white">♔</span>
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                Chess<span className="text-blue-400">Pro</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Experience professional chess with real-time multiplayer gameplay, 
                advanced move validation, and a clean, modern interface.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-6">
            <button
              onClick={handlePlayGame}
              disabled={isConnected}
              className="button-primary text-white font-semibold py-4 px-12 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-3"
            >
              <span>Start Playing</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-slate-500 text-sm">
              Connect instantly and get matched with players worldwide
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="card rounded-2xl p-8 text-center card-hover">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-xl mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-time Play</h3>
              <p className="text-slate-400 leading-relaxed">
                Lightning-fast WebSocket connections ensure every move is synchronized instantly across all players.
              </p>
            </div>
            
            <div className="card rounded-2xl p-8 text-center card-hover">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-xl mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Advanced Validation</h3>
              <p className="text-slate-400 leading-relaxed">
                Complete chess rule enforcement including check detection, legal moves, and game state management.
              </p>
            </div>
            
            <div className="card rounded-2xl p-8 text-center card-hover">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-xl mb-6">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Professional UI</h3>
              <p className="text-slate-400 leading-relaxed">
                Clean, modern interface designed for serious chess players with intuitive controls and visual feedback.
              </p>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="card rounded-2xl p-8 mt-16 text-left max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">Quick Start Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Connect & Match</h4>
                    <p className="text-slate-400 text-sm">Click "Start Playing" to connect to the game server and get matched with an opponent.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Choose Your Side</h4>
                    <p className="text-slate-400 text-sm">You'll be automatically assigned white or black pieces to begin the match.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Make Your Moves</h4>
                    <p className="text-slate-400 text-sm">Click on your pieces to see valid moves, then click your destination square.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">4</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Win the Game</h4>
                    <p className="text-slate-400 text-sm">Checkmate your opponent or force a draw to complete the match.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}