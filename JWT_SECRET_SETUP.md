# JWT Secret Key Configuration Guide

## 🔐 What is a JWT Secret?

The JWT (JSON Web Token) secret is used to sign and verify authentication tokens in your Net Control application. It's crucial for security - anyone who knows this secret can generate valid authentication tokens for your application.

## ⚠️ Security Warning

- **NEVER** use the default secret in production
- **ALWAYS** use a strong, random secret (32+ characters)
- **NEVER** commit your secret to version control
- **CHANGE** the secret if you suspect it's been compromised

## 🛠️ How to Set Up JWT Secret

### Method 1: Using .env File (Recommended)

1. **Generate a secure secret key:**
   ```bash
   # Option A: Using Node.js
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Option B: Using OpenSSL
   openssl rand -base64 64
   
   # Option C: Manual generation (use a password manager or online generator)
   ```

2. **Edit your .env file:**
   ```bash
   # Create or edit the .env file in your project root
   nano .env
   ```
   
3. **Add your JWT secret:**
   ```bash
   JWT_SECRET=your_generated_64_character_random_string_here
   ```

4. **Restart your application:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Method 2: Set Environment Variable

1. **Set the environment variable before starting Docker:**
   ```bash
   export JWT_SECRET="your_very_secure_secret_key_here"
   docker-compose up -d
   ```

### Method 3: Direct Docker Compose Override

1. **Create a docker-compose.override.yml file:**
   ```yaml
   version: '3.8'
   services:
     backend:
       environment:
         JWT_SECRET: "your_very_secure_secret_key_here"
   ```

2. **Start with override:**
   ```bash
   docker-compose up -d
   ```

## 🔍 Verify Your Configuration

Check that your JWT secret is properly loaded:

```bash
# Check the environment variable in the running container
docker-compose exec backend env | grep JWT_SECRET
```

## 🚨 Important Notes

- **After changing the JWT secret**, all existing login sessions will become invalid
- Users will need to **log in again** after you change the secret
- The secret should be **at least 32 characters long** and contain a mix of letters, numbers, and symbols
- Store your JWT secret securely - losing it means losing access to all user accounts

## 🔧 Troubleshooting

### Issue: "Invalid token" errors after setup
**Solution:** All users need to log in again after changing the JWT secret.

### Issue: Can't log in after changing secret
**Solution:** Verify the JWT_SECRET environment variable is correctly set in the backend container.

### Issue: Application won't start
**Solution:** Check that your JWT_SECRET doesn't contain special characters that need escaping in your shell or .env file.

## 📝 Example .env File

```bash
# Net Control by K4HEF - Environment Configuration
JWT_SECRET=a89bb25035a1d03c1343059025c96da2f7b74a73d4b858edba44a37a5c50a262143e602bcc60c3cdb5e9bd06461e7ad66e4c482f2282ed2538c4ea5bdf641f40
MONGODB_URI=mongodb://mongodb:27017/netcontrolapp
PORT=5000
NODE_ENV=production
```

Remember: Keep your JWT secret secure and never share it publicly!
