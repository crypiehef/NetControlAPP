# Quick Login Fix for K4HEF Account

## Issue
Account "K4HEF" cannot login after Docker rebuild.

## Quick Fix Commands

### Option 1: Check and Enable Account (Recommended)

Run these commands to check and enable your account:

```bash
# Navigate to project directory
cd /Volumes/1\ TB\ SSD/Net/NetControlApp

# Check account status
docker-compose exec backend node src/scripts/checkUser.js K4HEF

# Enable account if needed
docker-compose exec backend node src/scripts/enableUser.js K4HEF
```

### Option 2: Direct MongoDB Update

If the scripts don't work, update directly via MongoDB:

```bash
# Connect to MongoDB and update user
docker-compose exec mongodb mongosh netcontrolapp --eval "
db.users.updateOne(
  { username: 'K4HEF' },
  { \$set: { isEnabled: true } }
);
print('User K4HEF enabled');
"
```

### Option 3: Check Account Status First

Before enabling, check what's wrong:

```bash
# Check user details
docker-compose exec backend node src/scripts/checkUser.js K4HEF Shampoo14281
```

This will show:
- If user exists
- Current `isEnabled` status
- If password is correct
- Account creation date

## Common Issues

### 1. Account Disabled (isEnabled: false)
**Solution:** Run `enableUser.js` script above

### 2. Missing isEnabled Field
**Solution:** The script will automatically set it to `true`

### 3. Password Incorrect
**Solution:** Reset password via admin panel or:
```bash
docker-compose exec backend node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const user = await User.findOne({ username: 'K4HEF' });
  if (user) {
    user.password = 'Shampoo14281';
    await user.save();
    console.log('Password reset');
  }
  process.exit(0);
});
"
```

## Verify Fix

After running the enable script:

1. **Try logging in again** with:
   - Username: `K4HEF`
   - Password: `Shampoo14281`

2. **Check backend logs** if still failing:
   ```bash
   docker-compose logs backend --tail 20
   ```

3. **Verify account status**:
   ```bash
   docker-compose exec backend node src/scripts/checkUser.js K4HEF
   ```

## Expected Output

After enabling, you should see:
```
✅ User "K4HEF" found
   Callsign: K4HEF
   Email: [your email]
   Role: admin
   isEnabled: true
   Created: [date]

✅ User "K4HEF" is now enabled
   They should be able to login now
```

## Still Having Issues?

1. **Check if account exists:**
   ```bash
   docker-compose exec backend node -e "
   require('dotenv').config();
   const mongoose = require('mongoose');
   const User = require('./src/models/User');
   mongoose.connect(process.env.MONGODB_URI).then(async () => {
     const user = await User.findOne({ username: 'K4HEF' });
     console.log('User found:', !!user);
     if (user) console.log('Details:', { username: user.username, isEnabled: user.isEnabled, role: user.role });
     process.exit(0);
   });
   "
   ```

2. **Check backend logs for specific error:**
   ```bash
   docker-compose logs backend | grep -i "k4hef\|login\|error" | tail -20
   ```

3. **Verify MongoDB connection:**
   ```bash
   docker-compose exec backend node -e "
   require('dotenv').config();
   const mongoose = require('mongoose');
   mongoose.connect(process.env.MONGODB_URI).then(() => {
     console.log('✅ MongoDB connected');
     process.exit(0);
   }).catch(err => {
     console.error('❌ MongoDB error:', err.message);
     process.exit(1);
   });
   "
   ```

