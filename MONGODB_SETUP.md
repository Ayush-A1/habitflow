# 🍃 MongoDB Connection Guide — HabitFlow

---

## Option A: Local MongoDB (Development)

### Step 1 — Install MongoDB Community

**On Windows:**
1. Go to https://www.mongodb.com/try/download/community
2. Download the MSI installer for Windows x64
3. Run the installer → select "Complete" install
4. Check "Install MongoDB as a Service" (auto-starts with Windows)
5. MongoDB Compass (the GUI) will also be installed — useful for visualizing your data

**On Mac:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**On Ubuntu/Debian:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Step 2 — Verify it's running
```bash
mongosh
# You should see: "Connecting to: mongodb://127.0.0.1:27017/"
# Type: show dbs
# Type: exit
```

### Step 3 — Set your .env
```env
MONGODB_URI=mongodb://localhost:27017/habitflow
```
That's it. MongoDB creates the `habitflow` database automatically when you first write to it.

---

## Option B: MongoDB Atlas (Cloud — Free Tier, Recommended for Production)

### Step 1 — Create a free cluster
1. Go to https://www.mongodb.com/atlas
2. Click "Try Free" → sign up
3. Choose **Free (M0)** tier — 512MB storage, always free
4. Select a cloud provider (AWS/GCP/Azure) and region closest to you
5. Click "Create Cluster" (takes ~2 minutes)

### Step 2 — Create a database user
1. In Atlas sidebar → **Database Access**
2. Click "Add New Database User"
3. Username: `habitflow-user`
4. Password: Generate a strong password and **copy it**
5. Role: "Atlas Admin" or "Read and write to any database"
6. Click "Add User"

### Step 3 — Whitelist your IP
1. In Atlas sidebar → **Network Access**
2. Click "Add IP Address"
3. For development: click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: only add your server's specific IP
4. Click "Confirm"

### Step 4 — Get your connection string
1. In Atlas → **Database** → click "Connect" on your cluster
2. Choose "Connect your application"
3. Select: Driver = Node.js, Version = 5.5 or later
4. Copy the connection string. It looks like:
   ```
   mongodb+srv://habitflow-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

### Step 5 — Set your .env
```env
MONGODB_URI=mongodb+srv://habitflow-user:YourPassword123@cluster0.xxxxx.mongodb.net/habitflow?retryWrites=true&w=majority
```
Note: `habitflow` at the end is the database name — Atlas creates it automatically.

---

## Verifying the Connection

Start your backend:
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected: cluster0.xxxxx.mongodb.net   ← Atlas
✅ MongoDB connected: localhost                     ← Local
🚀 HabitFlow server running on port 5000
```

---

## Viewing Your Data

### Option 1: MongoDB Compass (GUI — recommended)
1. Download from https://www.mongodb.com/try/download/compass
2. Paste your connection string
3. Click Connect → you'll see your collections: users, habits, habitlogs, goals

### Option 2: mongosh (CLI)
```bash
mongosh "your-connection-string"
use habitflow
db.users.find().pretty()
db.habits.find().pretty()
db.habitlogs.find().sort({date:-1}).limit(10).pretty()
```

### Option 3: VS Code Extension
Install "MongoDB for VS Code" extension → connects directly in VS Code

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `MongoServerError: Authentication failed` | Wrong password in connection string |
| `Connection timed out` | IP not whitelisted in Atlas Network Access |
| `ECONNREFUSED 127.0.0.1:27017` | Local MongoDB not running. Run: `mongod` or `brew services start mongodb-community` |
| `MONGODB_URI is not defined` | Forgot to create `.env` file from `.env.example` |

---

## MongoDB Collections HabitFlow Creates

| Collection | Description |
|------------|-------------|
| `users` | User accounts (passwords hashed with bcrypt) |
| `habits` | User habits with streaks, colors, icons |
| `habitlogs` | Daily completion logs (one per habit per day) |
| `goals` | Goals linked to habits with progress tracking |

Mongoose auto-creates these collections when data is first inserted.

---

## Environment Variables Reference

```env
# backend/.env
PORT=5000
MONGODB_URI=<your-connection-string>

# Generate secure secrets (run this in terminal):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<32-char-random-string>
JWT_REFRESH_SECRET=<another-32-char-random-string>

JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```
