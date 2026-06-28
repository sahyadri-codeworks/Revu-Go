import { createAdminClient } from "@/lib/supabase/admin";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

function generateUniqueSeed(): string {
  const now = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  const micro = performance.now().toString(36).replace(".", "");
  const extra = Math.random().toString(36).slice(2, 6);
  return `${now}-${rand}-${micro}-${extra}`;
}

const WRITING_STYLES = [
  "ultra-casual texting style — like messaging a friend. Short bursts. No fancy words. Maybe skip some grammar. Real raw.",
  "detailed storyteller — paints a vivid picture of one specific moment during the visit, describes feelings and atmosphere",
  "straight-to-the-point minimalist — short, punchy, honest. Says what needs to be said in fewest words possible",
  "first-time discoverer — genuinely surprised, compares to expectations, expressive about what stood out",
  "local expert who knows every spot in the area — speaks with authority, compares subtly, knows what matters",
  "single-moment focuser — entire review orbits around ONE specific detail or experience that stuck with them",
  "reluctant reviewer who rarely writes reviews — casual, starts with why they felt compelled to actually write one",
  "practical family person — talks about value, convenience, whether it worked for everyone, real-world concerns",
  "young professional — trendy vocabulary, mentions vibe, aesthetic, energy. Concise but expressive",
  "older experienced customer — measured, thoughtful, compares to years of experience, dignified tone",
  "enthusiastic but specific — loves it but backs up every claim with a concrete example, no vague praise",
  "slightly critical but fair — even in a positive review, mentions one honest observation, feels balanced and real",
];

const SENTENCE_STARTERS_TO_AVOID = [
  "I recently", "I had the pleasure", "I visited", "We visited", "My experience",
  "I would like", "I want to", "Just visited", "Visited", "Went to",
];

const REVIEW_STRUCTURES = [
  "Start mid-thought, as if continuing a conversation. Jump straight into the specific detail.",
  "Open with the standout moment — the thing they'd tell a friend about first.",
  "Begin with a feeling or reaction, then explain what caused it.",
  "Start with a question or contrast — what they expected vs what happened.",
  "Lead with context — why they were there, what they needed — then the experience.",
  "Open with one sharp observation, then expand briefly.",
  "Start with a time reference that isn't 'recently' — 'last week', 'couple days ago', 'been coming for months'.",
  "Begin with an action — what they did, ordered, tried — not a description of the place.",
];

