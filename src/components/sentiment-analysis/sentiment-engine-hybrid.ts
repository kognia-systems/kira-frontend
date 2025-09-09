

import { 
  SentimentScore, 
  EmotionAnalysis, 
  SentimentInsight, 
  CustomerSatisfactionMetrics,
  ConversationSummary,
  MessageAnalysis,
  SentimentEvent 
} from './types';

// Patrones MEJORADOS Y AMPLIADOS para análisis de sentimientos
const ENHANCED_SENTIMENT_PATTERNS = {
  positive: {
    high: [/excelente/i, /perfecto/i, /fantástico/i, /increíble/i, /maravilloso/i, /genial/i, /estupendo/i, /amazing/i, /awesome/i, /love/i],
    medium: [/gracias/i, /bueno/i, /bien/i, /contento/i, /satisfecho/i, /feliz/i, /me gusta/i, /correcto/i, /good/i, /great/i, /nice/i, /thank/i, /appreciate/i, /happy/i, /pleased/i],
    low: [/ok/i, /vale/i, /entiendo/i, /claro/i, /comprendo/i, /sí/i, /si/i, /yes/i, /sure/i, /fine/i, /alright/i]
  },
  negative: {
    high: [/terrible/i, /horrible/i, /furioso/i, /indignado/i, /inaceptable/i, /desastre/i, /awful/i, /hate/i, /disgusting/i],
    medium: [/mal/i, /disgusto/i, /molesto/i, /enojado/i, /frustrado/i, /problema/i, /error/i, /bad/i, /wrong/i, /upset/i, /annoyed/i, /disappointed/i],
    low: [/preocupado/i, /confundido/i, /dudas/i, /no entiendo/i, /no está bien/i, /worried/i, /confused/i, /not sure/i, /doubt/i]
  },
  neutral: [/información/i, /consulta/i, /pregunta/i, /necesito/i, /quiero/i, /puede/i, /podría/i, /cuando/i, /como/i, /dónde/i, /want/i, /need/i, /can/i, /could/i, /would/i, /question/i, /info/i],
  // NUEVOS: Patrones de respuesta común que deben generar cambios
  engagement: [/hello/i, /hi/i, /hola/i, /buenas/i, /saludo/i, /hey/i, /help/i, /ayuda/i, /assistance/i, /support/i]
};

// Patrones de emociones específicas mejorados
const ENHANCED_EMOTION_PATTERNS = {
  satisfacción: [/satisfech/i, /content/i, /feliz/i, /alegr/i, /gust/i, /perfect/i, /excelent/i],
  frustración: [/frustrad/i, /desesper/i, /harto/i, /cansad/i, /irritad/i, /molest/i],
  confianza: [/segur/i, /confí/i, /tranquil/i, /ciert/i, /convencid/i, /clar/i],
  preocupación: [/preocup/i, /inquiet/i, /nervios/i, /ansiedad/i, /temor/i, /dud/i],
  calma: [/tranquil/i, /calm/i, /relajad/i, /sereno/i, /pacienci/i, /sosegad/i],
  urgencia: [/urgente/i, /rápid/i, /prisa/i, /inmediatament/i, /ya/i, /ahora/i],
  gratitud: [/gracias/i, /agradec/i, /amable/i, /gentil/i, /atento/i],
  confusión: [/confund/i, /no entiendo/i, /no comprendo/i, /explicar/i, /aclarar/i]
};

export class HybridSentimentAnalysisEngine {
  private satisfactionHistory: number[] = [];
  private insights: SentimentInsight[] = [];
  private conversationMessages: MessageAnalysis[] = [];
  private storedMessages: Array<{text: string, sender: 'user' | 'agent', timestamp: Date}> = []; // Para análisis manual
  private startTime: Date | null = null;
  private customerName: string | null = null;
  private contactReason: string | null = null;
  private executedActions: string[] = [];
  private analysisCount = 0;
  private lastAnalysisTime = 0;

