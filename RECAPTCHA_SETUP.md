# reCAPTCHA Setup Guide

This guide explains how to set up Google reCAPTCHA v3 for the NetControlApp to minimize bot registrations.

## Overview

The NetControlApp now includes:
- **Admin Authorization**: New user accounts require admin approval before they can login
- **reCAPTCHA Protection**: Registration form includes reCAPTCHA verification to minimize bots

## Setup Instructions

### 1. Get reCAPTCHA Keys from Google

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Click "Create" to create a new site
3. Fill in the form:
   - **Label**: NetControlApp (or your preferred name)
   - **reCAPTCHA type**: Select "reCAPTCHA v3"
   - **Domains**: Add your domain(s)
     - For development: `localhost`, `127.0.0.1`
     - For production: Your actual domain (e.g., `netcontrol.example.com`)
4. Accept the reCAPTCHA Terms of Service
5. Click "Submit"

### 2. Configure Backend

Add the reCAPTCHA secret key to your `.env` file:

```env
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

**Note**: The secret key is shown only once when you create the site. Copy it immediately.

### 3. Configure Frontend

Add the reCAPTCHA site key to your frontend `.env` file:

```env
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

**Note**: The site key is public and can be exposed in client-side code.

### 4. Environment Variables

Update your `.env` files:

**Backend `.env`:**
```env
RECAPTCHA_SECRET_KEY=6Lc...your_secret_key_here
```

**Frontend `.env`:**
```env
VITE_RECAPTCHA_SITE_KEY=6Lc...your_site_key_here
```

### 5. Development Mode

In development mode, if reCAPTCHA keys are not set:
- Registration will still work (reCAPTCHA is bypassed)
- A warning will be logged to the console
- This allows testing without reCAPTCHA setup

**Important**: In production, always set both keys for security.

## How It Works

### Registration Flow

1. User fills out registration form
2. reCAPTCHA v3 script loads automatically
3. When user submits form:
   - reCAPTCHA executes invisibly (no checkbox for v3)
   - Token is generated and sent to backend
   - Backend verifies token with Google
   - User account is created with `isEnabled: false` (pending approval)
   - First user is automatically enabled and made admin

### Admin Approval Flow

1. New user registers → Account created but disabled
2. Admin logs into admin panel
3. Admin sees pending users in user list
4. Admin clicks "✅ Enable" button
5. User account is enabled
6. User can now login

### Login Flow

1. User attempts to login
2. System checks if account is enabled
3. If disabled: Error message shown "Your account is pending admin approval"
4. If enabled: Login proceeds normally

## Admin Features

### User Management

In the Admin panel, you can now:

- **View Account Status**: See which accounts are "Enabled" or "Pending"
- **Enable Accounts**: Click "✅ Enable" to approve new user registrations
- **Disable Accounts**: Click "🔒 Disable" to temporarily disable accounts
- **Filter Users**: Status badges make it easy to see pending accounts

### Status Badges

- **✓ Enabled** (Green): User can login
- **⏳ Pending** (Yellow): User is waiting for admin approval

## Security Features

### Protection Against Bots

- reCAPTCHA v3 analyzes user behavior
- Scores users based on interaction patterns
- Blocks suspicious registrations automatically

### Admin Authorization

- All new registrations require admin approval
- Prevents unauthorized access
- Admins have full control over user access

### Additional Security

- First user is automatically enabled (setup user)
- Admins cannot disable their own account
- Password validation and hashing
- JWT token-based authentication

## Troubleshooting

### reCAPTCHA Not Working

1. **Check Environment Variables**:
   - Verify `RECAPTCHA_SECRET_KEY` is set in backend `.env`
   - Verify `VITE_RECAPTCHA_SITE_KEY` is set in frontend `.env`

2. **Check Domain Configuration**:
   - Ensure your domain is added to reCAPTCHA site configuration
   - For localhost: Use `localhost` or `127.0.0.1`

3. **Check Console Errors**:
   - Open browser developer console
   - Look for reCAPTCHA-related errors

4. **Development Mode**:
   - If keys are not set, reCAPTCHA is bypassed in development
   - Set keys for production use

### Users Cannot Login

1. **Check Account Status**:
   - Admin should verify user account is enabled
   - Check "Status" column in admin panel

2. **Error Messages**:
   - "Your account is pending admin approval" → Account needs to be enabled
   - "Invalid username or password" → Credentials are incorrect

## Testing

### Test Registration

1. Register a new account
2. Check admin panel for pending user
3. Enable the account
4. Attempt to login with new account

### Test reCAPTCHA

1. Complete registration form
2. Submit form
3. Check browser console for reCAPTCHA logs
4. Verify token is sent to backend
5. Check backend logs for verification status

## Production Checklist

- [ ] reCAPTCHA site created in Google Console
- [ ] Production domain added to reCAPTCHA configuration
- [ ] `RECAPTCHA_SECRET_KEY` set in production backend `.env`
- [ ] `VITE_RECAPTCHA_SITE_KEY` set in production frontend `.env`
- [ ] Test registration on production domain
- [ ] Verify admin can enable accounts
- [ ] Test that disabled accounts cannot login

## Support

For reCAPTCHA-specific issues:
- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)

For NetControlApp issues:
- Check backend logs for detailed error messages
- Verify environment variables are correctly set
- Ensure admin account has proper permissions

