# Changelog

All notable changes to the Net Control by K4HEF project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.4] - 2024-10-27

### Added
- Admin authorization system requiring approval for new user accounts
- Google reCAPTCHA v3 integration for bot protection on registration
- User account enable/disable functionality in admin panel
- Status indicators (Enabled/Pending) in user management table
- reCAPTCHA setup documentation (RECAPTCHA_SETUP.md)
- Backend reCAPTCHA verification service
- Environment variable configuration for reCAPTCHA keys

### Changed
- New user registrations default to `isEnabled: false` (requires admin approval)
- First user is automatically enabled and made admin
- Login endpoint now checks if user account is enabled
- Registration response includes account status information
- Admin-created users are automatically enabled
- Improved registration success messaging based on account status

### Security
- reCAPTCHA v3 protection prevents bot registrations
- Admin approval required for all new accounts (except first user)
- Disabled accounts cannot login even with correct credentials
- Admin cannot disable their own account

### Documentation
- Added RECAPTCHA_SETUP.md with complete setup instructions
- Updated README.md with version 2.2.4 information
- Added troubleshooting guide for reCAPTCHA configuration
- Environment variable setup instructions

## [2.1.0] - Previous Release

### Added
- Advanced reporting system with multi-filter support
- Enhanced note-taking with edit capabilities
- Staying for Comments tracking
- Professional PDF report generation

## [1.2.0] - Previous Release

### Added
- Schedule future nets without starting
- Recurring net scheduling (Daily, Weekly, Bi-Weekly, Monthly)
- Start scheduled nets from Dashboard and Schedule page
- Edit user information in Admin panel

## [1.0.1] - Previous Release

### Fixed
- Multer vulnerabilities (upgraded to 2.0.0)
- Calendar dark mode text readability
- Modal text readability in light mode

## [1.0.0] - Initial Release

### Added
- Net Control operations management
- Real-time check-in tracking
- QRZ.com API integration
- Schedule calendar with PDF export
- Admin panel for user management
- Theme switching with persistence
- Custom logo upload
- User authentication with JWT

