import { WebSocket } from "ws";
import { Chess } from 'chess.js';
import { GAME_OVER, INIT_GAME, MOVE, GAME_STATE } from "./message";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private startTime: Date;
    private moveCount: number = 0;
    private gameId: string;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.gameId = this.generateGameId();

        console.log(`🎮 New game created: ${this.gameId}`);
        
        // Send initial game state to both players
        this.sendToPlayer(this.player1, {
            type: INIT_GAME,
            payload: {
                color: "white",
                gameId: this.gameId,
                fen: this.board.fen()
            }
        });

        this.sendToPlayer(this.player2, {
            type: INIT_GAME,
            payload: {
                color: "black",
                gameId: this.gameId,
                fen: this.board.fen()
            }
        });

        // Send initial board state
        this.broadcastGameState();
    }

    makeMove(socket: WebSocket, move: { from: string; to: string }): void {
        // Validate it's the correct player's turn
        const isPlayer1Turn = this.moveCount % 2 === 0;
        const isValidPlayer = (isPlayer1Turn && socket === this.player1) || 
                             (!isPlayer1Turn && socket === this.player2);

        if (!isValidPlayer) {
            console.log(`❌ Invalid turn: Player ${socket === this.player1 ? '1' : '2'} tried to move on ${isPlayer1Turn ? 'player 1' : 'player 2'}'s turn`);
            this.sendToPlayer(socket, {
                type: 'error',
                payload: { message: 'Not your turn!' }
            });
            return;
        }

        // Validate and make the move
        try {
            const moveResult = this.board.move(move);
            if (!moveResult) {
                console.log(`❌ Invalid move: ${move.from} → ${move.to}`);
                this.sendToPlayer(socket, {
                    type: 'error',
                    payload: { message: 'Invalid move!' }
                });
                return;
            }

            console.log(`✅ Valid move: ${move.from} → ${move.to} (${moveResult.san})`);
            this.moveCount++;

            // Broadcast the move to both players
            this.broadcastMove(move, moveResult.san);
            
            // Check for game over conditions
            this.checkGameOver();

        } catch (error) {
            console.error('❌ Move error:', error);
            this.sendToPlayer(socket, {
                type: 'error',
                payload: { message: 'Invalid move format!' }
            });
        }
    }

    handleResignation(socket: WebSocket): void {
        const winner = socket === this.player1 ? 'black' : 'white';
        const resigningPlayer = socket === this.player1 ? 'white' : 'black';
        
        console.log(`🏳️ ${resigningPlayer} resigned, ${winner} wins`);
        
        this.broadcastGameOver(winner, 'resignation');
    }

    private broadcastMove(move: { from: string; to: string }, san: string): void {
        const moveData = {
            type: MOVE,
            payload: {
                move,
                san,
                fen: this.board.fen(),
                moveCount: this.moveCount,
                turn: this.board.turn() === 'w' ? 'white' : 'black'
            }
        };

        this.sendToPlayer(this.player1, moveData);
        this.sendToPlayer(this.player2, moveData);
    }

    private broadcastGameState(): void {
        const gameState = {
            type: GAME_STATE,
            payload: {
                fen: this.board.fen(),
                turn: this.board.turn() === 'w' ? 'white' : 'black',
                moveCount: this.moveCount,
                gameId: this.gameId
            }
        };

        this.sendToPlayer(this.player1, gameState);
        this.sendToPlayer(this.player2, gameState);
    }

    private checkGameOver(): void {
        let winner: string | null = null;
        let reason: string = '';

        if (this.board.isCheckmate()) {
            winner = this.board.turn() === 'w' ? 'black' : 'white';
            reason = 'checkmate';
            console.log(`🏆 Checkmate! ${winner} wins`);
        } else if (this.board.isDraw()) {
            winner = 'draw';
            if (this.board.isStalemate()) {
                reason = 'stalemate';
            } else if (this.board.isInsufficientMaterial()) {
                reason = 'insufficient_material';
            } else if (this.board.isThreefoldRepetition()) {
                reason = 'threefold_repetition';
            } else {
                reason = 'fifty_move_rule';
            }
            console.log(`🤝 Draw by ${reason}`);
        }

        if (winner !== null) {
            this.broadcastGameOver(winner, reason);
        }
    }

    private broadcastGameOver(winner: string, reason: string): void {
        const gameOverData = {
            type: GAME_OVER,
            payload: {
                winner,
                reason,
                fen: this.board.fen(),
                gameId: this.gameId
            }
        };

        this.sendToPlayer(this.player1, gameOverData);
        this.sendToPlayer(this.player2, gameOverData);
    }

    private sendToPlayer(player: WebSocket, data: any): void {
        if (player.readyState === WebSocket.OPEN) {
            player.send(JSON.stringify(data));
        }
    }

    private generateGameId(): string {
        return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Utility methods
    public getGameInfo() {
        return {
            gameId: this.gameId,
            fen: this.board.fen(),
            turn: this.board.turn() === 'w' ? 'white' : 'black',
            moveCount: this.moveCount,
            startTime: this.startTime,
            isGameOver: this.board.isGameOver(),
            winner: this.board.isGameOver() ? 
                (this.board.isCheckmate() ? 
                    (this.board.turn() === 'w' ? 'black' : 'white') : 'draw') : null
        };
    }
}