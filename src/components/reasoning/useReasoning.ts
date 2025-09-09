/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ReasoningState, ConversationEvent } from "./types";
import { ReasoningEngine } from "./reasoning-engine";

interface UseReasoningReturn {
  state: ReasoningState;
  togglePanel: () => void;
  toggleExpanded: () => void;
  reset: () => void;
  processEvent: (event: ConversationEvent, data?: any) => void;
  analyzeText: (text: string) => void;
  hasActivity: boolean;
}

export function useReasoning(): UseReasoningReturn {
  const engineRef = useRef<ReasoningEngine>(new ReasoningEngine());
  const [hasActivity, setHasActivity] = useState(false);
  
  const [state, setState] = useState<ReasoningState>({
    isOpen: true,
    isExpanded: false,
    currentStep: 0,
    steps: [],
    mode: 'compact'
  });

  // Actualizar estado desde el motor
  const refreshState = useCallback(() => {
    const engine = engineRef.current;
    setState(prev => ({
      ...prev,
      currentStep: engine.getCurrentStep(),
      steps: engine.getSteps(),
      mode: prev.isExpanded ? 'expanded' : 'compact'
    }));
  }, []);

  const togglePanel = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
    // Marcar actividad como vista cuando se abre el panel
    if (!state.isOpen) {
      setHasActivity(false);
    }
  }, [state.isOpen]);

  const toggleExpanded = useCallback(() => {
    setState(prev => ({
      ...prev,
      isExpanded: !prev.isExpanded,
      mode: prev.isExpanded ? 'compact' : 'expanded'
    }));
  }, []);

  const reset = useCallback(() => {
    engineRef.current.reset();
    setHasActivity(false);
    refreshState();
  }, [refreshState]);

  const processEvent = useCallback(async (event: ConversationEvent, data?: any) => {
    const node = await engineRef.current.processEvent(event, data);
    if (node) {
      // Marcar que hay nueva actividad si el panel está cerrado
      if (!state.isOpen) {
        setHasActivity(true);
      }
    }
    refreshState();
  }, [refreshState, state.isOpen]);

  const analyzeText = useCallback((text: string) => {
    const node = engineRef.current.analyzeAvatarResponse(text);
    if (node) {
      // Marcar que hay nueva actividad si el panel está cerrado
      if (!state.isOpen) {
        setHasActivity(true);
      }
    }
    refreshState();
  }, [refreshState, state.isOpen]);

  // Inicializar estado
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  return {
    state,
    togglePanel,
    toggleExpanded,
    reset,
    processEvent,
    analyzeText,
    hasActivity
  };
}

// Hook para integración con eventos del SDK de HeyGen
export function useReasoningWithSDK() {
  const reasoning = useReasoning();

  // Esta función será llamada desde los componentes que tienen acceso a los eventos del SDK
  const handleSDKEvent = useCallback(async (eventType: string, data?: any) => {
    console.log(`[Reasoning] Processing event: ${eventType}`, data);
    
    // Mapear eventos del SDK a nuestros eventos de razonamiento
    let reasoningEvent: ConversationEvent | null = null;

    switch (eventType) {
      case 'STREAM_READY':
        reasoningEvent = ConversationEvent.SESSION_START;
        break;
      case 'USER_START':
        reasoningEvent = ConversationEvent.USER_MESSAGE;
        break;
      case 'USER_STOP':
      case 'USER_END_MESSAGE':
        // Assuming the user's text is available in data.text
        if (data && data.text) {
          const userText = data.text;
          fetch('/api/classify-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: userText }),
          })
          .then(response => response.json())
          .then(result => {
            if (result.intent) {
              // Process the classified intent
              reasoning.processEvent(ConversationEvent.INTENT_DETECTED, { userText: userText, intent: result.intent });
            }
          })
          .catch(error => {
            console.error('Error classifying intent:', error, userText);
            // Optionally, process a generic error node or log it
            reasoning.processEvent(ConversationEvent.SYSTEM_VERIFICATION, { error: 'Intent classification failed', details: error.message });
          });
        }
        // No longer set AGENT_ANALYZING here, as INTENT_DETECTED will be processed
        break;
      case 'AVATAR_START_TALKING':
        reasoningEvent = ConversationEvent.AGENT_RESPONSE;
        break;
      case 'AVATAR_STOP_TALKING':
        reasoningEvent = ConversationEvent.AGENT_LISTENING;
        break;
      case 'AVATAR_TALKING_MESSAGE':
        // Procesar cada mensaje que habla el avatar en tiempo real
        reasoningEvent = ConversationEvent.AGENT_RESPONSE;
        break;
      case 'AVATAR_END_MESSAGE':
        // Cuando termine de hablar, marcar como análisis completo
        reasoningEvent = ConversationEvent.AGENT_LISTENING;
        break;
      case 'STREAM_DISCONNECTED':
        reasoningEvent = ConversationEvent.SESSION_END;
        break;
      default:
        console.log(`[Reasoning] Unmapped event: ${eventType}`);
        break;
    }

    if (reasoningEvent) {
      await reasoning.processEvent(reasoningEvent, data);
    }
  }, [reasoning]);

  // Función para finalizar la sesión de razonamiento
  const endSession = useCallback(() => {
    const engine = (reasoning as any).engineRef?.current;
    if (engine && typeof engine.endSession === 'function') {
      engine.endSession();
    }
  }, [reasoning]);

  // Función para analizar texto del avatar (usar la del hook original)
  const analyzeText = useCallback((text: string) => {
    reasoning.analyzeText(text);
  }, [reasoning]);

  return {
    ...reasoning,
    handleSDKEvent,
    endSession,
    analyzeText
  };
}
