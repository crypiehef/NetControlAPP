#!/bin/bash

# Net Control by K4HEF - Startup Script
# This script helps you quickly set up and start the application

echo "================================================"
echo "  Net Control by K4HEF - Setup & Start"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo "✅ Docker is installed"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running!"
    echo ""
    echo "Please start Docker Desktop and wait for it to fully start."
    echo "Look for the Docker whale icon in your menu bar - it should be steady, not animated."
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Docker daemon is running"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available!"
    echo "Please install Docker Compose or use Docker Desktop which includes it."
    exit 1
fi

echo "✅ Docker Compose is available"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
JWT_SECRET=NetControl2024SecureKeyForYorkCountyAmateurRadioSociety_ChangeInProduction
EOF
    echo "✅ .env file created"
    echo "⚠️  Remember to change JWT_SECRET in production!"
else
    echo "✅ .env file already exists"
fi

echo ""

# Check if port 80 is in use
if lsof -i :80 &> /dev/null; then
    echo "⚠️  WARNING: Port 80 is already in use!"
    echo ""
    echo "Would you like to use port 8080 instead? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo ""
        echo "🚀 Starting Net Control on port 8080..."
        echo ""
        
        if command -v docker-compose &> /dev/null; then
            docker-compose -f docker-compose-port8080.yml up -d
        else
            docker compose -f docker-compose-port8080.yml up -d
        fi
        
        echo ""
        echo "================================================"
        echo "  ✅ Net Control is starting up!"
        echo "================================================"
        echo ""
        echo "The application will be available shortly at:"
        echo "  👉 http://localhost:8080  (note the port!)"
        echo ""
        echo "First time setup:"
        echo "  1. Wait 30-60 seconds for services to fully start"
        echo "  2. Open http://localhost:8080 in your browser"
        echo "  3. Click 'Register' to create your account"
        echo "  4. Go to Settings to configure your QRZ API key"
        echo ""
        echo "Useful commands:"
        echo "  Stop:    docker-compose -f docker-compose-port8080.yml down"
        echo "  Logs:    docker-compose -f docker-compose-port8080.yml logs -f"
        echo "  Status:  docker ps"
        echo ""
        echo "📻 73 de K4HEF"
        echo "================================================"
        exit 0
    else
        echo ""
        echo "Please free up port 80 or manually use docker-compose-port8080.yml"
        exit 1
    fi
fi

echo "🚀 Starting Net Control application..."
echo ""

# Use docker-compose if available, otherwise use docker compose
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

# Wait a moment and check status
sleep 3

echo ""
echo "Checking container status..."
docker ps --format "table {{.Names}}\t{{.Status}}" | grep netcontrol || echo "No containers running yet, they may still be starting..."

echo ""
echo "================================================"
echo "  ✅ Net Control is starting up!"
echo "================================================"
echo ""
echo "The application will be available shortly at:"
echo "  👉 http://localhost"
echo ""
echo "First time setup:"
echo "  1. Wait 30-60 seconds for services to fully start"
echo "  2. Open http://localhost in your browser"
echo "  3. Click 'Register' to create your account"
echo "  4. Go to Settings to configure your QRZ API key"
echo ""
echo "If you get 'Can't connect to server':"
echo "  - Wait a full minute (first start takes time)"
echo "  - Check logs: docker-compose logs -f"
echo "  - See QUICK_FIX.md for troubleshooting"
echo ""
echo "Useful commands:"
echo "  Stop:    docker-compose down"
echo "  Logs:    docker-compose logs -f"
echo "  Status:  docker ps"
echo "  Rebuild: docker-compose up -d --build"
echo ""
echo "📻 73 de K4HEF"
echo "================================================"

