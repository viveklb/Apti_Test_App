import { cookies } from "next/headers";
import crypto from "crypto";
import connectDB from "./mongodb";
import User from "../models/User";

export function newSessionToken() { return crypto.randomBytes(32).toString("hex"); }
export async function currentUser() {
  const token = (await cookies()).get("apptitude_session")?.value;
  if (!token) return null;
  await connectDB();
  return User.findOne({ sessionToken: token });
}
export async function setSession(token) { (await cookies()).set("apptitude_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" }); }
