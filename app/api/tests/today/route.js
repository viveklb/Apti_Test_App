import { currentUser } from "../../../../lib/auth";
<<<<<<< HEAD
import { questionsForDate } from "../../../../lib/questions";
import { completedTestsForUser } from "../../../../lib/results";
=======
import connectDB from "../../../../lib/mongodb";
import Question from "../../../../models/Question";
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request) {
  try {
<<<<<<< HEAD
    const user = await currentUser();
    if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
    const date = new URL(request.url).searchParams.get("date") || todayUtc();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "Invalid test date." }, { status: 400 });

    const [questions, completed] = await Promise.all([questionsForDate(date), completedTestsForUser(user.id)]);
=======
    if (!await currentUser()) return Response.json({ error: "Please log in." }, { status: 401 });
    const date = new URL(request.url).searchParams.get("date") || todayUtc();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "Invalid test date." }, { status: 400 });

    await connectDB();
    const questions = await Question.find({ testDate: date }).sort({ testTime: 1, testName: 1, topic: 1, createdAt: 1 }).select("testName topic question options answer testDate testTime").lean();
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
    const tests = new Map();
    for (const question of questions) {
      const testName = question.testName || question.topic;
      const key = `${testName}\u0000${question.testDate}\u0000${question.testTime}`;
<<<<<<< HEAD
      const scheduledAt = Date.parse(`${question.testDate}T${question.testTime}:00Z`);
      const completedLegacyTest = completed.legacyResults.some((result) => result.topic === testName && Math.abs(result.scheduledAt - scheduledAt) <= 14 * 60 * 60 * 1000);
      if (completed.exactKeys.has(key) || completedLegacyTest) continue;
=======
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
      if (!tests.has(key)) tests.set(key, { testName, testDate: question.testDate, testTime: question.testTime, questions: [] });
      tests.get(key).questions.push({ question: question.question, options: question.options, answer: question.answer });
    }
    return Response.json({ tests: [...tests.values()] });
  } catch (error) {
    console.error("Could not load today's tests", error);
    return Response.json({ error: "Could not load today's test." }, { status: 500 });
  }
}
