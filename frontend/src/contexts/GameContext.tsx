import { createContext, useContext, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react'

export type GameState = 'waiting' | 'playing' | 'finished'
export type PlayerColor = 'white' | 'black' | null
export type Winner = 'white' | 'black' | 'draw' | null

interface GameContextType {
  socket: WebSocket | null
  gameState: GameState
  playerColor: PlayerColor
  board: string[][]
  currentTurn: 'white' | 'black'
  winner: Winner
  isConnected: boolean
  selectedSquare: string | null
  validMoves: string[]
  lastMove: { from: string; to: string } | null
  gameHistory: Array<{ from: string; to: string; piece: string; captured?: string }>
  connectToGame: () => void
  makeMove: (from: string, to: string) => void
  selectSquare: (square: string) => void
  resignGame: () => void
  startNewGame: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

interface GameAction {
  type: 'CONNECT' | 'DISCONNECT' | 'INIT_GAME' | 'MOVE' | 'OPPONENT_MOVE' | 'GAME_OVER' | 'SELECT_SQUARE' | 'CLEAR_SELECTION' | 'SET_VALID_MOVES' | 'RESET_GAME'
  payload?: any
}

interface GameStateType {
  socket: WebSocket | null
  gameState: GameState
  playerColor: PlayerColor
  board: string[][]
  currentTurn: 'white' | 'black'
  winner: Winner
  isConnected: boolean
  selectedSquare: string | null
  validMoves: string[]
  lastMove: { from: string; to: string } | null
  gameHistory: Array<{ from: string; to: string; piece: string; captured?: string }>
}

const initialBoard = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
]

const initialState: GameStateType = {
  socket: null,
  gameState: 'waiting',
  playerColor: null,
  board: initialBoard,
  currentTurn: 'white',
  winner: null,
  isConnected: false,
  selectedSquare: null,
  validMoves: [],
  lastMove: null,
  gameHistory: []
}


function gameReducer(state: GameStateType, action: GameAction): GameStateType {
  switch (action.type) {
    case 'CONNECT':
      return { ...state, socket: action.payload, isConnected: true }
    case 'DISCONNECT':
      return { ...state, socket: null, isConnected: false, gameState: 'waiting' }
    case 'INIT_GAME':
      return {
        ...state,
        gameState: 'playing',
        playerColor: action.payload.color,
        board: initialBoard,
        currentTurn: 'white',
        winner: null,
        selectedSquare: null,
        validMoves: [],
        lastMove: null,
        gameHistory: []
      }
    case 'MOVE':
    case 'OPPONENT_MOVE':
      const newBoard = state.board.map(row => [...row])
      const { from, to } = action.payload

      // Convert chess notation to array indices
      // e.g., "a2" -> file=0, rank=2 -> row=6, col=0
      const fromCol = from.charCodeAt(0) - 97  // 'a' = 0, 'b' = 1, etc.
      const fromRow = 8 - parseInt(from[1])    // rank 1 = row 7, rank 8 = row 0
      const toCol = to.charCodeAt(0) - 97
      const toRow = 8 - parseInt(to[1])

      const isOpponentMove = action.type === 'OPPONENT_MOVE'
      console.log(`🔄 ${isOpponentMove ? 'Opponent' : 'Your'} move: ${from} → ${to}`)
      console.log(`   From: (${fromRow}, ${fromCol}) To: (${toRow}, ${toCol})`)

      // Validate indices
      if (fromRow < 0 || fromRow > 7 || fromCol < 0 || fromCol > 7 ||
        toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) {
        console.error('❌ Invalid move coordinates:', { from, to, fromRow, fromCol, toRow, toCol })
        return state
      }

      const piece = newBoard[fromRow][fromCol]
      const captured = newBoard[toRow][toCol]

      // Validate that there's actually a piece to move
      if (!piece) {
        console.error(`❌ No piece found at ${from} (${fromRow}, ${fromCol})`)
        return state
      }

      console.log(`   Moving piece "${piece}" from ${from} to ${to}`)
      if (captured) console.log(`   Capturing "${captured}"`)

      newBoard[toRow][toCol] = piece
      newBoard[fromRow][fromCol] = ''

      // Log the board state after the move
      console.log('📋 Board after move:')
      newBoard.forEach((row, i) => {
        console.log(`Rank ${8 - i}: [${row.map(p => p || '·').join(' ')}]`)
      })

      return {
        ...state,
        board: newBoard,
        currentTurn: state.currentTurn === 'white' ? 'black' : 'white',
        selectedSquare: null,
        validMoves: [],
        lastMove: { from, to },
        gameHistory: [...state.gameHistory, { from, to, piece, captured: captured || undefined }]
      }
    case 'GAME_OVER':
      return {
        ...state,
        gameState: 'finished',
        winner: action.payload.winner,
        selectedSquare: null,
        validMoves: []
      }
    case 'SELECT_SQUARE':
      return { ...state, selectedSquare: action.payload }
    case 'CLEAR_SELECTION':
      return { ...state, selectedSquare: null, validMoves: [] }
    case 'SET_VALID_MOVES':
      return { ...state, validMoves: action.payload }
    case 'RESET_GAME':
      return { ...initialState, socket: state.socket, isConnected: state.isConnected }
    default:
      return state
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const socketRef = useRef<WebSocket | null>(null)
  const isConnectingRef = useRef(false)

  const connectToGame = useCallback(() => {
    // Prevent multiple connection attempts
    if (socketRef.current || isConnectingRef.current) {
      console.log('Connection already exists or in progress')
      return
    }

    isConnectingRef.current = true
    console.log('Attempting to connect to WebSocket server...')

    try {
      const ws = new WebSocket('ws://localhost:8080')
      socketRef.current = ws

      ws.onopen = () => {
        console.log('✅ Connected to WebSocket server')
        isConnectingRef.current = false
        dispatch({ type: 'CONNECT', payload: ws })
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('📨 Received message:', message.type)

          switch (message.type) {
            case 'init_game':
              console.log('🎮 Game initialized:', message.payload)
              dispatch({ type: 'INIT_GAME', payload: message.payload })
              break
            case 'move':
              console.log('♟️ Move received from server:', message.payload)
              // Handle server move response - this is the opponent's move
              if (message.payload.move) {
                dispatch({ type: 'OPPONENT_MOVE', payload: message.payload.move })
              } else if (message.payload.from && message.payload.to) {
                dispatch({ type: 'OPPONENT_MOVE', payload: { from: message.payload.from, to: message.payload.to } })
              } else {
                dispatch({ type: 'OPPONENT_MOVE', payload: message.payload })
              }
              break
            case 'game_over':
              console.log('🏁 Game over:', message.payload)
              dispatch({ type: 'GAME_OVER', payload: message.payload })
              break
            case 'waiting_for_opponent':
              console.log(' Waiting for opponent...')
              break
            case 'welcome':
              console.log('👋 Welcome message received')
              break
            case 'error':
              console.error('❌ Server error:', message.payload)
              break
            default:
              console.log('❓ Unknown message type:', message.type, message)
          }
        } catch (error) {
          console.error('❌ Error parsing message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason)
        socketRef.current = null
        isConnectingRef.current = false
        dispatch({ type: 'DISCONNECT' })
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        socketRef.current = null
        isConnectingRef.current = false
        dispatch({ type: 'DISCONNECT' })
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      socketRef.current = null
      isConnectingRef.current = false
      dispatch({ type: 'DISCONNECT' })
    }
  }, [])

  const makeMove = useCallback((from: string, to: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && state.gameState === 'playing') {

      // Check if it's the player's turn
      if (state.currentTurn !== state.playerColor) {
        console.log(`❌ Not your turn! Current turn: ${state.currentTurn}, You are: ${state.playerColor}`)
        return
      }

      // Get the piece at the from square
      const fromCol = from.charCodeAt(0) - 97
      const fromRow = 8 - parseInt(from[1])

      if (fromRow < 0 || fromRow > 7 || fromCol < 0 || fromCol > 7) {
        console.log(`❌ Invalid from square: ${from}`)
        return
      }

      const piece = state.board[fromRow][fromCol]
      if (!piece) {
        console.log(`❌ No piece at ${from}`)
        return
      }

      // Check if the piece belongs to the current player
      const pieceIsWhite = piece === piece.toUpperCase()
      const playerIsWhite = state.playerColor === 'white'

      if (pieceIsWhite !== playerIsWhite) {
        console.log(`❌ Cannot move opponent's piece! Piece: ${piece}, Player: ${state.playerColor}`)
        return
      }

      console.log(`♟️ Valid move attempt: ${from} → ${to} (${piece})`)

      // Send to server first - let server validate and confirm
      socketRef.current.send(JSON.stringify({
        type: 'move',
        payload: { move: { from, to } }
      }))

      // Update locally for immediate feedback (your move)
      dispatch({ type: 'MOVE', payload: { from, to } })
    }
  }, [state.gameState, state.currentTurn, state.playerColor, state.board])

  const selectSquare = useCallback((square: string) => {
    if (state.gameState !== 'playing') return

    console.log(`🎯 Square selected: ${square}`)

    // Check if it's the player's turn
    if (state.currentTurn !== state.playerColor) {
      console.log(`❌ Not your turn! Current turn: ${state.currentTurn}, You are: ${state.playerColor}`)
      return
    }

    if (state.selectedSquare === square) {
      console.log('🔄 Deselecting square')
      dispatch({ type: 'CLEAR_SELECTION' })
      return
    }

    // If we have a selected square and click on a different square, try to move
    if (state.selectedSquare && state.selectedSquare !== square) {
      console.log(`🎯 Attempting move: ${state.selectedSquare} → ${square}`)
      makeMove(state.selectedSquare, square)
      dispatch({ type: 'CLEAR_SELECTION' })
    } else {
      // Check if there's a piece at the selected square
      const col = square.charCodeAt(0) - 97
      const row = 8 - parseInt(square[1])

      if (row < 0 || row > 7 || col < 0 || col > 7) {
        console.log(`❌ Invalid square: ${square}`)
        return
      }

      const piece = state.board[row][col]
      if (!piece) {
        console.log(`❌ No piece at ${square}`)
        return
      }

      // Check if the piece belongs to the current player
      const pieceIsWhite = piece === piece.toUpperCase()
      const playerIsWhite = state.playerColor === 'white'

      if (pieceIsWhite !== playerIsWhite) {
        console.log(`❌ Cannot select opponent's piece! Piece: ${piece}, Player: ${state.playerColor}`)
        return
      }

      // Select the square and calculate valid moves
      console.log(`✅ Selecting your piece: ${piece} at ${square}`)
      dispatch({ type: 'SELECT_SQUARE', payload: square })

      // Calculate valid moves for the selected piece
      const validMoves = calculateValidMoves(square, state.board, state.playerColor)
      console.log(`🎯 Valid moves for ${square}:`, validMoves)
      dispatch({ type: 'SET_VALID_MOVES', payload: validMoves })
    }
  }, [state.gameState, state.selectedSquare, state.board, state.playerColor, state.currentTurn, makeMove])

  const resignGame = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && state.gameState === 'playing') {
      console.log('🏳️ Resigning game')
      socketRef.current.send(JSON.stringify({ type: 'resign' }))
    }
  }, [state.gameState])

  const startNewGame = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('🎮 Starting new game')
      socketRef.current.send(JSON.stringify({ type: 'init_game' }))
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log('🧹 Cleaning up WebSocket connection')
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [])

  const value: GameContextType = {
    ...state,
    connectToGame,
    makeMove,
    selectSquare,
    resignGame,
    startNewGame
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

// Helper function to find the king position
function findKing(board: string[][], isWhite: boolean): [number, number] | null {
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

// Helper function to check if a square is under attack by the opponent
function isSquareUnderAttack(board: string[][], row: number, col: number, byWhite: boolean): boolean {
  // Check all opponent pieces to see if they can attack this square
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (!piece) continue

      const pieceIsWhite = piece === piece.toUpperCase()
      if (pieceIsWhite !== byWhite) continue // Skip pieces of wrong color

      // Check if this piece can attack the target square
      if (canPieceAttackSquare(board, r, c, row, col)) {
        return true
      }
    }
  }
  return false
}

