import "server-only";

import { getDb, asDate } from "./firestore";

function results() {
  return getDb().collection("results");
}

export async function saveResult(user, result) {
  await results().add({
    ...result,
    userId: user.id,
    studentName: user.name,
    studentEmail: user.email,
    completedAt: new Date()
  });
}

export async function completedTestsForUser(userId) {
  const snapshot = await results().where("userId", "==", userId).limit(2000).get();
  const exactKeys = new Set();
  const legacyResults = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.testName && data.testDate && data.testTime) {
      exactKeys.add(`${data.testName}\u0000${data.testDate}\u0000${data.testTime}`);
      continue;
    }

    const scheduledFor = asDate(data.scheduledFor);
    if (data.topic && scheduledFor) legacyResults.push({ topic: data.topic, scheduledAt: scheduledFor.getTime() });
  }

  return { exactKeys, legacyResults };
}

export async function listResults(range) {
  let query = results();
  if (range) query = query.where("completedAt", ">=", range.start).where("completedAt", "<", range.end);
  const snapshot = await query.orderBy("completedAt", "desc").limit(1000).get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      topic: data.topic,
      score: data.score,
      total: data.total,
      scheduledFor: asDate(data.scheduledFor)?.toISOString() || null,
      completedAt: asDate(data.completedAt)?.toISOString() || null
    };
  });
}
