# Firebase reCAPTCHA Not Loading - Fix Guide

## Issue
Firebase reCAPTCHA is not loading on the deployed Vercel site during login.

## Root Cause
The Vercel deployment domain is not whitelisted in Firebase Console.

## Solution

### Step 1: Add Vercel Domain to Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **RoziRakshak AI**
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add your Vercel domains:
   - `rozi-rakshak-ai.vercel.app`
   - Any custom domains you're using

### Step 2: Verify reCAPTCHA Settings

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Phone** provider
3. Ensure it's **Enabled**
4. Check that **Phone numbers for testing** (if any) are configured correctly

### Step 3: Check Environment Variables

Ensure these are set in Vercel:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Step 4: Test

1. Redeploy on Vercel (or wait for auto-deploy)
2. Open the login page
3. The reCAPTCHA widget should now load properly

## Additional Notes

- Firebase automatically allows `localhost` for development
- Production domains must be explicitly whitelisted
- Changes to authorized domains take effect immediately (no redeploy needed)
- If using a custom domain, add both the Vercel subdomain AND your custom domain

## Troubleshooting

If reCAPTCHA still doesn't load:

1. Check browser console for specific Firebase errors
2. Verify the Firebase project ID matches your environment variables
3. Ensure the Firebase project has the Phone authentication method enabled
4. Try clearing browser cache and cookies
5. Check if there are any CORS errors in the console
