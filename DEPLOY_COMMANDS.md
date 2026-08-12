# CRM Manager - Deployment Commands & Guide

This guide provides step-by-step commands and instructions for deploying the CRM Manager application to **Render** (backend) and **Vercel** (frontend) with a Pabey rendostgreSQL database hosted on Render.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           Vercel (Frontend)                      │
│  - Next.js Frontend Application                 │
│  - URL: https://your-app.vercel.app             │
└────────────────┬────────────────────────────────┘
                 │
                 │ API Calls (HTTPS)
                 ▼
┌─────────────────────────────────────────────────┐
│           Render (Backend)                       │
│  - Node.js/Express API Server                   │
│  - URL: https://crm-backend.onrender.com        │
│  - Port: 5000                                   │
└────────────────┬────────────────────────────────┘
                 │
                 │ Database Connection
                 ▼
┌─────────────────────────────────────────────────┐
│      Render PostgreSQL Database                  │
│  - Database: crm_manager                        │
│  - Internal URL: (for backend only)             │
│  - Free Tier: 1GB storage                       │
└─────────────────────────────────────────────────┘
```

---

## Part 1: Prerequisites Setup

### 1. Create Required Accounts

```bash
# 1. GitHub Account (if not already)
# Visit: https://github.com/signup

# 2. Render Account
# Visit: https://dashboard.render.com/register

# 3. Vercel Account
# Visit: https://vercel.com/signup
```

### 2. Push Code to GitHub

```bash
# Navigate to your project directory
cd E:\Downloads\crm01-torkk\crm-manager

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: CRM Manager ready for deployment"

# Create a new repository on GitHub (https://github.com/new)
# Then push:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/crm-manager.git
git push -u origin main
```

---

## Part 2: Deploy Backend to Render

### Step 1: Create PostgreSQL Database on Render

```bash
# 1. Go to Render Dashboard: https://dashboard.render.com
# 2. Click: "New +" → "PostgreSQL"
# 3. Fill in the form:
#    - Name: crm-manager-db
#    - Database: crm_manager
#    - User: crm_user
#    - Region: Select closest to you (e.g., Ohio, Frankfurt)
#    - Plan: Free
# 4. Click: "Create Database"
# 5. Wait for database to be created (2-3 minutes)
# 6. Copy the Internal Database URL (appears on the database page)
#    It will look like:
#    postgresql://crm_user:password@host:5432/crm_manager?schema=public

# Save this URL - you'll need it in the next step
```

### Step 2: Deploy Backend Service

```bash
# 1. Go to Render Dashboard: https://dashboard.render.com
# 2. Click: "New +" → "Web Service"
# 3. Connect GitHub:
#    - Click: "Connect account" (if not connected)
#    - Authorize GitHub
#    - Select your repository: crm-manager
# 4. Configure Web Service:
#    - Name: crm-backend
#    - Environment: Node
#    - Region: Same as database (e.g., Ohio)
#    - Branch: main
#    - Build Command: npm install && npm run build && npx prisma generate
#    - Start Command: npx prisma migrate deploy && node dist/server.js
#    - Plan: Free
# 5. Click: "Create Web Service"
# 6. Wait for initial deployment (5-10 minutes)
```

### Step 3: Configure Backend Environment Variables

```bash
# 1. Go to your backend service in Render dashboard
# 2. Click on the service name
# 3. Go to: "Environment" tab
# 4. Add these environment variables:

# Copy from .env file or generate new:

NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://crm_user:PASSWORD@HOSTNAME:5432/crm_manager?schema=public
JWT_SECRET=generate-a-long-random-string-here-at-least-32-characters
JWT_EXPIRE=24h
BREVO_API_KEY=your-brevo-api-key-here
BREVO_SENDER_EMAIL=your-verified-email@example.com
BREVO_SENDER_NAME=CRM Manager
FRONTEND_URL=https://your-frontend-url.vercel.app
CORS_ORIGIN=https://your-frontend-url.vercel.app

# After adding all variables, click: "Save"
# The service will redeploy automatically
```

### Step 4: Get Your Backend URL

```bash
# After deployment succeeds:
# 1. Go to your backend service in Render
# 2. Copy the URL from the top (looks like):
#    https://crm-backend.onrender.com
#
# Save this URL for Step 5 (Frontend deployment)
```

### Step 5: Verify Backend Deployment

```bash
# Open in browser:
https://crm-backend.onrender.com/api/health

# You should see the server is running
# If you get a 404, check the Render logs for errors
```

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Connect GitHub to Vercel

```bash
# 1. Go to: https://vercel.com/new
# 2. Click: "Continue with GitHub"
# 3. Authorize Vercel if needed
# 4. Find and select your repository: crm-manager
# 5. Click: "Import"
```

### Step 2: Configure Vercel Project

```bash
# In the Vercel import screen:

# Framework Preset: Next.js (should auto-detect)
# Root Directory: frontend (click "Edit" and set to ./frontend)
# Node Version: 18.x (or latest)

