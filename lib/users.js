import "server-only";

import crypto from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "./firestore";

function users() {
  return getDb().collection("users");
}

function fromSnapshot(snapshot) {
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
}

function userIdForEmail(email) {
  return crypto.createHash("sha256").update(email).digest("hex");
}

export async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const direct = await users().doc(userIdForEmail(normalizedEmail)).get();
  if (direct.exists) return fromSnapshot(direct);

  const snapshot = await users().where("email", "==", normalizedEmail).limit(1).get();
  return snapshot.empty ? null : fromSnapshot(snapshot.docs[0]);
}

export async function findUserByGoogleId(googleId) {
  const snapshot = await users().where("googleId", "==", googleId).limit(1).get();
  return snapshot.empty ? null : fromSnapshot(snapshot.docs[0]);
}

export async function findUserBySessionToken(sessionToken) {
  const snapshot = await users().where("sessionToken", "==", sessionToken).limit(1).get();
  return snapshot.empty ? null : fromSnapshot(snapshot.docs[0]);
}

export async function findUserByResetToken(resetTokenHash) {
  const snapshot = await users().where("resetTokenHash", "==", resetTokenHash).limit(1).get();
  return snapshot.empty ? null : fromSnapshot(snapshot.docs[0]);
}

export async function createUser(data) {
  const now = new Date();
  const id = userIdForEmail(data.email);
  await users().doc(id).create({ ...data, createdAt: now, updatedAt: now });
  return { id, ...data, createdAt: now, updatedAt: now };
}

export async function updateUser(id, changes) {
  await users().doc(id).update({ ...changes, updatedAt: new Date() });
  const updated = await users().doc(id).get();
  return fromSnapshot(updated);
}

export async function clearUserFields(id, fields) {
  const changes = Object.fromEntries(fields.map((field) => [field, FieldValue.delete()]));
  return updateUser(id, changes);
}

export function isAlreadyExistsError(error) {
  return error?.code === 6 || error?.code === "already-exists";
}