// Helper function to check if a piece can attack a specific square
function canPieceAttackSquare(board: string[][], fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
  const piece = board[fromRow][fromCol]
  if (!piece) return false

  const pieceType = piece.toLowerCase()
  const isWhite = piece === piece.toUpperCase()

  const rowDiff = toRow - fromRow
  const colDiff = toCol - fromCol
  const absRowDiff = Math.abs(rowDiff)
  const absColDiff = Math.abs(colDiff)

  switch (pieceType) {
    case 'p': // Pawn
      const direction = isWhite ? -1 : 1
      // Pawns attack diagonally
      return rowDiff === direction && absColDiff === 1

    case 'r': // Rook
      if (rowDiff === 0 || colDiff === 0) {
        return isPathClear(board, fromRow, fromCol, toRow, toCol)
      }
      return false

    case 'n': // Knight
      return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2)

    case 'b': // Bishop
      if (absRowDiff === absColDiff) {
        return isPathClear(board, fromRow, fromCol, toRow, toCol)
      }
      return false

    case 'q': // Queen
      if (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) {
        return isPathClear(board, fromRow, fromCol, toRow, toCol)
      }
      return false

    case 'k': // King
      return absRowDiff <= 1 && absColDiff <= 1
  }

  return false
}

// Helper function to check if path is clear between two squares
function isPathClear(board: string[][], fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
  const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0
  const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0

  let currentRow = fromRow + rowStep
  let currentCol = fromCol + colStep

  while (currentRow !== toRow || currentCol !== toCol) {
    if (board[currentRow][currentCol] !== '') {
      return false // Path is blocked
    }
    currentRow += rowStep
    currentCol += colStep
  }

  return true
}

