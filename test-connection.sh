#!/bin/bash

# Test if Net Control services are responding

echo "Testing Net Control Application..."
echo ""

# Test port 80
echo "1. Testing http://localhost ..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    echo "   ✅ Frontend is responding on port 80"
    FRONTEND_PORT=80
elif curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|301\|302"; then
    echo "   ✅ Frontend is responding on port 8080"
    FRONTEND_PORT=8080
else
    echo "   ❌ Frontend is not responding"
    echo "   Try: docker logs netcontrol-frontend"
    FRONTEND_PORT=0
fi

echo ""

# Test backend
echo "2. Testing backend API..."
BACKEND_RESPONSE=$(curl -s http://localhost:5000/api/health 2>&1)
if echo "$BACKEND_RESPONSE" | grep -q "Net Control"; then
    echo "   ✅ Backend API is responding"
    echo "   Response: $BACKEND_RESPONSE"
else
    echo "   ❌ Backend API is not responding"
    echo "   Try: docker logs netcontrol-backend"
fi

echo ""

# Check Docker containers
echo "3. Docker container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|netcontrol"

echo ""
echo "================================"
if [ $FRONTEND_PORT -gt 0 ]; then
    echo "✅ Application is ready!"
    echo "   Access at: http://localhost:$FRONTEND_PORT"
else
    echo "❌ Application is not ready yet"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Wait 30-60 seconds (first start is slow)"
    echo "2. Check logs: docker-compose logs -f"
    echo "3. See QUICK_FIX.md for solutions"
fi
echo "================================"

