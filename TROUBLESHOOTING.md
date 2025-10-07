# Troubleshooting Guide - Net Control by K4HEF

## Can't Connect to http://localhost

### Quick Fixes to Try (in order):

### 1. Check if Docker Desktop is Running
- **macOS**: Look for the Docker icon in the menu bar (top right)
- **Windows**: Look for the Docker icon in the system tray
- If Docker is not running, start Docker Desktop and wait for it to fully start (whale icon should be still, not animated)

### 2. Run the Diagnostic Script
```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp"
chmod +x diagnose.sh
./diagnose.sh
```

This will tell you exactly what's wrong.

### 3. Check Container Status
```bash
docker ps
```

You should see three containers running:
- `netcontrol-frontend`
- `netcontrol-backend`
- `netcontrol-mongodb`

If you don't see them, check all containers:
```bash
docker ps -a
```

### 4. View Container Logs
```bash
# Frontend logs
docker logs netcontrol-frontend

# Backend logs
docker logs netcontrol-backend

# MongoDB logs
docker logs netcontrol-mongodb
```

## Common Issues and Solutions

### Issue 1: Port 80 Already in Use

**Symptoms:**
- Error: "port is already allocated"
- "bind: address already in use"

**Solution A - Use Different Port:**

Edit `docker-compose.yml` and change the frontend ports from:
```yaml
frontend:
  ports:
    - "80:80"
```

To:
```yaml
frontend:
  ports:
    - "8080:80"
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

Access the app at: http://localhost:8080

**Solution B - Stop Service Using Port 80:**
```bash
# Find what's using port 80
sudo lsof -i :80

# Stop Apache (if that's what's running)
sudo apachectl stop

# Or stop nginx
sudo nginx -s stop
```

### Issue 2: Containers Keep Restarting

**Check the logs:**
```bash
docker-compose logs
```

**Common causes:**

1. **Missing .env file:**
```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp"
cat > .env << 'EOF'
JWT_SECRET=NetControl2024SecureKeyForYorkCountyAmateurRadioSociety
EOF
```

2. **MongoDB not starting:**
```bash
# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Issue 3: Frontend Container Starts but Backend Doesn't

**Check backend logs:**
```bash
docker logs netcontrol-backend
```

**Common fixes:**

1. **Rebuild backend:**
```bash
docker-compose down
docker-compose up -d --build backend
```

2. **Check if MongoDB is accessible:**
```bash
docker exec -it netcontrol-backend ping mongodb
```

### Issue 4: "502 Bad Gateway" Error

This means the frontend is running but can't reach the backend.

**Solution:**
```bash
# Restart backend
docker-compose restart backend

# Wait 10 seconds, then check
docker logs netcontrol-backend
```

### Issue 5: Frontend Shows Blank Page

**Solution:**
```bash
# Rebuild frontend
docker-compose down
docker-compose up -d --build frontend

# Clear browser cache
# Then refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
```

### Issue 6: Need to Start Fresh

**Complete reset (WARNING: This deletes all data!):**
```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp"

# Stop and remove everything including data
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

## Step-by-Step Startup Process

### Clean Startup:

1. **Stop everything:**
```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp"
docker-compose down
```

2. **Ensure Docker Desktop is running:**
   - Wait until the whale icon is steady (not animated)

3. **Start the services:**
```bash
docker-compose up -d
```

4. **Watch the logs:**
```bash
docker-compose logs -f
```

5. **Wait for services to be ready:**
   - MongoDB: Look for "Waiting for connections"
   - Backend: Look for "Server running on port 5000"
   - Frontend: Should start nginx

6. **Test the application:**
   - Open http://localhost
   - Wait 30-60 seconds on first start (Docker needs to download images)

## Verification Commands

### Check All Services Are Up:
```bash
docker-compose ps
```

All three should show "Up" status.

### Check Network:
```bash
docker network ls | grep netcontrol
```

### Check Volumes:
```bash
docker volume ls | grep netcontrol
```

### Test Backend API:
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"OK","message":"Net Control by K4HEF API is running"}`

### Test Frontend:
```bash
curl -I http://localhost
```

Should return HTTP 200.

## Still Having Issues?

### Get Full System Info:

```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp"

# Save diagnostic info to file
./diagnose.sh > diagnostic-output.txt 2>&1

# View the file
cat diagnostic-output.txt
```

### Manual Container Inspection:

```bash
# Enter backend container
docker exec -it netcontrol-backend sh

# Check if node is running
ps aux

# Check environment variables
env | grep MONGODB_URI

# Exit container
exit
```

### Check Container Resource Usage:
```bash
docker stats
```

## Alternative: Development Mode

If Docker is giving you trouble, you can run in development mode:

### Terminal 1 - MongoDB:
```bash
docker run -d -p 27017:27017 --name netcontrol-mongodb mongo:7
```

### Terminal 2 - Backend:
```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp/backend"
npm install

# Create .env
cat > .env << 'EOF'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/netcontrol
JWT_SECRET=your_secret_key_here
NODE_ENV=development
EOF

npm run dev
```

### Terminal 3 - Frontend:
```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp/frontend"
npm install
npm run dev
```

Access at: http://localhost:3000

## Contact Support

If you've tried everything and it's still not working, gather:
1. Output of `./diagnose.sh`
2. Output of `docker-compose logs`
3. Your operating system version
4. Docker Desktop version

**73!** 📻