# Build Command: npm run build
# Output Directory: .next

# Do NOT set environment variables yet - we'll do it next
# Click: "Deploy"

# Wait for build to complete (5-10 minutes)
```

### Step 3: Add Environment Variables

```bash
# After deployment:
# 1. Go to your Vercel project
# 2. Click: "Settings"
# 3. Click: "Environment Variables"
# 4. Add this variable:

NEXT_PUBLIC_API_URL=https://crm-backend.onrender.com/api

# Click: "Save"
# Vercel will automatically redeploy with the new variable
```

### Step 4: Update .env.local (Local Development)

```bash
# In frontend/.env.local (create if doesn't exist):

NEXT_PUBLIC_API_URL=https://crm-backend.onrender.com/api
```

### Step 5: Get Your Frontend URL

```bash
# Your frontend URL will be shown in Vercel:
# Example: https://crm-manager.vercel.app
#
# Save this for updating backend FRONTEND_URL if needed
```

### Step 6: Verify Frontend Deployment

```bash
# Open in browser:
https://crm-manager.vercel.app

# Test:
# 1. Login page loads
# 2. You can navigate through the app
# 3. API calls work (check Network tab in browser DevTools)
```

---

## Part 4: Update Backend CORS (After Frontend Deploy)

```bash
# 1. Go back to Render backend service
# 2. Go to: "Environment" tab
# 3. Update these variables with your Vercel URL:

FRONTEND_URL=https://crm-manager.vercel.app
CORS_ORIGIN=https://crm-manager.vercel.app

# 4. Click: "Save"
# Backend will redeploy automatically
```

---

## Part 5: Database Migrations & Seeding

### Manual Migration (if needed)

```bash
# If migrations didn't run automatically:
# 1. Go to your backend service in Render
# 2. Click: "Manual Deploy" → "Deploy latest commit"
# 3. Check logs to verify migrations ran

# Or, if you need to seed data:
# 1. Go to Render backend service
# 2. Click the "Shell" tab at the bottom
# 3. Run: npx prisma db seed
```

---

## Part 6: Set Up Email Service (Brevo)

### Get Brevo API Credentials

```bash
# 1. Sign up at: https://www.brevo.com
# 2. Verify your sender email:
#    - Go to Senders & lists
#    - Verify your email address
# 3. Get API Key:
#    - Click your profile icon (top right)
#    - Settings → API Keys
#    - Copy the API key (starts with xkeysib-)
# 4. Add to Render environment:
#    - BREVO_API_KEY=xkeysib-...
#    - BREVO_SENDER_EMAIL=your-email@example.com
#    - BREVO_SENDER_NAME=Your CRM Name
```

---

## Build & Run Commands Reference

### Backend

```bash
# Local Development
cd backend
npm install
npm run dev                    # Starts dev server on port 5000

# Production Build
npm run build                  # Compiles TypeScript to dist/

# Database
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run migrations (dev)
npm run prisma:deploy          # Deploy migrations (production)
npm run prisma:seed            # Seed database with initial data

# Testing
npm test                       # Run all tests
npm run test:run               # Run tests with forceExit

# Verification
npm run verify                 # Verify API endpoints
npm run backfill:perms         # Backfill permissions in database

# Production Start
npm start                      # Run compiled server
```

### Frontend

```bash
# Local Development
cd frontend
npm install
npm run dev                    # Starts dev server on port 3000

# Production Build
npm run build                  # Build Next.js app
npm start                      # Start production server (local testing)

# Linting
npm run lint                   # Check code for linting issues
```

---

## Environment Variables Reference

### Backend (Render)

```env
# Required
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://crm_user:password@host:5432/crm_manager?schema=public
JWT_SECRET=your-secret-key-min-32-chars

# Optional but Recommended
JWT_EXPIRE=24h
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=noreply@example.com
BREVO_SENDER_NAME=CRM Manager
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (Vercel)

```env
# Required
NEXT_PUBLIC_API_URL=https://crm-backend.onrender.com/api
```

---

## Troubleshooting

### Backend Won't Deploy

```bash
# Check 1: Build logs
# 1. Go to Render backend service
# 2. Click "Logs" tab
# 3. Look for TypeScript errors or npm errors
# 4. Fix issues locally and push to GitHub

# Check 2: Database connection
# 1. Verify DATABASE_URL is correct in Render
# 2. Check PostgreSQL database is running
# 3. Check database user has correct permissions

# Check 3: Port already in use
# In Render it's always 5000, but check PORT env var

# Local Testing
cd backend
npm run build          # Check if build succeeds
npm run prisma:generate
```

### Frontend Won't Deploy

```bash
# Check 1: Build logs
# 1. Go to Vercel project
# 2. Click "Deployments"
# 3. Check build logs for errors
# 4. Fix locally and push to GitHub

# Check 2: API connection issues
# 1. Verify NEXT_PUBLIC_API_URL is set correctly
# 2. Check backend is running and accessible
# 3. Ensure CORS is configured on backend

# Local Testing
cd frontend
npm run build          # Check if build succeeds
npm run lint           # Check for linting errors
```

