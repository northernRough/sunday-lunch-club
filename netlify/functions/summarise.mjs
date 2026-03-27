export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { pubName, comments } = await req.json();
  if (!comments || comments.length === 0) {
    return Response.json({ summary: "" });
  }

  const prompt = `You are summarising comments from a group of friends who visited "${pubName}" for Sunday lunch. Here are their individual comments:\n\n${comments.map(c => `${c.name}: "${c.comment}"`).join("\n")}\n\nWrite a single brief, fun summary sentence (max 30 words) capturing the overall sentiment. Use a warm, casual British tone. Do not mention anyone by name. Just return the summary text, nothing else.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: err }, { status: 500 });
  }

  const data = await res.json();
  const summary = data.content[0].text;
  return Response.json({ summary });
};

export const config = { path: "/api/summarise" };
