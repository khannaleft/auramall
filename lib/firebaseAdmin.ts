/// <reference types="node" />
import admin from 'firebase-admin';

// This configuration assumes that the Firebase Admin SDK credentials are set
// in the server's environment variables (e.g., GOOGLE_APPLICATION_CREDENTIALS or
// a base64 encoded FIREBASE_SERVICE_ACCOUNT_JSON). This is a secure practice
// for production environments like Vercel or Google Cloud.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8'))
  : null;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: serviceAccount ? admin.credential.cert(serviceAccount) : undefined,
    });
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
}

export const db = admin.firestore();