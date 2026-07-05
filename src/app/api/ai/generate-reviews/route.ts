import { createAdminClient } from "@/lib/supabase/admin";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

function generateUniqueSeed(): string {
  const now = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  const micro = performance.now().toString(36).replace(".", "");
  const extra = Math.random().toString(36).slice(2, 6);
  const counter = (++seedCounter).toString(36);
  return `${now}-${rand}-${micro}-${extra}-${counter}`;
}
let seedCounter = 0;

const WRITING_STYLES = [
  "ultra-casual texting style — short bursts, no fancy words, maybe skip grammar, raw and real, like telling a mate about it",
  "detailed storyteller — paints a vivid picture of one specific moment, describes what they saw/felt/tasted/heard",
  "straight-to-the-point minimalist — short, punchy, honest, says it in fewest words, no fluff at all",
  "first-time discoverer — genuinely surprised, didn't expect much, compares to what they thought it'd be like",
  "local regular who's been here multiple times — speaks with familiarity, mentions changes over time, casual authority",
  "single-moment focuser — entire review orbits ONE specific detail or experience that stuck with them",
  "reluctant reviewer who almost never writes — starts with why they felt compelled to write this time",
  "practical parent — talks about value, convenience, kid-friendliness, real-world concerns",
  "young professional — trendy vocab, mentions vibe and aesthetic, concise but expressive",
  "older experienced person — measured, thoughtful, compares to years of experience, dignified tone",
  "enthusiastic but specific — backs up every claim with a concrete example, no empty praise",
  "slightly critical but fair — even in a positive review, mentions one honest observation, feels balanced",
  "work-break visitor — popped in quickly, comments on speed, convenience, whether it fit their tight schedule",
  "group visitor — went with friends/family, talks about how it worked for the group dynamic",
  "comparison shopper — mentions trying similar places, why this one won or lost",
  "emotional reactor — writes from feeling, uses sensory language, visceral reactions",
];

const REVIEW_STRUCTURES = [
  "Start mid-thought, as if continuing a conversation",
  "Open with the standout moment — the thing they'd mention first",
  "Begin with a feeling or gut reaction, then explain what caused it",
  "Start with what they expected vs what actually happened",
  "Lead with why they were there, then what unfolded",
  "Open with one sharp observation, then expand",
  "Start with a casual time reference — 'went last week', 'stopped by on saturday', 'been meaning to try this'",
  "Begin with an action — what they did, ordered, tried",
  "Open with a question — 'know that feeling when...', 'ever had one of those days where...'",
  "Start with someone else's recommendation that brought them here",
  "Begin with a contrast to a previous visit or similar place",
  "Open with the weather, time of day, or circumstance that set the scene",
];

const SENTENCE_STARTERS_TO_AVOID = [
  "I recently", "I had the pleasure", "I visited", "We visited", "My experience",
  "I would like", "I want to", "Just visited", "Visited", "Went to",
  "I am writing", "This place", "The establishment", "What a",
];

