#!/bin/bash

echo "Setting up Next.js frontend..."
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the Next.js app
echo "Starting Next.js server on http://localhost:3000"
npm run dev