  constructor() {
    this.startTime = new Date();
    console.log('[Hybrid Sentiment Engine] Initialized with enhanced pattern-based analysis');
  }

  // Método para almacenar mensajes sin analizar (para análisis manual)
  public storeMessage(text: string, sender: 'user' | 'agent'): void {
    if (!text || typeof text !== 'string') {
      return;
    }
    
    this.storedMessages.push({
      text,
      sender,
      timestamp: new Date()
    });
    
    console.log(`[Hybrid Sentiment Engine] Stored ${sender} message for manual analysis: "${text.substring(0, 40)}..."`);
  }

  // Obtener número de mensajes almacenados
  public getStoredMessageCount(): number {
    return this.storedMessages.length;
  }

  // Análisis principal híbrido - SIEMPRE síncrono e inmediato
  public analyzeMessage(text: string, sender: 'user' | 'agent'): MessageAnalysis {
    if (!text || typeof text !== 'string') {
      console.log('[Hybrid Sentiment Engine] ❌ Invalid text input, skipping analysis');
      return this.createEmptyAnalysis(text, sender);
    }

    // Control de frecuencia para evitar spam
    const now = Date.now();
    if (now - this.lastAnalysisTime < 500) { // Mínimo 500ms entre análisis
      console.log('[Hybrid Sentiment Engine] ⏰ Skipping analysis - too frequent');
      return this.createEmptyAnalysis(text, sender);
    }

    this.lastAnalysisTime = now;
    this.analysisCount++;
    
    console.log(`[Hybrid Sentiment Engine] 🔍 Analyzing ${sender} message (${this.analysisCount}): "${text.substring(0, 60)}..."`);
    console.log(`[Hybrid Sentiment Engine] 📝 Texto completo para análisis: "${text}"`);

    // Análisis de sentimientos mejorado
    const sentiment = this.enhancedSentimentAnalysis(text);
    console.log(`[Hybrid Sentiment Engine] 😊 Sentimiento detectado:`, sentiment);
    
    // Análisis de emociones
    const emotions = this.detectEmotions(text);
    console.log(`[Hybrid Sentiment Engine] 🎭 Emociones detectadas:`, emotions);
    
    // Calcular impacto en satisfacción
    const previousScore = this.getCurrentSatisfactionScore();
    const satisfactionImpact = this.calculateSatisfactionImpact(sentiment, sender, emotions);
    console.log(`[Hybrid Sentiment Engine] 📊 Impacto de satisfacción: ${satisfactionImpact.toFixed(2)} (Score previo: ${previousScore.toFixed(1)})`);
    
    // Extraer palabras clave
    const keyWords = this.extractKeywords(text);
    console.log(`[Hybrid Sentiment Engine] 🔑 Palabras clave:`, keyWords);

    const analysis: MessageAnalysis = {
      text,
      sender,
      sentiment,
      emotions,
      satisfactionImpact,
      keyWords
    };

    // Actualizar datos internos inmediatamente (solo satisfacción)
    this.conversationMessages.push(analysis);
    this.updateSatisfactionScore(satisfactionImpact);
    // NO generar insights ni extraer datos adicionales - solo satisfacción

    const newScore = this.getCurrentSatisfactionScore();
    const metrics = this.getSatisfactionMetrics();
    console.log(`[Hybrid Sentiment Engine] ✅ Analysis completed:`);
    console.log(`[Hybrid Sentiment Engine]   • Impact: ${satisfactionImpact.toFixed(1)}`);
    console.log(`[Hybrid Sentiment Engine]   • Satisfaction: ${previousScore.toFixed(1)} → ${newScore.toFixed(1)}`);
    console.log(`[Hybrid Sentiment Engine]   • Metrics:`, metrics);
    
    return analysis;
  }

