# Net Control by K4HEF

A modern web application for Ham Radio Net Control Operators to manage net operations, track check-ins, and export reports.

## Features

### 🎙️ Net Control Operation
- Start and manage net operations in real-time
- Record check-ins with callsign, name, and notes
- Automatic callsign lookup via QRZ.com API integration
- Real-time check-in tracking and management

### 📅 Schedule
- Calendar view of all past net operations
- View detailed information for each operation
- Export individual net operations to PDF
- Support for multiple nets per day with timestamps

### ⚙️ Settings
- Dark/Light theme toggle
- Custom logo upload for branding
- QRZ.com API key configuration
- Personal preferences management

### 🔐 User Management
- Secure authentication with JWT
- User registration and login
- Role-based access control

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **PDFKit** - PDF generation
- **QRZ.com API** - Callsign lookup

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Calendar** - Calendar component
- **React Toastify** - Notifications

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server (frontend)

## Installation

### Prerequisites
- Docker and Docker Compose installed
- QRZ.com account with XML API access (optional, for callsign lookup)

### Quick Start with Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd NetControlApp
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Edit `.env` and set your JWT secret:
```
JWT_SECRET=your_very_secure_jwt_secret_key_here
```
Get a secret JWT Token here: https://jwtsecrets.com/#generator

4. Start the application:
```bash
docker-compose up -d
```

5. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:5000

6. Create your first account by visiting http://localhost and clicking "Register"

### Development Setup

#### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/netcontrol
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
EOF

# Start MongoDB (if not using Docker)
# Option 1: Using local MongoDB
mongod

# Option 2: Using Docker for MongoDB only
docker run -d -p 27017:27017 --name netcontrol-mongodb mongo:7

# Start the backend
npm run dev
```

#### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:3000

## Configuration

### QRZ.com API Setup

1. Log in to your QRZ.com account
2. Subscribe to the XML Data service (if not already subscribed)
3. Get your XML API key from https://www.qrz.com/XML/current_spec.html
4. In the application, go to Settings and enter your QRZ API key
5. The app will now automatically lookup callsign information when you enter a callsign

### Logo Upload

1. Go to Settings page
2. Click "Choose File" under Logo section
3. Select your logo image (JPG, PNG, GIF, or SVG)
4. Click "Upload Logo"
5. Your logo will appear in the navbar and on PDF exports

### Theme Configuration

Toggle between light and dark mode using the theme button in the navbar or in the Settings page.

## Usage Guide

### Starting a Net Operation

1. Navigate to "Net Control" page
2. Fill in the net information:
   - Net Name (default: York County Amateur Radio Society Net)
   - Frequency (optional)
   - Notes (optional)
3. Click "Start Net Operation"

### Adding Check-ins

1. With an active net operation, use the check-in form
2. Enter the callsign - the name will auto-populate if QRZ API is configured
3. Add any notes if needed
4. Click "Add Check-in"

### Completing a Net Operation

1. When the net is finished, click "Complete Net Operation"
2. Confirm the completion
3. The net will be saved to your schedule

### Viewing Past Operations

1. Navigate to "Schedule" page
2. Click on any date in the calendar
3. View all operations for that date
4. Export any operation to PDF

### Exporting to PDF

1. From the Schedule page, select a date with operations
2. Click "Export to PDF" on the desired operation
3. The PDF will download automatically

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Net Operations Endpoints

- `POST /api/net-operations` - Create new operation
- `GET /api/net-operations` - Get all operations
- `GET /api/net-operations/:id` - Get single operation
- `PUT /api/net-operations/:id` - Update operation
- `PUT /api/net-operations/:id/complete` - Complete operation
- `POST /api/net-operations/:id/checkins` - Add check-in
- `DELETE /api/net-operations/:id/checkins/:checkinId` - Delete check-in
- `GET /api/net-operations/lookup/:callsign` - Lookup callsign via QRZ
- `GET /api/net-operations/:id/pdf` - Export to PDF

### Settings Endpoints

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/logo` - Upload logo
- `DELETE /api/settings/logo` - Delete logo

## Docker Commands

### Start all services
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild containers
```bash
docker-compose up -d --build
```

### Remove all data (including database)
```bash
docker-compose down -v
```

## Project Structure

```
NetControlApp/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── server.js        # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── styles/          # CSS files
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

### Backend Not Starting
```bash
# Check backend logs
docker-compose logs backend

# Ensure .env file exists with correct values
# Restart backend
docker-compose restart backend
```

### Frontend Build Issues
```bash
# Rebuild frontend
docker-compose up -d --build frontend
```

### QRZ Lookup Not Working
1. Verify your QRZ API key is correct
2. Ensure you have an active QRZ XML subscription
3. Check backend logs for API errors
4. Test the API key directly on QRZ.com

## Security Notes

⚠️ **IMPORTANT**: Before deploying to production:

1. Change the default JWT_SECRET in `.env`
2. Use strong, unique passwords for user accounts
3. Consider using HTTPS with SSL/TLS certificates
4. Set up proper firewall rules
5. Regularly backup your MongoDB database
6. Keep all dependencies updated

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please contact K4HEF or open an issue in the repository.

## Acknowledgments

- York County Amateur Radio Society
- QRZ.com for callsign lookup API
- The Ham Radio community

---

**73 de K4HEF** 📻

