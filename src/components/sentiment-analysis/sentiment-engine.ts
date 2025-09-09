

import { 
  SentimentScore, 
  EmotionAnalysis, 
  SentimentInsight, 
  CustomerSatisfactionMetrics,
  ConversationSummary,
  MessageAnalysis,
  SentimentEvent 
} from './types';

// Patrones de palabras para análisis de sentimientos
const SENTIMENT_PATTERNS = {
  positive: [
    /gracias/i, /perfecto/i, /excelente/i, /genial/i, /bueno/i, /bien/i,
    /contento/i, /satisfecho/i, /feliz/i, /me gusta/i, /estupendo/i,
    /fantástico/i, /maravilloso/i, /increíble/i, /solución/i, /resuelto/i
  ],
  negative: [
    /mal/i, /terrible/i, /horrible/i, /disgusto/i, /molesto/i, /enojado/i,
    /frustrado/i, /problema/i, /error/i, /fallo/i, /deficiente/i,
    /inaceptable/i, /preocupado/i, /decepcionado/i, /furioso/i, /indignado/i
  ],
  neutral: [
    /entiendo/i, /comprendo/i, /información/i, /consulta/i, /pregunta/i,
    /necesito/i, /quiero/i, /puede/i, /podría/i, /cuando/i, /como/i
  ]
};

// Patrones de emociones específicas
const EMOTION_PATTERNS = {
  calma: [/tranquil/i, /calm/i, /relajad/i, /sereno/i, /pacienci/i],
  frustración: [/frustrad/i, /desesper/i, /harto/i, /cansad/i, /irritad/i],
  confianza: [/segur/i, /confí/i, /tranquil/i, /certain/i, /convencid/i],
  preocupación: [/preocup/i, /inquiet/i, /nervios/i, /ansiedad/i, /temor/i],
  satisfacción: [/satisfech/i, /content/i, /feliz/i, /alegr/i, /gust/i],
  urgencia: [/urgente/i, /rápid/i, /prisa/i, /inmediatament/i, /ya/i]
};

export class SentimentAnalysisEngine {
  private satisfactionHistory: number[] = [];
  private insights: SentimentInsight[] = [];
  private conversationMessages: MessageAnalysis[] = [];
  private startTime: Date | null = null;
  private customerName: string | null = null;
  private contactReason: string | null = null;
  private executedActions: string[] = [];

  constructor() {
    this.startTime = new Date();
  }

