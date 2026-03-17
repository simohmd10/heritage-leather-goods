#!/bin/bash
# Heritage Leather Goods - Start Script

echo "Starting Heritage Leather Goods E-Commerce Platform..."

# Install server dependencies if needed
if [ ! -d "server/node_modules" ]; then
  echo "Installing server dependencies..."
  cd server && npm install && cd ..
fi

# Seed the database if it doesn't exist
if [ ! -f "server/data/shop.db" ]; then
  echo "Seeding database..."
  cd server && node seed.js && cd ..
fi

# Start the API server in the background
echo "Starting API server on port 3001..."
cd server && node index.js &
API_PID=$!
cd ..

# Wait a moment for the server to start
sleep 2

# Start the frontend dev server
echo "Starting frontend on port 8080..."
bun run dev &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo "  Heritage Leather Goods is running!"
echo "================================================"
echo "  Frontend:  http://localhost:8080"
echo "  API:       http://localhost:3001/api"
echo ""
echo "  Admin:     admin@heritageleather.com / admin123"
echo "  Customer:  customer@example.com / password123"
echo "================================================"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $API_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'" EXIT
wait
