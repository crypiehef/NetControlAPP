# Quick Setup Instructions for Net Control by K4HEF

## Fast Setup (5 minutes)

### Step 1: Install Docker
If you don't have Docker installed:
- **macOS**: Download Docker Desktop from https://www.docker.com/products/docker-desktop/
- **Windows**: Download Docker Desktop from https://www.docker.com/products/docker-desktop/
- **Linux**: Follow instructions at https://docs.docker.com/engine/install/

### Step 2: Clone or Download the Application
```bash
cd "NetControlApp"
```

### Step 3: Configure Environment
Create a `.env` file in the root directory:
```bash
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
```
(`./start.sh` does this for you if `.env` doesn't exist yet.)

### Step 4: Start the Application
```bash
docker-compose up -d
```

This will:
- ✅ Start MongoDB database
- ✅ Build and start the backend API
- ✅ Build and start the frontend

### Step 5: Access the Application
Open your web browser and go to:
```
http://localhost
```

### Step 6: Create Your Account
1. Click "Register here"
2. Fill in your information:
   - Username: Your preferred username
   - Callsign: Your ham radio callsign (e.g., K4HEF)
   - Email: Your email address
   - Password: Create a secure password
3. Click "Register"

### Step 7: Configure QRZ.com (Optional but Recommended)
1. Log in to the application
2. Go to Settings
3. Enter your QRZ.com API key
4. Click "Save API Key"

Now when you enter callsigns during net operations, names will be automatically looked up!

## Verification

Check that all services are running:
```bash
docker-compose ps
```

You should see three services running:
- netcontrol-mongodb
- netcontrol-backend
- netcontrol-frontend

## Stopping the Application

To stop all services:
```bash
docker-compose down
```

To start again:
```bash
docker-compose up -d
```

## Getting Your QRZ.com API Key

1. Go to https://www.qrz.com/
2. Log in to your account
3. Go to "XML Logbook Data" section
4. Subscribe if you haven't already (may require subscription)
5. Your API key will be your QRZ username and password combination
6. Enter this in the Settings page of the application

## Troubleshooting

### Port 80 Already in Use
If you get an error that port 80 is already in use, you can change the frontend port:

Edit `docker-compose.yml` and change:
```yaml
frontend:
  ports:
    - "8080:80"  # Changed from "80:80"
```

Then access the app at http://localhost:8080

### Application Won't Start
```bash
# Check logs
docker-compose logs

# Rebuild everything
docker-compose down
docker-compose up -d --build
```

### Need to Reset Everything
```bash
# This will remove all data including the database
docker-compose down -v
docker-compose up -d
```

### Reset a Password

Use this when you are locked out of an account (for example the only admin
account) or need to rotate a password without the web UI. Run it inside the
backend container:

```bash
docker exec -it netcontrol-backend node src/scripts/resetPassword.js <username>
```

The script asks for the new password twice with hidden input. The password
must be at least 12 characters and is never printed or logged. Optional flags:

- `--enable` also enables the account (useful after registering the first user)
- `--admin` also gives the account the admin role

```bash
# Example: reset, enable and promote a freshly registered account
docker exec -it netcontrol-backend node src/scripts/resetPassword.js <username> --enable --admin
```

For non-interactive use (no terminal attached), pass the password in the
`NEW_PASSWORD` environment variable instead. Don't put the password on the
command line itself: it ends up in your shell history.

## Support

For questions or issues:
- Check the main README.md
- Review the troubleshooting section
- Contact K4HEF

**73!** 📻

