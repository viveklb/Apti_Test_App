"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
<<<<<<< HEAD
import { browserPopupRedirectResolver, getAuth, inMemoryPersistence, initializeAuth } from "firebase/auth";
=======
import { getAuth } from "firebase/auth";
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

<<<<<<< HEAD
let firebaseAuth;

=======
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
export function getFirebaseAuth() {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Google sign-in is not configured yet.");
  }

<<<<<<< HEAD
  if (firebaseAuth) return firebaseAuth;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  try {
    firebaseAuth = initializeAuth(app, {
      persistence: inMemoryPersistence,
      popupRedirectResolver: browserPopupRedirectResolver
    });
  } catch (error) {
    if (error?.code === "auth/already-initialized") firebaseAuth = getAuth(app);
    else throw error;
  }
  return firebaseAuth;
=======
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
}
