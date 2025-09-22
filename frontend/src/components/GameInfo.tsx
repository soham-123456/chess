import { useGame } from '../contexts/GameContext'

const pieceSymbols: { [key: string]: string } = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
}

const getPieceSymbol = (piece: string): string => {
  return pieceSymbols[piece] || piece
}

export default function GameInfo() {
  const { 
    gameState, 
    playerColor, 
    currentTurn, 
    winner, 
    gameHistory, 
    resignGame,
    startNewGame,
    isConnected 
  } = useGame()

  const isPlayerTurn = currentTurn === playerColor

  const getStatusMessage = () => {
    if (!isConnected) return 'Disconnected from server'
    if (gameState === 'waiting') return 'Waiting for opponent...'
    if (gameState === 'finished') {
      if (winner === 'draw') return 'Game ended in a draw'
      if (winner === playerColor) return 'You won! 🎉'
      return 'You lost 😔'
    }
    if (isPlayerTurn) return 'Your turn'
    return 'Opponent\'s turn'
  }

  const getStatusColor = () => {
    if (!isConnected) return 'text-red-400'
    if (gameState === 'waiting') return 'text-yellow-400'
    if (gameState === 'finished') {
      if (winner === playerColor) return 'text-green-400'
      if (winner === 'draw') return 'text-blue-400'
      return 'text-red-400'
    }
    if (isPlayerTurn) return 'text-green-400'
    return 'text-orange-400'
  }

  return (
    <div className="space-y-6">
      {/* Game Status Card */}
      <div className="card rounded-2xl p-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mb-3">
            <span className="text-2xl">♔</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Game Status</h2>
          <div className={`text-base font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>
          {gameState === 'waiting' && (
            <div className="mt-3">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      {/* Player Info */}
      {playerColor && (
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Playing as</p>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">
                  {playerColor === 'white' ? '♔' : '♚'}
                </span>
                <span className="text-lg font-semibold text-white capitalize">{playerColor}</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              playerColor === 'white' ? 'bg-slate-100 text-slate-900' : 'bg-slate-800 text-white'
            }`}>
              {playerColor === 'white' ? 'White' : 'Black'}
            </div>
          </div>
        </div>
      )}

      {/* Turn Indicator */}
      {gameState === 'playing' && (
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Current Turn</p>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {currentTurn === 'white' ? '♔' : '♚'}
                </span>
                <span className="text-lg font-semibold text-white capitalize">{currentTurn}</span>
              </div>
            </div>
            {isPlayerTurn && (
              <div className="px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-xl">
                <span className="text-green-300 text-sm font-medium">Your Turn</span>
              </div>
            )}
          </div>
          
          {/* Check Warning - This would be populated by backend validation */}
          {false && ( // Placeholder - backend should send check status
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-300 font-medium text-sm">
                    {currentTurn === playerColor ? 'Your king is in CHECK!' : 'Opponent\'s king is in CHECK!'}
                  </p>
                  <p className="text-red-400 text-xs mt-1">
                    You must move to get out of check!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game Controls */}
      <div className="card rounded-2xl p-6">
        <div className="space-y-3">
          {gameState === 'playing' && (
            <button
              onClick={resignGame}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-white transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17l-1.5-1.5m2.999-1.5L11 12.5l1.5-1.5m-4.5 0L12 7l1.5 1.5M8.5 8.5L7 7m5 5L7.5 7.5M21 3l-9 9" />
              </svg>
              <span>Resign Game</span>
            </button>
          )}
          
          {gameState === 'finished' && (
            <button
              onClick={startNewGame}
              className="w-full py-3 px-4 button-primary rounded-xl font-medium text-white flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Play Again</span>
            </button>
          )}
        </div>
      </div>

      {/* Move History */}
      {gameHistory.length > 0 && (
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Move History</h3>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-slate-700 px-3 py-1 rounded-full text-xs font-medium text-slate-300">
                {gameHistory.length} moves
              </div>
              {gameHistory.some(move => move.captured) && (
                <div className="bg-red-500/20 px-3 py-1 rounded-full text-xs font-medium text-red-300">
                  {gameHistory.filter(move => move.captured).length} captures
                </div>
              )}
            </div>
          </div>
            
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {gameHistory.map((move, index) => {
                const moveNumber = Math.floor(index / 2) + 1
                const isWhiteMove = index % 2 === 0
                const isLastMove = index === gameHistory.length - 1
                
                return (
                  <div 
                    key={index} 
                    className={`
                      flex items-center justify-between p-4 rounded-xl transition-all duration-200
                      ${isLastMove ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-slate-800/50 hover:bg-slate-800/70'}
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {isWhiteMove && (
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded-full font-medium text-slate-300">
                            {moveNumber}.
                          </span>
                        )}
                        <span className={`text-xl ${isWhiteMove ? '' : 'ml-8'}`}>
                          {isWhiteMove ? '♔' : '♚'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                          <span className="text-lg">{getPieceSymbol(move.piece)}</span>
                          <span className="font-mono text-sm font-medium text-white">
                            {move.from}
                          </span>
                        </div>
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                          <span className="font-mono text-sm font-medium text-white">
                            {move.to}
                          </span>
                          {move.captured && (
                            <span className="text-red-400 text-lg">×{getPieceSymbol(move.captured)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isLastMove && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full font-medium">
                          Latest
                        </span>
                      )}
                      {move.captured && (
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full font-medium">
                          Capture
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
            
        </div>
      )}

      {/* Connection Status */}
      <div className="card rounded-2xl p-4">
        <div className="flex items-center justify-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'Connected to Server' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  )
}