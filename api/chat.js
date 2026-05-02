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

    const geminiMessages = messages
      .filter(m => m.role !== "system")
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: typeof m.content === "string" ? m.content : m.content?.find?.(c => c.type === "text")?.text || "" }]
      }));

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system || "" }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 1000 }
        })
      }
    );

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data));

    if (data.error) {
      console.log("Gemini error:", data.error.message);
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Samahani, try again!";

    return res.status(200).json({
      choices: [{ message: { content: reply } }]
    });

  } catch (error) {
    console.log("Server error:", error.message);
    return res.status(500).json({ error: "Server error!" });
  }
}
