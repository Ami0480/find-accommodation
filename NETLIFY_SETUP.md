# Netlify Setup Guide

This guide will help you deploy your accommodation search website to Netlify with secure API key management using serverless functions.

## Prerequisites

1. A Netlify account (sign up at [netlify.com](https://www.netlify.com))
2. StayAPI credentials (get them from [StayAPI](https://stayapi.com/))

## Step 1: Get StayAPI Credentials

1. Go to [StayAPI](https://stayapi.com/)
2. Sign up for a free account
3. Get your API Key from the dashboard
4. Save your API key securely - you'll need it in Step 3

StayAPI provides more comprehensive hotel data including images, reviews, prices, and booking URLs.

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify CLI

1. Install Netlify CLI globally:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize your site:
```bash
netlify init
```

4. Build and deploy:
```bash
npm run build
netlify deploy --prod
```

### Option B: Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click "Deploy site"

## Step 3: Configure Environment Variables

After deploying, you need to add your Amadeus API credentials as environment variables:

1. Go to your site in the Netlify Dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add variable** and add the following:

   - **Key:** `STAYAPI_KEY`
   - **Value:** Your StayAPI Key

4. Click **Save**

## Step 4: Redeploy

After adding environment variables, you need to trigger a new deployment:

1. Go to **Deploys** tab in Netlify Dashboard
2. Click **Trigger deploy** → **Clear cache and deploy site**

Or if using CLI:
```bash
netlify deploy --prod
```

## Step 5: Test Your Deployment

1. Visit your Netlify site URL
2. Try searching for accommodations using city codes like:
   - `NYC` (New York)
   - `PAR` (Paris)
   - `LON` (London)
   - `MIA` (Miami)
   - `LAX` (Los Angeles)

## Local Development with Netlify Functions

To test serverless functions locally:

1. Install Netlify CLI (if not already installed):
```bash
npm install -g netlify-cli
```

2. Create a `.env` file in the root directory:
```bash
STAYAPI_KEY=your_stayapi_key_here
```

3. Start Netlify Dev:
```bash
netlify dev
```

This will:
- Start your Vite dev server
- Start Netlify Functions locally
- Load environment variables from `.env`

## Troubleshooting

### Function Not Found Error

If you get a 404 error when calling the function:
- Make sure `netlify.toml` is in the root directory
- Verify the function file is at `netlify/functions/search-accommodations.js`
- Check that the function name matches the URL path

### API Authentication Failed

If you see authentication errors:
- Verify `STAYAPI_KEY` is set correctly in Netlify Dashboard
- Check that your API key is valid and active
- Ensure you've redeployed after adding environment variables
- Visit [StayAPI Dashboard](https://stayapi.com/) to verify your API key status

### CORS Errors

The function includes CORS headers, but if you encounter issues:
- Check browser console for specific error messages
- Verify the function is returning proper headers
- Make sure you're calling the function from the same domain

## Security Best Practices

✅ **DO:**
- Keep API keys in Netlify environment variables
- Never commit `.env` files to version control
- Use different API keys for development and production
- Regularly rotate your API keys

❌ **DON'T:**
- Hardcode API keys in your frontend code
- Commit API keys to GitHub
- Share API keys publicly
- Use production keys in development

## Function Structure

The serverless function is located at:
```
netlify/functions/search-accommodations.js
```

It handles:
1. Authentication with Amadeus API
2. Hotel search by city code
3. Fetching hotel offers for specific dates
4. Data transformation for frontend
5. Error handling and validation

## Additional Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [StayAPI Documentation](https://stayapi.com/docs)
- [StayAPI Google Hotels Search Endpoint](https://stayapi.com/docs/endpoints/google-hotels/search)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