async function fetchExistingReviews(businessId: string): Promise<string[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("review_sessions")
      .select("selected_review_text")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(20);
    return (data || [])
      .map((r) => r.selected_review_text)
      .filter((t): t is string => !!t && t.length > 10);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    businessName, locationArea, locationCity,
    industrySegment, subIndustry,
    businessDescription, servicesOffered, staffInfo, businessHighlights,
    mcqAnswers, mcqNotes, starRating, businessId,
  } = body;

  if (!GROQ_API_KEY) {
    return Response.json({ reviews: generateMinimalFallback(businessName, mcqAnswers, starRating), source: "fallback" });
  }

  const existingReviews = businessId ? await fetchExistingReviews(businessId) : [];

  const uniqueSeed = generateUniqueSeed();
  const shuffledStyles = [...WRITING_STYLES].sort(() => Math.random() - 0.5);
  const selectedStyles = shuffledStyles.slice(0, 3);
  const shuffledStructures = [...REVIEW_STRUCTURES].sort(() => Math.random() - 0.5);
  const selectedStructures = shuffledStructures.slice(0, 3);

  const wordRange1 = randomWordRange();
  const wordRange2 = randomWordRange();
  const wordRange3 = randomWordRange();

  const notes = (mcqNotes || {}) as Record<string, string>;
  const answersText = Object.entries(mcqAnswers as Record<string, string>)
    .map(([q, a]) => {
      const note = notes[q];
      return note ? `Q: ${q}\nA: ${a}\nCustomer's own words: "${note}"` : `Q: ${q}\nA: ${a}`;
    })
    .join("\n\n");

  let toneGuide: string;
  if (starRating <= 2) {
    toneGuide = `UNHAPPY customer (${starRating}/5). Write honestly disappointed reviews. Not hostile — just genuinely let down. Be specific about what fell short.`;
  } else if (starRating === 3) {
    toneGuide = `MIXED customer (3/5). Balanced reviews — something good, something lacking. "X was fine but Y could be better" energy.`;
  } else if (starRating === 4) {
    toneGuide = `HAPPY customer (4/5). Positive but grounded. One small thing kept it from perfect. Not gushing.`;
  } else {
    toneGuide = `VERY HAPPY customer (5/5). Genuinely enthusiastic but specific — show WHY through details, not generic praise.`;
  }

  const allNotes = Object.values(notes).filter(Boolean).join(" ");
  const hasContradiction = allNotes && (
    (starRating >= 4 && /bad|worst|terrible|awful|dirty|rude|slow|expensive|overpriced|waste|never again|disgusting/i.test(allNotes)) ||
    (starRating <= 2 && /amazing|best|love|wonderful|excellent|perfect|fantastic|great experience/i.test(allNotes))
  );

  const existingReviewsBlock = existingReviews.length > 0
    ? `\n\nEXISTING REVIEWS ALREADY IN SYSTEM (you MUST NOT generate anything similar to these — different words, different structure, different focus, different opening, different length):\n${existingReviews.map((r, i) => `${i + 1}. "${r}"`).join("\n")}`
    : "";

  const businessContext = [
    businessDescription && `About: ${businessDescription}`,
    servicesOffered && `Services/Menu: ${servicesOffered}`,
    staffInfo && `Staff: ${staffInfo}`,
    businessHighlights && `Special: ${businessHighlights}`,
  ].filter(Boolean).join("\n");

  try {
    const prompt = `SESSION_ID: ${uniqueSeed}

Generate 3 Google reviews for a customer visit. These must read like 3 completely different humans wrote them — different vocabulary, rhythm, length, structure, and personality.

BUSINESS: ${businessName}
LOCATION: ${locationArea ? `${locationArea}, ` : ""}${locationCity}
TYPE: ${industrySegment || "Business"}${subIndustry ? ` / ${subIndustry}` : ""}
${businessContext || "No additional business details provided — work purely from customer feedback below."}

CUSTOMER FEEDBACK (${starRating}/5):
${answersText}

TONE: ${toneGuide}
${hasContradiction ? `\nCONTRADICTION DETECTED: Customer's words contradict their star rating. Trust their WORDS over the number.` : ""}
${existingReviewsBlock}

EACH REVIEW MUST FOLLOW ITS ASSIGNED PERSONALITY AND STRUCTURE:

Review 1 — Personality: ${selectedStyles[0]}
Structure: ${selectedStructures[0]}
Length: ${wordRange1} words

Review 2 — Personality: ${selectedStyles[1]}
Structure: ${selectedStructures[1]}
Length: ${wordRange2} words

Review 3 — Personality: ${selectedStyles[2]}
Structure: ${selectedStructures[2]}
Length: ${wordRange3} words

HARD RULES:
- BANNED PHRASES (instant fail): "hidden gem", "I highly recommend", "exceeded expectations", "top-notch", "second to none", "can't recommend enough", "a must-visit", "par excellence", "needless to say", "pleasantly surprised", "I had the pleasure", "I recently visited", "would definitely recommend"
- BANNED PATTERNS: Do NOT start any review with "${SENTENCE_STARTERS_TO_AVOID[Math.floor(Math.random() * SENTENCE_STARTERS_TO_AVOID.length)]}" or any of these: ${SENTENCE_STARTERS_TO_AVOID.slice(0, 5).join(", ")}
- BANNED FORMAT: Do NOT use the pattern "[Action] [business] in [city] for [X] and it has [Y]! [Generic praise]. Best in [city]!" — this is the exact format we're trying to AVOID
- Each review must reference at least one SPECIFIC detail from the customer's actual answers
- Do NOT force the business name or city into every review — use them only where natural
- Include natural human imperfections in at least 2 reviews — things like: sentence fragments, starting with "So", "Okay", "Honestly", "Ngl", using dashes mid-thought, casual comma usage, or dropping articles
- The 3 reviews must have ZERO overlapping phrases or sentence patterns
- If customer wrote additional notes, weave their actual language into reviews naturally
- Never use exclamation marks in more than 1 review
- Vary punctuation style: one review might use more periods, another might use dashes, another might have one run-on thought

Respond ONLY with a JSON array of 3 strings: ["review1", "review2", "review3"]`;

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
            content: "You are a review diversity engine. Your sole purpose is to generate Google reviews that are indistinguishable from real human reviews. Every review you create must be unique in structure, tone, vocabulary, and perspective. You NEVER repeat patterns. You NEVER use template-like structures. You write like different real humans with different backgrounds, ages, and communication styles.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1200,
        temperature: 1.2,
        top_p: 0.95,
      }),
    });

    if (!res.ok) throw new Error(`Groq error: ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON");

    const reviews = JSON.parse(jsonMatch[0]) as string[];
    if (!Array.isArray(reviews) || reviews.length < 3) throw new Error("Bad format");

    return Response.json({ reviews: reviews.slice(0, 3), source: "ai", seed: uniqueSeed });
  } catch {
    return Response.json({ reviews: generateMinimalFallback(businessName, mcqAnswers, starRating), source: "fallback" });
  }
}

function randomWordRange(): string {
  const ranges = ["25-45", "40-60", "55-80", "30-50", "45-70", "20-40", "50-75", "35-55"];
  return ranges[Math.floor(Math.random() * ranges.length)];
}

function generateMinimalFallback(
  businessName: string,
  mcqAnswers: Record<string, string>,
  starRating: number,
): string[] {
  const answers = Object.values(mcqAnswers || {}).filter(Boolean);
  const detail1 = answers[0] || "the experience";
  const detail2 = answers[1] || "the service";
  const detail3 = answers[2] || "the quality";

  if (starRating <= 2) {
    return [
      `${detail1} at ${businessName} wasn't what I expected. Needs improvement.`,
      `Honestly disappointed with ${detail2.toLowerCase()}. Hope they work on it.`,
      `${businessName} has potential but ${detail3.toLowerCase()} let it down for me.`,
    ];
  }
  if (starRating === 3) {
    return [
      `${detail1} was decent at ${businessName}. Some things were good, others not so much.`,
      `Mixed feelings about ${businessName}. ${detail2} was okay but could be better.`,
      `${businessName} is alright. ${detail3} was fine, nothing extraordinary though.`,
    ];
  }
  return [
    `Really liked ${detail1.toLowerCase()} at ${businessName}. Solid experience overall.`,
    `${businessName} nailed it with ${detail2.toLowerCase()}. Will be back for sure.`,
    `Good stuff at ${businessName}. ${detail3} stood out to me. Worth checking out.`,
  ];
}
