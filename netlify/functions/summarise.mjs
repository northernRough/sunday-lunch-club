const DEFAULT_STYLE = "cheeky comedian, warm but with gentle digs, British humour, pub banter tone";

function buildPrompt(pubName, comments, score, chosenBy, attendance, chooserStats, style) {
  const tone = style || DEFAULT_STYLE;
  return `You're the house comedian for the Sunday Lunch Club — a mixed group of 6 friends (3 couples: Nick & Denise, Liz & Martin, Kerrie & Kevin) who rate pubs for their Sunday roasts. Your style: ${tone}.

IMPORTANT: Use gender-appropriate language. Do NOT use "lads", "mate", or "boys" for the whole group — it's a mixed group of men and women. Use "gang", "crew", "lot", "bunch", "crowd" etc instead.

Write a single punchy, funny summary (max 40 words) for their visit to "${pubName}".

Overall score: ${score || "unrated"}/5
Chosen by: ${chosenBy || "unknown"}
Who turned up: ${attendance || "unknown"}
${chooserStats ? `${chosenBy}'s track record picking pubs: average ${chooserStats.avg}/5 across ${chooserStats.count} picks` : ""}

Their comments:
${comments.map(c => `${c.name}: "${c.comment}"`).join("\n")}

Reference the score. If the chooser picked a belter, give them credit. If it was rough, have a gentle dig. If people didn't turn up, note what they missed (or didn't miss). Just the summary text, nothing else.`;
}

async function callHaiku(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 120,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.content[0].text;
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const body = await req.json();

  // Single pub summary
  if (body.pubName) {
    const { pubName, comments, score, chosenBy, attendance, chooserStats, style } = body;
    if (!comments || comments.length === 0) {
      return Response.json({ summary: "" });
    }
    try {
      const summary = await callHaiku(buildPrompt(pubName, comments, score, chosenBy, attendance, chooserStats, style));
      return Response.json({ summary });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  // Batch regenerate all summaries
  if (body.pubs) {
    const style = body.style;
    const results = {};
    for (const pub of body.pubs) {
      if (!pub.comments || pub.comments.length === 0) continue;
      try {
        results[pub.id] = await callHaiku(buildPrompt(pub.name, pub.comments, pub.score, pub.chosenBy, pub.attendance, pub.chooserStats, style));
      } catch (e) { /* skip failed ones */ }
    }
    return Response.json({ summaries: results });
  }

  return Response.json({ error: "Invalid request" }, { status: 400 });
};

export const config = { path: "/api/summarise" };
