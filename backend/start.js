#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Chess Backend Server...\n');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
    console.log('📦 Building TypeScript files...');

    const buildProcess = spawn('npm', ['run', 'build'], {
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
    });

    buildProcess.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Build successful!');
            startServer();
        } else {
            console.error('❌ Build failed!');
            process.exit(1);
        }
    });
} else {
    startServer();
}

function startServer() {
    console.log('🎮 Starting server...\n');

    const serverProcess = spawn('npm', ['start'], {
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
    });

    serverProcess.on('close', (code) => {
        console.log(`\n🛑 Server exited with code ${code}`);
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping server...');
        serverProcess.kill('SIGINT');
    });
}