# 🚀 Quick Start Guide

## Prerequisites Check
✅ MongoDB running (local or Atlas)  
✅ Node.js installed  
✅ npm installed

## Step 1: Install Dependencies

### Backend:
```bash
cd server
npm install
```

### Frontend:
```bash
cd frontend
npm install
```

## Step 2: Configure Backend

Create `server/.env` file:
```env
MONGO_URI=mongodb://localhost:27017/hrms_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Note:** If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

## Step 3: Start Backend Server

Open Terminal 1:
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

You should see:
```
MongoDB connected: localhost:27017
Server running on port 5000
```

## Step 4: Start Frontend

Open Terminal 2:
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

## Step 5: Open in Browser

Open: **http://localhost:3000**

## Step 6: Create Default Users

Run the seed script to create default login credentials:

```bash
cd server
npm run seed
```

This creates:
- **Admin**: admin@company.com / password123
- **Manager**: manager@company.com / password123  
- **Employee**: employee@company.com / password123

## Step 7: Login

Go to http://localhost:3000/login

Login with:
- Email: `admin@company.com`
- Password: `password123`

---

## ✅ That's It!

Your HRMS system is now running:
- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:3000
- **MongoDB**: Running and connected

---

## Troubleshooting

**MongoDB not connecting?**
- Check if MongoDB service is running
- Verify `MONGO_URI` in `.env` is correct
- Test: `mongosh` or `mongo` command

**Port already in use?**
- Change `PORT` in `server/.env` (backend)
- Change port in `frontend/vite.config.js` (frontend)

**Dependencies error?**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

## Next Steps

1. Register admin user
2. Add employees
3. Mark attendance
4. Manage leaves
5. Generate payroll

Enjoy your HRMS! 🎉

