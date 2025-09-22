# Chess Master 🏆

A real-time multiplayer chess game built with React, TypeScript, and WebSockets.

## Features

- **Real-time multiplayer** - Play against opponents instantly
- **Beautiful UI** - Modern, responsive design with smooth animations
- **Smart matchmaking** - Automatic pairing with available players
- **Move validation** - Full chess rule enforcement
- **Game history** - Track moves and captured pieces
- **Resignation support** - Players can resign at any time

## Tech Stack

### Frontend
- React 19 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- WebSocket client for real-time communication
- Vite for fast development and building

### Backend
- Node.js with TypeScript
- WebSocket server (ws library)
- Chess.js for game logic and validation
- Real-time game state management

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chess-master
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The server will start on `ws://localhost:8080`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

3. **Open multiple browser tabs** to test multiplayer functionality

## How to Play

1. **Connect**: Click "Play Chess" on the home page
2. **Wait for opponent**: The system will pair you with another player
3. **Make moves**: Click on a piece to select it, then click the destination square
4. **Win conditions**: Checkmate, resignation, or draw

## Game Controls

- **Select piece**: Click on your pieces to see valid moves
- **Make move**: Click on highlighted squares to move
- **Resign**: Use the resign button to forfeit the game
- **Play again**: Start a new game after finishing

## Project Structure

```
chess-master/
├── backend/
│   ├── src/
│   │   ├── index.ts          # WebSocket server setup
│   │   ├── GameManager.ts    # Handles multiple games and players
│   │   ├── Game.ts           # Individual game logic
│   │   └── message.ts        # Message type constants
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # Game state management
│   │   ├── pages/           # Route components
│   │   └── styles/          # CSS and styling
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Development

### Backend Development
```bash
cd backend
npm run watch    # Watch mode for TypeScript compilation
npm run build    # Build for production
npm start        # Run compiled JavaScript
```

### Frontend Development
```bash
cd frontend
npm run dev      # Development server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
```

## WebSocket API

### Client to Server Messages
- `init_game` - Request to start/join a game
- `move` - Make a chess move
- `resign` - Resign from current game

### Server to Client Messages
- `init_game` - Game started, includes player color
- `move` - Opponent's move
- `game_over` - Game finished with winner

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning and development.

## Future Enhancements

- [ ] Player authentication and profiles
- [ ] Game replay system
- [ ] Chess engine for single-player mode
- [ ] Tournament system
- [ ] Chat functionality
- [ ] Move time limits
- [ ] Rating system