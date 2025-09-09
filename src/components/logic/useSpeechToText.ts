import { useState, useRef, useCallback, useEffect } from "react";
import { useStreamingAvatarContext } from "./context";
import { MessageSender } from "./context";
import { useBackendWebSocket } from "./useBackendWebSocket";

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: () => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const { appendMessage } = useStreamingAvatarContext();
  const { send } = useBackendWebSocket();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecognitionActiveRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSpeechTimeRef = useRef<number>(0);

  // Verificar soporte del navegador
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.continuous = true; // Reconocimiento continuo
      recognition.interimResults = true;
      recognition.lang = "es-ES"; // Español por defecto
      
      recognition.onstart = () => {
        setIsListening(true);
        isRecognitionActiveRef.current = true;
        console.log("Speech recognition started");
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Actualizar el estado de habla
        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        
        if (currentTranscript.trim()) {
          setIsSpeaking(true);
          lastSpeechTimeRef.current = Date.now();
          
          // Limpiar timer de silencio anterior
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          
          // Configurar nuevo timer de silencio
          silenceTimerRef.current = setTimeout(() => {
            setIsSpeaking(false);
            setTranscript("");
          }, 2000); // 2 segundos de silencio para dar más tiempo
        }
        
        // Si tenemos un resultado final, enviar al backend
        if (finalTranscript.trim()) {
          console.log("Final transcript:", finalTranscript);
          
          // Agregar mensaje al chat
          appendMessage(MessageSender.CLIENT, finalTranscript.trim());
          
          // Enviar al backend
          send(finalTranscript.trim());
          
          // Limpiar transcripción después de enviar
          setTimeout(() => {
            setTranscript("");
            setIsSpeaking(false);
          }, 500);
        }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        isRecognitionActiveRef.current = false;
        
        // Reintentar si es un error temporal y estamos activos
        if (isActive && event.error !== "not-allowed" && event.error !== "service-not-allowed") {
          setTimeout(() => {
            if (isActive && !isRecognitionActiveRef.current) {
              startRecognition();
            }
          }, 1000);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        isRecognitionActiveRef.current = false;
        console.log("Speech recognition ended");
        
        // Reiniciar automáticamente si estamos activos
        if (isActive) {
          setTimeout(() => {
            if (isActive && !isRecognitionActiveRef.current) {
              startRecognition();
            }
          }, 100);
        }
      };
    }
  }, [appendMessage, send, isActive]);

  const startRecognition = useCallback(() => {
    if (recognitionRef.current && !isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  }, []);

  const startListening = useCallback(() => {
    setIsActive(true);
    startRecognition();
  }, [startRecognition]);

  const stopListening = useCallback(() => {
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript("");
    
    // Limpiar timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  return {
    isListening: isActive,
    isSpeaking,
    transcript,
    isSupported,
    startListening,
    stopListening,
  };
}
