
<img width="1308" height="924" alt="Screenshot 2025-10-07 at 2 38 02 PM" src="https://github.com/user-attachments/assets/8bfb2bf1-8871-48b5-939e-1d81c362bead" />
<img width="1220" height="759" alt="Screenshot 2025-10-07 at 2 39 15 PM" src="https://github.com/user-attachments/assets/8344cd47-e21b-4b5d-887c-6cec707c5668" />
<img width="1293" height="848" alt="Screenshot 2025-10-07 at 2 39 41 PM" src="https://github.com/user-attachments/assets/55d7e31a-b7b1-40e5-bf22-b8c90ae67156" />
<img width="1245" height="1050" alt="Screenshot 2025-10-07 at 2 40 14 PM" src="https://github.com/user-attachments/assets/afe29d61-9600-4a64-88ec-0899c44265d8" />
<img width="1238" height="652" alt="Screenshot 2025-10-07 at 2 40 41 PM" src="https://github.com/user-attachments/assets/23c8b45c-9a20-44a6-9b6a-dcc294805bec" />



# Net Control by K4HEF

A modern web application for Ham Radio Net Control Operators to manage net operations, track check-ins, and export reports.

## Features

### 🎙️ Net Control Operation
- Start and manage net operations in real-time
- Record check-ins with:
  - **Callsign** (auto-uppercased)
  - **Name** (auto-filled from QRZ)
  - **License Class** (auto-filled from QRZ, displayed next to name)
  - **Location** (City, State - auto-filled from QRZ)
  - **Notes** (optional)
- Automatic callsign lookup via QRZ.com API integration
- Real-time check-in tracking and management
- Delete individual check-ins as needed
- Complete net operations when finished

### 📅 Schedule & Planning
- **Calendar view** of all past and future net operations
- **Schedule future nets** without starting them immediately
- **Recurring net operations** with flexible repeat options:
  - **Daily** (365 days ahead)
  - **Weekly** (52 weeks ahead)
  - **Bi-Weekly** (26 occurrences ahead)
  - **Monthly** (12 months ahead)
- **Start scheduled nets** from Dashboard or Schedule page with one click
- View detailed information for each operation
- Export individual net operations to PDF with custom logo
- Support for multiple nets per day with timestamps
- Delete past net operations as needed
- Color-coded status badges (Active, Scheduled, Completed)

### ⚙️ Settings
- **Dark/Light theme toggle** with localStorage persistence
- **Custom logo upload** for branding (JPEG, PNG, GIF, SVG, WebP)
- Logo appears in navbar and on PDF exports
- **QRZ.com API credentials** configuration (username:password format)
- Personal preferences management

### 👨‍💼 Admin Panel (Admin Users Only)
- **User management dashboard** with full CRUD operations
- **Add new net operators** with custom roles
- **Edit user information**:
  - Username
  - Callsign
  - Email address
- **Reset user passwords** for any operator
- **Role management**: Toggle between Operator and Admin roles
- **Delete users** (with safety checks to prevent self-deletion)
- **First registered user** automatically becomes admin
- View user creation dates and statistics

### 🔐 User Authentication
- Secure authentication with JWT (30-day expiration)
- **Username-based login** (not email)
- User registration with validation
- Role-based access control (Operator/Admin)
- Protected routes and API endpoints

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
git clone https://github.com/crypiehef/NetControlAPP.git
cd NetControlAPP
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
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:5001 (port 5001 to avoid macOS AirPlay conflict)

