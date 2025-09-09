

// Exportar todos los componentes del módulo de análisis de sentimientos
export { SentimentAnalysisPanel } from './sentiment-analysis-panel';
export { SatisfactionKPI } from './satisfaction-kpi';
export { SatisfactionGauge } from './satisfaction-gauge';
export { InsightsPanel } from './insights-panel';
export { ConversationSummaryComponent } from './conversation-summary';

// Exportar hooks
export { useSentimentAnalysis, useSentimentAnalysisWithSDK } from './use-sentiment-analysis';

// Exportar motores
export { SentimentAnalysisEngine } from './sentiment-engine';
export { HybridSentimentAnalysisEngine } from './sentiment-engine-hybrid';

// Exportar tipos
export type {
  SentimentScore,
  EmotionAnalysis,
  SentimentInsight,
  CustomerSatisfactionMetrics,
  ConversationSummary,
  SentimentState,
  MessageAnalysis,
  SentimentEvent
} from './types';