### API Connection Errors

```bash
# Frontend can't reach backend?

# 1. Verify backend URL in Frontend env:
#    NEXT_PUBLIC_API_URL=https://crm-backend.onrender.com/api
#
# 2. Check CORS on backend:
#    - CORS_ORIGIN must match frontend URL
#    - FRONTEND_URL should match Vercel URL
#
# 3. Test backend directly:
#    curl https://crm-backend.onrender.com/api/health
#
# 4. Check browser DevTools Network tab:
#    - See what URL is being called
#    - Check for CORS errors
```

### Database Migration Issues

```bash
# If migrations didn't run:

# Option 1: Force redeploy
# 1. Go to Render backend
# 2. Click "Manual Deploy"
# 3. Select "Deploy latest commit"

# Option 2: Run in Shell
# 1. Go to Render backend
# 2. Click "Shell" tab
# 3. Run: npx prisma migrate deploy

# Option 3: Check logs
# 1. Go to Logs tab
# 2. Look for migration errors
# 3. Fix schema if needed
```

---

## Monitoring & Logs

### View Backend Logs

```bash
# 1. Go to Render backend service
# 2. Click "Logs" tab
# 3. Watch real-time logs
# 4. Filter by date/level if needed
```

### View Frontend Logs

```bash
# 1. Go to Vercel project
# 2. Click "Deployments"
# 3. Click specific deployment
# 4. View build logs
```

### Access Backend Console

```bash
# 1. Go to Render backend service
# 2. Click "Shell" tab at bottom
# 3. Run commands (same as SSH)

# Useful commands:
node -v                       # Check Node version
npm -v                        # Check npm version
npx prisma studio            # Open Prisma Studio (if running locally)
```

---

## Post-Deployment Checklist

- [ ] Backend deployed successfully on Render
- [ ] PostgreSQL database created and connected
- [ ] Frontend deployed successfully on Vercel
- [ ] Environment variables set on both platforms
- [ ] CORS configured properly
- [ ] Email service (Brevo) configured
- [ ] Test login functionality
- [ ] Test email sending (registration, password reset)
- [ ] Test API endpoints
- [ ] Monitor logs for any errors
- [ ] Set up backups (if on paid tier)
- [ ] Enable HTTPS (both platforms do this by default)

---

## Continuous Deployment

Both Render and Vercel support automatic deployments:

### Enable Auto-Deploy

```bash
# For both Render and Vercel:
# 1. Connect GitHub repository
# 2. Select branch to deploy (main)
# 3. Enable auto-deploy in settings
#
# Now, every push to main will trigger a deployment
#
# To disable for a specific commit, add [skip] in commit message:
# git commit -m "Fix: bug in auth [skip]"
```

---

## Costs

### Free Tier (Recommended for Learning)

- **Render Free Plan:**
  - 750 hours/month of web service (enough for 1 service)
  - 1 GB PostgreSQL database
  - No SSL included
  - Spins down after 15 minutes of inactivity

- **Vercel Free Plan:**
  - Unlimited deployments
  - 100 GB bandwidth per month
  - Automatic HTTPS
  - Global CDN

### Paid Plans

- **Render Paid:**
  - $7-12/month per service
  - Unlimited runtime
  - SSL included

- **Vercel Pro:**
  - $20/month
  - More bandwidth and features

---

## Security Best Practices

```bash
# 1. Never commit .env files
git update-index --skip-worktree backend/.env
git update-index --skip-worktree frontend/.env

# 2. Use strong JWT_SECRET
# Generate with: openssl rand -base64 32

# 3. Rotate secrets periodically
# 1. Update JWT_SECRET in Render
# 2. Redeploy backend
# 3. Users may need to re-login

# 4. Monitor logs for suspicious activity
# 1. Check Render logs regularly
# 2. Check Vercel error logs

# 5. Enable database backups
# In Render: Go to database → Backups tab
```

---

## Additional Resources

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment/static-exports)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## Quick Start Summary

```bash
# 1. Create accounts
#    - GitHub
#    - Render
#    - Vercel
#    - Brevo

# 2. Deploy Database
#    - Render: PostgreSQL (copy internal URL)

# 3. Deploy Backend
#    - Render: Web Service with render.yaml
#    - Set all env variables
#    - Test health endpoint

# 4. Deploy Frontend
#    - Vercel: Import GitHub repo
#    - Set NEXT_PUBLIC_API_URL
#    - Test in browser

# 5. Configure Email
#    - Brevo: Verify email, get API key
#    - Update backend env vars

# 6. Test
#    - Login
#    - Register
#    - Send email
#    - Create deals
#    - etc.
```

---

**Last Updated:** 2026-08-12
**Status:** Production Ready
