# Installation Guide

## System Requirements

### Minimum Requirements
- **CPU:** 2 cores, 2.0 GHz
- **RAM:** 4 GB
- **Storage:** 10 GB free space
- **Network:** Internet connection for QRZ.com API
- **OS:** Linux, macOS, or Windows

### Recommended Requirements
- **CPU:** 4 cores, 3.0 GHz
- **RAM:** 8 GB
- **Storage:** 20 GB free space (for logs and data)
- **Network:** Stable internet connection
- **OS:** Linux (Ubuntu 20.04+ recommended)

### Software Dependencies
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+

---

## Installation Methods

### Method 1: Docker Installation (Recommended)

#### Step 1: Install Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# macOS
# Download Docker Desktop from https://www.docker.com/products/docker-desktop

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

#### Step 2: Clone Repository
```bash
git clone https://github.com/crypiehef/NetControlAPP.git
cd NetControlAPP
```

#### Step 3: Start Application
```bash
docker-compose up -d
```

#### Step 4: Verify Installation
```bash
# Check container status
docker ps

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

#### Step 5: Access Application
- **Web Interface:** http://localhost
- **Admin Access:** First registered user becomes admin

---

### Method 2: Manual Installation

#### Prerequisites
- Node.js 16.0+
- MongoDB 4.4+
- npm 8.0+

#### Backend Installation
```bash
cd backend
npm install
npm start
```

#### Frontend Installation
```bash
cd frontend
npm install
npm start
```

#### MongoDB Setup
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongodb
# or
brew services start mongodb-community
```

---

## Configuration

### Environment Variables

Create `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/netcontrol

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=5000
NODE_ENV=production

# QRZ.com API (Optional)
QRZ_USERNAME=your-qrz-username
QRZ_PASSWORD=your-qrz-password
```

### Docker Environment

For Docker installation, environment variables are set in `docker-compose.yml`:

```yaml
environment:
  - MONGODB_URI=mongodb://mongodb:27017/netcontrol
  - JWT_SECRET=your-super-secret-jwt-key-here
  - NODE_ENV=production
```

---

## Initial Setup

### 1. First Login
1. Navigate to http://localhost
2. Click "Register" to create your account
3. **Important:** First user automatically becomes admin
4. Complete registration form

### 2. Admin Configuration
1. Login with your admin account
2. Navigate to Settings
3. Configure QRZ.com API credentials (optional)
4. Upload your organization's logo

### 3. User Management
1. Go to Admin Panel
2. Add additional operators as needed
3. Set appropriate roles (Operator/Admin)

---

## Updating the Application

### Docker Update
```bash
# Stop containers
docker-compose down

# Pull latest changes
git pull origin main

# Rebuild and start
docker-compose up -d --build
```

### Manual Update
```bash
# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install
npm start

# Update frontend
cd frontend
npm install
npm start
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 5000
lsof -i :5000

# Kill the process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Restart MongoDB
sudo systemctl restart mongodb

# Check MongoDB logs
sudo journalctl -u mongodb
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -a

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Logs and Debugging

#### View Application Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f backend
```

#### Enable Debug Mode
```bash
# Set environment variable
export DEBUG=net-control:*

# Or in .env file
DEBUG=net-control:*
```

---

## Security Configuration

### Production Security Checklist

- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Enable MongoDB authentication
- [ ] Regular security updates
- [ ] Backup strategy implemented

### SSL/HTTPS Setup

#### Using Let's Encrypt
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx/apache for SSL
```

#### Using Docker with SSL
```yaml
# Add to docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "443:443"
  volumes:
    - ./ssl:/etc/nginx/ssl
    - ./nginx.conf:/etc/nginx/nginx.conf
```

---

## Backup and Recovery

### Database Backup
```bash
# Create backup
mongodump --db netcontrol --out /backup/$(date +%Y%m%d)

# Restore backup
mongorestore --db netcontrol /backup/20231201/netcontrol
```

### Docker Backup
```bash
# Backup volumes
docker run --rm -v netcontrol_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz /data

# Restore volumes
docker run --rm -v netcontrol_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb_backup.tar.gz -C /
```

---

## Performance Optimization

### Docker Optimization
```yaml
# Add resource limits
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### MongoDB Optimization
```javascript
// Create indexes for better performance
db.netoperations.createIndex({ "startTime": 1 })
db.netoperations.createIndex({ "operatorId": 1 })
db.users.createIndex({ "username": 1 })
```

---

## Monitoring and Maintenance

### Health Checks
```bash
# Application health
curl http://localhost/api/health

# Database health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Regular Maintenance
- Monitor disk space usage
- Check application logs for errors
- Update dependencies regularly
- Backup database weekly
- Monitor system performance

---

## Support and Documentation

### Getting Help
1. Check this installation guide
2. Review the main wiki documentation
3. Search GitHub issues
4. Create a new issue if needed

### Community Resources
- GitHub Discussions
- Amateur Radio Forums
- Local Radio Club Support
