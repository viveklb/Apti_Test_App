import { currentUser, isAdmin } from "../../../../lib/auth";
import { practiceQuestions } from "../../../../lib/questions";

export const runtime = "nodejs";

function cleanQuestions(value, expectedCount) {
  if (!Array.isArray(value) || value.length !== expectedCount) return null;
  const questions = value.map((item) => ({
    question: typeof item?.question === "string" ? item.question.trim() : "",
    options: Array.isArray(item?.options) ? item.options.map((option) => typeof option === "string" ? option.trim() : "") : [],
    answer: Number(item?.answer)
  }));
  const valid = questions.every((item) => item.question && item.options.length === 4 && item.options.every(Boolean) && Number.isInteger(item.answer) && item.answer >= 0 && item.answer <= 3);
  return valid ? questions : null;
}

function extractJson(content) {
  const cleaned = String(content || "").replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
}

export async function POST(request) {
  try {
    const user = await currentUser();
    if (!user) return Response.json({ error: "Please log in to generate questions." }, { status: 401 });
    if (!isAdmin(user)) return Response.json({ error: "Question generation is available to administrators only." }, { status: 403 });
    const { topic, count } = await request.json();
    const safeTopic = typeof topic === "string" ? topic.trim().slice(0, 120) : "";
    const safeCount = Number(count);
    if (!safeTopic) return Response.json({ error: "Enter a topic for your practice set." }, { status: 400 });
    if (![10, 20, 50].includes(safeCount)) return Response.json({ error: "Choose 10, 20, or 50 questions." }, { status: 400 });
    const importedQuestions = await practiceQuestions(safeTopic, safeCount);
    const savedQuestions = importedQuestions.map(({ question, options, answer }) => ({ question, options, answer }));
    if (savedQuestions.length === safeCount) return Response.json({ questions: savedQuestions, source: "library" });
    if (!process.env.NVIDIA_API_KEY) return Response.json({ error: "NVIDIA_API_KEY is missing. Add it to .env.local, then restart the server." }, { status: 503 });

    const generatedCount = safeCount - savedQuestions.length;
    const prompt = `Create exactly ${generatedCount} accessible multiple-choice aptitude questions about "${safeTopic}" for students. Use clear, age-appropriate language and vary the difficulty from easy to medium. Write every mathematical expression as LaTeX enclosed in dollar delimiters, including expressions inside options (for example, $2^3 \\times 5$, $\\frac{3}{4}$, and $x^2 + 2x + 1$). Escape LaTeX backslashes correctly inside JSON strings. Return ONLY a valid JSON array with this exact shape: [{"question":"...","options":["option 1","option 2","option 3","option 4"],"answer":0}]. The answer field is the zero-based index of the correct option. Do not include explanations, duplicate questions, Markdown outside the LaTeX dollar delimiters, or extra keys.`;
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        model: process.env.NEMOTRON_MODEL || "nvidia/nemotron-3-nano-30b-a3b",
        messages: [
          { role: "system", content: "You generate accurate, accessible student quiz questions. Output JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.35,
        top_p: 0.9,
        max_tokens: Math.min(12000, generatedCount * 220),
        stream: false
      }),
      cache: "no-store"
    });
    if (!response.ok) {
      console.error("Nemotron API error", response.status, (await response.text()).slice(0, 300));
      return Response.json({ error: "Nemotron could not generate questions. Check your NVIDIA API key and model access." }, { status: 502 });
    }
    const data = await response.json();
    const generatedQuestions = cleanQuestions(extractJson(data?.choices?.[0]?.message?.content), generatedCount);
    if (!generatedQuestions) return Response.json({ error: "Nemotron returned an invalid question set. Please try again." }, { status: 502 });
    return Response.json({ questions: [...savedQuestions, ...generatedQuestions], source: savedQuestions.length ? "library-and-ai" : "ai" });
  } catch (error) {
    console.error("Question generation failed", error);
    return Response.json({ error: "Unable to generate questions right now. Please try again." }, { status: 500 });
  }
}