  // Analizar sentimiento de un mensaje
  public analyzeSentiment(text: string): SentimentScore {
    if (!text || typeof text !== 'string') {
      return { positive: 0, neutral: 1, negative: 0, compound: 0 };
    }

    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    // Analizar patrones positivos
    SENTIMENT_PATTERNS.positive.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) positiveScore += matches.length;
    });

    // Analizar patrones negativos
    SENTIMENT_PATTERNS.negative.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) negativeScore += matches.length;
    });

    // Analizar patrones neutrales
    SENTIMENT_PATTERNS.neutral.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) neutralScore += matches.length;
    });

    // Normalizar puntuaciones
    const total = positiveScore + negativeScore + neutralScore || 1;
    const positive = positiveScore / total;
    const negative = negativeScore / total;
    const neutral = neutralScore / total;

    // Calcular puntuación compuesta (-1 a 1)
    const compound = (positive - negative);

    return { positive, neutral, negative, compound };
  }

  // Detectar emociones en el texto
  public detectEmotions(text: string): EmotionAnalysis[] {
    if (!text || typeof text !== 'string') return [];

    const emotions: EmotionAnalysis[] = [];

    Object.entries(EMOTION_PATTERNS).forEach(([emotion, patterns]) => {
      let confidence = 0;
      patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          confidence += matches.length * 0.3;
        }
      });

      if (confidence > 0) {
        emotions.push({
          emotion,
          confidence: Math.min(confidence, 1),
          intensity: Math.min(confidence * 100, 100)
        });
      }
    });

    return emotions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  // Analizar mensaje completo
  public analyzeMessage(text: string, sender: 'user' | 'agent'): MessageAnalysis {
    const sentiment = this.analyzeSentiment(text);
    const emotions = this.detectEmotions(text);
    
    // Calcular impacto en satisfacción
    let satisfactionImpact = sentiment.compound * 10;
    
    // Ajustar según el emisor
    if (sender === 'agent') {
      satisfactionImpact *= 0.8; // Las respuestas del agente tienen menos impacto directo
    }

    // Detectar palabras clave
    const keyWords = this.extractKeywords(text);

    const analysis: MessageAnalysis = {
      text,
      sender,
      sentiment,
      emotions,
      satisfactionImpact,
      keyWords
    };

    this.conversationMessages.push(analysis);
    this.updateSatisfactionScore(satisfactionImpact);
    this.generateInsights(analysis);
    this.extractConversationData(text, sender);

    return analysis;
  }

  // Extraer palabras clave
  private extractKeywords(text: string): string[] {
    const commonWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'uno', 'una', 'pero', 'todo', 'más', 'muy', 'mi', 'me', 'he', 'ha', 'si', 'yo'];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5);
  }

  // Actualizar puntuación de satisfacción
  private updateSatisfactionScore(impact: number) {
    const currentScore = this.getCurrentSatisfactionScore();
    const newScore = Math.max(0, Math.min(100, currentScore + impact));
    this.satisfactionHistory.push(newScore);
  }

  // Obtener puntuación actual de satisfacción
  public getCurrentSatisfactionScore(): number {
    if (this.satisfactionHistory.length === 0) return 50; // Comenzar neutral
    return this.satisfactionHistory[this.satisfactionHistory.length - 1];
  }

  // Obtener métricas de satisfacción
  public getSatisfactionMetrics(): CustomerSatisfactionMetrics {
    if (this.satisfactionHistory.length === 0) {
      return {
        currentScore: 50,
        trend: 'stable',
        peakScore: 50,
        lowestScore: 50,
        averageScore: 50
      };
    }

    const currentScore = this.getCurrentSatisfactionScore();
    const peakScore = Math.max(...this.satisfactionHistory);
    const lowestScore = Math.min(...this.satisfactionHistory);
    const averageScore = this.satisfactionHistory.reduce((a, b) => a + b, 0) / this.satisfactionHistory.length;

    // Determinar tendencia
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (this.satisfactionHistory.length >= 3) {
      const recent = this.satisfactionHistory.slice(-3);
      const initialRecent = recent[0];
      const finalRecent = recent[recent.length - 1];
      
      if (finalRecent > initialRecent + 5) trend = 'increasing';
      else if (finalRecent < initialRecent - 5) trend = 'decreasing';
    }

    return {
      currentScore,
      trend,
      peakScore,
      lowestScore,
      averageScore: Math.round(averageScore)
    };
  }

  // Generar insights
  private generateInsights(analysis: MessageAnalysis) {
    const insights: string[] = [];

    // Insight basado en sentimiento
    if (analysis.sentiment.compound > 0.3) {
      insights.push("El cliente muestra una actitud positiva");
    } else if (analysis.sentiment.compound < -0.3) {
      insights.push("Se detecta frustración en el cliente");
    }

    // Insight basado en emociones
    if (analysis.emotions.length > 0) {
      const dominantEmotion = analysis.emotions[0];
      switch (dominantEmotion.emotion) {
        case 'frustración':
          insights.push("Cliente presenta signos de frustración - requiere atención especial");
          break;
        case 'satisfacción':
          insights.push("El cliente se siente satisfecho con la atención");
          break;
        case 'urgencia':
          insights.push("El cliente requiere una respuesta urgente");
          break;
        case 'confianza':
          insights.push("Se establece una buena relación de confianza");
          break;
      }
    }

    // Generar insight si hay alguno
    if (insights.length > 0) {
      const insight: SentimentInsight = {
        id: `insight_${Date.now()}`,
        timestamp: new Date(),
        text: insights[0],
        type: analysis.sentiment.compound > 0 ? 'positive' : analysis.sentiment.compound < -0.2 ? 'negative' : 'neutral',
        priority: Math.abs(analysis.sentiment.compound) > 0.5 ? 'high' : 'medium'
      };

      this.insights.push(insight);
    }
  }

  // Extraer datos de la conversación
  private extractConversationData(text: string, sender: 'user' | 'agent') {
    // Detectar nombre del cliente
    if (!this.customerName && sender === 'user') {
      const namePatterns = [
        /mi nombre es (\w+)/i,
        /soy (\w+)/i,
        /me llamo (\w+)/i
      ];
      
      namePatterns.forEach(pattern => {
        const match = text.match(pattern);
        if (match && !this.customerName) {
          this.customerName = match[1];
        }
      });
    }

    // Detectar motivo de contacto
    if (!this.contactReason && sender === 'user') {
      const reasonPatterns = [
        /tengo un problema con/i,
        /necesito ayuda con/i,
        /quiero consultar sobre/i,
        /me contacto por/i
      ];

      reasonPatterns.forEach(pattern => {
        if (pattern.test(text) && !this.contactReason) {
          this.contactReason = text.substring(0, 100);
        }
      });
    }

    // Detectar acciones ejecutadas (por el agente)
    if (sender === 'agent') {
      const actionPatterns = [
        /he realizado/i,
        /he procesado/i,
        /he verificado/i,
        /he solucionado/i,
        /voy a procesar/i
      ];

      actionPatterns.forEach(pattern => {
        if (pattern.test(text)) {
          this.executedActions.push(text.substring(0, 80));
        }
      });
    }
  }

  // Obtener insights recientes
  public getRecentInsights(): SentimentInsight[] {
    return this.insights.slice(-5).reverse();
  }

  // Obtener emociones dominantes actuales
  public getDominantEmotions(): EmotionAnalysis[] {
    const recentMessages = this.conversationMessages.slice(-3);
    const emotionMap = new Map<string, EmotionAnalysis>();

    recentMessages.forEach(message => {
      message.emotions.forEach(emotion => {
        const existing = emotionMap.get(emotion.emotion);
        if (!existing || emotion.intensity > existing.intensity) {
          emotionMap.set(emotion.emotion, emotion);
        }
      });
    });

    return Array.from(emotionMap.values())
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3);
  }

  // Generar resumen de conversación
  public generateConversationSummary(): ConversationSummary {
    const metrics = this.getSatisfactionMetrics();
    const dominantEmotions = this.getDominantEmotions();
    const duration = this.startTime ? (Date.now() - this.startTime.getTime()) / 1000 : 0;

    // Determinar estado de resolución
    let resolutionStatus: 'resolved' | 'pending' | 'escalated' = 'pending';
    if (metrics.currentScore >= 80) {
      resolutionStatus = 'resolved';
    } else if (metrics.currentScore < 30) {
      resolutionStatus = 'escalated';
    }

    return {
      customerName: this.customerName || 'Cliente',
      contactReason: this.contactReason || 'Consulta general',
      executedActions: [...new Set(this.executedActions)], // Eliminar duplicados
      finalSatisfaction: metrics.currentScore,
      dominantEmotion: dominantEmotions[0]?.emotion || 'neutral',
      conversationDuration: Math.round(duration),
      keyInsights: this.insights.slice(-3).map(i => i.text),
      resolutionStatus
    };
  }

  // Resetear engine
  public reset() {
    this.satisfactionHistory = [];
    this.insights = [];
    this.conversationMessages = [];
    this.startTime = new Date();
    this.customerName = null;
    this.contactReason = null;
    this.executedActions = [];
  }

  // Finalizar conversación
  public endConversation() {
    console.log('[SentimentEngine] Conversation ended');
    // No resetear datos, mantener para resumen final
  }
}

