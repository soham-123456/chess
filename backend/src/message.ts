
// Message types for WebSocket communication
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const RESIGN = "resign";
export const WAITING_FOR_OPPONENT = "waiting_for_opponent";
export const GAME_STATE = "game_state";
export const ERROR = "error";

// Message interfaces for type safety
export interface InitGameMessage {
    type: typeof INIT_GAME;
    payload: {
        color: 'white' | 'black';
        gameId: string;
        fen: string;
    };
}

export interface MoveMessage {
    type: typeof MOVE;
    payload: {
        move: { from: string; to: string };
        san?: string;
        fen: string;
        moveCount: number;
        turn: 'white' | 'black';
    };
}

export interface GameOverMessage {
    type: typeof GAME_OVER;
    payload: {
        winner: 'white' | 'black' | 'draw';
        reason: string;
        fen: string;
        gameId: string;
    };
}

export interface WaitingMessage {
    type: typeof WAITING_FOR_OPPONENT;
    payload: {
        message: string;
    };
}

export interface GameStateMessage {
    type: typeof GAME_STATE;
    payload: {
        fen: string;
        turn: 'white' | 'black';
        moveCount: number;
        gameId: string;
    };
}

export interface ErrorMessage {
    type: typeof ERROR;
    payload: {
        message: string;
    };
}