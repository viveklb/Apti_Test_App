import "server-only";

import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function normalizePrivateKey(value) {
  if (!value) return "";
  const key = value.replace(/\\n/g, "\n").trim();
  if (key.startsWith("-----BEGIN PRIVATE KEY-----")) return key;

  const body = key.replace(/\s/g, "");
  if (body.length >= 500 && /^[A-Za-z0-9+/=]+$/.test(body)) {
    const lines = body.match(/.{1,64}/g)?.join("\n") || body;
    return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----\n`;
  }
  return key;
}

function adminOptions() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if ((clientEmail && !privateKey) || (!clientEmail && privateKey)) {
    throw new Error("FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be configured together.");
  }

  if (clientEmail && privateKey) {
    if (!projectId || privateKey.length < 500 || !privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
      throw new Error("Replace the placeholder Firebase Admin values in .env.local with credentials from a Firebase service-account key.");
    }
    return { projectId, credential: cert({ projectId, clientEmail, privateKey }) };
  }

  return { projectId, credential: applicationDefault() };
}

export function getFirebaseAdminApp() {
  return getApps()[0] || initializeApp(adminOptions());
}

export function getDb() {
  return getFirestore(getFirebaseAdminApp());
}

export function asDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
