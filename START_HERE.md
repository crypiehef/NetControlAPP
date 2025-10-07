# 🚀 START HERE - Net Control by K4HEF

## Can't Connect to http://localhost? Try This First!

### Most Common Issue: Port 80 is in Use

**QUICK SOLUTION - Use Port 8080:**

```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp"
docker-compose down
docker-compose -f docker-compose-port8080.yml up -d
```

Wait 60 seconds, then go to: **http://localhost:8080**

---

## Step-by-Step First Time Setup

### 1. Make Sure Docker Desktop is Running
- Look for the Docker whale icon in your menu bar (Mac) or system tray (Windows)
- If it's not there, start Docker Desktop
- **Wait until the icon is steady** (not animated) - this means Docker is ready

### 2. Navigate to the Application Folder
```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp"
```

### 3. Run the Diagnostic (Optional but Recommended)
```bash
chmod +x diagnose.sh test-connection.sh
./diagnose.sh
```

This will tell you exactly what's wrong if anything.

### 4. Start the Application

**Option A - Automatic (Recommended):**
```bash
./start.sh
```

**Option B - Manual with Port 8080 (if Port 80 is busy):**
```bash
docker-compose -f docker-compose-port8080.yml up -d
```

**Option C - Manual with Port 80:**
```bash
docker-compose up -d
```

### 5. Wait for Startup
**IMPORTANT:** First time startup takes 1-2 minutes because Docker needs to:
- Download images (if first time)
- Build the application
- Start all services

### 6. Test the Connection
```bash
./test-connection.sh
```

Or manually check:
```bash
docker ps
```

You should see 3 containers running:
- netcontrol-frontend
- netcontrol-backend
- netcontrol-mongodb

### 7. Access the Application

**If using port 80:**
http://localhost

**If using port 8080:**
http://localhost:8080

### 8. Create Your Account
1. Click "Register here"
2. Fill in your information (username, callsign, email, password)
3. Click "Register"

### 9. Configure QRZ.com (Optional)
1. Go to Settings
2. Enter your QRZ.com API key
3. Now callsign lookups will work automatically!

---

## Still Having Issues?

### Check the Logs
```bash
# All services
docker-compose logs

# Just one service
docker logs netcontrol-frontend
docker logs netcontrol-backend
docker logs netcontrol-mongodb
```

### Common Error Messages and Solutions

**"Can't connect to server"**
- Wait longer (full 60 seconds)
- Check if containers are running: `docker ps`
- Try port 8080 instead: See QUICK_FIX.md

**"Port is already allocated"**
- Use the port 8080 configuration
- See QUICK_FIX.md

**"502 Bad Gateway"**
- Backend is not ready yet, wait 30 more seconds
- Check backend logs: `docker logs netcontrol-backend`

**Blank white page**
- Clear browser cache and hard refresh (Cmd+Shift+R on Mac)
- Check frontend logs: `docker logs netcontrol-frontend`

### Complete Reset (Nuclear Option)
```bash
cd "/Volumes/1 TB SSD/Net/NetControlApp"

# Stop and remove everything (WARNING: Deletes all data!)
docker-compose down -v

# Start fresh with port 8080
docker-compose -f docker-compose-port8080.yml up -d --build

# Wait 90 seconds
sleep 90

# Test
./test-connection.sh
```

---

## Quick Reference

### Start Application
```bash
./start.sh
# OR
docker-compose up -d
# OR (port 8080)
docker-compose -f docker-compose-port8080.yml up -d
```

### Stop Application
```bash
docker-compose down
# OR (if using port 8080)
docker-compose -f docker-compose-port8080.yml down
```

### View Logs
```bash
docker-compose logs -f
```

### Check Status
```bash
docker ps
```

### Test Connection
```bash
./test-connection.sh
```

### Rebuild Everything
```bash
docker-compose down
docker-compose up -d --build
```

---

## Documentation Files

- **QUICK_FIX.md** - Fast solutions for common problems
- **TROUBLESHOOTING.md** - Detailed troubleshooting guide
- **README.md** - Complete documentation
- **SETUP_INSTRUCTIONS.md** - Detailed setup guide

---

## Get Help

1. Run `./diagnose.sh` and check the output
2. Check `docker-compose logs`
3. See TROUBLESHOOTING.md for detailed solutions

**73 de K4HEF!** 📻

---

## What This Application Does

**Net Control by K4HEF** helps Ham Radio Net Control Operators:
- ✅ Manage net operations in real-time
- ✅ Track check-ins (callsign, name, notes)
- ✅ Automatically lookup callsigns via QRZ.com
- ✅ View history in a calendar
- ✅ Export net reports to PDF
- ✅ Customize with your club logo
- ✅ Dark/Light theme

Built for the York County Amateur Radio Society.

