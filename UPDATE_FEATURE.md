# Check for Updates Feature

## Overview
The "Check for Updates" feature has been added to the Admin panel. This feature allows administrators to check for updates from the GitHub repository and install them with a single click.

## Features

### 1. **Version Information Display**
- Shows current commit SHA (short format)
- Displays current branch
- Shows last update date
- Displays the last commit message

### 2. **Check for Updates**
- Connects to GitHub API to check for new commits
- Compares local version with remote repository
- Shows notification if update is available
- Confirms if you're running the latest version

### 3. **Update Installation**
- One-click update installation
- Real-time progress indicator with percentage
- Step-by-step progress messages:
  - Fetching latest changes from GitHub
  - Saving local changes
  - Pulling latest changes
  - Checking for dependency updates
  - Installing backend dependencies (if needed)
  - Installing frontend dependencies (if needed)
  - Rebuilding Docker containers (if needed)
  - Restarting services

### 4. **Update Modal**
- Shows detailed comparison between current and new versions
- Displays commit information for both versions
- Warning about application restart
- Progress bar during update
- Clear completion message

### 5. **Post-Update Instructions**
- Notifies user when update is complete
- Instructs user to perform a hard refresh (SHIFT + Refresh)
- Ensures new frontend assets are loaded

## How to Use

### For Administrators:

1. **Access the Admin Panel**
   - Log in with an admin account
   - Navigate to the Admin page

2. **Check for Updates**
   - Click the "🔍 Check for Updates" button
   - Wait for the system to check the GitHub repository
   - If an update is available, a modal will appear
   - If no update is available, you'll see a success message

3. **Install Updates**
   - Review the update information in the modal
   - Click "✅ Install Update" to proceed
   - Watch the progress bar as the update installs
   - Wait for the "Update completed" message

4. **Load New Version**
   - Hold down the **SHIFT** key
   - Click the browser refresh button (or press CTRL+SHIFT+R / CMD+SHIFT+R)
   - This performs a hard refresh and loads the new version

## Technical Details

### Backend Endpoints

#### GET `/api/updates/check`
- **Auth Required**: Yes (Admin only)
- **Description**: Checks for updates from GitHub
- **Response**:
```json
{
  "updateAvailable": true,
  "current": {
    "sha": "abc1234",
    "message": "Previous commit message",
    "date": "2025-10-13T10:00:00Z",
    "author": "Developer"
  },
  "latest": {
    "sha": "def5678",
    "message": "New commit message",
    "date": "2025-10-13T12:00:00Z",
    "author": "Developer"
  }
}
```

#### POST `/api/updates/perform`
- **Auth Required**: Yes (Admin only)
- **Description**: Performs the update
- **Response**: Server-Sent Events (SSE) stream with progress updates

#### GET `/api/updates/version`
- **Auth Required**: Yes (Admin only)
- **Description**: Gets current version information
- **Response**:
```json
{
  "sha": "abc1234",
  "message": "Current commit message",
  "date": "2025-10-13T10:00:00Z",
  "author": "Developer",
  "branch": "main"
}
```

### Frontend Components

#### Update Checker Section
Location: Admin.jsx (Lines 284-321)
- Displays version information
- Check for updates button
- Status messages

#### Update Modal
Location: Admin.jsx (Lines 664-751)
- Version comparison display
- Progress bar
- Update controls

### Update Process

1. **Fetch Changes**
   - Connects to GitHub and fetches latest commits
   - Uses `git fetch origin main`

2. **Stash Local Changes**
   - Saves any uncommitted local changes
   - Uses `git stash`

3. **Pull Updates**
   - Pulls latest changes from GitHub
   - Uses `git pull origin main`

4. **Check for Dependency Updates**
   - Compares package.json files
   - Determines if npm install is needed

5. **Install Dependencies**
   - Runs `npm install` in backend if needed
   - Runs `npm install` in frontend if needed

6. **Rebuild Docker Containers**
   - Rebuilds containers if dependencies changed
   - Uses `docker-compose build`

7. **Restart Services**
   - Restarts Docker containers
   - Uses `docker-compose restart`

## Requirements

- Git must be installed and the repository must be a git clone
- Docker and docker-compose must be available
- The application must be running in Docker containers
- Admin privileges in the application
- Internet connection to access GitHub

## Security

- Only admin users can access update features
- Authentication token required for all update endpoints
- Protected routes ensure only authorized access

## Limitations

1. Only works with the main branch
2. Requires Docker for container management
3. May cause brief downtime during restart
4. Requires hard refresh after update

## Troubleshooting

### Update Fails to Start
- Check internet connection
- Verify Git repository is properly initialized
- Ensure Docker is running

### Update Fails Midway
- Check Docker logs: `docker-compose logs`
- Verify sufficient disk space
- Check for merge conflicts

### New Version Doesn't Load
- Perform a hard refresh (SHIFT + Refresh)
- Clear browser cache
- Check browser console for errors

### Services Don't Restart
- Manually restart: `docker-compose restart`
- Check Docker status: `docker-compose ps`
- Review logs: `docker-compose logs`

## Files Modified/Created

### New Files
- `backend/src/controllers/updateController.js` - Update logic
- `backend/src/routes/updateRoutes.js` - Update routes

### Modified Files
- `backend/src/server.js` - Added update routes
- `frontend/src/services/api.js` - Added update API functions
- `frontend/src/pages/Admin.jsx` - Added update UI

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for multiple branches
- [ ] Rollback functionality
- [ ] Scheduled automatic updates
- [ ] Update notifications
- [ ] Changelog display
- [ ] Backup before update
- [ ] Update history log

