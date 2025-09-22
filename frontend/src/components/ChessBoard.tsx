import { useGame } from '../contexts/GameContext'

const pieceSymbols: { [key: string]: string } = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
}



// Helper function to find the king position
const findKing = (board: string[][], isWhite: boolean): [number, number] | null => {
  const kingSymbol = isWhite ? 'K' : 'k'
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === kingSymbol) {
        return [row, col]
      }
    }
  }
  return null
}

// Helper function to check if the king is in check (simplified version)
const isKingInCheck = (board: string[][], isWhite: boolean): boolean => {
  const kingPos = findKing(board, isWhite)
  if (!kingPos) return false
  
  // This is a simplified check detection - in a real game, you'd need full attack detection
  // For now, we'll just check if there are any enemy pieces that could potentially attack
  // The backend should handle the real validation
  return false // Placeholder - backend handles real check detection
}

export default function ChessBoard() {
  const {
    board,
    playerColor,
    selectedSquare,
    validMoves,
    lastMove,
    selectSquare,
    currentTurn,
    gameState
  } = useGame()

  const isFlipped = playerColor === 'black'
  
  // Check if either king is in check
  const whiteKingInCheck = isKingInCheck(board, true)
  const blackKingInCheck = isKingInCheck(board, false)
  
  // Debug: Log board state when it changes
  console.log('🏁 Current board state:')
  board.forEach((row, i) => {
    console.log(`Rank ${8-i}: [${row.map(p => p || '·').join(' ')}]`)
  })

  const getSquareName = (displayRow: number, displayCol: number): string => {
    // Convert display coordinates to actual board coordinates
    const actualRow = isFlipped ? 7 - displayRow : displayRow
    const actualCol = isFlipped ? 7 - displayCol : displayCol
    
    // Convert to chess notation
    const rank = 8 - actualRow
    const file = String.fromCharCode(97 + actualCol) // a-h
    return file + rank
  }

  const isLightSquare = (row: number, col: number): boolean => {
    return (row + col) % 2 === 0
  }

  const isValidMove = (square: string): boolean => {
    return validMoves.includes(square)
  }

  const isLastMove = (square: string): boolean => {
    return Boolean(lastMove && (lastMove.from === square || lastMove.to === square))
  }

  const canSelectSquare = (displayRow: number, displayCol: number): boolean => {
    if (gameState !== 'playing') return false
    
    // Can't interact if it's not your turn
    if (currentTurn !== playerColor) return false
    
    // Get actual board position
    const actualRow = isFlipped ? 7 - displayRow : displayRow
    const actualCol = isFlipped ? 7 - displayCol : displayCol
    const piece = board[actualRow][actualCol]
    
    // If no piece selected, can only select your own pieces
    if (!selectedSquare) {
      if (!piece) return false // Can't select empty square when nothing is selected
      
      // Can only select own pieces
      const pieceIsWhite = piece === piece.toUpperCase()
      const playerIsWhite = playerColor === 'white'
      return pieceIsWhite === playerIsWhite
    }
    
    // If we have a piece selected, we can click anywhere to try to move
    return true
  }

  const handleSquareClick = (displayRow: number, displayCol: number) => {
    const square = getSquareName(displayRow, displayCol)
    const actualRow = isFlipped ? 7 - displayRow : displayRow
    const actualCol = isFlipped ? 7 - displayCol : displayCol
    const piece = board[actualRow]?.[actualCol] || ''
    console.log(`🎯 Clicked square ${square} (display[${displayRow}][${displayCol}] -> actual[${actualRow}][${actualCol}]) with piece: "${piece}"`)
    console.log('Current turn:', currentTurn, 'Player color:', playerColor, 'Board flipped:', isFlipped)
    console.log('Selected square:', selectedSquare)
    selectSquare(square)
  }

  const renderSquare = (displayRow: number, displayCol: number) => {
    // Get actual board coordinates
    const actualRow = isFlipped ? 7 - displayRow : displayRow
    const actualCol = isFlipped ? 7 - displayCol : displayCol
    
    const square = getSquareName(displayRow, displayCol)
    const piece = board[actualRow]?.[actualCol] || ''
    const isLight = isLightSquare(displayRow, displayCol)
    const isSelected = selectedSquare === square
    const isValid = isValidMove(square)
    const isLast = isLastMove(square)
    const canSelect = canSelectSquare(displayRow, displayCol)

    // Add visual feedback for turn-based play
    const isMyTurn = currentTurn === playerColor
    const isMyPiece = piece && ((playerColor === 'white' && piece === piece.toUpperCase()) || 
                               (playerColor === 'black' && piece === piece.toLowerCase()))
    
    // Check if this square contains a king in check
    const isKingInCheckSquare = (piece === 'K' && whiteKingInCheck) || (piece === 'k' && blackKingInCheck)
    
    // Classic chess board colors - green and cream
    let squareColor = ''
    if (isKingInCheckSquare) {
      squareColor = isLight ? 'bg-red-300' : 'bg-red-500'
    } else if (isSelected) {
      squareColor = isLight ? 'bg-yellow-200' : 'bg-yellow-400'
    } else if (isLast) {
      squareColor = isLight ? 'bg-blue-200' : 'bg-blue-400'
    } else if (isLight) {
      squareColor = 'bg-amber-50' // Cream color for light squares
    } else {
      squareColor = 'bg-green-600' // Classic green for dark squares
    }
    
    const squareClasses = [
      'chess-square w-16 h-16 flex items-center justify-center relative transition-all duration-200',
      squareColor,
      canSelect ? 'cursor-pointer' : 'cursor-default',
      // Dim the board when it's not your turn
      !isMyTurn ? 'opacity-70' : '',
      // Hover effects for selectable pieces
      canSelect ? 'hover:brightness-110' : ''
    ].filter(Boolean).join(' ')

    return (
      <div
        key={`${displayRow}-${displayCol}`}
        className={squareClasses}
        onClick={() => handleSquareClick(displayRow, displayCol)}
      >
        {/* Valid move indicator */}
        {isValid && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-3 h-3 bg-red-500 rounded-full border border-red-700"></div>
          </div>
        )}

        {/* Chess piece */}
        {piece && pieceSymbols[piece] && (
          <div className={`
            chess-piece text-3xl relative z-10 transition-all duration-200
            ${piece === piece.toUpperCase() ? 'text-white' : 'text-gray-800'}
            ${canSelect ? 'cursor-pointer hover:scale-110' : ''}
          `}
          style={{
            textShadow: piece === piece.toUpperCase() 
              ? '1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000' 
              : '1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff'
          }}>
            {pieceSymbols[piece]}
          </div>
        )}

        {/* Coordinate labels */}
        {displayCol === 0 && (
          <div className="absolute left-0.5 top-0.5 text-xs font-bold text-gray-700">
            {isFlipped ? displayRow + 1 : 8 - displayRow}
          </div>
        )}
        {displayRow === 7 && (
          <div className="absolute right-0.5 bottom-0.5 text-xs font-bold text-gray-700">
            {String.fromCharCode(97 + (isFlipped ? 7 - displayCol : displayCol))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="inline-block">
      {/* Classic Chess Board */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
        <div className="grid grid-cols-8 gap-0 border-4 border-gray-700 rounded-lg overflow-hidden">
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => renderSquare(row, col))
          )}
        </div>
      </div>
    </div>
  )
}