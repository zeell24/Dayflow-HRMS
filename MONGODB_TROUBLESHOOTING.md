# 🔧 MongoDB Connection Troubleshooting

## Error: `connect ECONNREFUSED 127.0.0.1:27017`

This means MongoDB is **not running** on your computer.

## Solutions:

### Option 1: Start MongoDB Locally (If Installed)

**Windows:**
```bash
# Check if MongoDB service exists
sc query MongoDB

# Start MongoDB service
net start MongoDB

# OR if it's named differently
net start MongoDBServer
```

**Check Windows Services:**
1. Press `Win + R`
2. Type `services.msc`
3. Look for "MongoDB" service
4. Right-click → Start

**Mac:**
```bash
# Using Homebrew
brew services start mongodb-community

# OR
mongod --config /usr/local/etc/mongod.conf
```

**Linux:**
```bash
sudo systemctl start mongod

# Check status
sudo systemctl status mongod
```

### Option 2: Install MongoDB (If Not Installed)

**Windows:**
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will start automatically as a Windows service

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### Option 3: Use MongoDB Atlas (Cloud - FREE)

If you don't want to install MongoDB locally, use the cloud version:

1. **Sign up at MongoDB Atlas:**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create a free account

2. **Create a Cluster:**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select a cloud provider and region
   - Click "Create"

3. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

4. **Configure Database Access:**
   - Go to "Database Access"
   - Create a database user (remember username/password)
   - Add your IP address to Network Access (or use 0.0.0.0/0 for all IPs - development only!)

5. **Update `.env` file:**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms_db?retryWrites=true&w=majority
   ```

6. **Replace in connection string:**
   - `<username>` with your database username
   - `<password>` with your database password
   - `cluster.mongodb.net` with your actual cluster address

### Test MongoDB Connection

**Check if MongoDB is running:**
```bash
# Try to connect
mongosh
# OR (older versions)
mongo

# If it connects, you're good!
# Type: exit to leave
```

**Test connection string:**
```bash
# Test with mongosh
mongosh "your_connection_string"
```

## Verify Your Setup

1. **Check MongoDB is running:**
   ```bash
   # Windows
   net start | findstr MongoDB
   
   # Mac/Linux
   ps aux | grep mongod
   ```

2. **Check port 27017:**
   ```bash
   # Windows
   netstat -an | findstr 27017
   
   # Mac/Linux
   lsof -i :27017
   ```

3. **Try connecting manually:**
   ```bash
   mongosh mongodb://localhost:27017
   ```

## Quick Fix Checklist

- [ ] MongoDB service is started
- [ ] Port 27017 is not blocked by firewall
- [ ] `.env` file has correct `MONGO_URI`
- [ ] Connection string format is correct
- [ ] If using Atlas: IP address is whitelisted

## Still Having Issues?

**Try these commands:**

```bash
# Check what's listening on port 27017
# Windows
netstat -ano | findstr :27017

# Mac/Linux  
lsof -i :27017

# If nothing is listening, MongoDB is not running!
```

**Common Issues:**

1. **MongoDB installed but service not started**
   - Solution: Start the MongoDB service (see Option 1)

2. **Firewall blocking port 27017**
   - Solution: Allow port 27017 in Windows Firewall

3. **Wrong connection string format**
   - Local: `mongodb://localhost:27017/hrms_db`
   - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/hrms_db`

4. **Atlas IP not whitelisted**
   - Solution: Add your IP to Network Access in Atlas

---

**Need more help?** Check MongoDB logs:
- Windows: `C:\Program Files\MongoDB\Server\[version]\log\mongod.log`
- Mac/Linux: `/var/log/mongodb/mongod.log`

