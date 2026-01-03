# MongoDB Setup Guide for HRMS

## Quick Setup Steps

### Step 1: Start MongoDB

**Option A: MongoDB Running Locally**
- Make sure MongoDB is installed and running on your machine
- Default connection: `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/hrms_db`)

### Step 2: Configure Environment Variables

Create a `.env` file in the `server/` directory:

1. Copy the example file:
   ```bash
   # On Windows (Command Prompt)
   copy env.example .env
   
   # On Windows (PowerShell)
   copy-item env.example .env
   
   # On Mac/Linux
   cp env.example .env
   ```

2. Edit `.env` file with your MongoDB connection:
   ```env
   # For Local MongoDB
   MONGO_URI=mongodb://localhost:27017/hrms_db
   
   # OR for MongoDB Atlas (Cloud)
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms_db?retryWrites=true&w=majority
   
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   
   PORT=5000
   NODE_ENV=development
   
   FRONTEND_URL=http://localhost:3000
   ```

**Note:** The database name `hrms_db` will be created automatically if it doesn't exist!

### Step 3: Install Dependencies and Start Server

```bash
cd server
npm install
npm start
```

**Mongoose will automatically:**
- Connect to MongoDB
- Create the database if it doesn't exist
- Create all collections (tables) when you first use them
- No need to run any SQL scripts!

### Step 4: (Optional) Load Sample Data

You can manually create sample data through the API or use MongoDB Compass to import JSON data.

---

## MongoDB Connection Strings

### Local MongoDB
```
mongodb://localhost:27017/hrms_db
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/hrms_db?retryWrites=true&w=majority
```

### With Authentication (Local)
```
mongodb://username:password@localhost:27017/hrms_db?authSource=admin
```

---

## Troubleshooting

### Error: "MongoServerError: connect ECONNREFUSED"
- **Solution:** Make sure MongoDB service is running
  - **Windows:** Check Services (services.msc) for "MongoDB Server"
  - **Mac:** `brew services list` or `sudo systemctl status mongod`
  - **Linux:** `sudo systemctl status mongod`

### Error: "Authentication failed"
- **Solution:** Check your MongoDB username and password in the connection string
- If using local MongoDB without auth, remove username/password from connection string

### Error: "getaddrinfo ENOTFOUND"
- **Solution:** Check your MongoDB Atlas cluster URL is correct
- Make sure your IP address is whitelisted in MongoDB Atlas Network Access

### Check MongoDB Connection

**Using MongoDB Shell (mongosh):**
```bash
mongosh
# Then try: show dbs
```

**Using MongoDB Compass:**
- Download [MongoDB Compass](https://www.mongodb.com/products/compass)
- Connect using your connection string
- View databases and collections visually

---

## MongoDB Collections (Tables)

The following collections will be created automatically:
- `users` - User accounts and authentication
- `employees` - Employee information
- `attendances` - Attendance records
- `leaves` - Leave applications
- `payrolls` - Payroll records

---

## Key Differences from MySQL Setup

1. **No Database Creation Needed:** MongoDB creates databases automatically
2. **No Schema Scripts:** Mongoose handles schema creation
3. **Connection String:** Uses `MONGO_URI` instead of separate DB_HOST, DB_USER, etc.
4. **Collections vs Tables:** MongoDB uses "collections" (similar to tables)

---

## Useful MongoDB Commands

**View databases:**
```javascript
show dbs
```

**Use database:**
```javascript
use hrms_db
```

**View collections:**
```javascript
show collections
```

**Count documents in a collection:**
```javascript
db.employees.countDocuments()
```

**View documents:**
```javascript
db.employees.find().pretty()
```

