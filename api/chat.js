export default async function handler(req, res) {
  const { messages } = req.body;

  const system = `Du är en lead-agent för ett byggföretag. Svara på svenska, vänligt och kort (max 3 meningar).
Ställ EN fråga i taget för att ta reda på: typ av projekt, ort, budget, önskad starttid och namn + telefon.
Om kunden har ett konkret projekt, budget över 50 000 kr och vill starta inom 3 månader: föreslå ett kostnadsfritt platsbesök och ge två tidsförslag.
Hitta aldrig på priser.`;

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-4-hydrogen:generateContent?key=" + process.env.GEMINI_API_KEY;

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))
    })
  });

  const d = await r.json();
  const parts = d.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p.text || "").join("").trim() || "Något gick fel, försök igen.";
  res.status(200).json({ text });
}
