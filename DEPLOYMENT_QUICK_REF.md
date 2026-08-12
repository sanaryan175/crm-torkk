# Deployment Quick Reference Card

## Build Commands

### Backend (Node.js + Express + TypeScript)
```bash
npm run build              # Build TypeScript → dist/
npm start                  # Run production server
npm run dev                # Run with nodemon (local)
npm run prisma:generate    # Generate Prisma client
npm run prisma:deploy      # Deploy database migrations
```

### Frontend (Next.js)
```bash
npm run build              # Build Next.js application
npm start                  # Run Next.js server
npm run dev                # Run dev server (port 3000)
npm run lint               # Check code quality
```

---

## Render Deployment (Backend)

### Quick Steps
1. **Database:** Render → New → PostgreSQL (copy Internal URL)
2. **Service:** Render → New Web Service → Connect GitHub → Select `backend` root directory
3. **Build:** `npm install && npm run build && npx prisma generate`
4. **Start:** `npx prisma migrate deploy && node dist/server.js`
5. **Env Vars:** Add all from `backend/.env.example`
6. **Result:** `https://crm-backend.onrender.com`

### Required Environment Variables
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/crm_manager?schema=public
JWT_SECRET=your-32-char-min-secret-key
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=noreply@example.com
BREVO_SENDER_NAME=CRM Manager
FRONTEND_URL=https://your-vercel-url.vercel.app
CORS_ORIGIN=https://your-vercel-url.vercel.app
```

---

## Vercel Deployment (Frontend)

### Quick Steps
1. **Project:** Vercel → New → Import GitHub repo
2. **Settings:** Root directory = `frontend`
3. **Build:** `npm run build`
4. **Env Vars:** `NEXT_PUBLIC_API_URL=https://crm-backend.onrender.com/api`
5. **Deploy:** Click Deploy
6. **Result:** `https://your-app.vercel.app`

### Required Environment Variables
```
NEXT_PUBLIC_API_URL=https://crm-backend.onrender.com/api
```

---

## Database Setup

### PostgreSQL on Render
- **Database Name:** crm_manager
- **User:** crm_user
- **Password:** Auto-generated
- **Host:** Provided by Render
- **Port:** 5432
- **Internal URL:** Used by backend (Render will inject as DATABASE_URL)

### Connection String Format
```
postgresql://user:password@hostname:5432/crm_manager?schema=public
```

---

## Files Modified/Created

| File | Purpose |
|------|---------|
| `backend/render.yaml` | Render deployment configuration |
| `frontend/vercel.json` | Vercel deployment configuration |
| `backend/package.json` | Updated build & start scripts |
| `frontend/.env.example` | Updated with production URL example |
| `DEPLOY_COMMANDS.md` | Detailed step-by-step deployment guide |
| `DEPLOYMENT_QUICK_REF.md` | This file - quick reference |

---

## Testing Endpoints

### Backend Health Check
```
GET https://crm-backend.onrender.com/api/health
```

### Frontend
```
https://your-app.vercel.app
```

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Backend won't build | Check TypeScript errors: `npm run build` locally |
| Database connection error | Verify DATABASE_URL format and PostgreSQL is running |
| Frontend can't reach API | Verify `NEXT_PUBLIC_API_URL` env var is set |
| CORS errors | Check `CORS_ORIGIN` matches frontend URL in backend |
| Email not sending | Add BREVO_API_KEY and verify email in Brevo |
| Migrations not running | Run manually via Render Shell: `npx prisma migrate deploy` |

---

## Environment Variable Locations

### Backend (Render Dashboard)
```
Service → Settings → Environment Variables
```

### Frontend (Vercel Dashboard)
```
Project → Settings → Environment Variables
```

---

## Monitoring

### Backend Logs
Render → Backend Service → Logs tab

### Frontend Logs
Vercel → Project → Deployments → Click deployment → Logs

### Database Access
Render → PostgreSQL Database → Connection info

---

## Useful URLs

| Service | URL |
|---------|-----|
| Render Dashboard | https://dashboard.render.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| GitHub | https://github.com |
| Brevo | https://www.brevo.com |

---

## Post-Deployment Checklist

- [ ] Backend deployed & accessible
- [ ] Database created & connected
- [ ] Frontend deployed & accessible
- [ ] API calls work (test in browser DevTools)
- [ ] Login/Register flow works
- [ ] Emails send properly
- [ ] No CORS errors
- [ ] SSL/HTTPS working (both platforms provide)

---

## Generate JWT Secret

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Or use an online tool:
# https://generate-random.org/base64-generator
```

---

## Database Migrations

### Local Development
```bash
cd backend
npm run prisma:migrate    # Create and apply migrations
npm run prisma:seed       # Seed test data
```

### Production (Render)
- Migrations run automatically on deployment
- View in: Service Logs
- Manual run via Shell: `npx prisma migrate deploy`

---

## Branches & Auto-Deploy

### Enable Automatic Deployment
Both Render and Vercel auto-deploy when you push to `main` branch:

```bash
git push origin main  # Triggers automatic deployment
```

### Skip Deployment
```bash
git commit -m "Docs: updated README [skip]"  # Won't trigger deployment
```

---

## Scaling (When Needed)

### Free Tier Limits
- **Render:** 750 hrs/month = 1 always-running service
- **Vercel:** 100 GB bandwidth/month
- **Database:** 1 GB storage

### Upgrade When You Need
- Render: $7-12/month per service
- Vercel: $20/month Pro plan
- Database: Scale as needed

---

**For detailed instructions, see: `DEPLOY_COMMANDS.md`**
