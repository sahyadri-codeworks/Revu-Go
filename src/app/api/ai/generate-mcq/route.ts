import { getMCQQuestions } from "@/lib/mcq-templates";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function callGroq(prompt: string, temperature = 0.9): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature,
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
    starRating,
    questionIndex,
    previousQA,
  } = body;

  const hasProfile = businessDescription || servicesOffered || staffInfo || businessHighlights;

  // Legacy mode: generate all 3 questions at once (fallback)
  if (questionIndex === undefined) {
    if (!GROQ_API_KEY || !hasProfile) {
      const fallback = getMCQQuestions(industrySegment, subIndustry);
      return Response.json({ questions: fallback, source: "template" });
    }

    try {
      const prompt = buildBatchPrompt({
        businessName, industrySegment, subIndustry,
        businessDescription, servicesOffered, staffInfo, businessHighlights,
        starRating,
      });
      const text = await callGroq(prompt);
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON");
      const questions = JSON.parse(jsonMatch[0]);
      if (Array.isArray(questions) && questions.length >= 3) {
        return Response.json({ questions: questions.slice(0, 3), source: "ai" });
      }
    } catch {}
    const fallback = getMCQQuestions(industrySegment, subIndustry);
    return Response.json({ questions: fallback, source: "template" });
  }

  // Dynamic mode: generate ONE question based on context
  if (!GROQ_API_KEY || !hasProfile) {
    const fallback = getMCQQuestions(industrySegment, subIndustry);
    return Response.json({
      question: fallback[questionIndex] || fallback[0],
      source: "template",
    });
  }

  const prevContext = (previousQA as { question: string; answer: string; note?: string }[] || [])
    .map((qa, i) => {
      let line = `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`;
      if (qa.note) line += `\nAdditional comment: ${qa.note}`;
      return line;
    })
    .join("\n\n");

  const ratingContext = starRating <= 2
    ? "The customer had a POOR experience. Ask about what went wrong, what disappointed them, or what could be improved."
    : starRating === 3
    ? "The customer had a MIXED experience. Ask about both positives and areas needing improvement."
    : "The customer had a GOOD experience. Ask about what they enjoyed, what stood out, or what made it special.";

  const questionThemes: Record<number, string> = {
    0: "Ask about the CORE experience — what the customer came for, what they used/tried/ordered, or their primary interaction with the business.",
    1: "Ask about a SPECIFIC DETAIL — service quality, staff behavior, ambiance, timing, value for money, hygiene, or a particular feature of this business. This should dig deeper based on what the customer already shared.",
    2: "Ask about OVERALL IMPRESSION — what stood out most, would they return, who would they recommend it to, or one thing they'd change. This wraps up their experience.",
  };

  try {
    const prompt = `You are designing a conversational feedback question for a real customer who just visited a business. Generate exactly 1 MCQ question with 4 short answer options.

Business Profile:
- Name: ${businessName}
- Industry: ${industrySegment || "General"} / ${subIndustry || "General"}
- Description: ${businessDescription || "Not provided"}
- Services: ${servicesOffered || "Not provided"}
- Staff: ${staffInfo || "Not provided"}
- Highlights: ${businessHighlights || "Not provided"}

Customer Context:
- Star Rating: ${starRating}/5
- ${ratingContext}
- This is question ${questionIndex + 1} of 3

${prevContext ? `Previous conversation:\n${prevContext}\n` : ""}
Theme for this question:
${questionThemes[questionIndex] || questionThemes[2]}

Critical Rules:
- Question MUST be specific to THIS business (reference actual services, features, menu items, treatments, etc.)
- Options must be 2-5 words each, realistic and relevant
- ${prevContext ? "DO NOT repeat topics already covered. Build on what the customer already shared." : "Start with something welcoming and easy to answer."}
- If rating is low (1-2), include options that capture specific complaints (slow service, rude staff, poor quality, overpriced, etc.)
- If rating is mixed (3), include both positive and negative options
- Keep it conversational, not corporate
- Make the question feel natural, like a friend asking about their visit

Respond ONLY with valid JSON, no other text:
{"question": "Your question here?", "options": ["Option A", "Option B", "Option C", "Option D"]}`;

    const text = await callGroq(prompt, 0.9);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    const result = JSON.parse(jsonMatch[0]);
    if (result.question && Array.isArray(result.options) && result.options.length >= 3) {
      return Response.json({ question: result, source: "ai" });
    }
  } catch {}

  const fallback = getMCQQuestions(industrySegment, subIndustry);
  return Response.json({
    question: fallback[questionIndex] || fallback[0],
    source: "template",
  });
}

function buildBatchPrompt(ctx: Record<string, string | number | undefined>) {
  return `You are a customer feedback expert. Generate exactly 3 MCQ questions for a customer who just visited a business. Each question should have exactly 4 short answer options (2-5 words each).

Business Profile:
- Name: ${ctx.businessName}
- Industry: ${ctx.industrySegment || "General"} / ${ctx.subIndustry || "General"}
- Description: ${ctx.businessDescription || "Not provided"}
- Services: ${ctx.servicesOffered || "Not provided"}
- Staff: ${ctx.staffInfo || "Not provided"}
- Highlights: ${ctx.businessHighlights || "Not provided"}

Star Rating: ${ctx.starRating || "not given"}/5

Requirements:
- Questions must be specific to THIS business, not generic
- Options should be real services/features this business offers
- If rating is low (1-2), focus on what went wrong
- If rating is high (4-5), focus on what was great
- Keep questions conversational and easy to answer
- Each option should be 2-5 words maximum

Respond ONLY with valid JSON array, no other text:
[
  {"question": "Question 1?", "options": ["A", "B", "C", "D"]},
  {"question": "Question 2?", "options": ["A", "B", "C", "D"]},
  {"question": "Question 3?", "options": ["A", "B", "C", "D"]}
]`;
}
