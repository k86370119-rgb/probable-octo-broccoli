export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, system } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 1000,
        messages: [
          { role: "system", content: system || "" },
          ...messages.filter(m => m.role !== "system").map(m => ({
            role: m.role,
            content: typeof m.content === "string" ? m.content : m.content?.find?.(c => c.type === "text")?.text || ""
          }))
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.log("Groq error:", data.error.message);
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || "Samahani, try again!";
    return res.status(200).json({
      choices: [{ message: { content: reply } }]
    });

  } catch (error) {
    console.log("Server error:", error.message);
    return res.status(500).json({ error: "Server error!" });
  }
      }
