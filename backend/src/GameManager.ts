import { WebSocket } from "ws";
import { INIT_GAME, MOVE, RESIGN, WAITING_FOR_OPPONENT } from "./message";
import { Game } from "./Game";

export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket: WebSocket): void {
        console.log(`📝 Adding user. Total users: ${this.users.length + 1}`);
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket): void {
        console.log(`🚪 Removing user. Total users: ${this.users.length - 1}`);
        
        // Remove from users list
        this.users = this.users.filter(user => user !== socket);
        
        // Remove from pending if they were waiting
        if (this.pendingUser === socket) {
            this.pendingUser = null;
            console.log('⏳ Pending user removed');
        }
        
        // Handle game cleanup
        const gameIndex = this.games.findIndex(game => 
            game.player1 === socket || game.player2 === socket
        );
        
        if (gameIndex !== -1) {
            const game = this.games[gameIndex];
            console.log('🎮 Player left active game');
            
            // Notify the other player
            const otherPlayer = game.player1 === socket ? game.player2 : game.player1;
            if (otherPlayer.readyState === WebSocket.OPEN) {
                otherPlayer.send(JSON.stringify({
                    type: 'game_over',
                    payload: {
                        winner: game.player1 === socket ? 'black' : 'white',
                        reason: 'opponent_disconnected'
                    }
                }));
            }
            
            // Remove the game
            this.games.splice(gameIndex, 1);
        }
    }

    private addHandler(socket: WebSocket): void {
        socket.on("message", (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log(`📨 Received message: ${message.type}`);
                
                switch (message.type) {
                    case INIT_GAME:
                        this.handleInitGame(socket);
                        break;
                    case MOVE:
                        this.handleMove(socket, message.payload.move);
                        break;
                    case RESIGN:
                        this.handleResign(socket);
                        break;
                    default:
                        console.log(`❓ Unknown message type: ${message.type}`);
                }
            } catch (error) {
                console.error('❌ Error parsing message:', error);
            }
        });

        socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });
    }

    private handleInitGame(socket: WebSocket): void {
        if (this.pendingUser && this.pendingUser !== socket) {
            // Start the game with pending user
            console.log('🎮 Starting new game!');
            const game = new Game(this.pendingUser, socket);
            this.games.push(game);
            this.pendingUser = null;
        } else {
            // Set as pending user
            console.log('⏳ Player waiting for opponent...');
            this.pendingUser = socket;
            
            // Send waiting message
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: WAITING_FOR_OPPONENT,
                    payload: {
                        message: "Waiting for an opponent to join..."
                    }
                }));
            }
        }
    }

    private handleMove(socket: WebSocket, move: { from: string; to: string }): void {
        const game = this.games.find(game => 
            game.player1 === socket || game.player2 === socket
        );
        
        if (game) {
            console.log(`♟️ Move: ${move.from} → ${move.to}`);
            game.makeMove(socket, move);
        } else {
            console.log('❌ No active game found for move');
        }
    }

    private handleResign(socket: WebSocket): void {
        const game = this.games.find(game => 
            game.player1 === socket || game.player2 === socket
        );
        
        if (game) {
            console.log('🏳️ Player resigned');
            game.handleResignation(socket);
            
            // Remove the game after resignation
            const gameIndex = this.games.indexOf(game);
            if (gameIndex !== -1) {
                this.games.splice(gameIndex, 1);
            }
        }
    }

    // Utility method to get stats
    getStats(): { totalUsers: number; activeGames: number; waitingUsers: number } {
        return {
            totalUsers: this.users.length,
            activeGames: this.games.length,
            waitingUsers: this.pendingUser ? 1 : 0
        };
    }
}
