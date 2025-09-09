


import { 
  SentimentScore, 
  EmotionAnalysis, 
  SentimentInsight, 
  CustomerSatisfactionMetrics,
  ConversationSummary,
  MessageAnalysis,
  SentimentEvent 
} from './types';
import { openAIService, OpenAISentimentResponse } from '../../lib/openai-service';

export class EnhancedSentimentAnalysisEngine {
  private satisfactionHistory: number[] = [];
  private insights: SentimentInsight[] = [];
  private conversationMessages: MessageAnalysis[] = [];
  private startTime: Date | null = null;
  private customerName: string | null = null;
  private contactReason: string | null = null;
  private executedActions: string[] = [];
  private analysisCount = 0;

  constructor() {
    this.startTime = new Date();
    console.log('[Enhanced Sentiment Engine] Initialized with OpenAI integration');
  }

  // Analizar mensaje usando OpenAI API
  public async analyzeMessage(text: string, sender: 'user' | 'agent'): Promise<MessageAnalysis> {
    if (!text || typeof text !== 'string') {
      console.log('[Enhanced Sentiment Engine] Invalid text input, skipping analysis');
      return this.createEmptyAnalysis(text, sender);
    }

    console.log(`[Enhanced Sentiment Engine] Analyzing ${sender} message (${++this.analysisCount}):`, text.substring(0, 50) + '...');

    try {
      // Crear contexto conversacional
      const conversationContext = this.buildConversationContext();
      
      // Llamar a OpenAI para análisis real
      const aiAnalysis = await openAIService.analyzeSentiment(text, sender, conversationContext);
      
      // Crear análisis completo
      const analysis: MessageAnalysis = {
        text,
        sender,
        sentiment: aiAnalysis.sentiment,
        emotions: aiAnalysis.emotions.map((e: any) => ({
          emotion: e.emotion,
          confidence: e.confidence,
          intensity: e.intensity
        })),
        satisfactionImpact: this.calculateSatisfactionImpact(aiAnalysis.sentiment, sender),
        keyWords: this.extractKeywords(text)
      };

      // Actualizar datos internos
      this.conversationMessages.push(analysis);
      this.updateSatisfactionScore(analysis.satisfactionImpact);
      
      // Generar insight si existe
      if (aiAnalysis.insight) {
        this.addInsight(aiAnalysis.insight, sender);
      }
      
      this.extractConversationData(text, sender);

      console.log(`[Enhanced Sentiment Engine] Analysis completed - Satisfaction impact: ${analysis.satisfactionImpact.toFixed(2)}`);
      
      return analysis;

    } catch (error) {
      console.error('[Enhanced Sentiment Engine] Error in analysis:', error);
      return this.createFallbackAnalysis(text, sender);
    }
  }

  private buildConversationContext(): string {
    const recentMessages = this.conversationMessages.slice(-3);
    if (recentMessages.length === 0) return '';

    return recentMessages
      .map(msg => `${msg.sender}: ${msg.text.substring(0, 100)}`)
      .join(' | ');
  }

  private calculateSatisfactionImpact(sentiment: SentimentScore, sender: 'user' | 'agent'): number {
    let impact = sentiment.compound * 15; // Rango más amplio para mayor sensibilidad
    
    // Ajustar según el emisor
    if (sender === 'agent') {
      impact *= 0.7; // Las respuestas del agente tienen menos impacto directo
    } else {
      impact *= 1.2; // Los mensajes del usuario tienen más peso
    }

    return Math.max(-20, Math.min(20, impact)); // Limitar rango
  }

  private addInsight(insightData: any, sender: 'user' | 'agent'): void {
    const insight: SentimentInsight = {
      id: `insight_${Date.now()}_${this.analysisCount}`,
      timestamp: new Date(),
      text: insightData.text,
      type: insightData.type,
      priority: insightData.priority
    };

    // Evitar insights duplicados recientes
    const recentInsights = this.insights.slice(-3);
    const isDuplicate = recentInsights.some(existing => 
      existing.text === insight.text || 
      existing.text.includes(insight.text.substring(0, 20))
    );

    if (!isDuplicate) {
      this.insights.push(insight);
      console.log(`[Enhanced Sentiment Engine] Added insight: ${insight.text}`);
    } else {
      console.log(`[Enhanced Sentiment Engine] Skipped duplicate insight`);
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

  private createFallbackAnalysis(text: string, sender: 'user' | 'agent'): MessageAnalysis {
    // Análisis básico como respaldo
    const positiveWords = /gracias|perfecto|excelente|genial|bueno|bien|contento|satisfecho/i;
    const negativeWords = /mal|terrible|horrible|disgusto|molesto|enojado|frustrado|problema/i;
    
    let positive = 0.2;
    let negative = 0.2;
    let neutral = 0.6;

    if (positiveWords.test(text)) {
      positive = 0.6;
      negative = 0.1;
      neutral = 0.3;
    } else if (negativeWords.test(text)) {
      positive = 0.1;
      negative = 0.6;
      neutral = 0.3;
    }

    const compound = positive - negative;
    const satisfactionImpact = compound * 10 * (sender === 'agent' ? 0.7 : 1.2);

    const analysis: MessageAnalysis = {
      text,
      sender,
      sentiment: { positive, neutral, negative, compound },
      emotions: [],
      satisfactionImpact,
      keyWords: this.extractKeywords(text)
    };

    this.conversationMessages.push(analysis);
    this.updateSatisfactionScore(satisfactionImpact);
    this.extractConversationData(text, sender);

    return analysis;
  }

  // Métodos existentes mejorados
  private extractKeywords(text: string): string[] {
    const commonWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'uno', 'una', 'pero', 'todo', 'más', 'muy', 'mi', 'me', 'he', 'ha', 'si', 'yo', 'fue', 'sido', 'tiene', 'hacer', 'puede', 'estar'];
    
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
    
    console.log(`[Enhanced Sentiment Engine] Satisfaction updated: ${currentScore.toFixed(1)} → ${newScore.toFixed(1)} (Δ${impact > 0 ? '+' : ''}${impact.toFixed(1)})`);
  }

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
      
      if (finalRecent > initialRecent + 3) trend = 'increasing';
      else if (finalRecent < initialRecent - 3) trend = 'decreasing';
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
    console.log('[Enhanced Sentiment Engine] Resetting engine');
    this.satisfactionHistory = [];
    this.insights = [];
    this.conversationMessages = [];
    this.startTime = new Date();
    this.customerName = null;
    this.contactReason = null;
    this.executedActions = [];
    this.analysisCount = 0;
  }

  public endConversation() {
    console.log('[Enhanced Sentiment Engine] Conversation ended - Total analyses:', this.analysisCount);
  }

  // Método síncrono para compatibility
  public analyzeMessageSync(text: string, sender: 'user' | 'agent'): MessageAnalysis {
    // Ejecutar análisis asíncrono pero devolver análisis básico inmediatamente
    this.analyzeMessage(text, sender).catch(console.error);
    return this.createFallbackAnalysis(text, sender);
  }
}
