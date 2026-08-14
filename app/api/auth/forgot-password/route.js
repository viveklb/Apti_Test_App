import crypto from "crypto";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const generic = { message: "If an account exists for this email, a password-reset link has been created." };
    if (!normalizedEmail) return Response.json(generic);
    await connectDB();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return Response.json(generic);
    const token = crypto.randomBytes(32).toString("hex");
    user.resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    if (process.env.NODE_ENV !== "production") return Response.json({ ...generic, resetUrl: `${new URL(request.url).origin}/reset-password?token=${token}` });
    return Response.json(generic);
  } catch (error) {
    console.error("Password reset request failed", error);
    return Response.json({ error: "Unable to start password reset. Please try again." }, { status: 500 });
  }
}
