# Deploying Slashing Claim Portal to Vercel

## 🚀 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Database**: Set up Vercel Postgres (recommended)

## 📋 Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Slashing Claim Portal"
git branch -M main
git remote add origin https://github.com/your-username/slashing-claim-portal.git
git push -u origin main
```

### 2. Set Up Database (Vercel Postgres)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database**
3. Choose **Postgres**
4. Name: `slashing-claims-db`
5. Click **Create**
6. Copy the `DATABASE_URL` from the `.env.local` tab

### 3. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Project Name**: `slashing-claim-portal`
4. **Framework Preset**: Vite
5. Click **Deploy**

### 4. Configure Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

```
VITE_DYNAMIC_ENVIRONMENT_ID=4134a0bb-a14b-496b-ac4b-0b73a6293651
DATABASE_URL=postgresql://your-db-url-from-vercel
VITE_BOND_CONTRACT_ADDRESS=0x9fA6BfDA1c0Cc5940A7b2274521E90A0dC994cfB
```

### 5. Set Up Database Schema

After deployment, run database migration:

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Run migration: `vercel env pull .env.local && npx prisma db push`

## 🔧 Production Configuration

### Database Migration Commands

```bash
# Pull environment variables
vercel env pull .env.local

# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma db push

# View data (optional)
npx prisma studio
```

### Testing Production

1. **Frontend**: `https://your-project.vercel.app`
2. **API Health**: `https://your-project.vercel.app/api/health`
3. **Claims API**: `https://your-project.vercel.app/api/claims`

## 🛠 Troubleshooting

### Common Issues

1. **Build Failures**: Check Vercel build logs
2. **Database Connection**: Verify `DATABASE_URL` in environment variables
3. **API Routes**: Ensure all routes work at `/api/endpoint`

### Useful Commands

```bash
# Local development with production env
vercel dev

# View deployment logs
vercel logs

# Redeploy latest
vercel --prod
```

## 📱 Post-Deployment

1. Test the full flow: Claim submission → Bonding → Transaction
2. Verify Arbitrum Sepolia network switching works
3. Test with real MetaMask transactions
4. Monitor Vercel analytics and logs

Your Slashing Claim Portal is now live! 🎉 