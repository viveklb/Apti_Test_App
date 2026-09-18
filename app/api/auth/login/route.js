import bcrypt from "bcryptjs";
<<<<<<< HEAD
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
=======
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { newSessionToken, publicUser, setSession } from "../../../../lib/auth";

export async function POST(request) {
  try { const { email, password } = await request.json(); await connectDB(); const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    if (!user.password) return Response.json({ error: "This account uses Google sign-in. Continue with Google instead." }, { status: 401 });
    if (!(await bcrypt.compare(password || "", user.password))) return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    const token = newSessionToken(); user.sessionToken = token; user.sessionProvider = "password"; await user.save(); await setSession(token);
    return Response.json({ user: publicUser(user) });
  } catch { return Response.json({ error: "Could not log in. Check your MongoDB connection." }, { status: 500 }); }
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
}
