# 🏆 ClassRank - Academic Performance & Backlog Leaderboard Platform

ClassRank is a complete, modern, responsive full-stack web application designed for college departments to manage, track, and rank students based on their academic performance and backlog count.

---

## 🎯 Ranking Logic Specification

The platform implements a strict, deterministic 4-tier sorting algorithm:

```
┌────────────────────────────────────────────────────────┐
│ 1. BACKLOG COUNT (ASCENDING)                           │
│    0 Backlogs → 1 Backlog → 2 Backlogs → 3+ Backlogs   │
├────────────────────────────────────────────────────────┤
│ 2. PERCENTAGE (DESCENDING)                             │
│    Higher percentage ranks higher within backlog group │
├────────────────────────────────────────────────────────┤
│ 3. CGPA (DESCENDING)                                   │
│    First tie-breaker for identical percentages         │
├────────────────────────────────────────────────────────┤
│ 4. ROLL NUMBER (ASCENDING)                             │
│    Alphabetical tie-breaker for identical CGPA & %     │
└────────────────────────────────────────────────────────┘
```

> **Key Rule**: A student with **0 backlogs and 80%** will ALWAYS rank above a student with **1 backlog and 95%**, because backlog count has the highest priority.

---

## 🌐 Deploying to Vercel with MongoDB Atlas

Follow these steps to deploy ClassRank live on Vercel with a free MongoDB Atlas cloud database:

### Step 1: Create MongoDB Atlas Database (Free Tier)
1. Register for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g. username: `admin`, password: `yourpassword`).
4. Under **Network Access**, click **Add IP Address** $\rightarrow$ select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** $\rightarrow$ **Drivers** $\rightarrow$ Copy the MongoDB connection URI string:
   ```text
   mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/classrank?retryWrites=true&w=majority
   ```

### Step 2: Paste Connection String in `.env`
In `backend/.env`, set:
```env
MONGODB_URI=mongodb+srv://admin:yourpassword@cluster0.abcde.mongodb.net/classrank?retryWrites=true&w=majority
```

Run seed to populate your Atlas database:
```bash
npm run seed
```

### Step 3: Deploy to Vercel
1. Push this project repository to **GitHub**.
2. Go to your [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `MONGODB_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `classrank_super_secret_jwt_key_2026_academic_perf`
5. Click **Deploy**!

Vercel will automatically build the React Vite frontend and deploy the Express API backend serverlessly using the included `vercel.json` config!

---

## 🔑 Local Demo Credentials

### Administrator Account
- **URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@classrank.edu`
- **Password**: `adminpassword123`

### Sample Student Account
- **URL**: `http://localhost:5173/login`
- **Roll Number / Email**: `23JD1A0501` or `aarav.sharma@student.classrank.edu`
- **Password**: `Student@23JD1A0501`

---

## 🛠️ Quick Local Setup & Execution

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Seed Mock Data
```bash
npm run seed
```

### 3. Start Application
```bash
npm start   # or npm run dev
```

Open browser at **`http://localhost:5173`**.
