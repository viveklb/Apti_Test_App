import bcrypt from "bcryptjs";
import { newSessionToken, publicUser, setSession } from "../../../../lib/auth";
import { createUser, findUserByEmail, isAlreadyExistsError } from "../../../../lib/users";

export async function POST(request) {
  try { const { name, email, password } = await request.json();
    if (!name?.trim() || !email || !password || password.length < 6) return Response.json({ error: "Enter a name, valid email and a password of at least 6 characters." }, { status: 400 });
    const normalizedEmail = email.trim().toLowerCase();
    if (await findUserByEmail(normalizedEmail)) return Response.json({ error: "An account already exists for this email." }, { status: 409 });
    const token = newSessionToken(); const user = await createUser({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), sessionToken: token, sessionProvider: "password" }); await setSession(token);
    return Response.json({ user: publicUser(user) });
  } catch (error) {
    if (isAlreadyExistsError(error)) return Response.json({ error: "An account already exists for this email." }, { status: 409 });
    console.error("Account creation failed", error);
    return Response.json({ error: "Could not create account. Check your Firestore configuration." }, { status: 500 });
  }
}
