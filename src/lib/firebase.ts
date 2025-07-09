// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

// Helper to ensure the database URL is sanitized
const getSanitizedDbUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;

  let sanitizedUrl = url.trim();

  // Ensure it has a protocol if it's a Firebase URL, as the URL constructor requires it.
  if (
    (sanitizedUrl.includes('firebaseio.com') || sanitizedUrl.includes('firebasedatabase.app')) 
    && !sanitizedUrl.startsWith('http')
  ) {
    sanitizedUrl = 'https://' + sanitizedUrl;
  }
  
  // Use the URL constructor to reliably strip any path.
  try {
    const urlObject = new URL(sanitizedUrl);
    // Reconstruct to be safe: protocol + hostname
    return `${urlObject.protocol}//${urlObject.hostname}`;
  } catch (error) {
    // If it's still not a valid URL, Firebase will throw an error, 
    // but this prevents our sanitizer from crashing.
    console.warn(`Could not parse the provided Firebase Database URL: "${url}". Returning it as-is.`);
    return url;
  }
};


// Your web app's Firebase configuration
// IMPORTANT: Replace with your project's configuration
// and store them in a .env file.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: getSanitizedDbUrl(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let database: Database | null = null;

// Check if the essential Firebase config is present
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.databaseURL &&
  !!firebaseConfig.projectId;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    database = getDatabase(app);
  } catch (error) {
    console.error('FIREBASE INITIALIZATION ERROR:', error);
  }
} else {
  console.warn(
    'Firebase configuration is incomplete. Please check your .env.local file. All Firebase-related functionality will be disabled.'
  );
}


export { app, database };
