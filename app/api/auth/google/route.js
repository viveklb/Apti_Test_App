import { getAuth } from "firebase-admin/auth";
import { newSessionToken, publicUser, setSession } from "../../../../lib/auth";
import { getFirebaseAdminApp } from "../../../../lib/firestore";
import { createUser, findUserByEmail, findUserByGoogleId, updateUser } from "../../../../lib/users";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (typeof idToken !== "string" || !idToken) {
      return Response.json({ error: "Google sign-in could not be verified." }, { status: 400 });
    }
    const googleUser = await getAuth(getFirebaseAdminApp()).verifyIdToken(idToken);
    if (!googleUser?.uid || !googleUser?.email || googleUser.firebase?.sign_in_provider !== "google.com") {
      return Response.json({ error: "Google sign-in could not be verified." }, { status: 401 });
    }

    const email = googleUser.email.trim().toLowerCase();
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
    await setSession(token);
    return Response.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Google sign-in failed", error);
    if (typeof error?.code === "string" && error.code.startsWith("auth/")) {
      return Response.json({ error: "Google sign-in could not be verified." }, { status: 401 });
    }
    if (["ETIMEOUT", "ENOTFOUND", "ECONNREFUSED"].includes(error?.code)) {
      return Response.json({ error: "Google verified your account, but the app cannot reach Firestore. Check your Firebase configuration and network connection." }, { status: 503 });
    }
    return Response.json({ error: "Google sign-in is unavailable. Please try again." }, { status: 500 });
  }
}
