import { currentUser } from "../../../../lib/auth";
import { questionsForDate } from "../../../../lib/questions";
import { completedTestsForUser } from "../../../../lib/results";

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request) {
  try {
    const user = await currentUser();
    if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
    const date = new URL(request.url).searchParams.get("date") || todayUtc();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "Invalid test date." }, { status: 400 });

    const [questions, completed] = await Promise.all([questionsForDate(date), completedTestsForUser(user.id)]);
    const tests = new Map();
    for (const question of questions) {
      const testName = question.testName || question.topic;
      const key = `${testName}\u0000${question.testDate}\u0000${question.testTime}`;
      const scheduledAt = Date.parse(`${question.testDate}T${question.testTime}:00Z`);
      const completedLegacyTest = completed.legacyResults.some((result) => result.topic === testName && Math.abs(result.scheduledAt - scheduledAt) <= 14 * 60 * 60 * 1000);
      if (completed.exactKeys.has(key) || completedLegacyTest) continue;
      if (!tests.has(key)) tests.set(key, { testName, testDate: question.testDate, testTime: question.testTime, questions: [] });
      tests.get(key).questions.push({ question: question.question, options: question.options, answer: question.answer });
    }
    return Response.json({ tests: [...tests.values()] });
  } catch (error) {
    console.error("Could not load today's tests", error);
    return Response.json({ error: "Could not load today's test." }, { status: 500 });
  }
}
