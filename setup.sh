#!/bin/bash
# Setup script - Install dependencies and configure environment

set -euo pipefail

echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "❌ npm not found"
    exit 1
fi

if [ -f .env.example ]; then
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "✅ Environment file created from .env.example"
    fi
fi

echo "✅ Setup complete!"
