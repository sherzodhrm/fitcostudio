# 📱 Mobile Deployment Guide (Android & iOS)

This application is ready to be converted into a native mobile app for the **Google Play Store** and **Apple App Store** using **Capacitor**.

## Prerequisites
1. **Android Studio** (for Play Store)
2. **Xcode** (for App Store - requires a Mac)
3. **Node.js** installed locally

## Steps to Build for Mobile

### 1. Build the Web Project
First, create a production build of the web application:
```bash
npm run build
```

### 2. Initialize Platforms
Add the mobile platforms you want to target:
```bash
# For Android
npx cap add android

# For iOS
npx cap add ios
```

### 3. Sync the Web Build
Every time you make a change and run `npm run build`, you must sync the files to the mobile platforms:
```bash
npx cap copy
```

### 4. Open in IDEs
To compile and sign the apps for the stores:
```bash
# Opens Android Studio
npx cap open android

# Opens Xcode
npx cap open ios
```

## Production Checklist
*   **Icon & Splash:** Replace the files in `android/app/src/main/res` and `ios/App/App/Assets.xcassets` with your custom logo.
*   **Keystore:** In Android Studio, use `Build > Generate Signed Bundle / APK` to create your production key.
*   **App Store Connect:** Create an app record at [appstoreconnect.apple.com](https://appstoreconnect.apple.com).
*   **Google Play Console:** Create a developer account at [play.google.com/console](https://play.google.com/console).

## Payment Integration (Payme/Click)
For native mobile apps, you should replace the web-based Stripe/Payme buttons with the native SDKs for the best user experience. 
*   **Payme Android SDK:** [Payme Documentation](https://help.payme.uz/)
*   **Click SDK:** [Click Documentation](https://click.uz/)

*Note: Since Stripe is not natively supported in Uzbekistan for local merchants yet, direct integration with Payme/Click APIs is the recommended path for production in UZ.*
