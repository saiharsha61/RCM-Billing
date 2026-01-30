# Vercel Deployment Guide

## Quick Deploy

1. **Push to GitHub** (if not already done):
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository: `saiharsha61/RCM-Billing`
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

3. **Access Your Live Site**:
   - Vercel will provide a URL: `https://rcm-billing-xxx.vercel.app`
   - Your site will auto-deploy on every git push!

## Configuration

The `vercel.json` file configures:
- Build command: `npm run build`
- Output directory: `dist`
- SPA routing (all routes → index.html)

## Custom Domain (Optional)

In Vercel dashboard:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment Variables (For Supabase)

When you connect Supabase:
1. Go to Vercel project settings
2. Click "Environment Variables"
3. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Auto-Deployment

Every git push to `main` will automatically:
- Trigger a new build
- Deploy to production
- Update your live site

## Build Status

Check build status at:
`https://vercel.com/your-username/rcm-billing/deployments`
