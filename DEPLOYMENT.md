# Deployment Guide

## Quick Start - Push to GitHub

1. **Create a new repository on GitHub** (don't initialize with README)

2. **Add remote and push:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Deploy to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect Vite settings
6. Click "Deploy"

### Option 2: Via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## Local Development

```bash
# Install dependencies (already done)
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

This project doesn't require any environment variables. It runs entirely client-side.

## Build Configuration

The project is configured with:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Vercel will auto-detect these settings from your `package.json`.

## Custom Domain (Optional)

After deployment, you can add a custom domain in Vercel's project settings.

## Notes

- The app is a Single Page Application (SPA)
- `vercel.json` handles client-side routing
- Build outputs to `dist/` directory
- All dependencies are listed in `package.json`



