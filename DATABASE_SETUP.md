# Database Setup Guide

## Quick Setup Steps

### Step 1: Create MySQL Database

**Option A: Using MySQL Command Line (Recommended)**
```bash
mysql -u root -p
```
Then in MySQL prompt:
```sql
CREATE DATABASE hrms_db;
EXIT;
```

**Option B: Using MySQL Command Line (One-liner)**
```bash
mysql -u root -p -e "CREATE DATABASE hrms_db;"
```

**Option C: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your server
3. Click "Create a new schema" button
4. Name it `hrms_db`
5. Click "Apply"

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

2. Edit `.env` file with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=hrms_db
   
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   
   PORT=5000
   NODE_ENV=development
   
   FRONTEND_URL=http://localhost:3000
   ```

### Step 3: Install Dependencies and Start Server

```bash
cd server
npm install
npm start
```

**Sequelize will automatically create all tables!** You don't need to run the schema.sql file manually.

### Step 4: (Optional) Load Sample Data

If you want to populate the database with sample data:

```bash
mysql -u root -p hrms_db < database/sample-data.sql
```

**Note:** You may need to update user passwords in the sample data, as they might be placeholder hashes. Better to create users through the registration API.

---

## Troubleshooting

### Error: "Access denied for user"
- Check your MySQL username and password in `.env`
- Make sure MySQL is running

### Error: "Unknown database 'hrms_db'"
- Make sure you created the database first (Step 1)

### Error: "Can't connect to MySQL server"
- Make sure MySQL service is running
- Check if MySQL is running on default port 3306
- Verify DB_HOST in `.env` matches your MySQL server

### Check MySQL Service Status

**Windows:**
```bash
# Check if MySQL is running
sc query MySQL80
# or
net start | findstr MySQL
```

**Mac/Linux:**
```bash
# Check MySQL status
sudo systemctl status mysql
# or
brew services list
```

