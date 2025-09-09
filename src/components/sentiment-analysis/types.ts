

// Tipos para el sistema de análisis de sentimientos
export interface SentimentScore {
  positive: number;
  neutral: number;
  negative: number;
  compound: number; // Puntuación compuesta (-1 a 1)
}

export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  intensity: number; // 0-100
}

export interface SentimentInsight {
  id: string;
  timestamp: Date;
  text: string;
  type: 'positive' | 'neutral' | 'negative' | 'alert';
  priority: 'low' | 'medium' | 'high';
}

export interface CustomerSatisfactionMetrics {
  currentScore: number; // 0-100
  trend: 'increasing' | 'decreasing' | 'stable';
  peakScore: number;
  lowestScore: number;
  averageScore: number;
  currentInsight?: string; // Insight actual del cliente
  urgency?: 'low' | 'medium' | 'high'; // Nivel de urgencia
  lastAnalysis?: Date; // Timestamp del último análisis
}

export interface ConversationSummary {
  customerName: string | null;
  contactReason: string | null;
  executedActions: string[];
  finalSatisfaction: number;
  dominantEmotion: string;
  conversationDuration: number; // en segundos
  keyInsights: string[];
  resolutionStatus: 'resolved' | 'pending' | 'escalated';
}

export interface SentimentState {
  isActive: boolean;
  currentSentiment: SentimentScore;
  detectedEmotions: EmotionAnalysis[];
  satisfactionMetrics: CustomerSatisfactionMetrics;
  recentInsights: SentimentInsight[];
  conversationSummary: ConversationSummary;
  isConversationEnded: boolean;
}

// Eventos de análisis de sentimientos
export enum SentimentEvent {
  CONVERSATION_START = 'conversation_start',
  USER_MESSAGE_ANALYZED = 'user_message_analyzed',
  AGENT_RESPONSE_ANALYZED = 'agent_response_analyzed',
  EMOTION_DETECTED = 'emotion_detected',
  SATISFACTION_UPDATED = 'satisfaction_updated',
  INSIGHT_GENERATED = 'insight_generated',
  CONVERSATION_END = 'conversation_end'
}

export interface MessageAnalysis {
  text: string;
  sender: 'user' | 'agent';
  sentiment: SentimentScore;
  emotions: EmotionAnalysis[];
  satisfactionImpact: number; // -10 to +10
  keyWords: string[];
}

