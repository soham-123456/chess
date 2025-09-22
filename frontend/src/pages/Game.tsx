import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import ChessBoard from '../components/ChessBoard'
import GameInfo from '../components/GameInfo'

export default function Game() {
  const navigate = useNavigate()
  const { isConnected, connectToGame, gameState, startNewGame } = useGame()
  const hasConnectedRef = useRef(false)
  const hasStartedGameRef = useRef(false)

  // Connect only once when component mounts
  useEffect(() => {
    if (!hasConnectedRef.current && !isConnected) {
      console.log('🔌 Connecting to game server...')
      connectToGame()
      hasConnectedRef.current = true
    }
  }, [connectToGame, isConnected])

  // Start new game only once after connection
  useEffect(() => {
    if (isConnected && gameState === 'waiting' && !hasStartedGameRef.current) {
      console.log('🎮 Starting new game after connection...')
      const timer = setTimeout(() => {
        startNewGame()
        hasStartedGameRef.current = true
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isConnected, gameState, startNewGame])

  const handleBackHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBackHome}
            className="button-secondary text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 hover:scale-105 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">ChessPro</h1>
            <p className="text-slate-400 text-sm">Professional Chess Match</p>
          </div>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Game Content */}
        <div className="flex flex-col xl:flex-row items-start justify-center gap-8 max-w-7xl mx-auto">
          {/* Chess Board */}
          <div className="fade-in flex-shrink-0">
            <ChessBoard />
          </div>

          {/* Game Info Panel */}
          <div className="fade-in w-full xl:w-auto xl:min-w-[400px]">
            <GameInfo />
          </div>
        </div>
      </div>

      {/* Connection Status Overlay */}
      {!isConnected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card rounded-2xl p-8 text-white text-center max-w-md mx-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent"></div>
            </div>
            <h2 className="text-xl font-semibold mb-3">Connecting to Server</h2>
            <p className="text-slate-400 mb-6">
              Establishing connection to the game server...
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  hasConnectedRef.current = false
                  connectToGame()
                }}
                className="w-full button-primary px-4 py-3 rounded-xl font-medium"
              >
                Retry Connection
              </button>
              <button
                onClick={handleBackHome}
                className="w-full button-secondary px-4 py-3 rounded-xl font-medium"
              >
                Back to Home
              </button>
            </div>
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
              <p className="text-xs text-slate-400 mb-2">Server Setup:</p>
              <code className="block text-xs text-slate-300 text-left">
                cd backend<br/>
                npm install<br/>
                npm run dev
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}