import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai/index.mjs";

interface SatisfactionAnalysisResponse {
  sentiment_score: number; // 0 a 1
  label: "negativo" | "neutral" | "positivo";
  insight: string; // máx 1 línea
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // <-- CAMBIO: ahora usa OpenAI
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SatisfactionAnalysisResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, max_tokens = 150, temperature = 0.3 } = req.body ?? {};

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Missing 'prompt'" });
    }

    console.log("[API] 📝 Analyzing satisfaction:", {
      promptLength: prompt.length,
      maxTokens: max_tokens,
    });

    // 🔑 llamada a OpenAI Chat Completions
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en análisis de sentimientos. " +
            "Devuelve SOLO un JSON válido con las claves exactas solicitadas: " +
            '{ "sentiment_score": number (0..1), "label": "negativo"|"neutral"|"positivo", "insight": string (máx 100 chars) }',
        },
        { role: "user", content: prompt },
      ],
      max_tokens,
      temperature,
      response_format: { type: "json_object" }, // <-- fuerza salida JSON
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in LLM response");
    }

    const analysis = JSON.parse(content);
    console.log("[API] ✅ Parsed analysis:", analysis);

    const result: SatisfactionAnalysisResponse = {
      sentiment_score: Math.max(
        0,
        Math.min(1, Number(analysis.sentiment_score ?? 0.5))
      ),
      label: ["negativo", "neutral", "positivo"].includes(analysis.label)
        ? analysis.label
        : "neutral",
      insight:
        typeof analysis.insight === "string"
          ? analysis.insight.substring(0, 100)
          : "Sin cambios detectados.",
    };

    console.log("[API] 📊 Final result:", result);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[API] ❌ Error:", error);
    return res.status(200).json({
      sentiment_score: 0.5,
      label: "neutral",
      insight: "Sin cambios detectados.",
    });
  }
}
