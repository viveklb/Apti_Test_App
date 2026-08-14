import bcrypt from "bcryptjs";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { newSessionToken, publicUser, setSession } from "../../../../lib/auth";

export async function POST(request) {
  try { const { name, email, password } = await request.json();
    if (!name?.trim() || !email || !password || password.length < 6) return Response.json({ error: "Enter a name, valid email and a password of at least 6 characters." }, { status: 400 });
    await connectDB(); if (await User.findOne({ email: email.toLowerCase() })) return Response.json({ error: "An account already exists for this email." }, { status: 409 });
    const token = newSessionToken(); const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password: await bcrypt.hash(password, 12), sessionToken: token, sessionProvider: "password" }); await setSession(token);
    return Response.json({ user: publicUser(user) });
  } catch { return Response.json({ error: "Could not create account. Check your MongoDB connection." }, { status: 500 }); }
}
