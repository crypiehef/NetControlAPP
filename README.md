‼️ **Before you put this WebApp on the Internet please review the Production Considers near the buttom!**
<img width="545" height="153" alt="bmc-button" src="https://github.com/user-attachments/assets/ca0f20cd-7b6b-46bd-958e-86ed9ed95535" /> https://buymeacoffee.com/hamradiohef
<img width="1403" height="819" alt="Screenshot 2025-10-07 at 12 52 05 PM" src="https://github.com/user-attachments/assets/7183b52c-b24f-4813-99b1-13e4a3ac3aa2" />
<img width="1213" height="874" alt="Screenshot 2025-10-08 at 9 02 51 PM" src="https://github.com/user-attachments/assets/dc598bf3-7da1-4c3e-beed-bbd9abd89e7d" />
<img width="1272" height="842" alt="Screenshot 2025-10-08 at 9 03 16 PM" src="https://github.com/user-attachments/assets/df75d9a4-c958-4339-9c89-8f55e2742cc9" />
<img width="1245" height="1027" alt="Screenshot 2025-10-08 at 9 03 40 PM" src="https://github.com/user-attachments/assets/ef239b82-fc90-4c21-b818-20b474d8e251" />
<img width="1213" height="942" alt="Screenshot 2025-10-08 at 9 03 59 PM" src="https://github.com/user-attachments/assets/4e2dde6b-ceb1-42eb-a157-d51fce512ae1" />




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
  - **Staying for Comments** (checkbox to track who stays for post-net discussion)
  - **Notes** (optional, editable during or after net)
- Automatic callsign lookup via QRZ.com API integration
- Real-time check-in tracking and management
- **Edit check-in notes** during active net operations
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
- **Edit operation notes** for completed nets
- **Edit individual check-in notes** for any saved check-in
- View detailed information for each operation including:
  - Complete check-in lists with license class, location, and comment status
  - Staying for Comments indicators
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

**Advanced Reporting:**
- **Generate comprehensive PDF reports** with custom filters
- **Filter by Operator**: All Operators or specific operator
- **Filter by Date Range**: Start date, end date, or both (optional)
- **Clear Filters button** for easy reset
- **Professional PDF reports** include:
  - Custom logo (PNG/JPEG)
  - Summary statistics (total ops, status breakdown, check-ins, averages)
  - Detailed operations list with all data
  - Complete check-in information with license class, location, and comment status
  - Operation notes and check-in notes
  - Page numbers and generation timestamp

**User Management:**
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
5. **Check "Staying for comments"** if operator is staying for post-net discussion
6. Add optional notes
7. Click "Add Check-in"

### Managing Check-ins (During Active Net)

- **View all check-ins** in the table with:
  - Callsign, Name, License Class, Location, Time
  - **Comments status**: "✓ Yes" or "Not staying"
  - Notes (editable)
- **Edit notes**: Click ✏️ button to add/modify notes for any check-in
- **Remove check-ins**: Click "Remove" button to delete a check-in

### Editing Completed Net Information (Schedule Page)

**Edit Operation Notes:**
1. Navigate to Schedule page
2. Select a date with completed operations
3. Click "✏️ Edit Notes" below the operation info
4. Modify notes in the textarea
5. Click "💾 Save Notes"

**Edit Check-in Notes:**
1. On the same operation card, scroll to check-ins table
2. Click ✏️ in the Actions column for any check-in
3. Edit notes in the inline textarea
4. Click "💾 Save" or "Cancel"

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

**Advanced Reporting:**
1. Navigate to "Admin" page (only visible to admins)
2. **Advanced Reporting** section at top of page
3. **Select Filters:**
   - **Operator**: Choose "All Operators" or specific operator from dropdown
   - **Start Date**: Optional - leave blank for all-time
   - **End Date**: Optional - leave blank for all-time
4. **Click "📄 Generate PDF Report"**
5. PDF downloads automatically with:
   - Summary statistics
   - Filtered operations list
   - Complete check-in data
   - All notes and comment status
