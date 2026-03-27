export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const body = await req.json();

  // Single pub summary
  if (body.pubName) {
    const { pubName, comments, score, chosenBy, attendance, chooserStats } = body;
    if (!comments || comments.length === 0) {
      return Response.json({ summary: "" });
    }

    const prompt = `You're the cheeky house comedian for the Sunday Lunch Club — six mates who rate pubs for their Sunday roasts. Write a single punchy, funny summary (max 40 words) for their visit to "${pubName}".

Overall score: ${score || "unrated"}/5
Chosen by: ${chosenBy || "unknown"}
Who turned up: ${attendance || "unknown"}
${chooserStats ? `${chosenBy}'s track record picking pubs: average ${chooserStats.avg}/5 across ${chooserStats.count} picks` : ""}

Their comments:
${comments.map(c => `${c.name}: "${c.comment}"`).join("\n")}

Be warm but cheeky. Reference the score. If the chooser picked a belter, give them credit. If it was rough, have a gentle dig. If people didn't turn up, note what they missed (or didn't miss). British humour, pub banter tone. Just the summary text, nothing else.`;

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

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: 500 });
    }

    const data = await res.json();
    return Response.json({ summary: data.content[0].text });
  }

  // Batch regenerate all summaries
  if (body.pubs) {
    const results = {};
    for (const pub of body.pubs) {
      if (!pub.comments || pub.comments.length === 0) continue;
      try {
        const prompt = `You're the cheeky house comedian for the Sunday Lunch Club — six mates who rate pubs for their Sunday roasts. Write a single punchy, funny summary (max 40 words) for their visit to "${pub.name}".

Overall score: ${pub.score || "unrated"}/5
Chosen by: ${pub.chosenBy || "unknown"}
Who turned up: ${pub.attendance || "unknown"}
${pub.chooserStats ? `${pub.chosenBy}'s track record picking pubs: average ${pub.chooserStats.avg}/5 across ${pub.chooserStats.count} picks` : ""}

Their comments:
${pub.comments.map(c => `${c.name}: "${c.comment}"`).join("\n")}

Be warm but cheeky. Reference the score. If the chooser picked a belter, give them credit. If it was rough, have a gentle dig. If people didn't turn up, note what they missed (or didn't miss). British humour, pub banter tone. Just the summary text, nothing else.`;

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

        if (res.ok) {
          const data = await res.json();
          results[pub.id] = data.content[0].text;
        }
      } catch (e) { /* skip failed ones */ }
    }
    return Response.json({ summaries: results });
  }

  return Response.json({ error: "Invalid request" }, { status: 400 });
};

export const config = { path: "/api/summarise" };