async function fetchExistingReviews(businessId: string): Promise<string[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("review_sessions")
      .select("selected_review_text")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(30);
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

  if (!businessId || !businessName || !mcqAnswers) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: biz } = await admin.from("businesses").select("id").eq("id", businessId).single();
  if (!biz) return Response.json({ error: "Invalid business" }, { status: 400 });

  if (!GROQ_API_KEY) {
    return Response.json({ reviews: generateMinimalFallback(businessName, mcqAnswers, mcqNotes, starRating), source: "fallback" });
  }

  const existingReviews = await fetchExistingReviews(businessId);

  const uniqueSeed = generateUniqueSeed();
  const shuffledStyles = [...WRITING_STYLES].sort(() => Math.random() - 0.5);
  const selectedStyles = shuffledStyles.slice(0, 3);
  const shuffledStructures = [...REVIEW_STRUCTURES].sort(() => Math.random() - 0.5);
  const selectedStructures = shuffledStructures.slice(0, 3);

  const wordRange1 = randomWordRange();
  const wordRange2 = randomWordRange();
  const wordRange3 = randomWordRange();

  const notes = (mcqNotes || {}) as Record<string, string>;
  const allNotes = Object.values(notes).filter(Boolean);
  const answersText = Object.entries(mcqAnswers as Record<string, string>)
    .map(([q, a]) => {
      const note = notes[q];
      return note
        ? `Q: ${q}\nA: ${a}\nCustomer's own words: "${note}"`
        : `Q: ${q}\nA: ${a}`;
    })
    .join("\n\n");

  let toneGuide: string;
  if (starRating === 1) {
    toneGuide = `VERY UNHAPPY customer (1/5). They had a genuinely bad time. Write honestly frustrated reviews — not abusive, but clearly disappointed and specific about what went wrong. Don't soften it.`;
  } else if (starRating === 2) {
    toneGuide = `DISAPPOINTED customer (2/5). Below expectations. Reviews should feel let-down, pointing out specific shortcomings. Not angry, just honest about what didn't work.`;
  } else if (starRating === 3) {
    toneGuide = `MIXED customer (3/5). Balanced — something worked, something didn't. "It was okay" energy. Not enthusiastic, not upset. Realistic and measured.`;
  } else if (starRating === 4) {
    toneGuide = `HAPPY customer (4/5). Positive but grounded. Good experience with maybe one small thing. Not gushing — genuinely satisfied.`;
  } else {
    toneGuide = `VERY HAPPY customer (5/5). Genuinely enthusiastic but show WHY through specific details. Not generic "amazing" — earned praise based on real moments.`;
  }

  // Detect contradictions between rating and feedback
  const allNotesText = allNotes.join(" ");
  const hasContradiction = allNotesText && (
    (starRating >= 4 && /bad|worst|terrible|awful|dirty|rude|slow|expensive|overpriced|waste|never again|disgusting|horrible|pathetic|poor|disappointed/i.test(allNotesText)) ||
    (starRating <= 2 && /amazing|best|love|wonderful|excellent|perfect|fantastic|great experience|outstanding|incredible/i.test(allNotesText))
  );

  const existingReviewsBlock = existingReviews.length > 0
    ? `\n\nEXISTING REVIEWS IN DATABASE — you MUST NOT generate anything resembling these. Different words, structure, focus, opening, length, personality:\n${existingReviews.slice(0, 20).map((r, i) => `${i + 1}. "${r.slice(0, 120)}..."`).join("\n")}`
    : "";

  const businessContext = [
    businessDescription && `About: ${businessDescription}`,
    servicesOffered && `Services/Menu: ${servicesOffered}`,
    staffInfo && `Staff: ${staffInfo}`,
    businessHighlights && `Special: ${businessHighlights}`,
  ].filter(Boolean).join("\n");

  const customerNotesSection = allNotes.length > 0
    ? `\nCUSTOMER'S OWN WORDS (CRITICAL — weave these naturally into the reviews, they represent the customer's real voice and feelings):\n${allNotes.map((n, i) => `- "${n}"`).join("\n")}`
    : "";

  try {
    const prompt = `SESSION_ID: ${uniqueSeed}

Generate 3 Google reviews for a real customer visit. These MUST read like 3 completely different humans — different vocabulary, rhythm, length, structure, personality, and perspective.

BUSINESS: ${businessName}
LOCATION: ${locationArea ? `${locationArea}, ` : ""}${locationCity}
TYPE: ${industrySegment || "Business"}${subIndustry ? ` / ${subIndustry}` : ""}
${businessContext || "No business details — work purely from customer feedback."}

CUSTOMER FEEDBACK (${starRating}/5 stars):
${answersText}
${customerNotesSection}

EMOTIONAL TONE: ${toneGuide}
${hasContradiction ? `\nCONTRADICTION ALERT: The customer's written comments CONFLICT with their star rating. Their WORDS reflect their true experience — trust the words over the number. Write a review that captures this nuanced, mixed reality. For example: if they gave 5 stars but mentioned rude staff, the review should acknowledge positives while honestly noting the staff issue.` : ""}
${existingReviewsBlock}

REVIEW ASSIGNMENTS (each review MUST follow its assigned personality — do NOT blend them):

Review 1 — Voice: ${selectedStyles[0]}
Opening: ${selectedStructures[0]}
Target length: ${wordRange1} words

Review 2 — Voice: ${selectedStyles[1]}
Opening: ${selectedStructures[1]}
Target length: ${wordRange2} words

Review 3 — Voice: ${selectedStyles[2]}
Opening: ${selectedStructures[2]}
Target length: ${wordRange3} words

ABSOLUTE RULES — VIOLATION = FAILURE:
1. BANNED PHRASES: "hidden gem", "I highly recommend", "exceeded expectations", "top-notch", "second to none", "can't recommend enough", "a must-visit", "par excellence", "needless to say", "pleasantly surprised", "I had the pleasure", "I recently visited", "would definitely recommend", "truly exceptional", "gem of a place", "hats off"
2. BANNED OPENINGS: Do NOT start any review with: ${SENTENCE_STARTERS_TO_AVOID.join(", ")}
3. BANNED PATTERN: Never use "[Did X] at [business] in [city] and [Y]! [Generic praise]."
4. Each review MUST reference at least one SPECIFIC detail from the customer's actual MCQ answers
5. ${allNotes.length > 0 ? "MUST incorporate the customer's own words/phrases naturally — they wrote these because it mattered to them" : "Use only the MCQ answers to build the review content"}
6. Do NOT force the business name or city into every review — use only where natural
7. Include human imperfections in at least 2 reviews: sentence fragments, casual connectors ("so", "honestly", "ngl", "like"), dashes mid-thought, dropped articles, or run-on thoughts
8. The 3 reviews must have ZERO overlapping phrases, sentence patterns, or structural similarity
9. Never use exclamation marks in more than 1 review
10. Vary punctuation: one uses more periods, another dashes, another might have a run-on
11. NO review should read like AI wrote it — no perfect grammar in every sentence, no neat three-part structure, no balanced pros-and-cons format
12. If rating is 1-2 stars, reviews MUST be genuinely negative — do not soften, do not add silver linings unless the customer explicitly mentioned one

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
            content: `You are a review authenticity engine. Timestamp: ${Date.now()}. Seed: ${uniqueSeed}. Your mission: generate Google reviews INDISTINGUISHABLE from real humans. Every review must be unique — in a pool of 10 million reviews, no two should feel alike. You write like real people with different ages, backgrounds, moods, and communication habits. You never use AI patterns — no balanced structure, no "overall" summaries, no perfect grammar. Real people are messy, specific, opinionated, and inconsistent in their writing style.`,
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 1.3,
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
    return Response.json({ reviews: generateMinimalFallback(businessName, mcqAnswers, mcqNotes, starRating), source: "fallback" });
  }
}

