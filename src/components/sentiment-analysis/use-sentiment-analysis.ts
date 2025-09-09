

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { SentimentState, SentimentEvent } from "./types";
import { HybridSentimentAnalysisEngine } from "./sentiment-engine-hybrid";

interface UseSentimentAnalysisReturn {
  state: SentimentState;
  analyzeMessage: (text: string, sender: 'user' | 'agent') => Promise<void>;
  reset: () => void;
  togglePanel: () => void;
  isOpen: boolean;
  isAnalyzing: boolean;
  reanalyzeConversation: () => Promise<void>;
  setState?: any; // Para uso interno
}

export function useSentimentAnalysis(): UseSentimentAnalysisReturn {
  const engineRef = useRef<HybridSentimentAnalysisEngine>(new HybridSentimentAnalysisEngine());
  const [isOpen, setIsOpen] = useState(true); // Siempre abierto para mostrar solo la satisfacción
  
  const [state, setState] = useState<SentimentState>({
    isActive: false,
    currentSentiment: { positive: 0, neutral: 1, negative: 0, compound: 0 },
    detectedEmotions: [],
    satisfactionMetrics: {
      currentScore: 50,
      trend: 'stable',
      peakScore: 50,
      lowestScore: 50,
      averageScore: 50
    },
    recentInsights: [],
    conversationSummary: {
      customerName: null,
      contactReason: null,
      executedActions: [],
      finalSatisfaction: 50,
      dominantEmotion: 'neutral',
      conversationDuration: 0,
      keyInsights: [],
      resolutionStatus: 'pending'
    },
    isConversationEnded: false
  });

  // Actualizar estado desde el motor (solo satisfacción)
  const refreshState = useCallback(() => {
    const engine = engineRef.current;
    const metrics = engine.getSatisfactionMetrics();
    
    setState(prev => ({
      ...prev,
      satisfactionMetrics: metrics,
      // Limpiar emociones e insights
      detectedEmotions: [],
      recentInsights: [],
      isActive: engine.getTotalAnalysisCount() > 0
    }));
  }, []);

  // Estado para controlar análisis en curso
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Análisis dinámico con GPT-4o
  const analyzeMessage = useCallback(async (text: string, sender: 'user' | 'agent') => {
    if (!text || typeof text !== 'string') {
      console.log('[SentimentAnalysis] ❌ Mensaje inválido, saltando análisis');
      return;
    }
    
    console.log(`[SentimentAnalysis] 🔍 INICIANDO ANÁLISIS GPT-4o ${sender}:`, text.substring(0, 100));
    
    // Cancelar análisis anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsAnalyzing(true);
    
    try {
      // Llamada a la API mejorada
      const response = await fetch('/api/analyze-satisfaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sender,
          context: 'Conversación con avatar interactivo'
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const analysis = await response.json();
      console.log('[SentimentAnalysis] 📈 Análisis GPT-4o recibido:', analysis);

      // Actualizar estado con los nuevos datos
      setState(prev => {
        const newMetrics = {
          currentScore: analysis.score,
          trend: analysis.trend,
          peakScore: Math.max(prev.satisfactionMetrics.peakScore, analysis.score),
          lowestScore: Math.min(prev.satisfactionMetrics.lowestScore, analysis.score),
          averageScore: prev.satisfactionMetrics.averageScore, // Calcular promedio después
          currentInsight: analysis.insight,
          urgency: analysis.urgency,
          lastAnalysis: new Date()
        };

        const newState = {
          ...prev,
          satisfactionMetrics: newMetrics,
          isActive: true,
          detectedEmotions: [], // Simplificado según requerimientos
          recentInsights: []
        };

        console.log('[SentimentAnalysis] 🆕 Estado actualizado con GPT-4o:', {
          score: newState.satisfactionMetrics.currentScore,
          insight: newState.satisfactionMetrics.currentInsight,
          urgency: newState.satisfactionMetrics.urgency
        });

        return newState;
      });

      console.log(`[SentimentAnalysis] ✅ ANÁLISIS GPT-4o COMPLETADO - Score: ${analysis.score}, Insight: ${analysis.insight}`);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[SentimentAnalysis] 🚫 Análisis cancelado');
        return;
      }
      
      console.error('[SentimentAnalysis] ❌ Error en análisis GPT-4o:', error);
      
      // Fallback a análisis local
      const engine = engineRef.current;
      const localAnalysis = engine.analyzeMessage(text, sender);
      const localMetrics = engine.getSatisfactionMetrics();
      
      setState(prev => ({
        ...prev,
        satisfactionMetrics: {
          ...prev.satisfactionMetrics,
          currentScore: localMetrics.currentScore,
          trend: localMetrics.trend,
          currentInsight: 'Cliente en conversación (análisis local)',
          urgency: 'medium' as const,
          lastAnalysis: new Date()
        },
        isActive: true
      }));
      
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, []);

  // Función de reanalizar manual
  const reanalyzeConversation = useCallback(async () => {
    const lastMessage = "Última interacción de la conversación"; // Se puede mejorar para capturar el último mensaje real
    console.log('[SentimentAnalysis] 🔄 Reanalisis manual solicitado');
    await analyzeMessage(lastMessage, 'user');
  }, [analyzeMessage]);

  const reset = useCallback(() => {
    // Cancelar cualquier análisis en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    engineRef.current.reset();
    setIsAnalyzing(false);
    
    setState({
      isActive: false,
      currentSentiment: { positive: 0, neutral: 1, negative: 0, compound: 0 },
      detectedEmotions: [],
      satisfactionMetrics: {
        currentScore: 50,
        trend: 'stable',
        peakScore: 50,
        lowestScore: 50,
        averageScore: 50,
        currentInsight: undefined,
        urgency: 'medium',
        lastAnalysis: undefined
      },
      recentInsights: [],
      conversationSummary: {
        customerName: null,
        contactReason: null,
        executedActions: [],
        finalSatisfaction: 50,
        dominantEmotion: 'neutral',
        conversationDuration: 0,
        keyInsights: [],
        resolutionStatus: 'pending'
      },
      isConversationEnded: false
    });
    
    console.log('[SentimentAnalysis] 🔄 Sistema reseteado completamente');
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    state,
    analyzeMessage,
    reset,
    togglePanel,
    isOpen,
    isAnalyzing,
    reanalyzeConversation,
    setState // Exponer setState para uso interno
  };
}

// Hook para integración con el SDK de HeyGen (similar al de reasoning)
export function useSentimentAnalysisWithSDK() {
  const sentimentAnalysis = useSentimentAnalysis();

  // FUNCIÓN DE DEMO para pruebas en consola
  const runDemo = useCallback(() => {
    console.log('🧪 INICIANDO DEMO DEL SISTEMA DE SATISFACCIÓN');
    
    const demoMessages: Array<{text: string, sender: 'user' | 'agent'}> = [
      { text: "Hola, necesito ayuda", sender: "user" as const },
      { text: "¡Perfecto! Muchas gracias, excelente servicio", sender: "user" as const },
      { text: "Esto está mal, estoy muy frustrado", sender: "user" as const },
      { text: "Entiendo tu preocupación. Te voy a ayudar", sender: "agent" as const },
      { text: "¡Genial! Estoy muy contento", sender: "user" as const },
    ];

    demoMessages.forEach((msg, i) => {
      setTimeout(() => {
        console.log(`\n🔥 DEMO ${i+1}: Analizando "${msg.text}" (${msg.sender})`);
        sentimentAnalysis.analyzeMessage(msg.text, msg.sender);
      }, i * 2000);
    });
    
    console.log('🎯 Demo iniciado - observa los cambios en la UI en los próximos 10 segundos');
  }, [sentimentAnalysis.analyzeMessage]);

  // Exponer función de demo globalmente para pruebas
  useEffect(() => {
    (window as any).sentimentDemo = runDemo;
    console.log('🚀 Demo de satisfacción disponible: ejecuta sentimentDemo() en la consola');
  }, [runDemo]);

  // Función para manejar eventos del SDK
  const handleSDKEvent = useCallback((eventType: string, data?: any) => {
    console.log(`[SentimentAnalysis] ✨ SDK Event: ${eventType}`, data);
    
    switch (eventType) {
      case 'STREAM_READY':
        // ✅ ACTIVAR INMEDIATAMENTE cuando comience la conversación
        console.log('[SentimentAnalysis] 🚀 CONVERSACIÓN INICIADA - ACTIVANDO ANÁLISIS');
        console.log('[SentimentAnalysis] Estado actual antes de activar:', sentimentAnalysis.state);
        if (sentimentAnalysis.setState) {
          sentimentAnalysis.setState((prev: SentimentState) => {
            const newState = {
              ...prev,
              isActive: true,
              satisfactionMetrics: {
                ...prev.satisfactionMetrics,
                currentInsight: 'Analizando en tiempo real',
                urgency: 'medium',
                lastAnalysis: new Date()
              }
            };
            console.log('[SentimentAnalysis] ✅ Estado actualizado a activo:', newState);
            return newState;
          });
        }
        break;
      case 'USER_END_MESSAGE':
        // Analizar mensaje del usuario cuando termine de hablar
        if (data?.detail?.message) {
          const message = data.detail.message;
          console.log('[SentimentAnalysis] 🔥 USER MESSAGE:', message);
          console.log('[SentimentAnalysis] Métricas antes del análisis:', sentimentAnalysis.state.satisfactionMetrics);
          
          // ✅ ASEGURAR que el estado esté activo cuando haya mensajes
          if (sentimentAnalysis.setState && !sentimentAnalysis.state.isActive) {
            sentimentAnalysis.setState((prev: SentimentState) => ({
              ...prev,
              isActive: true,
              satisfactionMetrics: {
                ...prev.satisfactionMetrics,
                currentInsight: 'Analizando en tiempo real',
                urgency: 'medium',
                lastAnalysis: new Date()
              }
            }));
          }
          
          // Llamada asíncrona al análisis con GPT-4o
          sentimentAnalysis.analyzeMessage(message, 'user').catch(error => {
            console.error('[SentimentAnalysis] Error en análisis USER:', error);
          });
        } else {
          console.log('[SentimentAnalysis] ⚠️ USER_END_MESSAGE sin datos:', data);
        }
        break;
      case 'AVATAR_END_MESSAGE':
        // Analizar respuesta del avatar
        if (data?.detail?.message) {
          const message = data.detail.message;
          console.log('[SentimentAnalysis] 🔥 AVATAR MESSAGE:', message);
          console.log('[SentimentAnalysis] Métricas antes del análisis:', sentimentAnalysis.state.satisfactionMetrics);
          
          // ✅ ASEGURAR que el estado esté activo cuando haya mensajes
          if (sentimentAnalysis.setState && !sentimentAnalysis.state.isActive) {
            sentimentAnalysis.setState((prev: SentimentState) => ({
              ...prev,
              isActive: true,
              satisfactionMetrics: {
                ...prev.satisfactionMetrics,
                currentInsight: 'Analizando en tiempo real',
                urgency: 'medium',
                lastAnalysis: new Date()
              }
            }));
          }
          
          // Llamada asíncrona al análisis con GPT-4o
          sentimentAnalysis.analyzeMessage(message, 'agent').catch(error => {
            console.error('[SentimentAnalysis] Error en análisis AVATAR:', error);
          });
        } else {
          console.log('[SentimentAnalysis] ⚠️ AVATAR_END_MESSAGE sin datos:', data);
        }
        break;
      case 'AVATAR_TALKING_MESSAGE':
        // NO analizar mensajes parciales para evitar spam - solo END_MESSAGE
        console.log('[SentimentAnalysis] 💬 AVATAR_TALKING_MESSAGE ignorado (procesaremos solo END_MESSAGE)');
        break;
      case 'STREAM_DISCONNECTED':
        // Solo resetear el análisis
        console.log('[SentimentAnalysis] 🔴 STREAM_DISCONNECTED - Reseteando análisis');
        sentimentAnalysis.reset();
        break;
    }
  }, [sentimentAnalysis.analyzeMessage, sentimentAnalysis.reset, sentimentAnalysis.setState]);

  return {
    ...sentimentAnalysis,
    handleSDKEvent
  };
}

