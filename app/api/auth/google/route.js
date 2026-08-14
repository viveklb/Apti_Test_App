import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { newSessionToken, setSession } from "../../../../lib/auth";

export const runtime = "nodejs";

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

export async function POST(request) {
  try {
    const { idToken } = await request.json();
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
      return Response.json({ error: "Google sign-in could not be verified." }, { status: 401 });
    }

    const email = googleUser.email.trim().toLowerCase();
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
    await user.save();
    await setSession(token);
    return Response.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Google sign-in failed", error);
    return Response.json({ error: "Google sign-in is unavailable. Please try again." }, { status: 500 });
  }
}
