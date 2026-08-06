# TORKK CRM - Local Development Setup Guide

**Complete Guide to Running Frontend & Backend on Localhost**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running Both Together](#running-both-together)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Troubleshooting](#troubleshooting)
9. [Common Commands](#common-commands)

---

## Prerequisites

Before starting, ensure you have installed:

### Required Software

```bash
# Check if installed (run in PowerShell/Terminal)
node --version          # Should be v18+ (v20 recommended)
npm --version           # Should be v9+
PostgreSQL --version    # Should be v13+
```

### Installation Links

- **Node.js** (includes npm): https://nodejs.org/ (Download LTS version)
- **PostgreSQL**: https://www.postgresql.org/download/
- **Git**: https://git-scm.com/ (optional, for version control)

### Verify Installation

```bash
# PowerShell
node -v
npm -v
psql --version
```

You should see version numbers, not "command not found" errors.

---

## Project Structure

```
crm01-torkk/
└── crm-manager/
    ├── backend/              # Express.js API server
    │   ├── src/
    │   │   ├── server.ts
    │   │   ├── app.ts
    │   │   ├── services/
    │   │   ├── controllers/
    │   │   ├── routes/
    │   │   └── ...
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── migrations/
    │   ├── .env              # Backend environment variables
    │   ├── package.json
    │   └── ...
    │
    └── frontend/             # Next.js web application
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── globals.css
        │   └── ... (55+ pages)
        ├── components/
        ├── lib/
        ├── .env.local        # Frontend environment variables
        ├── package.json
        └── ...
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd E:\Downloads\crm01-torkk\crm-manager\backend
```

Or use PowerShell:

```powershell
cd "E:\Downloads\crm01-torkk\crm-manager\backend"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages from `package.json`. Wait for it to complete (~2-3 minutes).

### Step 3: Create `.env` File

Create a file named `.env` in the backend directory with these variables:

```env
# Database Connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/torkk_crm

# Server Configuration
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_super_secret_key_min_32_characters_long_here
JWT_EXPIRE=24h

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@torkk.com

# CORS Configuration
CORS_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=info
```

### Step 4: Setup PostgreSQL Database

#### Option A: Using PostgreSQL GUI (pgAdmin)

1. Open pgAdmin (comes with PostgreSQL installation)
2. Connect to local server
3. Right-click "Databases" → Create → Database
4. Name it: `torkk_crm`
5. Save

#### Option B: Using Command Line

```bash
# Open PostgreSQL prompt
psql -U postgres

# Create database
CREATE DATABASE torkk_crm;

# Verify creation
\l

# Exit
\q
```

### Step 5: Run Database Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run all migrations
npm run prisma:migrate

# (Optional) Seed initial data
npm run prisma:seed
```

### Step 6: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production build
npm run build
npm start
```

**Expected Output:**
```
> crm-backend@1.0.0 dev
> nodemon src/server.ts

[nodemon] 3.0.1
[nodemon] to restart at any time, type `rs`
[nodemon] watching path(s): src/**/* .env*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node src/server.ts`

Server running on http://localhost:3000 ✓
```

**Backend is now running on:** `http://localhost:3000`

---

## Frontend Setup

### Step 1: Open New Terminal/PowerShell Window

**Keep backend running in first window, open new one for frontend**

### Step 2: Navigate to Frontend Directory

```bash
cd E:\Downloads\crm01-torkk\crm-manager\frontend
```

Or:

```powershell
cd "E:\Downloads\crm01-torkk\crm-manager\frontend"
```

### Step 3: Install Dependencies

```bash
npm install
```

Wait for completion (~2-3 minutes).

### Step 4: Create `.env.local` File

Create a file named `.env.local` in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_NAME=Torkk
NEXT_PUBLIC_SUPPORT_EMAIL=support@torkk.com

# Analytics (optional)
NEXT_PUBLIC_GTAG_ID=
```

### Step 5: Start Frontend Development Server

```bash
npm run dev
```

**Expected Output:**
```
> my-project@0.1.0 dev
> next dev

▲ Next.js 16.2.6
- Local:        http://localhost:3001
- Environments: .env.local

✓ Ready in 2.3s
```

**Frontend is now running on:** `http://localhost:3001`

---

## Running Both Together

### Terminal Setup

You need **two terminal windows**:

**Window 1 - Backend:**
```bash
cd E:\Downloads\crm01-torkk\crm-manager\backend
npm run dev
# Should show: Server running on http://localhost:3000
```

**Window 2 - Frontend:**
```bash
cd E:\Downloads\crm01-torkk\crm-manager\frontend
npm run dev
# Should show: Ready in 2.3s at http://localhost:3001
```

### Open in Browser

1. Open your browser
2. Go to: `http://localhost:3001`
3. You should see the Torkk CRM login page

### Testing API Connection

Open another terminal and test:

```bash
# Test backend is running
curl http://localhost:3000/health

# Expected response:
# {"status":"ok"}
```

---

## Environment Variables

### Backend Environment Variables (`.env`)

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/torkk_crm` | PostgreSQL connection string |
| `NODE_ENV` | `development` or `production` | Environment mode |
| `PORT` | `3000` | Backend server port |
| `JWT_SECRET` | 32+ character string | Secret for signing JWT tokens |
| `CORS_ORIGIN` | `http://localhost:3001` | Frontend URL for CORS |
| `LOG_LEVEL` | `info` | Logging level |

### Frontend Environment Variables (`.env.local`)

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Backend API URL |
| `NEXT_PUBLIC_APP_NAME` | `Torkk` | App name |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `support@torkk.com` | Support email |

---

## Database Setup

### PostgreSQL Installation

#### Windows

1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Keep default port: **5432**
4. Set password for `postgres` user (remember this!)
5. Finish installation

#### macOS

```bash
# Using Homebrew
brew install postgresql

# Start service
brew services start postgresql
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE torkk_crm;

# Create user (optional)
CREATE USER torkk_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE torkk_crm TO torkk_user;

# Exit
\q
```

### Run Migrations

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Verify (open Prisma Studio)
npx prisma studio
```

---

## Troubleshooting

### Backend Issues

#### Port 3000 Already in Use

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port
# Edit .env: PORT=3001
```

#### Database Connection Error

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1;"

# Verify DATABASE_URL in .env
# Format: postgresql://username:password@localhost:5432/database_name

# Test connection
psql postgresql://postgres:password@localhost:5432/torkk_crm
```

#### Dependencies Installation Failed

```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install

# Or update npm
npm install -g npm@latest
npm install
```

### Frontend Issues

#### Port 3001 Already in Use

```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <PID> /F

# Or use different port
# Edit: npm run dev -- -p 3002
```

#### API Connection Error

Check `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Make sure backend is running on port 3000.

#### Build Errors

```bash
# Clear Next.js cache
rm -r .next

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install

# Try again
npm run dev
```

### Database Issues

#### Migrations Failed

```bash
# Check migration status
npm run prisma:migrate status

# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset

# Or manually drop database
psql -U postgres -c "DROP DATABASE torkk_crm;"
psql -U postgres -c "CREATE DATABASE torkk_crm;"
npm run prisma:migrate
```

#### Can't Connect to PostgreSQL

```bash
# Verify PostgreSQL is running
# Windows: Check Services (services.msc) for PostgreSQL

# Try connecting manually
psql -U postgres -h localhost

# If not working, restart PostgreSQL
# Windows: net stop postgresql-x64-14
# Windows: net start postgresql-x64-14
```

---

## Common Commands

### Backend Commands

```bash
cd backend

# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Database migrations
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Run migrations
npm run prisma:seed       # Seed data
npm run prisma:studio     # Open Prisma Studio

# Run tests
npm test

# Type check
npm run build
```

### Frontend Commands

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Run tests
npm test

# Type check (during build)
npm run build
```

### Database Commands (PostgreSQL)

```bash
# Connect to PostgreSQL
psql -U postgres

# List databases
\l

# Connect to database
\c torkk_crm

# List tables
\dt

# Exit
\q

# Command line operations
psql -U postgres -d torkk_crm -c "SELECT COUNT(*) FROM users;"
```

---

## Complete Startup Sequence

Follow this step-by-step to get everything running:

### 1. Prerequisites ✓
- Node.js v18+ installed
- PostgreSQL installed and running
- Both repositories cloned

### 2. Setup Backend

```bash
cd E:\Downloads\crm01-torkk\crm-manager\backend

npm install
# Create .env file (see Environment Variables section)

npm run prisma:generate
npm run prisma:migrate

npm run dev
# Wait for: "Server running on http://localhost:3000"
```

### 3. Setup Frontend (New Terminal)

```bash
cd E:\Downloads\crm01-torkk\crm-manager\frontend

npm install
# Create .env.local file (see Environment Variables section)

npm run dev
# Wait for: "Ready in X.Xs at http://localhost:3001"
```

### 4. Open in Browser

Navigate to: `http://localhost:3001`

You should see the Torkk CRM login page!

---

## Quick Start (TL;DR)

```bash
# Terminal 1 - Backend
cd E:\Downloads\crm01-torkk\crm-manager\backend
npm install
# Create .env file with DATABASE_URL and other variables
npm run prisma:migrate
npm run dev

# Terminal 2 - Frontend
cd E:\Downloads\crm01-torkk\crm-manager\frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev

# Browser
# Visit http://localhost:3001
```

---

## Testing the Setup

### 1. Check Backend is Running

```bash
curl http://localhost:3000/health

# Expected response:
# {"status":"ok"}
```

### 2. Check Frontend is Running

Open: `http://localhost:3001` in browser

### 3. Test API Connection

In browser console (F12):

```javascript
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(data => console.log(data))
  // Should log: {status: "ok"}
```

### 4. Login

- Email: `admin@example.com` (if seeded)
- Password: Check seed data or create new user

---

## Development Workflow

### Making Changes

**Backend Changes:**
```bash
# Changes to src/* automatically reload with npm run dev
# If not working, restart with Ctrl+C and npm run dev again
```

**Frontend Changes:**
```bash
# Changes to app/*, components/*, lib/* automatically reload
# Page will refresh in browser
```

### Debugging

**Backend:**
```bash
# Check logs in terminal window 1
# Use VS Code debugger or add console.log()
```

**Frontend:**
```bash
# Open browser DevTools (F12)
# Check Console, Network tabs
# Use React DevTools extension
```

---

## Production Build

### Build Backend

```bash
cd backend

npm run build

# This creates: dist/ directory with compiled JavaScript
```

### Build Frontend

```bash
cd frontend

npm run build

# This creates: .next/ directory (production optimized)
```

---

## Summary

**Backend:** `http://localhost:3000`
- Node.js + Express.js
- PostgreSQL database
- RESTful API endpoints

**Frontend:** `http://localhost:3001`
- Next.js + React
- Web interface
- Connects to backend API

Both running together = Complete Torkk CRM system!

---

**Last Updated:** August 6, 2026  
**Version:** 1.0.0  
**Status:** ✅ Ready to Use
