import * as XLSX from "xlsx";
import { currentUser, isAdmin } from "../../../../lib/auth";
import { adminTests, deleteTest, insertQuestions } from "../../../../lib/questions";

export const runtime = "nodejs";

const headers = ["Test Name", "Topic", "Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Test Date", "Test Time"];

function clean(value, maxLength) {
  return typeof value === "string" || typeof value === "number" ? String(value).trim().slice(0, maxLength) : "";
}

function answerIndex(value) {
  const answer = clean(value, 10).toUpperCase();
  if (/^[A-D]$/.test(answer)) return answer.charCodeAt(0) - 65;
  if (/^[1-4]$/.test(answer)) return Number(answer) - 1;
  return -1;
}

function testDate(value) {
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
  }
  const date = clean(value, 10);
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return "";
  return date;
}

function testTime(value) {
  if (typeof value === "number" && value >= 0 && value < 1) {
    const minutes = Math.floor(value * 24 * 60) % (24 * 60);
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }
  const time = clean(value, 5);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return "";
  return time;
}

async function adminUser() {
  const user = await currentUser();
  return isAdmin(user) ? user : null;
}

export async function GET() {
  try {
    if (!await adminUser()) return Response.json({ error: "Not authorized." }, { status: 403 });
    const tests = await adminTests();
    return Response.json({ tests });
  } catch (error) {
    console.error("Could not load admin tests", error);
    return Response.json({ error: "Could not load created tests." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await adminUser();
    if (!user) return Response.json({ error: "Not authorized." }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file.arrayBuffer !== "function") return Response.json({ error: "Choose an Excel .xlsx or .csv file first." }, { status: 400 });
    if (file.size > 3 * 1024 * 1024) return Response.json({ error: "The Excel file must be 3 MB or smaller." }, { status: 400 });

    const workbook = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) return Response.json({ error: "The Excel file does not contain a worksheet." }, { status: 400 });
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });
    if (!rows.length) return Response.json({ error: "The Excel file has no question rows." }, { status: 400 });

    const errors = [];
    const questions = rows.map((row, index) => {
      const missingHeaders = headers.filter((header) => !(header in row));
      if (missingHeaders.length) {
        errors.push(`Missing required column${missingHeaders.length > 1 ? "s" : ""}: ${missingHeaders.join(", ")}.`);
        return null;
      }
      const name = clean(row["Test Name"], 120);
      const topic = clean(row.Topic, 120);
      const question = clean(row.Question, 1000);
      const options = [clean(row["Option A"], 500), clean(row["Option B"], 500), clean(row["Option C"], 500), clean(row["Option D"], 500)];
      const answer = answerIndex(row["Correct Answer"]);
      const date = testDate(row["Test Date"]);
      const time = testTime(row["Test Time"]);
      if (!name || !topic || !question || options.some((option) => !option) || answer < 0 || !date || !time) errors.push(`Row ${index + 2} needs a test name, topic, question, four options, correct answer (A-D or 1-4), test date, and test time.`);
      return { testName: name, topic, question, options, answer, testDate: date, testTime: time, createdBy: user.email };
    }).filter(Boolean);

    if (errors.length) return Response.json({ error: errors.slice(0, 5).join(" ") }, { status: 400 });
    if (questions.length > 200) return Response.json({ error: "Import no more than 200 questions at one time." }, { status: 400 });

    await insertQuestions(questions);
    return Response.json({ imported: questions.length });
  } catch (error) {
    console.error("Question import failed", error);
    return Response.json({ error: "Could not import this file. Check that it is a valid .xlsx or .csv spreadsheet." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    if (!await adminUser()) return Response.json({ error: "Not authorized." }, { status: 403 });
    const { testName: name, testDate: date, testTime: time } = await request.json();
    const safeName = clean(name, 120);
    const safeDate = testDate(date);
    const safeTime = testTime(time);
    if (!safeName || !safeDate || !safeTime) return Response.json({ error: "Invalid test." }, { status: 400 });

    const removed = await deleteTest({ testName: safeName, testDate: safeDate, testTime: safeTime });
    if (!removed) return Response.json({ error: "This test no longer exists." }, { status: 404 });
    return Response.json({ removed });
  } catch (error) {
    console.error("Could not remove test", error);
    return Response.json({ error: "Could not remove this test." }, { status: 500 });
  }
}
