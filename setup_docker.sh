#!/bin/bash

# Garage Platform Deployment Script
echo "🚀 Starting Garage Platform deployment setup..."

# 1. Create directory for logs and uploads if they don't exist
mkdir -p backend/uploads/products

# 2. Check for .env file in backend
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env not found. Creating from .env.example..."
    cp backend/.env.example backend/.env
    echo "❗ Please edit backend/.env and set a secure JWT_SECRET."
fi

# 3. Build and start containers
echo "📦 Building and starting containers..."

# Try to detect if 'docker compose' or 'docker-compose' is available
if docker compose version > /dev/null 2>&1; then
    DOCKER_CMD="docker compose"
elif docker-compose version > /dev/null 2>&1; then
    DOCKER_CMD="docker-compose"
else
    echo "❌ Error: Neither 'docker compose' nor 'docker-compose' found."
    echo "Please install Docker Compose plugin (sudo apt install docker-compose-plugin)"
    exit 1
fi

$DOCKER_CMD build
$DOCKER_CMD up -d

echo "✅ Deployment started!"
echo "📡 Access your site at: https://guidex.pw"
echo "🛠  Admin panel: https://guidex.pw/admin/"
echo "📝 Note: Make sure you have SSL certificates in /etc/letsencrypt/live/guidex.pw/ on your server."
