import crypto from "crypto";
<<<<<<< HEAD
import { findUserByEmail, updateUser } from "../../../../lib/users";
=======
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const generic = { message: "If an account exists for this email, a password-reset link has been created." };
    if (!normalizedEmail) return Response.json(generic);
<<<<<<< HEAD
    const user = await findUserByEmail(normalizedEmail);
    if (!user) return Response.json(generic);
    const token = crypto.randomBytes(32).toString("hex");
    await updateUser(user.id, {
      resetTokenHash: crypto.createHash("sha256").update(token).digest("hex"),
      resetTokenExpires: new Date(Date.now() + 30 * 60 * 1000)
    });
=======
    await connectDB();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return Response.json(generic);
    const token = crypto.randomBytes(32).toString("hex");
    user.resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
    if (process.env.NODE_ENV !== "production") return Response.json({ ...generic, resetUrl: `${new URL(request.url).origin}/reset-password?token=${token}` });
    return Response.json(generic);
  } catch (error) {
    console.error("Password reset request failed", error);
    return Response.json({ error: "Unable to start password reset. Please try again." }, { status: 500 });
  }
}
