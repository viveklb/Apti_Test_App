import { currentUser, isAdmin } from "../../../../lib/auth";
<<<<<<< HEAD
import { listResults } from "../../../../lib/results";
=======
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952

function dateRange(date) {
  if (!date) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  const start = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== date) return undefined;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

<<<<<<< HEAD
=======
async function getResults(date) {
  const range = dateRange(date);
  if (range === undefined) throw new Error("Invalid date.");
  const match = range ? { "results.completedAt": { $gte: range.start, $lt: range.end } } : {};
  return User.aggregate([
    { $unwind: "$results" },
    { $match: match },
    { $project: { _id: 0, studentName: "$name", studentEmail: "$email", topic: "$results.topic", score: "$results.score", total: "$results.total", scheduledFor: "$results.scheduledFor", completedAt: "$results.completedAt" } },
    { $sort: { completedAt: -1, studentName: 1 } },
    { $limit: 1000 }
  ]);
}

>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
export async function GET(request) {
  try {
    if (!isAdmin(await currentUser())) return Response.json({ error: "Not authorized." }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || "";
    const format = searchParams.get("format");
<<<<<<< HEAD
    const range = dateRange(date);
    if (range === undefined) throw new Error("Invalid date.");
    const results = await listResults(range);
=======
    await connectDB();
    const results = await getResults(date);
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952

    if (format === "csv") {
      const rows = [["Date", "Time", "Student", "Email", "Test", "Score", "Total", "Percentage"]];
      for (const result of results) {
        const completedAt = new Date(result.completedAt);
        rows.push([
          completedAt.toISOString().slice(0, 10),
          completedAt.toISOString().slice(11, 16),
          result.studentName,
          result.studentEmail,
          result.topic || "Practice set",
          result.score,
          result.total,
          result.total ? `${Math.round((result.score / result.total) * 100)}%` : ""
        ]);
      }
      const fileName = `apptitude-results-${date || "all"}.csv`;
      const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
      return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName}"` } });
    }

    return Response.json({ results });
  } catch (error) {
    console.error("Could not load results", error);
    return Response.json({ error: error.message === "Invalid date." ? error.message : "Could not load results." }, { status: 500 });
  }
}
