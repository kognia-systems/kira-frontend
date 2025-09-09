/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useMessageHistory } from "@/components/logic/useMessageHistory";
import { SatisfactionAnalyzer, SatisfactionResult, AnalysisState } from "./satisfaction-analyzer";

export function useSatisfactionSystem() {
  const { messages } = useMessageHistory();
  const analyzerRef = useRef(new SatisfactionAnalyzer());
  
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    lastResult: null,
    lastAnalyzedAt: null,
    error: null,
    conversationLength: 0
  });

  // Estado de la UI
  const [uiMessage, setUiMessage] = useState<string>("Esperando conversación");
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Auto-analizar cuando cambie el historial
  const analyzeConversation = useCallback(async (forceAnalysis = false) => {
    const analyzer = analyzerRef.current;
    
    // Solo analizar si hay mensajes nuevos o es forzado
    if (!forceAnalysis && messages.length === state.conversationLength) {
      return;
    }

    // Si no hay mensajes, resetear
    if (messages.length === 0) {
      setState(prev => ({
        ...prev,
        lastResult: null,
        conversationLength: 0,
        error: null
      }));
      setUiMessage("Esperando conversación");
      setIsSessionActive(false);
      return;
    }

    // Activar sesión si hay mensajes
    setIsSessionActive(true);
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    setUiMessage("Analizando...");

    console.log('[SatisfactionSystem] 🔍 Iniciando análisis automático:', { 
      messageCount: messages.length,
      previousCount: state.conversationLength 
    });

    try {
      const result = await analyzer.analyzeConversation(messages);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        lastResult: result,
        lastAnalyzedAt: new Date(),
        conversationLength: messages.length,
        error: null
      }));
      
      setUiMessage("Actualizado");
      
      // Cambiar mensaje después de 2 segundos
      setTimeout(() => {
        setUiMessage("Análisis activo");
      }, 2000);
      
      console.log('[SatisfactionSystem] ✅ Análisis completado:', result);
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[SatisfactionSystem] 🚫 Análisis cancelado');
        return;
      }
      
      console.error('[SatisfactionSystem] ❌ Error en análisis:', error);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error.message || 'Error de análisis',
        conversationLength: messages.length
      }));
      setUiMessage("Sin cambios");
    }
  }, [messages, state.conversationLength]);

  // Reanálisis manual
  const reanalyze = useCallback(async () => {
    console.log('[SatisfactionSystem] 🔄 Reanálisis manual solicitado');
    await analyzeConversation(true);
  }, [analyzeConversation]);

  // Auto-analizar cuando cambien los mensajes
  useEffect(() => {
    analyzeConversation();
  }, [analyzeConversation]);

  // Generar resumen final cuando termine la sesión
  const generateSessionSummary = useCallback(() => {
    const analyzer = analyzerRef.current;
    if (state.lastResult && messages.length > 0) {
      const summary = analyzer.generateSessionSummary(messages, state.lastResult);
      console.log('[SatisfactionSystem] 📋 Resumen final:', summary);
      return summary;
    }
    return "No hay datos suficientes para generar un resumen.";
  }, [state.lastResult, messages]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      analyzerRef.current.cancel();
    };
  }, []);

  // Reset cuando no hay sesión activa
  const resetSystem = useCallback(() => {
    analyzerRef.current.cancel();
    setState({
      isAnalyzing: false,
      lastResult: null,
      lastAnalyzedAt: null,
      error: null,
      conversationLength: 0
    });
    setUiMessage("Esperando conversación");
    setIsSessionActive(false);
    console.log('[SatisfactionSystem] 🔄 Sistema reseteado');
  }, []);

  return {
    // Estado actual
    isAnalyzing: state.isAnalyzing,
    result: state.lastResult,
    lastAnalyzedAt: state.lastAnalyzedAt,
    error: state.error,
    uiMessage,
    isSessionActive,
    
    // Acciones
    reanalyze,
    generateSessionSummary,
    resetSystem,
    
    // Datos de debug
    conversationLength: messages.length,
    hasMessages: messages.length > 0
  };
}
