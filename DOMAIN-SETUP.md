# Connecting Your Custom Domain to Firebase

This guide explains how to connect your custom domain (blinderfit.blinder.live) to your Firebase hosted application.

## Prerequisites

1. A registered domain name (blinder.live)
2. Access to your domain's DNS settings
3. Firebase CLI installed and logged in
4. A Firebase project (blinderfit)

## Step 1: Add Your Custom Domain in Firebase Console

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (blinderfit)
3. Click on "Hosting" in the left menu
4. Click "Add custom domain"
5. Enter your domain (blinderfit.blinder.live)
6. Click "Continue"

## Step 2: Verify Domain Ownership

Firebase will provide you with DNS records to add to your domain configuration:

1. Add the TXT records to your domain's DNS settings
2. Wait for verification (can take up to 24 hours, but often completes within minutes)

## Step 3: Configure DNS for Firebase Hosting

Once ownership is verified, Firebase will provide you with the final DNS records:

1. Add the A records pointing to Firebase's IP addresses
2. Add any AAAA records for IPv6 support

Example DNS Configuration:
```
A     blinderfit.blinder.live   -> 151.101.1.195
A     blinderfit.blinder.live   -> 151.101.65.195
AAAA  blinderfit.blinder.live   -> 2a04:4e42:600::323
AAAA  blinderfit.blinder.live   -> 2a04:4e42:200::323
```

## Step 4: Configure SSL Certificate

Firebase will automatically provision an SSL certificate for your domain once the DNS records are properly set up.

1. Wait for the SSL certificate to be provisioned (can take up to 24 hours)
2. The status will show as "Connected" once everything is ready

## Step 5: Deploy Your Application

Deploy your application using the deployment script:

```
deploy-production.bat
```

## Verification

After deployment, verify that:

1. Your website loads at https://blinderfit.blinder.live
2. The SSL certificate is valid (look for the lock icon in the browser)
3. All functions and APIs work properly

## Troubleshooting

If you encounter issues:

1. Check that DNS records are correctly set up
2. Ensure the Firebase hosting target is correctly configured
3. Verify that Firebase Functions are properly deployed
4. Check CORS settings if API calls fail