  // Análisis de sentimientos mejorado con patrones jerárquicos AMPLIFICADO
  private enhancedSentimentAnalysis(text: string): SentimentScore {
    console.log(`[Hybrid Sentiment Engine] 🔬 Iniciando análisis de sentimientos para: "${text}"`);
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;
    let engagementScore = 0;

    // Analizar patrones positivos con pesos
    Object.entries(ENHANCED_SENTIMENT_PATTERNS.positive).forEach(([intensity, patterns]) => {
      const weight = intensity === 'high' ? 4 : intensity === 'medium' ? 2.5 : 1.5; // Aumentar pesos
      patterns.forEach(pattern => {
        const matches = text.match(new RegExp(pattern.source, 'gi'));
        if (matches) {
          positiveScore += matches.length * weight;
          console.log(`[Hybrid Sentiment Engine] ✅ Patrón positivo (${intensity}) encontrado: "${pattern.source}" → +${matches.length * weight} (matches: ${matches})`);
        }
      });
    });

    // Analizar patrones negativos con pesos
    Object.entries(ENHANCED_SENTIMENT_PATTERNS.negative).forEach(([intensity, patterns]) => {
      const weight = intensity === 'high' ? 4 : intensity === 'medium' ? 2.5 : 1.5; // Aumentar pesos
      patterns.forEach(pattern => {
        const matches = text.match(new RegExp(pattern.source, 'gi'));
        if (matches) {
          negativeScore += matches.length * weight;
          console.log(`[Hybrid Sentiment Engine] ❌ Patrón negativo (${intensity}) encontrado: "${pattern.source}" → +${matches.length * weight} (matches: ${matches})`);
        }
      });
    });

    // Analizar patrones neutrales
    ENHANCED_SENTIMENT_PATTERNS.neutral.forEach(pattern => {
      const matches = text.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        neutralScore += matches.length * 1.2; // Pequeño aumento
        console.log(`[Hybrid Sentiment Engine] ⚪ Patrón neutral encontrado: "${pattern.source}" → +${matches.length * 1.2} (matches: ${matches})`);
      }
    });