// Helper function to check if the king is in check
function isKingInCheck(board: string[][], isWhite: boolean): boolean {
  const kingPos = findKing(board, isWhite)
  if (!kingPos) return false

  return isSquareUnderAttack(board, kingPos[0], kingPos[1], !isWhite)
}

// Helper function to simulate a move and check if it leaves the king in check
function wouldMoveLeaveKingInCheck(board: string[][], fromRow: number, fromCol: number, toRow: number, toCol: number, isWhite: boolean): boolean {
  // Create a copy of the board
  const testBoard = board.map(row => [...row])

  // Make the move on the test board
  const piece = testBoard[fromRow][fromCol]
  testBoard[toRow][toCol] = piece
  testBoard[fromRow][fromCol] = ''

  // Check if the king is in check after this move
  return isKingInCheck(testBoard, isWhite)
}

// Helper function to calculate valid moves for a piece with proper chess validation
function calculateValidMoves(square: string, board: string[][], playerColor: PlayerColor): string[] {
  const col = square.charCodeAt(0) - 97  // 'a' = 0, 'b' = 1, etc.
  const row = 8 - parseInt(square[1])    // rank 1 = row 7, rank 8 = row 0

  if (row < 0 || row > 7 || col < 0 || col > 7) return []

  const piece = board[row][col]
  if (!piece) return []

  const isWhite = piece === piece.toUpperCase()
  const pseudoLegalMoves: string[] = []

  // Helper function to convert array indices back to chess notation
  const toSquare = (r: number, c: number): string => {
    if (r < 0 || r > 7 || c < 0 || c > 7) return ''
    return String.fromCharCode(97 + c) + (8 - r)
  }

  // Helper function to check if a square is empty or contains enemy piece
  const canMoveTo = (r: number, c: number): boolean => {
    if (r < 0 || r > 7 || c < 0 || c > 7) return false
    const targetPiece = board[r][c]
    if (!targetPiece) return true // Empty square
    const targetIsWhite = targetPiece === targetPiece.toUpperCase()
    return isWhite !== targetIsWhite // Can capture enemy piece
  }

  const pieceType = piece.toLowerCase()

  // Generate pseudo-legal moves (moves that follow piece movement rules but might leave king in check)
  switch (pieceType) {
    case 'p': // Pawn
      const direction = isWhite ? -1 : 1
      const startRow = isWhite ? 6 : 1

      // One square forward
      if (canMoveTo(row + direction, col) && !board[row + direction][col]) {
        pseudoLegalMoves.push(toSquare(row + direction, col))

        // Two squares forward from starting position
        if (row === startRow && !board[row + 2 * direction][col]) {
          pseudoLegalMoves.push(toSquare(row + 2 * direction, col))
        }
      }

      // Diagonal captures
      if (canMoveTo(row + direction, col - 1) && board[row + direction][col - 1]) {
        pseudoLegalMoves.push(toSquare(row + direction, col - 1))
      }
      if (canMoveTo(row + direction, col + 1) && board[row + direction][col + 1]) {
        pseudoLegalMoves.push(toSquare(row + direction, col + 1))
      }
      break

    case 'r': // Rook
      const rookDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]]
      for (const [dr, dc] of rookDirections) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i
          const newCol = col + dc * i
          if (!canMoveTo(newRow, newCol)) break
          pseudoLegalMoves.push(toSquare(newRow, newCol))
          if (board[newRow][newCol]) break
        }
      }
      break

    case 'n': // Knight
      const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
      for (const [dr, dc] of knightMoves) {
        const newRow = row + dr
        const newCol = col + dc
        if (canMoveTo(newRow, newCol)) {
          pseudoLegalMoves.push(toSquare(newRow, newCol))
        }
      }
      break

    case 'b': // Bishop
      const bishopDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
      for (const [dr, dc] of bishopDirections) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i
          const newCol = col + dc * i
          if (!canMoveTo(newRow, newCol)) break
          pseudoLegalMoves.push(toSquare(newRow, newCol))
          if (board[newRow][newCol]) break
        }
      }
      break

    case 'q': // Queen
      const queenDirections = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
      for (const [dr, dc] of queenDirections) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i
          const newCol = col + dc * i
          if (!canMoveTo(newRow, newCol)) break
          pseudoLegalMoves.push(toSquare(newRow, newCol))
          if (board[newRow][newCol]) break
        }
      }
      break

    case 'k': // King
      const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
      for (const [dr, dc] of kingMoves) {
        const newRow = row + dr
        const newCol = col + dc
        if (canMoveTo(newRow, newCol)) {
          // For king moves, also check if the destination square is under attack
          if (!isSquareUnderAttack(board, newRow, newCol, !isWhite)) {
            pseudoLegalMoves.push(toSquare(newRow, newCol))
          }
        }
      }
      break
  }

  // Filter out moves that would leave the king in check
  const legalMoves: string[] = []

  for (const move of pseudoLegalMoves) {
    const toCol = move.charCodeAt(0) - 97
    const toRow = 8 - parseInt(move[1])

    if (!wouldMoveLeaveKingInCheck(board, row, col, toRow, toCol, isWhite)) {
      legalMoves.push(move)
    }
  }

  // Log check status for debugging
  if (isKingInCheck(board, isWhite)) {
    console.log(`👑 ${isWhite ? 'White' : 'Black'} king is in CHECK! Only ${legalMoves.length} legal moves available.`)
  }

  return legalMoves.filter(move => move !== '')
}