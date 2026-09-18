<<<<<<< HEAD
import { getAuth } from "firebase-admin/auth";
import { newSessionToken, publicUser, setSession } from "../../../../lib/auth";
import { getFirebaseAdminApp } from "../../../../lib/firestore";
import { createUser, findUserByEmail, findUserByGoogleId, updateUser } from "../../../../lib/users";
=======
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { newSessionToken, publicUser, setSession } from "../../../../lib/auth";
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { idToken } = await request.json();
<<<<<<< HEAD
    if (typeof idToken !== "string" || !idToken) {
      return Response.json({ error: "Google sign-in could not be verified." }, { status: 400 });
    }
    const googleUser = await getAuth(getFirebaseAdminApp()).verifyIdToken(idToken);
    if (!googleUser?.uid || !googleUser?.email || googleUser.firebase?.sign_in_provider !== "google.com") {
=======
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (typeof idToken !== "string" || !idToken) {
      return Response.json({ error: "Google sign-in could not be verified." }, { status: 400 });
    }
    if (!apiKey) {
      return Response.json({ error: "Google sign-in is not configured on the server." }, { status: 500 });
    }

    const verification = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store"
    });
    const payload = await verification.json();
    const googleUser = payload?.users?.[0];
    const signedInWithGoogle = googleUser?.providerUserInfo?.some(({ providerId }) => providerId === "google.com");
    if (!verification.ok || !googleUser?.localId || !googleUser?.email || !signedInWithGoogle) {
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
      return Response.json({ error: "Google sign-in could not be verified." }, { status: 401 });
    }

    const email = googleUser.email.trim().toLowerCase();
<<<<<<< HEAD
    const name = googleUser.name?.trim() || email.split("@")[0];
    const [userForGoogleId, userForEmail] = await Promise.all([
      findUserByGoogleId(googleUser.uid),
      findUserByEmail(email)
    ]);
    if (userForGoogleId && userForEmail && userForGoogleId.id !== userForEmail.id) {
      return Response.json({ error: "This Google account is linked to a different student account." }, { status: 409 });
    }

    const token = newSessionToken();
    const existingUser = userForGoogleId || userForEmail;
    const user = existingUser
      ? await updateUser(existingUser.id, { googleId: googleUser.uid, sessionToken: token, sessionProvider: "google" })
      : await createUser({ name, email, googleId: googleUser.uid, sessionToken: token, sessionProvider: "google" });
=======
    const name = googleUser.displayName?.trim() || email.split("@")[0];
    await connectDB();
    const [userForGoogleId, userForEmail] = await Promise.all([
      User.findOne({ googleId: googleUser.localId }),
      User.findOne({ email })
    ]);
    if (userForGoogleId && userForEmail && String(userForGoogleId._id) !== String(userForEmail._id)) {
      return Response.json({ error: "This Google account is linked to a different student account." }, { status: 409 });
    }

    const user = userForGoogleId || userForEmail || new User({ name, email, googleId: googleUser.localId });
    if (!user.googleId) user.googleId = googleUser.localId;
    const token = newSessionToken();
    user.sessionToken = token;
    user.sessionProvider = "google";
    await user.save();
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
    await setSession(token);
    return Response.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Google sign-in failed", error);
<<<<<<< HEAD
    if (typeof error?.code === "string" && error.code.startsWith("auth/")) {
      return Response.json({ error: "Google sign-in could not be verified." }, { status: 401 });
    }
    if (["ETIMEOUT", "ENOTFOUND", "ECONNREFUSED"].includes(error?.code)) {
      return Response.json({ error: "Google verified your account, but the app cannot reach Firestore. Check your Firebase configuration and network connection." }, { status: 503 });
=======
    if (["ETIMEOUT", "ENOTFOUND", "ECONNREFUSED"].includes(error?.code)) {
      return Response.json({ error: "Google verified your account, but the app cannot reach MongoDB Atlas. Check Atlas Network Access and your internet/DNS connection." }, { status: 503 });
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
    }
    return Response.json({ error: "Google sign-in is unavailable. Please try again." }, { status: 500 });
  }
}
