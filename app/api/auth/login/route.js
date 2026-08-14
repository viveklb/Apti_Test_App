import bcrypt from "bcryptjs";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { newSessionToken, setSession } from "../../../../lib/auth";

export async function POST(request) {
  try { const { email, password } = await request.json(); await connectDB(); const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    if (!user.password) return Response.json({ error: "This account uses Google sign-in. Continue with Google instead." }, { status: 401 });
    if (!(await bcrypt.compare(password || "", user.password))) return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    const token = newSessionToken(); user.sessionToken = token; await user.save(); await setSession(token);
    return Response.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch { return Response.json({ error: "Could not log in. Check your MongoDB connection." }, { status: 500 }); }
}