function randomWordRange(): string {
  const ranges = ["25-40", "40-55", "55-75", "30-45", "45-65", "20-35", "50-70", "35-50", "60-80", "22-38"];
  return ranges[Math.floor(Math.random() * ranges.length)];
}

function generateMinimalFallback(
  businessName: string,
  mcqAnswers: Record<string, string>,
  mcqNotes: Record<string, string> | undefined,
  starRating: number,
): string[] {
  const answers = Object.values(mcqAnswers || {}).filter(Boolean);
  const notes = Object.values(mcqNotes || {}).filter(Boolean);
  const detail1 = answers[0] || "the experience";
  const detail2 = answers[1] || "the service";
  const detail3 = answers[2] || "the quality";
  const noteSnippet = notes[0] ? ` ${notes[0].slice(0, 60)}.` : "";

  if (starRating <= 2) {
    return [
      `${detail1} at ${businessName} wasn't what I expected. Needs improvement.${noteSnippet}`,
      `Honestly disappointed with ${detail2.toLowerCase()}. Hope they work on it.`,
      `${businessName} has potential but ${detail3.toLowerCase()} let it down for me.`,
    ];
  }
  if (starRating === 3) {
    return [
      `${detail1} was decent at ${businessName}. Some things were good, others not so much.${noteSnippet}`,
      `Mixed feelings about ${businessName}. ${detail2} was okay but could be better.`,
      `${businessName} is alright. ${detail3} was fine, nothing extraordinary though.`,
    ];
  }
  return [
    `Really liked ${detail1.toLowerCase()} at ${businessName}. Solid experience overall.${noteSnippet}`,
    `${businessName} nailed it with ${detail2.toLowerCase()}. Will be back for sure.`,
    `Good stuff at ${businessName}. ${detail3} stood out to me. Worth checking out.`,
  ];
}
