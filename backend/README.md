# Chess Backend Server 🏰

A robust WebSocket-based backend server for real-time multiplayer chess games.

## Features

- **Real-time multiplayer** chess games via WebSocket
- **Automatic matchmaking** - pairs waiting players instantly
- **Full chess validation** using chess.js library
- **Game state management** - handles moves, turns, and game over conditions
- **Graceful disconnection handling** - notifies opponents when players leave
- **Comprehensive logging** - detailed server and game logs
- **Type-safe** - fully written in TypeScript

## Quick Start

### Option 1: Simple Start
```bash
npm install
npm run dev
```

### Option 2: Using Start Script
```bash
npm install
node start.js
```

### Option 3: Development with Auto-reload
```bash
npm install
npm run dev:watch
```

## Server Information

- **Port**: 8080 (configurable via PORT environment variable)
- **Protocol**: WebSocket (ws://)
- **URL**: `ws://localhost:8080`

## Message Protocol

### Client → Server Messages

#### Start/Join Game
```json
{
  "type": "init_game"
}
```

#### Make Move
```json
{
  "type": "move",
  "payload": {
    "move": {
      "from": "e2",
      "to": "e4"
    }
  }
}
```

#### Resign Game
```json
{
  "type": "resign"
}
```

### Server → Client Messages

#### Game Started
```json
{
  "type": "init_game",
  "payload": {
    "color": "white",
    "gameId": "game_1234567890_abc123",
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }
}
```

#### Move Made
```json
{
  "type": "move",
  "payload": {
    "move": { "from": "e2", "to": "e4" },
    "san": "e4",
    "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "moveCount": 1,
    "turn": "black"
  }
}
```

#### Game Over
```json
{
  "type": "game_over",
  "payload": {
    "winner": "white",
    "reason": "checkmate",
    "fen": "final_position_fen",
    "gameId": "game_1234567890_abc123"
  }
}
```

#### Waiting for Opponent
```json
{
  "type": "waiting_for_opponent",
  "payload": {
    "message": "Waiting for an opponent to join..."
  }
}
```

## Game Logic

### Move Validation
- Uses chess.js library for complete chess rule validation
- Validates turn order (white moves first, alternating turns)
- Checks for legal moves only
- Handles special moves (castling, en passant, promotion)

### Game Over Conditions
- **Checkmate**: Winner determined by checkmate
- **Draw**: Stalemate, insufficient material, threefold repetition, fifty-move rule
- **Resignation**: Player can resign at any time
- **Disconnection**: If a player disconnects, opponent wins

### Matchmaking
- First player to request a game waits for an opponent
- Second player automatically starts a game with the waiting player
- No complex rating or skill-based matching (simple FIFO)

## Architecture

```
GameManager
├── Manages multiple Game instances
├── Handles player connections and disconnections
├── Routes messages to appropriate games
└── Provides server statistics

Game
├── Manages individual chess game state
├── Validates moves using chess.js
├── Broadcasts moves to both players
├── Handles game over conditions
└── Tracks game history and metadata
```

## Development

### Project Structure
```
backend/
├── src/
│   ├── index.ts          # Server entry point
│   ├── GameManager.ts    # Multi-game management
│   ├── Game.ts           # Individual game logic
│   └── message.ts        # Message types and interfaces
├── dist/                 # Compiled JavaScript (auto-generated)
├── package.json
├── tsconfig.json
└── start.js             # Simple startup script
```

### Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled server
- `npm run dev` - Build and start server
- `npm run dev:watch` - Development mode with auto-reload
- `npm run clean` - Remove compiled files

### Environment Variables
- `PORT` - Server port (default: 8080)

## Logging

The server provides comprehensive logging:
- 🚀 Server startup and configuration
- 👤 Player connections and disconnections
- 🎮 Game creation and completion
- ♟️ Individual moves with validation
- 📊 Periodic statistics (every 30 seconds)
- ❌ Errors and invalid operations

## Error Handling

- Invalid moves are rejected with error messages
- Disconnected players trigger opponent notification
- Malformed messages are logged and ignored
- Server gracefully handles shutdown signals

## Performance

- Lightweight WebSocket implementation
- Efficient game state management
- Minimal memory footprint per game
- Fast move validation using chess.js

## Testing

Connect multiple WebSocket clients to test:
```javascript
const ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => ws.send(JSON.stringify({ type: 'init_game' }));
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8080
netstat -ano | findstr :8080
# Kill the process (Windows)
taskkill /PID <PID> /F
```

### TypeScript Compilation Errors
```bash
# Clean and rebuild
npm run clean
npm run build
```

### WebSocket Connection Issues
- Ensure firewall allows port 8080
- Check if server is actually running
- Verify WebSocket URL format: `ws://localhost:8080`

## License

MIT License - See LICENSE file for details.