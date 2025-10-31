# Fix for Docker Rebuild Issues

## Issue
Backend container is crashing due to MongoDB driver compatibility issue with mongoose 8.0.0.

## Fix Applied

1. ✅ **Downgraded mongoose** from `^8.0.0` to `^7.6.4` (stable version)
2. ✅ **Removed obsolete version field** from docker-compose.yml
3. ✅ **Enabled K4HEF account** directly via MongoDB

## Rebuild Steps

### 1. Stop Containers
```bash
docker-compose down
```

### 2. Rebuild Backend (with fixed mongoose version)
```bash
docker-compose build --no-cache backend
```

### 3. Start Containers
```bash
docker-compose up -d
```

### 4. Verify Backend is Running
```bash
docker-compose ps
docker-compose logs backend --tail 20
```

You should see:
```
✅ MongoDB connected
✅ Server running on port 5000
```

### 5. Test Login
- Username: `K4HEF`
- Password: `Shampoo14281`

The account should now be enabled and login should work.

## Alternative: Quick Rebuild All

If you want to rebuild everything:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Verify Account is Enabled

After containers are running, verify:

```bash
docker-compose exec backend node src/scripts/checkUser.js K4HEF
```

Should show:
```
✅ User "K4HEF" found
   isEnabled: true
```

## What Was Fixed

### MongoDB Compatibility
- **Problem**: Mongoose 8.0.0 had compatibility issues with MongoDB driver
- **Fix**: Downgraded to mongoose 7.6.4 (stable, proven version)

### Docker Compose
- **Problem**: Obsolete `version` field causing warnings
- **Fix**: Removed version field (not needed in newer docker-compose)

### Account Status
- **Problem**: K4HEF account may have been disabled
- **Fix**: Enabled directly via MongoDB command

## Expected Behavior After Fix

1. ✅ Backend container starts successfully
2. ✅ MongoDB connection works
3. ✅ Login with K4HEF account works
4. ✅ Registration works
5. ✅ Admin panel works

## If Still Having Issues

1. **Check backend logs:**
   ```bash
   docker-compose logs backend --tail 50
   ```

2. **Check if containers are running:**
   ```bash
   docker-compose ps
   ```

3. **Rebuild from scratch:**
   ```bash
   docker-compose down -v
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **Check MongoDB:**
   ```bash
   docker-compose exec mongodb mongosh netcontrolapp --eval "db.users.findOne({ username: 'K4HEF' })"
   ```

