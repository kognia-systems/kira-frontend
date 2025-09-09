
import type { NextApiRequest, NextApiResponse } from 'next';

interface SatisfactionAnalysisResponse {
  sentiment_score: number; // 0 a 1
  label: "negativo" | "neutral" | "positivo";
  insight: string; // máx 1 línea
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SatisfactionAnalysisResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, max_tokens = 150, temperature = 0.3 } = req.body;

    console.log('[API] 📝 Analyzing conversation satisfaction:', { 
      promptLength: prompt?.length,
      maxTokens: max_tokens 
    });

    const apiKey = process.env.ABACUSAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Configurar request para LLM API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en análisis de sentimientos. Siempre respondes SOLO en formato JSON válido con las claves exactas solicitadas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens,
        temperature,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[API] 🤖 LLM Response received');

    // Extraer y parsear la respuesta
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in LLM response');
    }

    const analysis = JSON.parse(content);
    console.log('[API] ✅ Parsed analysis:', analysis);

    // Validar y normalizar respuesta según especificación exacta
    const result: SatisfactionAnalysisResponse = {
      sentiment_score: Math.max(0, Math.min(1, analysis.sentiment_score || 0.5)),
      label: ["negativo", "neutral", "positivo"].includes(analysis.label) ? analysis.label : "neutral",
      insight: (analysis.insight || "Sin cambios detectados.").substring(0, 100) // máx 1 línea
    };

    console.log('[API] 📊 Final result:', result);
    res.status(200).json(result);

  } catch (error) {
    console.error('[API] ❌ Error in satisfaction analysis:', error);
    
    // Respuesta fallback según especificación
    res.status(200).json({
      sentiment_score: 0.5,
      label: "neutral",
      insight: "Sin cambios detectados."
    });
  }
}
