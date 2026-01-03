# 🔐 Login Credentials

## Option 1: Use Seed Script (Recommended)

Run the seed script to create default users:

```bash
cd server
npm run seed
```

This will create:
- **Admin User**
  - Email: `admin@company.com`
  - Password: `password123`
  
- **Manager User**
  - Email: `manager@company.com`
  - Password: `password123`
  
- **Employee User**
  - Email: `employee@company.com`
  - Password: `password123`

## Option 2: Register Manually

### Via API (using curl or Postman):

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "password123",
  "role": "admin",
  "name": "Admin User",
  "department": "IT",
  "role": "Administrator",
  "salary": 100000
}
```

### Via Frontend (if register page exists):

1. Navigate to registration page
2. Fill in the form
3. Select role: `admin`, `manager`, or `employee`

## Default Credentials (After Running Seed)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@company.com | password123 |
| **Manager** | manager@company.com | password123 |
| **Employee** | employee@company.com | password123 |

## ⚠️ Security Note

**IMPORTANT:** These are default credentials for development only!

In production:
1. Change all passwords immediately
2. Use strong, unique passwords
3. Consider implementing password requirements
4. Enable two-factor authentication if possible

## Access Levels

- **Admin**: Full access to all features (create, update, delete employees, approve leaves, generate payroll)
- **Manager**: Can create/update employees, approve leaves, generate payroll (cannot delete employees)
- **Employee**: Can view own data, apply for leaves, view own attendance and payroll

---

**Need to reset?** Delete the users from MongoDB and run the seed script again:
```bash
# Connect to MongoDB
mongosh

# Use database
use hrms_db

# Delete users (optional - or just run seed script again)
db.users.deleteMany({})
db.employees.deleteMany({})

# Exit
exit

# Run seed again
npm run seed
```

