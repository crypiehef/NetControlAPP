@echo off
REM Net Control by K4HEF - Windows Startup Script

echo ================================================
echo   Net Control by K4HEF - Setup ^& Start
echo ================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo ✅ Docker is installed
echo.

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file...
    echo JWT_SECRET=NetControl2024SecureKeyForYorkCountyAmateurRadioSociety_ChangeInProduction > .env
    echo ✅ .env file created
    echo ⚠️  Remember to change JWT_SECRET in production!
) else (
    echo ✅ .env file already exists
)

echo.
echo 🚀 Starting Net Control application...
echo.

docker-compose up -d

echo.
echo ================================================
echo   ✅ Net Control is starting up!
echo ================================================
echo.
echo The application will be available shortly at:
echo   👉 http://localhost
echo.
echo First time setup:
echo   1. Wait 30 seconds for services to fully start
echo   2. Open http://localhost in your browser
echo   3. Click 'Register' to create your account
echo   4. Go to Settings to configure your QRZ API key
echo.
echo Useful commands:
echo   Stop:    docker-compose down
echo   Logs:    docker-compose logs -f
echo   Status:  docker-compose ps
echo.
echo 📻 73 de K4HEF
echo ================================================
echo.
pause