6. **Create your first account** by visiting http://localhost and clicking "Register"
   - **First user automatically becomes admin!** ⭐
   - Subsequent users will be operators by default

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
2. Subscribe to the XML Data service (if not already subscribed) - https://www.qrz.com/XML/current_spec.html
3. In the application, go to Settings
4. Enter your QRZ credentials in one of these formats:
   - **Full format**: `username:password` (e.g., K4HEF:mypassword)
   - **Simple format**: `username` (if you're an XML subscriber)
5. Click "Save Credentials"
6. The app will now automatically lookup callsign information when you enter a callsign:
   - **Name** (First + Last)
   - **License Class** (Technician, General, Extra, etc.)
   - **Location** (City, State)
   - And more...

### Logo Upload

1. Go to Settings page
2. Click "Choose File" under Logo section
3. Select your logo image (JPG, PNG, GIF, SVG, or **WebP**)
4. Click "Upload Logo"
5. Your logo will appear in the navbar and on PDF exports

### Theme Configuration

Toggle between light and dark mode using the theme button in the navbar or in the Settings page. Theme preference is saved automatically and persists across sessions.

## Usage Guide

### Starting a Net Operation (Method 1: Immediate)

1. Navigate to "Net Control" page
2. Fill in the net information:
   - Net Name (default: York County Amateur Radio Society Net)
   - Frequency (optional)
   - Notes (optional)
3. Click "Start Net Operation"

### Scheduling a Future Net Operation (Method 2: Scheduled)

1. Navigate to "Schedule" page
2. Click "+ Schedule Future Net"
3. Fill in the form:
   - Net Name
   - Date & Time (datetime picker)
   - Frequency (optional)
   - **Repeat For**: Choose recurrence pattern
     - No Repeat (one-time)
     - Daily (next 365 days)
     - Weekly (next 52 weeks)
     - Bi-Weekly (next 26 occurrences)
     - Monthly (next 12 months)
   - Notes (optional)
4. Click "Schedule Net Operation"
5. Scheduled nets appear on calendar with orange "SCHEDULED" badge

### Starting a Scheduled Net

**From Dashboard:**
1. View scheduled nets in "Recent Operations"
2. Click "▶️ Start Net" button
3. Automatically redirected to Net Control page

**From Schedule:**
1. Select a date with scheduled operations
2. Click "▶️ Start Net" button on desired operation
3. Automatically redirected to Net Control page

### Adding Check-ins

1. With an active net operation, use the check-in form
2. Enter the callsign (3+ characters triggers auto-lookup)
3. **Auto-filled from QRZ** (if configured):
   - Name
   - License Class (appears next to name)
   - Location (City, State)
4. All fields are editable - modify as needed
5. Add optional notes
6. Click "Add Check-in"

### Managing Check-ins

- **View all check-ins** in the table with:
  - Callsign, Name, License Class, Location, Time, Notes
- **Remove check-ins** by clicking the "Remove" button

### Completing a Net Operation

1. When the net is finished, click "Complete Net Operation"
2. Confirm the completion
3. The net will be saved to your schedule with "COMPLETED" status

### Viewing Past Operations

1. Navigate to "Schedule" page
2. Click on any date in the calendar
3. View all operations for that date (Active, Scheduled, or Completed)
4. Export any operation to PDF
5. Delete operations if needed (trash icon)

### Exporting to PDF

1. From the Schedule page, select a date with operations
2. Click "Export to PDF" on the desired operation
3. The PDF will download automatically with:
   - Your custom logo (if uploaded)
   - Net details
   - Complete check-in list with all information

### Admin Functions (Admin Only)

**User Management:**
1. Navigate to "Admin" page (only visible to admins)
2. **Add User**: Click "+ Add Net Operator"
   - Enter username, callsign, email, password
   - Select role (Operator or Admin)
3. **Edit User**: Click "✏️ Edit" button
   - Modify username, callsign, or email
4. **Reset Password**: Click "Reset Password"
   - Enter new password (min 6 characters)
5. **Change Role**: Click role toggle button
   - Switch between Operator and Admin
6. **Delete User**: Click "🗑️ Delete"
   - Confirm deletion (cannot delete yourself)

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user (first user becomes admin)
- `POST /api/auth/login` - Login user (username + password)
- `GET /api/auth/me` - Get current user (requires auth)

### Net Operations Endpoints

- `POST /api/net-operations` - Create new operation
- `POST /api/net-operations/schedule` - Schedule future net operation(s) with recurrence
- `GET /api/net-operations` - Get all operations (supports query filters)
- `GET /api/net-operations/:id` - Get single operation
- `PUT /api/net-operations/:id` - Update operation
- `PUT /api/net-operations/:id/start` - Start a scheduled net operation
- `PUT /api/net-operations/:id/complete` - Complete operation
- `POST /api/net-operations/:id/checkins` - Add check-in (with location & license class)
- `DELETE /api/net-operations/:id/checkins/:checkinId` - Delete check-in
- `DELETE /api/net-operations/:id` - Delete net operation
- `GET /api/net-operations/lookup/:callsign` - Lookup callsign via QRZ
- `GET /api/net-operations/:id/pdf` - Export to PDF

### Settings Endpoints

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings (theme, QRZ credentials)
- `POST /api/settings/logo` - Upload logo (JPEG, PNG, GIF, SVG, WebP)
- `DELETE /api/settings/logo` - Delete logo

### User Management Endpoints (Admin Only)

- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user information (username, callsign, email)
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/reset-password` - Reset user password
- `PUT /api/users/:id/role` - Update user role (operator/admin)

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

### Port 5000 Already in Use (macOS AirPlay)

If you see `bind: address already in use` on port 5000:

**This app uses port 5001** to avoid conflicts with macOS AirPlay Receiver. 
- Frontend: http://localhost (port 80)
- Backend API: http://localhost:5001

If you still have conflicts:
1. Check what's using the port: `lsof -i :5001`
2. Disable AirPlay Receiver: System Settings → General → AirDrop & Handoff → Turn OFF AirPlay Receiver

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
1. Verify your QRZ credentials are in correct format (username:password or username)
2. Ensure you have an active QRZ XML subscription
3. Check backend logs for API errors: `docker-compose logs backend`
4. Test the credentials directly on QRZ.com

### Logo Upload Failing
- Ensure file is an image format: JPEG, PNG, GIF, SVG, or WebP
- Maximum file size: 5MB
- Check backend logs if upload continues to fail

### Theme Not Persisting
- Clear browser cache and localStorage
- Log out and log back in
- Theme is stored in localStorage and synced with backend

## Security Notes

⚠️ **IMPORTANT**: Before deploying to production:

1. Change the default JWT_SECRET in `.env` to a strong, random value
2. Use strong, unique passwords for user accounts
3. Consider using HTTPS with SSL/TLS certificates
4. Set up proper firewall rules
5. Regularly backup your MongoDB database
6. Keep all dependencies updated

### Security Features

✅ **Multer 2.0**: Upgraded to fix all known vulnerabilities
- Protection against DoS attacks from malformed requests
- Memory leak prevention from unclosed streams
- Enhanced error handling for file uploads
- File type validation and size limits (5MB max)

✅ **Authentication Security**:
- JWT tokens with 30-day expiration
- Bcrypt password hashing
- Role-based access control (RBAC)
- Protected API endpoints

✅ **Input Validation**:
- File upload validation (type, size, name)
- Form input sanitization
- MongoDB injection prevention
- CORS configuration

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please contact K4HEF or open an issue in the repository.

## Version History

### v1.0.1 - Security & UX Updates
- ✅ Fixed all multer vulnerabilities (upgraded to 2.0.0)
- ✅ Changed login from email to username
- ✅ Fixed calendar dark mode text readability
- ✅ Fixed modal text readability in light mode
- ✅ Enhanced error handling for file uploads

### v1.0 - Initial Release
**Core Features:**
- Net Control operations management
- Real-time check-in tracking
- QRZ.com API integration
- Schedule calendar with PDF export
- Admin panel for user management
- Theme switching with persistence
- Custom logo upload
- User authentication

**Recent Additions:**
- ✅ Username login instead of email (Thanks Dom The Dorito!)
- ✅ Schedule future nets without starting (Thanks Dom The Dorito!)
- ✅ Location and license class fields in check-ins
- ✅ Recurring net scheduling (Daily, Weekly, Bi-Weekly, Monthly)
- ✅ Start scheduled nets from Dashboard and Schedule page
- ✅ Edit user information in Admin panel
- ✅ Delete operations from Schedule
- ✅ WebP image support for logos
- ✅ Full year-ahead recurring schedules

## Acknowledgments

- **York County Amateur Radio Society** - Sponsoring organization
- **QRZ.com** - Callsign lookup API
- **Dom The Dorito** (Discord) - Feature suggestions
- **The Ham Radio Community** - Continued support

---

**73 de K4HEF** 📻

*Net Control by K4HEF - Making net operations simple and efficient for amateur radio operators worldwide.*

