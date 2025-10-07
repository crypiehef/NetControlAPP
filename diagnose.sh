#!/bin/bash

echo "================================================"
echo "  Net Control by K4HEF - Diagnostic Script"
echo "================================================"
echo ""

echo "1. Checking Docker installation..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    docker --version
else
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

echo ""
echo "2. Checking Docker daemon status..."
if docker info &> /dev/null; then
    echo "✅ Docker daemon is running"
else
    echo "❌ Docker daemon is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo ""
echo "3. Checking for running containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "4. Checking for NetControl containers..."
docker ps -a --filter "name=netcontrol" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "5. Checking port 80 availability..."
if lsof -i :80 &> /dev/null; then
    echo "⚠️  Port 80 is in use by:"
    lsof -i :80
    echo ""
    echo "SOLUTION: Port 80 is already in use. You have two options:"
    echo "  1. Stop the service using port 80"
    echo "  2. Or edit docker-compose.yml to use a different port (e.g., 8080)"
else
    echo "✅ Port 80 is available"
fi

echo ""
echo "6. Checking port 5000 availability..."
if lsof -i :5000 &> /dev/null; then
    echo "⚠️  Port 5000 is in use by:"
    lsof -i :5000
else
    echo "✅ Port 5000 is available"
fi

echo ""
echo "7. Checking .env file..."
if [ -f .env ]; then
    echo "✅ .env file exists"
else
    echo "⚠️  .env file not found, creating one..."
    cat > .env << 'EOF'
JWT_SECRET=NetControl2024SecureKeyForYorkCountyAmateurRadioSociety_ChangeInProduction
EOF
    echo "✅ .env file created"
fi

echo ""
echo "8. Recent Docker logs for NetControl containers..."
echo ""
echo "--- Frontend Logs ---"
docker logs netcontrol-frontend --tail 20 2>&1 || echo "Frontend container not found or not started"
echo ""
echo "--- Backend Logs ---"
docker logs netcontrol-backend --tail 20 2>&1 || echo "Backend container not found or not started"
echo ""
echo "--- MongoDB Logs ---"
docker logs netcontrol-mongodb --tail 20 2>&1 || echo "MongoDB container not found or not started"

echo ""
echo "================================================"
echo "  Diagnostic Complete"
echo "================================================"

