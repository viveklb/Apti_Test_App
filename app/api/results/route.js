import { currentUser } from "../../../lib/auth";

export async function POST(request) {
  try {
    const user = await currentUser();
    if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
    const { score, total, topic, questionCount, scheduledFor } = await request.json();
    if (!Number.isInteger(score) || !Number.isInteger(total) || score < 0 || score > total) return Response.json({ error: "Invalid result." }, { status: 400 });

    const result = { score, total };
    if (topic !== undefined) {
      if (typeof topic !== "string" || !topic.trim()) return Response.json({ error: "Invalid topic." }, { status: 400 });
      result.topic = topic.trim().slice(0, 120);
    }
    if (questionCount !== undefined) {
      if (!Number.isInteger(questionCount) || questionCount !== total) return Response.json({ error: "Invalid question count." }, { status: 400 });
      result.questionCount = questionCount;
    }
    if (scheduledFor !== undefined) {
      const date = new Date(scheduledFor);
      if (Number.isNaN(date.getTime())) return Response.json({ error: "Invalid practice date or time." }, { status: 400 });
      result.scheduledFor = date;
    }
    user.results.push(result);
    await user.save();
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Could not save result." }, { status: 500 }); }
}
