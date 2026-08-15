import { getMCQQuestions } from "@/lib/mcq-templates";
import { rateLimit } from "@/lib/rate-limit";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function callGroq(prompt: string, temperature = 1.0): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a conversational feedback designer. You create natural, human-sounding questions that feel like a friend asking about someone's visit — never corporate, never robotic. Every question you generate must be completely unique. You NEVER reuse the same question or options. You use the current timestamp ${Date.now()} and random seed ${Math.random().toString(36).slice(2)} to ensure variation.`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
      temperature,
    }),
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`gen-mcq:${ip}`, 60, 60_000)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const {
    businessId,
    starRating,
    questionIndex,
    previousQA,
  } = body;

  let industrySegment = body.industrySegment || "";
  let subIndustry = body.subIndustry || "";
  let businessName = "";
  let businessDescription = "";
  let servicesOffered = "";
  let staffInfo = "";
  let businessHighlights = "";

  if (businessId) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: biz } = await admin
      .from("businesses")
      .select("name, industry_segment, sub_industry, business_description, services_offered, staff_info, business_highlights")
      .eq("id", businessId)
      .single();
    if (biz) {
      businessName = biz.name;
      industrySegment = biz.industry_segment || industrySegment;
      subIndustry = biz.sub_industry || subIndustry;
      businessDescription = biz.business_description || "";
      servicesOffered = biz.services_offered || "";
      staffInfo = biz.staff_info || "";
      businessHighlights = biz.business_highlights || "";
    }
  }

  const hasProfile = businessDescription || servicesOffered || staffInfo || businessHighlights;

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
      if (qa.note) line += `\nCustomer's own words: "${qa.note}"`;
      return line;
    })
    .join("\n\n");

  const prevQuestions = (previousQA as { question: string }[] || [])
    .map((qa) => qa.question)
    .join(", ");

  let ratingContext: string;
  if (starRating === 1) {
    ratingContext = `VERY UNHAPPY customer (1/5). Something went seriously wrong. Ask specifically what the problem was — was it the product/service quality, staff attitude, wait time, hygiene, pricing, or something else? Be empathetic, not defensive. Options should capture real complaints.`;
  } else if (starRating === 2) {
    ratingContext = `DISAPPOINTED customer (2/5). The experience fell short. Ask what specifically let them down — options should include common pain points like poor quality, rude staff, long wait, overpriced, not as advertised, dirty/unkempt.`;
  } else if (starRating === 3) {
    ratingContext = `MIXED customer (3/5). Some things worked, some didn't. Ask what was okay and what needed work. Options should include both positive and negative choices.`;
  } else if (starRating === 4) {
    ratingContext = `HAPPY customer (4/5). Good experience with minor room for improvement. Ask about what they enjoyed and what could make it perfect. Options should be mostly positive with one "could improve" type.`;
  } else {
    ratingContext = `DELIGHTED customer (5/5). Exceptional experience. Ask about what made it special, what moment stood out, what they loved most. Options should capture specific highlights, not generic praise.`;
  }

  const questionPurpose: Record<number, string> = {
    0: starRating <= 2
      ? "Ask what specifically went wrong or disappointed them. What was the main issue? Options should be concrete problems (slow service, cold food, rude staff, dirty place, wrong order, overcharged, etc.)"
      : "Ask about their CORE experience — what they came for, what they tried/used/ordered. Options must reference actual services/products this business offers based on the description.",
    1: starRating <= 2
      ? "Dig deeper into their specific experience. Based on what they said in Q1, ask a follow-up. If they complained about food, ask about staff. If about staff, ask about the facility. Cover a DIFFERENT angle."
      : "Ask about a SPECIFIC DETAIL they experienced — based on their Q1 answer, drill into quality, staff, atmosphere, value, timing, or a specific feature. Must be different from Q1.",
    2: starRating <= 2
      ? "Ask about resolution or what would make it right. Would they give it another chance? What one change would fix it? Options should range from 'never coming back' to 'will try again if X improves'."
      : "Ask about OVERALL TAKEAWAY — what one thing they'd tell a friend, would they return, what made it memorable. This wraps up their story.",
  };

  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const prompt = `UNIQUE_SEED: ${seed}

Generate exactly 1 feedback question for a real customer. This question must be COMPLETELY DIFFERENT from any previous questions in this session.

BUSINESS:
- Name: ${businessName}
- Industry: ${industrySegment || "General"} / ${subIndustry || "General"}
- Description: ${businessDescription || "Not provided"}
- Services/Menu: ${servicesOffered || "Not provided"}
- Staff: ${staffInfo || "Not provided"}
- Highlights: ${businessHighlights || "Not provided"}

CUSTOMER CONTEXT:
- Star Rating: ${starRating}/5
- ${ratingContext}
- This is question ${questionIndex + 1} of 3

${prevContext ? `CONVERSATION SO FAR:\n${prevContext}\n` : ""}
${prevQuestions ? `ALREADY ASKED (DO NOT repeat or rephrase these): ${prevQuestions}` : ""}

PURPOSE OF THIS QUESTION:
${questionPurpose[questionIndex] || questionPurpose[2]}

RULES:
- Question MUST be specific to THIS business — reference its actual services, menu items, treatments, products from the description
- Options must be 2-5 words each, realistic and varied
- ${prevContext ? "MUST build on the customer's previous answers. If they mentioned something specific, follow up on a DIFFERENT aspect." : "Start with something easy and natural."}
- DO NOT ask generic questions like "How was your experience?" or "Would you recommend?"
- Make it feel like a real conversation, not a survey
- For low ratings: options should include honest negative choices, not forced positive ones
- For high ratings: options should be specific positives, not vague ("loved everything")
- Include 4 options that are genuinely different from each other

Respond ONLY with valid JSON:
{"question": "Your unique question?", "options": ["Option A", "Option B", "Option C", "Option D"]}`;

    const text = await callGroq(prompt, 1.0);
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
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const rating = Number(ctx.starRating) || 5;

  let ratingInstruction: string;
  if (rating <= 2) {
    ratingInstruction = "Customer is UNHAPPY. Q1: what went wrong specifically. Q2: dig into the issue. Q3: what would fix it / would they return.";
  } else if (rating === 3) {
    ratingInstruction = "Customer is MIXED. Q1: what they tried. Q2: what was good vs what fell short. Q3: what one change would improve things.";
  } else {
    ratingInstruction = "Customer is HAPPY. Q1: what they enjoyed/tried. Q2: what specific detail stood out. Q3: what they'd tell a friend.";
  }

  return `UNIQUE_SEED: ${seed}

Generate 3 unique feedback questions for a customer visit. Each must have 4 short options (2-5 words).

BUSINESS:
- Name: ${ctx.businessName}
- Industry: ${ctx.industrySegment || "General"} / ${ctx.subIndustry || "General"}
- Description: ${ctx.businessDescription || "Not provided"}
- Services: ${ctx.servicesOffered || "Not provided"}
- Staff: ${ctx.staffInfo || "Not provided"}
- Highlights: ${ctx.businessHighlights || "Not provided"}

Rating: ${rating}/5 — ${ratingInstruction}

RULES:
- Questions must reference THIS business's actual services/features
- Each question must cover a DIFFERENT topic
- Options must be concrete and specific, not vague
- For low ratings, include negative options (slow, rude, dirty, wrong order, etc.)
- Make questions conversational — like a friend asking, not a corporate survey

Respond ONLY with JSON array:
[
  {"question": "Q1?", "options": ["A", "B", "C", "D"]},
  {"question": "Q2?", "options": ["A", "B", "C", "D"]},
  {"question": "Q3?", "options": ["A", "B", "C", "D"]}
]`;
}
