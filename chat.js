// Vercel serverless function: keeps your API key on the server.
const hits = new Map();
const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || "40", 10); // requests per visitor per day
const MAX_PROMPT = 12000;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });

  const ip = String(req.headers["x-forwarded-for"] || "x").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 86400000);
  if (recent.length >= DAILY_LIMIT) return res.status(429).json({ error: "Daily limit reached. Come back tomorrow!" });

  const prompt = req.body && req.body.prompt;
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_PROMPT)
    return res.status(400).json({ error: "Bad request." });
  if (!/Mochi|multiple-choice quiz/.test(prompt)) return res.status(400).json({ error: "Bad request." });

  recent.push(now); hits.set(ip, recent);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.MODEL || "claude-sonnet-4-6",
        max_tokens: 2000,
        system: "You are Mochi, a study buddy for university-level maths and computer science. Only help with studying those subjects.",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: (data.error && data.error.message) || "AI request failed." });
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    res.status(200).json({ text, truncated: data.stop_reason === "max_tokens" });
  } catch (e) {
    res.status(500).json({ error: "Server error." });
  }
};
