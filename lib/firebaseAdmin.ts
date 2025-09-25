// lib/firebaseAdmin.ts
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const credsRaw = process.env.FIREBASE_CREDENTIALS;
  if (!credsRaw) {
    throw new Error("FIREBASE_CREDENTIALS no definida en .env");
  }
  const serviceAccount = JSON.parse(credsRaw);
  initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = getAuth();
export const adminDB = getFirestore();
