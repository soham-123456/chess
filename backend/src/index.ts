import { WebSocket, WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const wss = new WebSocketServer({ 
    port: PORT,
    perMessageDeflate: false // Disable compression for better performance
});

const gameManager = new GameManager();

console.log('🚀 Chess WebSocket server starting...');
console.log(`📡 Port: ${PORT}`);
console.log(`🕐 Started at: ${new Date().toISOString()}`);

wss.on('connection', function connection(ws, request) {
    const clientIP = request.socket.remoteAddress;
    console.log(`👤 New player connected from ${clientIP}`);
    
    // Add user to game manager
    gameManager.addUser(ws);
    
    // Handle connection close
    ws.on('close', (code, reason) => {
        console.log(`👤 Player disconnected (${code}): ${reason}`);
        gameManager.removeUser(ws);
        
        // Log current stats
        const stats = gameManager.getStats();
        console.log(`📊 Current stats: ${stats.totalUsers} users, ${stats.activeGames} games, ${stats.waitingUsers} waiting`);
    });

    // Handle connection errors
    ws.on('error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        gameManager.removeUser(ws);
    });

    // Send welcome message
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'welcome',
            payload: {
                message: 'Connected to Chess Server',
                timestamp: new Date().toISOString()
            }
        }));
    }
});

wss.on('listening', () => {
    console.log('✅ Chess server is running successfully!');
    console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`);
    console.log('🎮 Ready for players to connect!');
});

wss.on('error', (error) => {
    console.error('❌ WebSocket server error:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    
    const stats = gameManager.getStats();
    console.log(`📊 Final stats: ${stats.totalUsers} users, ${stats.activeGames} games`);
    
    wss.close(() => {
        console.log('✅ Server shut down gracefully');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    wss.close(() => {
        process.exit(0);
    });
});

// Log stats every 30 seconds if there are active connections
setInterval(() => {
    const stats = gameManager.getStats();
    if (stats.totalUsers > 0) {
        console.log(`📊 Stats: ${stats.totalUsers} users, ${stats.activeGames} active games, ${stats.waitingUsers} waiting`);
    }
}, 120000);

export { gameManager, wss }; 
