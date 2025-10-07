# Net Control by K4HEF - Project Summary

## Overview
A complete, production-ready web application for Ham Radio Net Control Operators built for the York County Amateur Radio Society.

## What's Included

### Complete Full-Stack Application
- ✅ Modern React frontend with responsive design
- ✅ RESTful Node.js/Express backend API
- ✅ MongoDB database for data persistence
- ✅ JWT-based authentication system
- ✅ Docker containerization for easy deployment

### Core Features Implemented

#### 1. Net Control Operation Page
- Start/stop net operations
- Real-time check-in tracking
- Automatic callsign lookup via QRZ.com API
- Add/remove check-ins with callsign, name, and notes
- Support for multiple operators

#### 2. Schedule Page
- Interactive calendar view
- Visual indicators for days with operations
- View all operations for any selected date
- Support for multiple nets per day
- One-click PDF export for any operation

#### 3. Settings Page
- Dark/Light theme toggle with persistence
- Custom logo upload for branding
- QRZ.com API key configuration
- User preferences management

#### 4. Authentication System
- Secure user registration
- Login/logout functionality
- JWT token-based authentication
- Protected routes
- Password hashing with bcrypt

### Technical Implementation

#### Backend (`/backend`)
```
✅ Express.js server
✅ MongoDB with Mongoose ODM
✅ JWT authentication middleware
✅ QRZ.com API integration
✅ PDF generation with PDFKit
✅ File upload handling (logos)
✅ RESTful API design
✅ Error handling
```

#### Frontend (`/frontend`)
```
✅ React 18 with Vite
✅ React Router for navigation
✅ Context API for state management
✅ Axios for HTTP requests
✅ React Calendar component
✅ Toast notifications
✅ Responsive CSS design
✅ Dark/Light theme support
```

#### Infrastructure
```
✅ Docker Compose orchestration
✅ Separate containers for frontend, backend, and database
✅ Nginx web server for frontend
✅ Volume persistence for database
✅ Network isolation
✅ Environment variable configuration
```

## File Structure

```
NetControlApp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── netOperationController.js
│   │   │   └── settingsController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── NetOperation.js
│   │   │   └── Settings.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── netOperationRoutes.js
│   │   │   └── settingsRoutes.js
│   │   ├── services/
│   │   │   ├── qrzService.js
│   │   │   └── pdfService.js
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CheckInForm.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── NetControl.jsx
│   │   │   ├── Schedule.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── README.md
├── SETUP_INSTRUCTIONS.md
├── CONTRIBUTING.md
├── LICENSE
├── start.sh (Linux/Mac)
└── start.bat (Windows)
```

## Quick Start

### Option 1: Use Startup Scripts (Easiest)

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```
start.bat
```

### Option 2: Manual Docker Compose
```bash
docker-compose up -d
```

Then visit: http://localhost

## Data Models

### User Schema
- username (unique)
- callsign (unique, uppercase)
- email (unique)
- password (hashed)
- role (operator/admin)

### Net Operation Schema
- operatorId (reference to User)
- operatorCallsign
- startTime / endTime
- checkIns (array)
  - callsign
  - name
  - notes
  - timestamp
- netName
- frequency
- notes
- status (active/completed)

### Settings Schema
- userId (reference to User)
- theme (light/dark)
- qrzApiKey
- logo (file path)

## API Endpoints Summary

**Authentication:**
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

**Net Operations:**
- POST `/api/net-operations`
- GET `/api/net-operations`
- GET `/api/net-operations/:id`
- PUT `/api/net-operations/:id`
- PUT `/api/net-operations/:id/complete`
- POST `/api/net-operations/:id/checkins`
- DELETE `/api/net-operations/:id/checkins/:checkinId`
- GET `/api/net-operations/lookup/:callsign`
- GET `/api/net-operations/:id/pdf`

**Settings:**
- GET `/api/settings`
- PUT `/api/settings`
- POST `/api/settings/logo`
- DELETE `/api/settings/logo`

## Dependencies

### Backend
- express: Web framework
- mongoose: MongoDB ODM
- bcryptjs: Password hashing
- jsonwebtoken: JWT authentication
- cors: CORS middleware
- dotenv: Environment variables
- multer: File upload handling
- axios: HTTP client for QRZ API
- pdfkit: PDF generation
- xml2js: XML parsing for QRZ responses

### Frontend
- react: UI framework
- react-router-dom: Routing
- axios: HTTP client
- react-calendar: Calendar component
- react-toastify: Notifications
- date-fns: Date utilities

## Security Features

✅ Password hashing with bcrypt
✅ JWT token authentication
✅ Protected API routes
✅ CORS configuration
✅ Input validation
✅ File type validation for uploads
✅ File size limits
✅ Secure headers

## Deployment Ready

✅ Production-optimized builds
✅ Environment variable configuration
✅ Docker containerization
✅ Nginx reverse proxy
✅ Volume persistence
✅ Automated startup scripts
✅ Comprehensive documentation

## Future Enhancement Ideas

- Email notifications
- Advanced reporting and analytics
- Multi-club support
- Mobile app version
- Real-time collaboration features
- Integration with logging software
- Automated net scheduling
- SMS notifications
- Weather alerts integration
- Repeater information database

## Support & Documentation

- `README.md` - Complete documentation
- `SETUP_INSTRUCTIONS.md` - Quick setup guide
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE` - MIT License

## Testing Recommendations

Before deploying to production:
1. Test user registration and login
2. Test net operation creation
3. Test check-in functionality
4. Test QRZ lookup with valid API key
5. Test PDF export
6. Test theme switching
7. Test logo upload
8. Test calendar navigation
9. Test on mobile devices
10. Verify data persistence after restart

## Production Deployment Checklist

- [ ] Change JWT_SECRET to a strong, unique value
- [ ] Set up SSL/TLS certificates (HTTPS)
- [ ] Configure firewall rules
- [ ] Set up automated backups for MongoDB
- [ ] Configure monitoring and logging
- [ ] Update QRZ API key in settings
- [ ] Test all features in production environment
- [ ] Create admin user account
- [ ] Document operator procedures
- [ ] Set up regular database backups

## Acknowledgments

Built with ❤️ for the York County Amateur Radio Society by K4HEF.

**73!** 📻

