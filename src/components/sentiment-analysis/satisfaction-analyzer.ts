
"use client";

import { Message, MessageSender } from "@/components/logic";

// Tipos para el análisis de satisfacción
export interface SatisfactionResult {
  sentiment_score: number; // 0 a 1
  label: "negativo" | "neutral" | "positivo";
  insight: string; // máx 1 línea
}

export interface AnalysisState {
  isAnalyzing: boolean;
  lastResult: SatisfactionResult | null;
  lastAnalyzedAt: Date | null;
  error: string | null;
  conversationLength: number; // para detectar cambios
}

export class SatisfactionAnalyzer {
  private timeout = 8000; // 8 segundos de timeout
  private abortController: AbortController | null = null;

  // Prompt fijo según especificación
  private readonly ANALYSIS_PROMPT = `A partir del siguiente texto de conversación, realiza un análisis de sentimiento en una escala de 0 a 1 (0 = muy negativo, 1 = muy positivo). Devuelve la respuesta SOLO en JSON con las claves:

"sentiment_score": número entre 0 y 1
"label": negativo / neutral / positivo  
"insight": frase breve (máx. 1 línea) que resuma el estado del cliente

Texto de conversación:`;

  // Convertir mensajes a texto para análisis
  private formatConversationForAnalysis(messages: Message[]): string {
    if (messages.length === 0) {
      return "No hay conversación aún.";
    }

    return messages
      .map(msg => {
        const sender = msg.sender === MessageSender.CLIENT ? "Cliente" : "Avatar";
        return `${sender}: ${msg.content}`;
      })
      .join('\n');
  }

  // Fallback si falla el análisis
  private getFallbackResult(): SatisfactionResult {
    return {
      sentiment_score: 0.5,
      label: "neutral",
      insight: "Sin cambios detectados."
    };
  }

  // Validar respuesta JSON
  private validateResult(data: any): SatisfactionResult | null {
    if (!data || typeof data !== 'object') return null;
    
    const { sentiment_score, label, insight } = data;
    
    // Validar sentiment_score
    if (typeof sentiment_score !== 'number' || sentiment_score < 0 || sentiment_score > 1) {
      return null;
    }
    
    // Validar label
    if (!["negativo", "neutral", "positivo"].includes(label)) {
      return null;
    }
    
    // Validar insight
    if (typeof insight !== 'string' || insight.length === 0) {
      return null;
    }
    
    return { sentiment_score, label, insight };
  }

  // Análisis principal usando GPT-4
  async analyzeConversation(messages: Message[]): Promise<SatisfactionResult> {
    // Cancelar análisis anterior si existe
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();
    const conversationText = this.formatConversationForAnalysis(messages);
    
    console.log('[SatisfactionAnalyzer] 🔍 Analizando conversación:', { 
      messageCount: messages.length,
      textLength: conversationText.length 
    });

    try {
      const response = await fetch('/api/analyze-satisfaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${this.ANALYSIS_PROMPT}\n\n${conversationText}`,
          max_tokens: 150,
          temperature: 0.3, // Más determinístico para análisis
        }),
        signal: this.abortController.signal,
      });

      // Timeout manual adicional
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), this.timeout);
      });

      const result = await Promise.race([
        response.json(),
        timeoutPromise
      ]);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Intentar parsear el JSON de GPT-4
      let analysisResult;
      if (result.content) {
        // Si viene envuelto en content
        analysisResult = JSON.parse(result.content);
      } else if (result.choices?.[0]?.message?.content) {
        // Si viene en formato OpenAI standard
        analysisResult = JSON.parse(result.choices[0].message.content);
      } else {
        // Si viene directo
        analysisResult = result;
      }

      const validatedResult = this.validateResult(analysisResult);
      if (validatedResult) {
        console.log('[SatisfactionAnalyzer] ✅ Análisis exitoso:', validatedResult);
        return validatedResult;
      } else {
        console.warn('[SatisfactionAnalyzer] ⚠️ Resultado inválido, usando fallback');
        return this.getFallbackResult();
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[SatisfactionAnalyzer] 🚫 Análisis cancelado');
        throw error;
      }
      
      console.error('[SatisfactionAnalyzer] ❌ Error en análisis:', error);
      console.log('[SatisfactionAnalyzer] 🔄 Usando resultado fallback');
      return this.getFallbackResult();
    } finally {
      this.abortController = null;
    }
  }

  // Generar resumen final de la sesión
  generateSessionSummary(messages: Message[], finalResult: SatisfactionResult): string {
    const totalMessages = messages.length;
    const clientMessages = messages.filter(m => m.sender === MessageSender.CLIENT).length;
    const avatarMessages = messages.filter(m => m.sender === MessageSender.AVATAR).length;

    return `Resumen de sesión: ${totalMessages} mensajes totales (${clientMessages} del cliente, ${avatarMessages} del avatar). Satisfacción final: ${Math.round(finalResult.sentiment_score * 100)}/100 (${finalResult.label}). ${finalResult.insight}`;
  }

  // Cancelar análisis en curso
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
