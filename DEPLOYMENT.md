# Netlify Deployment Instructions

## Manual Deployment to Netlify

### Option 1: Drag and Drop (Easiest)

1. Go to [Netlify](https://app.netlify.com/) and sign in or create an account
2. Click "Add new site" > "Deploy manually"
3. Drag and drop the `frontend/dist` folder into the deployment area
4. Netlify will automatically deploy your site

### Option 2: Git Integration (Recommended for continuous deployment)

1. Go to [Netlify](https://app.netlify.com/) and sign in or create an account
2. Click "Add new site" > "Import an existing project"
3. Connect your GitHub account
4. Select the repository: `sindhurr097-star/ryts1023`
5. Configure build settings:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/dist`
6. Click "Deploy site"

### Option 3: Netlify CLI (If you want to retry automated deployment)

1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

## Build Status

The frontend has been successfully built. The production files are in:
- **Directory**: `frontend/dist`
- **Build time**: 2.71s
- **Output size**: ~1.7 MB (gzipped: ~410 KB)

## Environment Variables (if needed)

If your application requires environment variables, add them in Netlify:
1. Go to Site settings > Environment variables
2. Add any required variables (e.g., API keys, Groq API key)

## Post-Deployment Checklist

- [ ] Verify the site loads correctly
- [ ] Test all pages (Dashboard, Energy, RCA, etc.)
- [ ] Verify sensor data is displaying
- [ ] Check maintenance assignment functionality
- [ ] Verify cost analysis is working
- [ ] Test anomaly insights (if re-enabled)