6. **Use "🔄 Clear Filters"** to reset all fields

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
- `PUT /api/net-operations/:id/notes` - Update operation notes
- `POST /api/net-operations/:id/checkins` - Add check-in (with location, license class, stayingForComments)
- `PUT /api/net-operations/:id/checkins/:checkinId/notes` - Update check-in notes
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
- `POST /api/users/reports/generate` - Generate PDF report with filters (operator, date range)

## Updating the Application

### Updating to Latest Version

If you already have the app installed and want to update to the latest version:

1. **Navigate to your app directory:**
```bash
cd NetControlAPP
```

2. **Stop the running containers:**
```bash
docker-compose down
```

3. **Fetch all updates from GitHub:**
```bash
git fetch --all --tags --prune
```

4. **Pull the latest changes:**
```bash
git pull origin main
```

5. **Rebuild and restart containers:**
```bash
docker-compose up -d --build
```

6. **Verify the update:**
```bash
# Check current version
git describe --tags

# View recent commits
git log --oneline -5
```

### Updating to a Specific Version

To update to a specific version (e.g., v1.2):

```bash
# Stop containers
docker-compose down

# Fetch all tags
git fetch --all --tags

# Checkout specific version
git checkout v1.2

# Rebuild containers
docker-compose up -d --build
```

### Common Update Issues

**Issue: "Already up to date" but features are missing**
- Solution: Run `docker-compose up -d --build` to rebuild containers

**Issue: Database errors after update**
- Your data is preserved in Docker volumes
- Check logs: `docker-compose logs backend`
- If needed, restart: `docker-compose restart`

**Issue: Port conflicts after update**
- The app uses port 5001 (not 5000) for backend
- Frontend uses port 80
- Run `lsof -i :80` and `lsof -i :5001` to check for conflicts

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

### Rebuild containers (after code changes)
```bash
docker-compose up -d --build
```

### Restart specific service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Remove all data (including database)
```bash
# ⚠️ WARNING: This will delete all your data!
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

### v2.1 - Advanced Reporting & Enhanced Operations Management (Current)
**Major Release - Enterprise Features**

**Advanced Reporting System:**
- ✅ Generate comprehensive PDF reports from Admin panel
- ✅ Multi-filter system (Operator, Date Range)
- ✅ All Operators option for organization-wide reports
- ✅ Professional PDF with summary statistics
- ✅ Complete check-in data in reports
- ✅ Custom logo support (PNG/JPEG)
- ✅ Clear Filters button

**Enhanced Note-Taking:**
- ✅ Edit operation notes for completed nets
- ✅ Edit individual check-in notes (during or after net)
- ✅ Inline editing in Net Control and Schedule pages
- ✅ All notes included in PDF reports

**Staying for Comments Tracking:**
- ✅ Checkbox in check-in form
- ✅ Tracks who stays for post-net discussion
- ✅ Visual indicators (✓ Yes / Not staying)
- ✅ Appears in tables and PDF reports
- ✅ Color-coded for easy scanning

**Bug Fixes:**
- ✅ WebP logo compatibility in PDFs
- ✅ UTC date handling for accurate filtering
- ✅ Operation notes now included in PDF reports

### v1.2 - Enhanced Scheduling & User Management
- ✅ Schedule future nets without starting (Thanks Dom The Dorito!)
- ✅ Recurring net scheduling (Daily, Weekly, Bi-Weekly, Monthly)
- ✅ Full year-ahead recurring schedules (365 daily, 52 weekly, etc.)
- ✅ Start scheduled nets from Dashboard and Schedule page
- ✅ Auto-navigation to Net Control after starting
- ✅ Edit user information in Admin panel
- ✅ Delete operations from Schedule
- ✅ Location and license class fields in check-ins

### v1.0.1 - Security & UX Updates
- ✅ Fixed all multer vulnerabilities (upgraded to 2.0.0)
- ✅ Username login instead of email (Thanks Dom The Dorito!)
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
- Custom logo upload (WebP, PNG, JPEG, GIF, SVG)
- User authentication with JWT

## Acknowledgments

- **York County Amateur Radio Society** - Sponsoring organization
- **QRZ.com** - Callsign lookup API
- **Dom The Dorito** (Discord) - Feature suggestions
- **The Ham Radio Community** - Continued support

---

**73 de K4HEF** 📻

*Net Control by K4HEF - Making net operations simple and efficient for amateur radio operators worldwide.*

