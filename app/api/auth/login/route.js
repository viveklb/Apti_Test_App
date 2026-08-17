import bcrypt from "bcryptjs";
import { newSessionToken, publicUser, setSession } from "../../../../lib/auth";
import { findUserByEmail, updateUser } from "../../../../lib/users";

export async function POST(request) {
  try { const { email, password } = await request.json(); const user = email ? await findUserByEmail(email) : null;
    if (!user) return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    if (!user.password) return Response.json({ error: "This account uses Google sign-in. Continue with Google instead." }, { status: 401 });
    if (!(await bcrypt.compare(password || "", user.password))) return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    const token = newSessionToken(); const updatedUser = await updateUser(user.id, { sessionToken: token, sessionProvider: "password" }); await setSession(token);
    return Response.json({ user: publicUser(updatedUser) });
  } catch (error) { console.error("Login failed", error); return Response.json({ error: "Could not log in. Check your Firestore configuration." }, { status: 500 }); }
}
