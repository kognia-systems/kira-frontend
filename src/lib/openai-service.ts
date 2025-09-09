


export interface OpenAISentimentResponse {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    compound: number;
  };
  emotions: {
    emotion: string;
    confidence: number;
    intensity: number;
  }[];
  insight: {
    text: string;
    type: 'positive' | 'negative' | 'neutral';
    priority: 'high' | 'medium' | 'low';
  } | null;
}

class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[OpenAI] API key not found in environment variables');
    }
  }

  async analyzeSentiment(text: string, sender: 'user' | 'agent', conversationContext?: string): Promise<OpenAISentimentResponse> {
    if (!this.apiKey) {
      console.warn('[OpenAI] API key not configured, falling back to basic analysis');
      return this.fallbackAnalysis(text);
    }

    try {
      const prompt = this.buildSentimentPrompt(text, sender, conversationContext);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en análisis de sentimientos y emociones en conversaciones de servicio al cliente. Responde SOLO con JSON válido, sin explicaciones adicionales.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Parsear la respuesta JSON
      const result = JSON.parse(content);
      
      // Validar estructura de respuesta
      if (!this.isValidResponse(result)) {
        throw new Error('Invalid response structure from OpenAI');
      }

      console.log('[OpenAI] Sentiment analysis completed:', result);
      return result;

    } catch (error) {
      console.error('[OpenAI] Error analyzing sentiment:', error);
      return this.fallbackAnalysis(text);
    }
  }

  private buildSentimentPrompt(text: string, sender: 'user' | 'agent', context?: string): string {
    return `
Analiza el siguiente mensaje de una conversación de servicio al cliente:

MENSAJE (enviado por ${sender === 'user' ? 'CLIENTE' : 'AGENTE'}): "${text}"

${context ? `CONTEXTO CONVERSACIONAL: ${context}` : ''}

Proporciona tu análisis en el siguiente formato JSON exacto:

{
  "sentiment": {
    "positive": [número entre 0 y 1],
    "neutral": [número entre 0 y 1], 
    "negative": [número entre 0 y 1],
    "compound": [número entre -1 y 1]
  },
  "emotions": [
    {
      "emotion": "[nombre de emoción detectada]",
      "confidence": [número entre 0 y 1],
      "intensity": [número entre 0 y 100]
    }
  ],
  "insight": {
    "text": "[insight contextual y específico - máximo 60 caracteres]",
    "type": "[positive/negative/neutral]",
    "priority": "[high/medium/low]"
  }
}

INSTRUCCIONES IMPORTANTES:
- Los valores de sentiment deben sumar 1
- Máximo 3 emociones detectadas
- El insight debe ser específico, contextual y único - evita frases genéricas
- Considera el rol del emisor (cliente vs agente)
- Si no detectas emociones significativas, devuelve array vacío en emotions
- Si no hay insight relevante, devuelve null en insight
`;
  }

  private isValidResponse(response: any): response is OpenAISentimentResponse {
    return response &&
           response.sentiment &&
           typeof response.sentiment.positive === 'number' &&
           typeof response.sentiment.neutral === 'number' &&
           typeof response.sentiment.negative === 'number' &&
           typeof response.sentiment.compound === 'number' &&
           Array.isArray(response.emotions);
  }

  private fallbackAnalysis(text: string): OpenAISentimentResponse {
    // Análisis básico como respaldo
    const positiveWords = /gracias|perfecto|excelente|genial|bueno|bien|contento|satisfecho/i;
    const negativeWords = /mal|terrible|horrible|disgusto|molesto|enojado|frustrado|problema/i;
    
    let positive = 0;
    let negative = 0;
    let neutral = 1;

    if (positiveWords.test(text)) {
      positive = 0.7;
      negative = 0.1;
      neutral = 0.2;
    } else if (negativeWords.test(text)) {
      positive = 0.1;
      negative = 0.7;
      neutral = 0.2;
    }

    const compound = positive - negative;

    return {
      sentiment: { positive, neutral, negative, compound },
      emotions: [],
      insight: null
    };
  }
}

// Singleton instance
export const openAIService = new OpenAIService();
