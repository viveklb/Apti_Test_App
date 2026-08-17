import { cookies } from "next/headers";
import crypto from "crypto";
import { findUserBySessionToken } from "./users";

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "tpoffice.nbnscoe@gmail.com").trim().toLowerCase();

export function newSessionToken() { return crypto.randomBytes(32).toString("hex"); }
export function isAdmin(user) { return user?.email?.toLowerCase() === ADMIN_EMAIL && user?.sessionProvider === "google"; }
export function publicUser(user) { return { id: user.id, name: user.name, email: user.email, isAdmin: isAdmin(user) }; }
export async function currentUser() {
  const token = (await cookies()).get("apptitude_session")?.value;
  if (!token) return null;
  return findUserBySessionToken(token);
}
export async function setSession(token) { (await cookies()).set("apptitude_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" }); }
