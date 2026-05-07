#!/bin/bash
echo "========================================"
echo "Gomoku Game Launcher (Unix)"
echo "========================================"

cd "$(dirname "$0")/server"
echo "Installing server dependencies..."
npm install
echo "Starting server..."
npm run dev &
SERVER_PID=$!

cd "$(dirname "$0")/client"
echo "Installing client dependencies..."
npm install
echo "Starting client..."
npm start &
CLIENT_PID=$!

echo ""
echo "Services started!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null" EXIT
wait