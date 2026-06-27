import { generateIndustryReviews } from "@/lib/mcq-templates";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

function generateUniqueSeed(): string {
  const now = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  const micro = performance.now().toString(36).replace(".", "");
  return `${now}-${rand}-${micro}`;
}

const WRITING_PERSONAS = [
  "a casual person who talks like they're texting a friend — short sentences, natural pauses, maybe a typo-like style",
  "a detailed storyteller who paints a picture of their visit — describes the ambiance, the feeling, specific moments",
  "a straight-to-the-point reviewer who values time — punchy, honest, no fluff, just facts and opinion",
  "a first-time visitor who's genuinely surprised — expressive, uses comparisons to other places they've been",
  "a regular local who knows the area well — mentions neighborhood context, compares to alternatives, speaks with authority",
  "a person who focuses on one standout moment — builds the whole review around that single experience",
  "someone who almost didn't come but is glad they did — mentions initial hesitation then pleasant surprise",
  "a family person reviewing from a practical angle — mentions value, portions, kid-friendliness, convenience",
];

export async function POST(request: Request) {
  const body = await request.json();
  const {
    businessName, locationArea, locationCity,
    industrySegment, subIndustry,
    businessDescription, servicesOffered, staffInfo, businessHighlights,
    mcqAnswers, mcqNotes, starRating,
  } = body;

  const hasProfile = businessDescription || servicesOffered || staffInfo || businessHighlights;

  if (!GROQ_API_KEY || !hasProfile) {
    const fallback = generateIndustryReviews(businessName, locationArea, locationCity, industrySegment, mcqAnswers);
    return Response.json({ reviews: fallback, source: "template" });
  }

  const uniqueSeed = generateUniqueSeed();

  // Pick 3 random personas (no repeats)
  const shuffled = [...WRITING_PERSONAS].sort(() => Math.random() - 0.5);
  const selectedPersonas = shuffled.slice(0, 3);

  const notes = (mcqNotes || {}) as Record<string, string>;
  const answersText = Object.entries(mcqAnswers as Record<string, string>)
    .map(([q, a]) => {
      const note = notes[q];
      return note ? `Q: ${q}\nA: ${a}\nCustomer's own words: "${note}"` : `Q: ${q}\nA: ${a}`;
    })
    .join("\n\n");

  // Determine tone based on rating
  let toneGuide: string;
  if (starRating <= 2) {
    toneGuide = `The customer is UNHAPPY (${starRating}/5). Reviews should reflect genuine disappointment. They can mention what went wrong while being fair. Don't make it sound hostile — just honest dissatisfaction. A 1-star review is blunt; a 2-star review is disappointed but measured.`;
  } else if (starRating === 3) {
    toneGuide = `The customer is MIXED (3/5). Reviews should acknowledge both good and bad. Something like "The X was great but Y let it down" or "It was okay, not bad but not amazing either." Don't be overly negative or positive.`;
  } else if (starRating === 4) {
    toneGuide = `The customer is HAPPY but not blown away (4/5). Reviews should be positive with maybe one small note — "Almost perfect, just wish X" or "Really enjoyed it, minor thing was Y." Don't be over-the-top enthusiastic.`;
  } else {
    toneGuide = `The customer is VERY HAPPY (5/5). Reviews should show genuine enthusiasm without sounding fake. Use specific details from their answers to show WHY it was great. Avoid generic praise — make it personal.`;
  }

  // Check if notes contradict the rating
  const allNotes = Object.values(notes).filter(Boolean).join(" ");
  const hasContradiction = allNotes && (
    (starRating >= 4 && /bad|worst|terrible|awful|dirty|rude|slow|expensive|overpriced|waste|never again|disgusting/i.test(allNotes)) ||
    (starRating <= 2 && /amazing|best|love|wonderful|excellent|perfect|fantastic|great experience/i.test(allNotes))
  );

  const contradictionNote = hasContradiction
    ? `\n\nIMPORTANT: The customer's written comments seem to CONTRADICT their star rating. Give MORE weight to their actual words than the stars. Their real feelings are in what they wrote, not the number they tapped. Write reviews that honestly reflect their WORDS.`
    : "";

  try {
    const prompt = `UNIQUE SESSION: ${uniqueSeed}

You must generate exactly 3 completely different Google reviews for a real customer visit. Each review MUST be written in a totally different voice and style.

Business:
- Name: ${businessName}
- Location: ${locationArea ? `${locationArea}, ` : ""}${locationCity}
- Type: ${industrySegment || "Business"} / ${subIndustry || "General"}
- About: ${businessDescription || "Not provided"}
- Services/Menu: ${servicesOffered || "Not provided"}
- Staff: ${staffInfo || "Not provided"}
- Special features: ${businessHighlights || "Not provided"}

Customer's actual feedback (${starRating}/5 stars):
${answersText}

${toneGuide}${contradictionNote}

WRITING PERSONAS (each review must follow its assigned persona):
Review 1: Write as ${selectedPersonas[0]}
Review 2: Write as ${selectedPersonas[1]}
Review 3: Write as ${selectedPersonas[2]}

ABSOLUTE RULES — violating any of these means failure:
1. Each review must be 30-90 words. Not a word more than 90.
2. NEVER use these AI giveaway phrases: "I highly recommend", "I can't recommend enough", "hidden gem", "a must-visit", "exceeded my expectations", "top-notch", "second to none", "a cut above", "par excellence", "needless to say", "I was pleasantly surprised to find"
3. NEVER start with "I recently visited" or "I had the pleasure of" — real people don't talk like that
4. Each review MUST reference at least one SPECIFIC thing from the customer's answers (a dish they ordered, a service they used, a staff interaction)
5. If the customer wrote additional comments, WEAVE THEIR OWN WORDS into the review naturally
6. All 3 reviews must have DIFFERENT opening words, DIFFERENT sentence structures, DIFFERENT lengths
7. Include natural human imperfections — sentence fragments, casual punctuation, starting with "So" or "Okay so" occasionally, using "tbh", "ngl", "def", or other casual markers sparingly
8. The business name should appear naturally — not forced into every sentence
9. Mention the area/city ONLY if it fits naturally (don't force it)
10. Reviews must feel like they were written by 3 completely different people with different vocabularies, different focuses, different communication styles

Use the unique session seed ${uniqueSeed} to ensure these reviews have never been generated before. Vary word choice, sentence length, and focus points.

Respond ONLY with a valid JSON array of exactly 3 strings:
["review1", "review2", "review3"]`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 1.0,
        top_p: 0.95,
      }),
    });

    if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON found");

    const reviews = JSON.parse(jsonMatch[0]) as string[];
    if (!Array.isArray(reviews) || reviews.length < 3) throw new Error("Invalid format");

    return Response.json({ reviews: reviews.slice(0, 3), source: "ai", seed: uniqueSeed });
  } catch {
    const fallback = generateIndustryReviews(businessName, locationArea, locationCity, industrySegment, mcqAnswers);
    return Response.json({ reviews: fallback, source: "template" });
  }
}
