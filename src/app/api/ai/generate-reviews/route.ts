import { generateIndustryReviews } from "@/lib/mcq-templates";

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
      max_tokens: 800,
      temperature: 0.8,
    }),
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    businessName,
    locationArea,
    locationCity,
    industrySegment,
    subIndustry,
    businessDescription,
    servicesOffered,
    staffInfo,
    businessHighlights,
    mcqAnswers,
    mcqNotes,
    starRating,
  } = body;

  const hasProfile = businessDescription || servicesOffered || staffInfo || businessHighlights;

  if (!GROQ_API_KEY || !hasProfile) {
    const fallback = generateIndustryReviews(businessName, locationArea, locationCity, industrySegment, mcqAnswers);
    return Response.json({ reviews: fallback, source: "template" });
  }

  const notes = (mcqNotes || {}) as Record<string, string>;
  const answersText = Object.entries(mcqAnswers as Record<string, string>)
    .map(([q, a]) => {
      const note = notes[q];
      return note ? `Q: ${q}\nA: ${a}\nAdditional detail: ${note}` : `Q: ${q}\nA: ${a}`;
    })
    .join("\n\n");

  try {
    const prompt = `You are a review writing assistant. Generate exactly 3 authentic Google review texts for a customer who just visited a business.

Business Profile:
- Name: ${businessName}
- Location: ${locationArea}, ${locationCity}
- Industry: ${industrySegment || "General"} / ${subIndustry || "General"}
- Description: ${businessDescription || "Not provided"}
- Services: ${servicesOffered || "Not provided"}
- Staff: ${staffInfo || "Not provided"}
- Highlights: ${businessHighlights || "Not provided"}

Customer Feedback:
- Star Rating: ${starRating}/5
${answersText}

Requirements:
- Write 3 different review styles: detailed, concise, and enthusiastic
- Each review should be 40-80 words
- Incorporate the customer's MCQ answers naturally
- Reference specific services/features of THIS business
- Sound authentic and human — not AI-generated
- Include the business name naturally
- Mention the location area if relevant
- Match the tone to the star rating (${starRating}/5)
- Do NOT use generic phrases like "I highly recommend" without context

Respond ONLY with valid JSON array of 3 strings, no other text:
["Review 1 text here", "Review 2 text here", "Review 3 text here"]`;

    const text = await callGroq(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON found");

    const reviews = JSON.parse(jsonMatch[0]) as string[];
    if (!Array.isArray(reviews) || reviews.length < 3) throw new Error("Invalid format");

    return Response.json({ reviews: reviews.slice(0, 3), source: "ai" });
  } catch {
    const fallback = generateIndustryReviews(businessName, locationArea, locationCity, industrySegment, mcqAnswers);
    return Response.json({ reviews: fallback, source: "template" });
  }
}
