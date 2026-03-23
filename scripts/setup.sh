#!/bin/bash
# Node.js Backend Development Setup
# Usage: ./scripts/setup.sh

set -e

echo "📦 Setting up Node.js Backend development..."

# Check Node.js version
NODE_VERSION=$(node --version)
echo "   Node version: $NODE_VERSION"

# Install dependencies
if [ -f package.json ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# Copy env example
if [ ! -f .env ] && [ -f .env.example ]; then
    echo "📝 Creating .env from example..."
    cp .env.example .env
fi

echo "✅ Node.js Backend environment ready!"
echo ""
echo "📝 Commands:"
echo "   dev:    npm run dev"
echo "   test:   npm test"
echo "   start:  npm start"