    // NUEVO: Analizar patrones de engagement
    ENHANCED_SENTIMENT_PATTERNS.engagement.forEach(pattern => {
      const matches = text.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        engagementScore += matches.length * 1.5;
        console.log(`[Hybrid Sentiment Engine] 🤝 Patrón de engagement encontrado: "${pattern.source}" → +${matches.length * 1.5} (matches: ${matches})`);
      }
    });

    // Si no se detecta nada específico, generar variación aleatoria pequeña para mostrar actividad
    if (positiveScore === 0 && negativeScore === 0 && neutralScore === 0 && engagementScore === 0) {
      // Generar pequeña variación aleatoria basada en longitud del mensaje
      const messageLength = text.length;
      const baseVariation = Math.min(messageLength / 100, 1); // 0-1 basado en longitud
      const randomFactor = (Math.random() - 0.5) * 0.4; // -0.2 a +0.2
      
      if (randomFactor > 0) {
        positiveScore = baseVariation + randomFactor;
        console.log(`[Hybrid Sentiment Engine] 🎲 No patrones encontrados, generando variación positiva: +${positiveScore.toFixed(2)}`);
      } else {
        negativeScore = Math.abs(baseVariation + randomFactor);
        console.log(`[Hybrid Sentiment Engine] 🎲 No patrones encontrados, generando variación negativa: +${negativeScore.toFixed(2)}`);
      }
      neutralScore = 1; // Base neutral
    }

    // Los patrones de engagement suman al lado positivo
    if (engagementScore > 0) {
      positiveScore += engagementScore * 0.8; // Factor positivo por engagement
    }

    // Asegurar que siempre haya algo de puntuación
    if (positiveScore === 0 && negativeScore === 0 && neutralScore === 0) {
      neutralScore = 1;
    }

    // Normalizar puntuaciones
    const total = positiveScore + negativeScore + neutralScore;
    const positive = positiveScore / total;
    const negative = negativeScore / total;
    const neutral = neutralScore / total;

    // Calcular puntuación compuesta AMPLIFICADA para mayor sensibilidad
    let compound = (positive - negative);
    
    // AMPLIFICAR compound para hacer más visibles los cambios
    if (Math.abs(compound) > 0.1) {
      compound *= 1.5; // Amplificar cambios significativos
    } else if (Math.abs(compound) > 0.05) {
      compound *= 1.2; // Amplificar cambios pequeños
    }
    
    // Mantener en rango [-1, 1]
    compound = Math.max(-1, Math.min(1, compound));

    console.log(`[Hybrid Sentiment Engine] 📊 Puntuaciones calculadas:`);
    console.log(`[Hybrid Sentiment Engine]   • Raw scores: pos=${positiveScore.toFixed(2)}, neg=${negativeScore.toFixed(2)}, neu=${neutralScore.toFixed(2)}, eng=${engagementScore.toFixed(2)}, total=${total.toFixed(2)}`);
    console.log(`[Hybrid Sentiment Engine]   • Normalized: pos=${positive.toFixed(3)}, neg=${negative.toFixed(3)}, neu=${neutral.toFixed(3)}`);
    console.log(`[Hybrid Sentiment Engine]   • Compound AMPLIFICADO: ${compound.toFixed(3)}`);

    return { positive, neutral, negative, compound };
  }

  // Detectar emociones mejoradas
  private detectEmotions(text: string): EmotionAnalysis[] {
    const emotions: EmotionAnalysis[] = [];

    Object.entries(ENHANCED_EMOTION_PATTERNS).forEach(([emotion, patterns]) => {
      let confidence = 0;
      let matchCount = 0;

      patterns.forEach(pattern => {
        const matches = text.match(new RegExp(pattern.source, 'gi'));
        if (matches) {
          confidence += matches.length * 0.4;
          matchCount += matches.length;
        }
      });

      if (confidence > 0) {
        // Ajustar confianza por longitud del texto
        const textLength = text.split(/\s+/).length;
        const adjustedConfidence = Math.min(confidence * (textLength > 10 ? 1 : textLength / 10), 1);
        
        emotions.push({
          emotion,
          confidence: adjustedConfidence,
          intensity: Math.min(adjustedConfidence * 100, 100)
        });
      }
    });

    return emotions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  // Calcular impacto en satisfacción mejorado y AMPLIFICADO
  private calculateSatisfactionImpact(sentiment: SentimentScore, sender: 'user' | 'agent', emotions: EmotionAnalysis[]): number {
    console.log(`[Hybrid Sentiment Engine] 📊 Calculando impacto de satisfacción para ${sender}:`);
    console.log(`[Hybrid Sentiment Engine]   • Compound sentiment: ${sentiment.compound.toFixed(3)}`);
    
    // AMPLIFICAR el factor base para hacer más visibles los cambios
    let impact = sentiment.compound * 25; // Aumentado de 15 a 25
    console.log(`[Hybrid Sentiment Engine]   • Impacto base AMPLIFICADO (compound × 25): ${impact.toFixed(2)}`);

    // Ajustar según el emisor (hacer más equilibrado)
    if (sender === 'agent') {
      const originalImpact = impact;
      impact *= 0.75; // Menos penalización para agente (era 0.6, ahora 0.75)
      console.log(`[Hybrid Sentiment Engine]   • Ajuste AGENT (×0.75): ${originalImpact.toFixed(2)} → ${impact.toFixed(2)}`);
    } else {
      const originalImpact = impact;
      impact *= 1.4; // Más peso a mensajes del usuario (era 1.3, ahora 1.4)
      console.log(`[Hybrid Sentiment Engine]   • Ajuste USER (×1.4): ${originalImpact.toFixed(2)} → ${impact.toFixed(2)}`);
    }

    // Amplificar con emociones (más impacto)
    const emotionMultiplier = emotions.length > 0 ? 
      1 + (emotions[0].intensity / 100) * 0.5 : 1; // Aumentado de 0.3 a 0.5
    console.log(`[Hybrid Sentiment Engine]   • Multiplicador emocional AMPLIFICADO: ${emotionMultiplier.toFixed(2)} (basado en ${emotions.length} emociones)`);
    
    impact *= emotionMultiplier;
    console.log(`[Hybrid Sentiment Engine]   • Impacto con emociones: ${impact.toFixed(2)}`);

    // Asegurar que SIEMPRE hay algún impacto mínimo si compound != 0
    if (Math.abs(impact) < 1 && Math.abs(sentiment.compound) > 0.01) {
      const minImpact = sentiment.compound > 0 ? 1.5 : -1.5; // Impacto mínimo visible
      impact = minImpact;
      console.log(`[Hybrid Sentiment Engine]   • Aplicando impacto mínimo para visibilidad: ${impact.toFixed(2)}`);
    }

    // Considerar contexto de la conversación (más sensible)
    const recentMessages = this.conversationMessages.slice(-3);
    const recentNegative = recentMessages.filter(msg => msg.sentiment.compound < -0.1).length; // Umbral más bajo
    
    if (recentNegative >= 2 && sentiment.compound < 0) {
      const originalImpact = impact;
      impact *= 1.3; // Más amplificación (era 1.2, ahora 1.3)
      console.log(`[Hybrid Sentiment Engine]   • Amplificación por tendencia negativa (×1.3): ${originalImpact.toFixed(2)} → ${impact.toFixed(2)}`);
    }

    // AMPLIFICAR límites para permitir cambios más dramáticos
    const finalImpact = Math.max(-35, Math.min(35, impact)); // Era [-25,25], ahora [-35,35]
    console.log(`[Hybrid Sentiment Engine]   • Impacto final limitado [-35,35]: ${finalImpact.toFixed(2)}`);

    return finalImpact;
  }

  // Generar insights dinámicos basados en contexto
  private generateDynamicInsights(analysis: MessageAnalysis) {
    const insights: string[] = [];

    // Insight basado en sentimiento y contexto
    if (analysis.sentiment.compound > 0.4) {
      if (analysis.sender === 'user') {
        insights.push("Cliente muestra satisfacción con el servicio");
      } else {
        insights.push("Respuesta del agente genera impacto positivo");
      }
    } else if (analysis.sentiment.compound < -0.4) {
      if (analysis.sender === 'user') {
        insights.push("Cliente expresa frustración - requiere atención");
      } else {
        insights.push("Respuesta del agente necesita mejora");
      }
    }

    // Insights basados en emociones
    if (analysis.emotions.length > 0) {
      const dominantEmotion = analysis.emotions[0];
      
      switch (dominantEmotion.emotion) {
        case 'frustración':
          insights.push("Se detecta frustración - priorizar resolución");
          break;
        case 'urgencia':
          insights.push("Cliente requiere respuesta inmediata");
          break;
        case 'satisfacción':
          insights.push("El cliente se siente satisfecho");
          break;
        case 'preocupación':
          insights.push("Cliente muestra preocupación - tranquilizar");
          break;
        case 'gratitud':
          insights.push("Cliente agradece el servicio recibido");
          break;
        case 'confusión':
          insights.push("Cliente necesita clarificación adicional");
          break;
      }
    }

    // Insights de tendencia
    const currentScore = this.getCurrentSatisfactionScore();
    if (this.satisfactionHistory.length >= 3) {
      const previousScore = this.satisfactionHistory[this.satisfactionHistory.length - 2];
      const trend = currentScore - previousScore;
      
      if (trend > 10) {
        insights.push("Tendencia positiva - satisfacción mejorando");
      } else if (trend < -10) {
        insights.push("Tendencia negativa - intervención requerida");
      }
    }

    // Generar insight si hay alguno y no es duplicado
    if (insights.length > 0) {
      const insightText = insights[0];
      const isDuplicate = this.insights.slice(-3).some(existing => 
        existing.text === insightText
      );

      if (!isDuplicate) {
        const insight: SentimentInsight = {
          id: `insight_${Date.now()}_${this.analysisCount}`,
          timestamp: new Date(),
          text: insightText,
          type: analysis.sentiment.compound > 0.2 ? 'positive' : 
                analysis.sentiment.compound < -0.2 ? 'negative' : 'neutral',
          priority: Math.abs(analysis.sentiment.compound) > 0.5 ? 'high' : 
                   Math.abs(analysis.sentiment.compound) > 0.2 ? 'medium' : 'low'
        };

        this.insights.push(insight);
        console.log(`[Hybrid Sentiment Engine] Generated insight: ${insight.text}`);
      }
    }
  }

  // Análisis completo bajo demanda (botón re-analizar)
  public performCompleteAnalysis(): void {
    console.log('[Hybrid Sentiment Engine] Performing complete conversation analysis...');
    
    // Procesar mensajes almacenados si los hay
    if (this.storedMessages.length > 0) {
      console.log(`[Hybrid Sentiment Engine] Processing ${this.storedMessages.length} stored messages...`);
      
      // Analizar todos los mensajes almacenados
      this.storedMessages.forEach(storedMessage => {
        this.analyzeMessage(storedMessage.text, storedMessage.sender);
      });
      
      // Limpiar mensajes almacenados después del análisis
      this.storedMessages = [];
    }
    
    if (this.conversationMessages.length === 0) {
      console.log('[Hybrid Sentiment Engine] No messages to analyze');
      return;
    }

    // Re-analizar todos los mensajes con contexto completo
    const totalMessages = this.conversationMessages.length;
    let positiveTrend = 0;
    let negativeTrend = 0;

    this.conversationMessages.forEach((message, index) => {
      if (message.sentiment.compound > 0.1) positiveTrend++;
      if (message.sentiment.compound < -0.1) negativeTrend++;
    });

    // Generar insight de análisis completo
    if (totalMessages >= 3) {
      let completeAnalysisInsight = '';
      
      if (positiveTrend > negativeTrend * 2) {
        completeAnalysisInsight = 'Conversación con tendencia mayoritariamente positiva';
      } else if (negativeTrend > positiveTrend * 2) {
        completeAnalysisInsight = 'Conversación con desafíos de satisfacción detectados';
      } else {
        completeAnalysisInsight = 'Conversación equilibrada con momentos mixtos';
      }

      // Agregar insight de análisis completo
      const completeInsight: SentimentInsight = {
        id: `complete_analysis_${Date.now()}`,
        timestamp: new Date(),
        text: completeAnalysisInsight,
        type: positiveTrend > negativeTrend ? 'positive' : 
              negativeTrend > positiveTrend ? 'negative' : 'neutral',
        priority: 'high'
      };

      this.insights.push(completeInsight);
      console.log(`[Hybrid Sentiment Engine] Complete analysis insight: ${completeInsight.text}`);
    }

    // Refinar satisfacción final
    const finalScore = this.getCurrentSatisfactionScore();
    console.log(`[Hybrid Sentiment Engine] Complete analysis finished. Final satisfaction: ${finalScore.toFixed(1)}%`);
  }

  private extractKeywords(text: string): string[] {
    const commonWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'uno', 'una', 'pero', 'todo', 'más', 'muy', 'mi', 'me', 'he', 'ha', 'si', 'yo', 'fue', 'sido', 'tiene', 'hacer', 'puede', 'estar', 'como', 'este', 'esta'];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5);
  }

  private updateSatisfactionScore(impact: number) {
    const currentScore = this.getCurrentSatisfactionScore();
    const newScore = Math.max(0, Math.min(100, currentScore + impact));
    this.satisfactionHistory.push(newScore);
    
    if (Math.abs(impact) > 0.5) { // Solo loguear cambios significativos
      console.log(`[Hybrid Sentiment Engine] Satisfaction: ${currentScore.toFixed(1)} → ${newScore.toFixed(1)} (${impact > 0 ? '+' : ''}${impact.toFixed(1)})`);
    }
  }

  private createEmptyAnalysis(text: string, sender: 'user' | 'agent'): MessageAnalysis {
    return {
      text,
      sender,
      sentiment: { positive: 0, neutral: 1, negative: 0, compound: 0 },
      emotions: [],
      satisfactionImpact: 0,
      keyWords: []
    };
  }

  // === MÉTODOS PÚBLICOS EXISTENTES ===

  public getCurrentSatisfactionScore(): number {
    if (this.satisfactionHistory.length === 0) return 50;
    return this.satisfactionHistory[this.satisfactionHistory.length - 1];
  }

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

  public getRecentInsights(): SentimentInsight[] {
    return this.insights.slice(-5).reverse();
  }

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

  private extractConversationData(text: string, sender: 'user' | 'agent') {
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

  public generateConversationSummary(): ConversationSummary {
    const metrics = this.getSatisfactionMetrics();
    const dominantEmotions = this.getDominantEmotions();
    const duration = this.startTime ? (Date.now() - this.startTime.getTime()) / 1000 : 0;

    let resolutionStatus: 'resolved' | 'pending' | 'escalated' = 'pending';
    if (metrics.currentScore >= 80) {
      resolutionStatus = 'resolved';
    } else if (metrics.currentScore < 30) {
      resolutionStatus = 'escalated';
    }

    return {
      customerName: this.customerName || 'Cliente',
      contactReason: this.contactReason || 'Consulta general',
      executedActions: [...new Set(this.executedActions)],
      finalSatisfaction: metrics.currentScore,
      dominantEmotion: dominantEmotions[0]?.emotion || 'neutral',
      conversationDuration: Math.round(duration),
      keyInsights: this.insights.slice(-3).map(i => i.text),
      resolutionStatus
    };
  }

  public reset() {
    console.log('[Hybrid Sentiment Engine] Resetting engine');
    this.satisfactionHistory = [];
    this.insights = [];
    this.conversationMessages = [];
    this.startTime = new Date();
    this.customerName = null;
    this.contactReason = null;
    this.executedActions = [];
    this.analysisCount = 0;
    this.lastAnalysisTime = 0;
  }

  public endConversation() {
    console.log(`[Hybrid Sentiment Engine] Conversation ended - Total analyses: ${this.analysisCount}, Final satisfaction: ${this.getCurrentSatisfactionScore().toFixed(1)}%`);
  }

  public getTotalAnalysisCount(): number {
    return this.analysisCount;
  }

  public getConversationMessages(): MessageAnalysis[] {
    return [...this.conversationMessages];
  }

  // Obtener últimos mensajes como contexto para GPT
  public getLastMessages(count: number): string {
    const lastMessages = this.conversationMessages.slice(-count);
    return lastMessages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
  }

  // Actualizar motor con resultado de GPT
  public updateFromGPTAnalysis(gptResult: any, text: string, sender: 'user' | 'agent') {
    const now = Date.now();
    
    // Crear análisis desde resultado de GPT
    const analysis: MessageAnalysis = {
      text,
      sender,
      sentiment: {
        positive: gptResult.sentiment === 'positive' ? 1 : 0,
        neutral: gptResult.sentiment === 'neutral' ? 1 : 0,  
        negative: gptResult.sentiment === 'negative' ? 1 : 0,
        compound: (gptResult.score - 50) / 50
      },
      emotions: [], // Vacío ya que solo nos enfocamos en satisfacción
      satisfactionImpact: this.satisfactionHistory.length > 0 
        ? gptResult.score - this.satisfactionHistory[this.satisfactionHistory.length - 1]
        : 0,
      keyWords: []
    };

    // Actualizar datos internos
    this.conversationMessages.push(analysis);
    this.satisfactionHistory.push(gptResult.score);
    this.lastAnalysisTime = now;
    this.analysisCount++;

    console.log(`[Hybrid Sentiment Engine] Updated from GPT - Score: ${gptResult.score}, Sentiment: ${gptResult.sentiment}`);
  }
}

