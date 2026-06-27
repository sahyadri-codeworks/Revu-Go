import { getMCQQuestions } from "@/lib/mcq-templates";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    industrySegment,
    subIndustry,
    businessName,
    businessDescription,
    servicesOffered,
    staffInfo,
    businessHighlights,
  } = body;

  const hasProfile = businessDescription || servicesOffered || staffInfo || businessHighlights;

  if (!GROQ_API_KEY || !hasProfile) {
    const fallback = getMCQQuestions(industrySegment, subIndustry);
    return Response.json({ questions: fallback, source: "template" });
  }

  try {
    const prompt = `You are a customer feedback expert. Generate exactly 3 MCQ questions for a customer who just visited a business. Each question should have exactly 4 short answer options (2-5 words each).

Business Profile:
- Name: ${businessName}
- Industry: ${industrySegment || "General"}
- Sub-Industry: ${subIndustry || "General"}
- Description: ${businessDescription || "Not provided"}
- Services: ${servicesOffered || "Not provided"}
- Staff: ${staffInfo || "Not provided"}
- Highlights: ${businessHighlights || "Not provided"}

Requirements:
- Questions must be specific to THIS business, not generic
- Options should be real services/features this business offers
- Questions should help generate a detailed, authentic Google review
- Keep questions conversational and easy to answer
- Each option should be 2-5 words maximum

Respond ONLY with valid JSON in this exact format, no other text:
[
  {"question": "What did you enjoy most?", "options": ["Option A", "Option B", "Option C", "Option D"]},
  {"question": "How was the service?", "options": ["Option A", "Option B", "Option C", "Option D"]},
  {"question": "What stood out?", "options": ["Option A", "Option B", "Option C", "Option D"]}
]`;

    const text = await callGroq(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON found");

    const questions = JSON.parse(jsonMatch[0]) as { question: string; options: string[] }[];

    if (!Array.isArray(questions) || questions.length < 3) throw new Error("Invalid format");
    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) || q.options.length < 3) throw new Error("Invalid question");
    }

    return Response.json({ questions: questions.slice(0, 3), source: "ai" });
  } catch {
    const fallback = getMCQQuestions(industrySegment, subIndustry);
    return Response.json({ questions: fallback, source: "template" });
  }
}
