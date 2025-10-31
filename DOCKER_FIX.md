# Docker Rebuild Fix for v2.2.4

## Issue
After rebuilding Docker containers with v2.2.4, login and registration may fail due to:
1. reCAPTCHA verification failing when keys are not configured
2. Existing users may not have `isEnabled` field (backward compatibility issue)

## Quick Fix

### Option 1: Rebuild Without reCAPTCHA (Recommended for Quick Fix)

If you don't have reCAPTCHA keys configured yet, the app will now work without them:

1. **Rebuild Docker containers:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **Verify the containers are running:**
   ```bash
   docker-compose ps
   ```

3. **Check backend logs:**
   ```bash
   docker-compose logs backend
   ```

   You should see a warning: "RECAPTCHA_SECRET_KEY not set - skipping verification"

4. **Test login and registration** - both should work now

### Option 2: Run Migration Script (For Existing Users)

If you have existing users in the database:

1. **Run the migration script:**
   ```bash
   docker-compose exec backend node src/scripts/migrateUsers.js
   ```

   This will set `isEnabled: true` for all existing users.

### Option 3: Configure reCAPTCHA (For Production)

If you want to use reCAPTCHA protection:

1. **Get reCAPTCHA keys** from https://www.google.com/recaptcha/admin/create
2. **Add to your `.env` file:**
   ```env
   RECAPTCHA_SECRET_KEY=your_secret_key_here
   VITE_RECAPTCHA_SITE_KEY=your_site_key_here
   ```

3. **Rebuild frontend** (to inject the site key):
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

4. **Restart backend** (to load the secret key):
   ```bash
   docker-compose restart backend
   ```

## Changes in v2.2.4 Fix

### Backward Compatibility
- ✅ Existing users without `isEnabled` field are treated as enabled
- ✅ Login checks handle missing `isEnabled` field gracefully
- ✅ Migration script available to update existing users

### reCAPTCHA Optional
- ✅ App works without reCAPTCHA keys configured
- ✅ Only requires verification when keys are set
- ✅ Development/production mode handled correctly

### Docker Configuration
- ✅ `RECAPTCHA_SECRET_KEY` added to docker-compose.yml (optional)
- ✅ `VITE_RECAPTCHA_SITE_KEY` added as build arg for frontend (optional)
- ✅ Frontend Dockerfile updated to accept build args

## Troubleshooting

### Still Can't Login?

1. **Check if your account is enabled:**
   ```bash
   docker-compose exec backend node -e "
   require('dotenv').config();
   const mongoose = require('mongoose');
   const User = require('./src/models/User');
   
   mongoose.connect(process.env.MONGODB_URI).then(async () => {
     const users = await User.find();
     users.forEach(u => console.log(u.username, 'isEnabled:', u.isEnabled));
     process.exit(0);
   });
   "
   ```

2. **Enable your account manually:**
   ```bash
   docker-compose exec backend node -e "
   require('dotenv').config();
   const mongoose = require('mongoose');
   const User = require('./src/models/User');
   
   mongoose.connect(process.env.MONGODB_URI).then(async () => {
     const user = await User.findOne({ username: 'your_username' });
     if (user) {
       user.isEnabled = true;
       await user.save();
       console.log('User enabled');
     }
     process.exit(0);
   });
   "
   ```

### Registration Still Failing?

1. **Check backend logs for reCAPTCHA errors:**
   ```bash
   docker-compose logs backend | grep -i recaptcha
   ```

2. **If you see "reCAPTCHA verification failed":**
   - Check if `RECAPTCHA_SECRET_KEY` is set but invalid
   - Or check if `VITE_RECAPTCHA_SITE_KEY` is set but invalid
   - Remove them from `.env` to bypass reCAPTCHA

3. **Check for other errors:**
   ```bash
   docker-compose logs backend --tail 50
   ```

## Verification

After applying the fix:

1. ✅ **Login works** - Existing users can login
2. ✅ **Registration works** - New users can register
3. ✅ **Admin panel shows users** - Users list displays correctly
4. ✅ **Account status visible** - Status column shows Enabled/Pending

## Next Steps

Once everything is working:

1. **Optional: Set up reCAPTCHA** (see RECAPTCHA_SETUP.md)
2. **Optional: Run migration** to set isEnabled on existing users
3. **Review pending users** in admin panel
4. **Enable approved users** as needed

## Notes

- reCAPTCHA is **optional** - app works without it
- Existing users are **automatically enabled** for backward compatibility
- New registrations are **pending approval** by default
- First user is **always enabled** and made admin

