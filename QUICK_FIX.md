# Quick Fix Guide - Can't Connect to http://localhost

## Most Likely Issue: Port 80 is Already in Use

### Quick Solution: Use Port 8080 Instead

**Step 1:** Stop any running containers
```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp"
docker-compose down
```

**Step 2:** Start using the alternate port configuration
```bash
docker-compose -f docker-compose-port8080.yml up -d
```

**Step 3:** Wait 30 seconds, then access at:
```
http://localhost:8080
```

✅ **This should work!**

---

## Other Quick Checks

### 1. Is Docker Desktop Running?
- Look for the Docker whale icon in your menu bar (Mac) or system tray (Windows)
- If not, start Docker Desktop and wait for it to fully load
- The whale should be still/steady, not animated

### 2. Check Container Status
```bash
docker ps
```

You should see three containers:
- netcontrol-frontend
- netcontrol-backend  
- netcontrol-mongodb

### 3. View Logs to See What's Wrong
```bash
# All logs
docker-compose logs

# Just backend
docker logs netcontrol-backend

# Just frontend
docker logs netcontrol-frontend
```

### 4. Complete Reset (if nothing else works)
```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp"

# Stop everything
docker-compose down

# Remove all data (WARNING: deletes database!)
docker-compose down -v

# Start fresh with port 8080
docker-compose -f docker-compose-port8080.yml up -d --build

# Wait 60 seconds
sleep 60

# Open in browser
open http://localhost:8080
```

---

## Run Diagnostics

Make the diagnostic script executable and run it:
```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp"
chmod +x diagnose.sh
./diagnose.sh
```

This will tell you exactly what's wrong.

---

## Still Not Working?

### Check These:

1. **Docker Desktop Version**: Make sure you're running a recent version
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Disk Space**: Make sure you have enough space
   ```bash
   df -h
   ```

3. **Memory**: Docker needs at least 2GB RAM
   - In Docker Desktop, go to Settings → Resources

4. **Firewall**: Make sure Docker is allowed through your firewall

### Try Development Mode (No Docker):

If Docker continues to give problems, run in development mode:

```bash
# Terminal 1 - Start MongoDB
docker run -d -p 27017:27017 --name mongo-dev mongo:7

# Terminal 2 - Start Backend
cd "/Volumes/1 TB SSD/Net/NetControlApp/backend"
npm install
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/netcontrol
JWT_SECRET=dev_secret_key
NODE_ENV=development" > .env
npm run dev

# Terminal 3 - Start Frontend
cd "/Volumes/1 TB SSD/Net/NetControlApp/frontend"
npm install
npm run dev
```

Access at: **http://localhost:3000**

---

## Need More Help?

See the full **TROUBLESHOOTING.md** file for detailed solutions.

**73!** 📻

