# 🌐 Custom Domain Setup: fitcostudio.org

To connect your domain **fitcostudio.org** to this application, follow these steps in your Google Cloud or Firebase account.

## Option A: Using Google Cloud Run (Current Setup)
Since your app is currently hosted on Cloud Run, follow these steps:

1.  **Google Cloud Console:** Go to the [Cloud Run Console](https://console.cloud.google.com/run).
2.  **Select Service:** Click on the name of your service (the one used for this app).
3.  **Manage Custom Domains:** Click on the **"Manage Custom Domains"** button in the top toolbar.
4.  **Add Mapping:** 
    *   Click **"Add Mapping"**.
    *   Select your verified domain (`fitcostudio.org`).
    *   Set the sub-domain (blank for root, or `www`).
5.  **DNS Verification:** Google will provide you with **A** or **AAAA** records.
6.  **Google Domains:** Go to [Google Domains](https://domains.google.com/), find `fitcostudio.org`, and add the DNS records provided in step 5.
7.  **SSL:** Once DNS propagates, Google Cloud will automatically provision an SSL certificate for you.

---

## Option B: Using Firebase Hosting (Highly Recommended)
Since you are already using Firebase and Firestore, Firebase Hosting is the easiest way to manage custom domains.

1.  **Firebase Console:** Go to [Hosting](https://console.firebase.google.com/project/_/hosting/main).
2.  **Add Custom Domain:** Click **"Add Custom Domain"**.
3.  **Enter Domain:** Type `fitcostudio.org`.
4.  **Verify Ownership:** Firebase will provide a **TXT** record. Add this to your Google Domains DNS settings.
5.  **Setup Records:** After verification, Firebase will provide **A** records. Replace old A records in Google Domains with these.
6.  **Deploy:** Run `npm run build && firebase deploy --only hosting` (requires firebase-tools installed locally).

---

## Google Domains Specifics
For Google Domains, you typically need to:
1. Navigate to **DNS** tab.
2. Scroll to **Custom resource records**.
3. Add the **A** records or **CNAME** provided by the hosting provider.
4. Set **TTL** to 1H (3600).

*Note: DNS propagation can take from 5 minutes up to 48 hours.*
