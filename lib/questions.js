import "server-only";

import { getDb, asDate } from "./firestore";

function questions() {
  return getDb().collection("questions");
}

function fromSnapshot(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

function timestamp(value) {
  return asDate(value)?.getTime() || 0;
}

export async function questionsForDate(date) {
  const snapshot = await questions().where("testDate", "==", date).get();
  return snapshot.docs.map(fromSnapshot).sort((a, b) =>
    a.testTime.localeCompare(b.testTime) ||
    (a.testName || a.topic).localeCompare(b.testName || b.topic) ||
    a.topic.localeCompare(b.topic) ||
    timestamp(a.createdAt) - timestamp(b.createdAt)
  );
}

export async function practiceQuestions(topic, count) {
  const normalizedTopic = topic.toLocaleLowerCase();
  const [normalized, exact] = await Promise.all([
    questions().where("topicNormalized", "==", normalizedTopic).limit(250).get(),
    questions().where("topic", "==", topic).limit(250).get()
  ]);
  const unique = new Map([...normalized.docs, ...exact.docs].map((doc) => [doc.id, fromSnapshot(doc)]));
  const matches = [...unique.values()].filter((question) => !question.testDate);

  for (let index = matches.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [matches[index], matches[randomIndex]] = [matches[randomIndex], matches[index]];
  }
  return matches.slice(0, count);
}

export async function adminTests() {
  const snapshot = await questions()
    .where("testDate", ">=", "0000-00-00")
    .orderBy("testDate", "desc")
    .limit(5000)
    .get();
  const groups = new Map();

  for (const doc of snapshot.docs) {
    const question = fromSnapshot(doc);
    const testName = question.testName || question.topic;
    const key = `${testName}\u0000${question.testDate}\u0000${question.testTime}`;
    const createdAt = asDate(question.createdAt);
    const current = groups.get(key);
    if (!current) {
      groups.set(key, { testName, testDate: question.testDate, testTime: question.testTime, questionCount: 1, createdAt });
    } else {
      current.questionCount += 1;
      if (timestamp(createdAt) > timestamp(current.createdAt)) current.createdAt = createdAt;
    }
  }

  return [...groups.values()]
    .sort((a, b) => b.testDate.localeCompare(a.testDate) || b.testTime.localeCompare(a.testTime) || timestamp(b.createdAt) - timestamp(a.createdAt))
    .slice(0, 100);
}

export async function insertQuestions(items) {
  const batch = getDb().batch();
  const now = new Date();
  for (const item of items) {
    const reference = questions().doc();
    batch.set(reference, {
      ...item,
      topicNormalized: item.topic.toLocaleLowerCase(),
      isScheduled: Boolean(item.testDate),
      createdAt: now,
      updatedAt: now
    });
  }
  await batch.commit();
}

export async function deleteTest({ testName, testDate, testTime }) {
  const snapshot = await questions().where("testDate", "==", testDate).get();
  const matches = snapshot.docs.filter((doc) => {
    const question = doc.data();
    return question.testTime === testTime && (question.testName === testName || (!question.testName && question.topic === testName));
  });

  for (let offset = 0; offset < matches.length; offset += 500) {
    const batch = getDb().batch();
    for (const doc of matches.slice(offset, offset + 500)) batch.delete(doc.ref);
    await batch.commit();
  }
  return matches.length;
}
