const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(request: Request) {
  const { starRating, mcqAnswers, mcqNotes } = await request.json();

  // Quick check: below 2 stars is always negative
  if (starRating <= 2) {
    return Response.json({ isNegative: true, reason: "low_rating" });
  }

  // For 3+ stars, analyze the MCQ answers and notes for negativity
  if (!GROQ_API_KEY) {
    return Response.json({ isNegative: false, reason: "no_api_key" });
  }

  const notes = (mcqNotes || {}) as Record<string, string>;
  const feedbackText = Object.entries(mcqAnswers as Record<string, string>)
    .map(([q, a]) => {
      const note = notes[q];
      return note ? `Q: ${q} → ${a} (Note: ${note})` : `Q: ${q} → ${a}`;
    })
    .join("\n");

  try {
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
            role: "user",
            content: `Analyze this customer feedback for a business visit. The customer gave ${starRating}/5 stars.

Feedback:
${feedbackText}

Is the overall sentiment NEGATIVE? A customer may give high stars but still express dissatisfaction, complaints, bad experience, rudeness, poor quality, hygiene issues, overcharging, long wait times, or other problems.

Respond ONLY with valid JSON: {"isNegative": true/false}`,
          },
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const result = JSON.parse(match[0]);
      return Response.json({
        isNegative: !!result.isNegative,
        reason: result.isNegative ? "negative_sentiment" : "positive",
      });
    }
  } catch {}

  return Response.json({ isNegative: false, reason: "analysis_failed" });
}
