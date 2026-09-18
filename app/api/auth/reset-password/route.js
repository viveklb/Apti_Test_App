import bcrypt from "bcryptjs";
import crypto from "crypto";
<<<<<<< HEAD
import { asDate } from "../../../../lib/firestore";
import { clearUserFields, findUserByResetToken, updateUser } from "../../../../lib/users";
=======
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (typeof password !== "string" || password.length < 6) return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    if (typeof token !== "string" || !token) return Response.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
<<<<<<< HEAD
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await findUserByResetToken(tokenHash);
    if (!user || !asDate(user.resetTokenExpires) || asDate(user.resetTokenExpires) <= new Date()) return Response.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    await updateUser(user.id, { password: await bcrypt.hash(password, 12) });
    await clearUserFields(user.id, ["sessionToken", "sessionProvider", "resetTokenHash", "resetTokenExpires"]);
=======
    await connectDB();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ resetTokenHash: tokenHash, resetTokenExpires: { $gt: new Date() } });
    if (!user) return Response.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    user.password = await bcrypt.hash(password, 12);
    user.sessionToken = undefined;
    user.sessionProvider = undefined;
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
    return Response.json({ message: "Password updated. Please log in with your new password." });
  } catch (error) {
    console.error("Password reset failed", error);
    return Response.json({ error: "Unable to reset password. Please try again." }, { status: 500 });
  }
}
