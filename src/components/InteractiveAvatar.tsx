"use client";

import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AvatarConfig } from "@/components/avatar-config/avatar-config";
import { AvatarVideo } from "@/components/avatar-session/avatar-video";
import { useStreamingAvatarSession } from "@/components/logic/use-streaming-avatar-session";
import { AvatarControls } from "@/components/avatar-session/avatar-controls";
import { useVoiceChat } from "@/components/logic/use-voice-chat";
import {
  StreamingAvatarProvider,
  StreamingAvatarSessionState,
} from "@/components/logic";
import { MessageHistory } from "@/components/avatar-session/message-history";
import { ReasoningPanel, useReasoningWithSDK } from "@/components/reasoning";
import { SatisfactionPanelV2 } from "@/components/sentiment-analysis/satisfaction-panel-v2";

import { AVATARS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: AVATARS[0].avatar_id,
  knowledgeId: undefined,
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();

  // Sistema de razonamiento
  const reasoning = useReasoningWithSDK();

  // Panel de satisfacción del cliente
  const [isSatisfactionOpen, setIsSatisfactionOpen] = useState(true);

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarFocused, setIsAvatarFocused] = useState(false);

  const mediaStream = useRef<HTMLVideoElement>(null);

  const toggleAvatarFocus = () => {
    setIsAvatarFocused(!isAvatarFocused);
  };

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token);

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      setIsLoading(true);
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      // Eventos existentes + integración con sistema de razonamiento
      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
        reasoning.handleSDKEvent("AVATAR_START_TALKING", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
        reasoning.handleSDKEvent("AVATAR_STOP_TALKING", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
        reasoning.handleSDKEvent("STREAM_DISCONNECTED");
        // Finalizar las sesiones
        reasoning.endSession?.();
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
        reasoning.handleSDKEvent("STREAM_READY", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
        reasoning.handleSDKEvent("USER_START", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
        reasoning.handleSDKEvent("USER_STOP", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
        reasoning.handleSDKEvent("USER_END_MESSAGE", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
        reasoning.handleSDKEvent("USER_TALKING_MESSAGE", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
        reasoning.handleSDKEvent("AVATAR_TALKING_MESSAGE", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
        reasoning.handleSDKEvent("AVATAR_END_MESSAGE", event);
        // Procesar mensaje completo del avatar SOLO UNA VEZ cuando termine
        if (event?.detail?.message) {
          reasoning.analyzeText(event.detail.message);
        }
      });

      await startAvatar(config);

      if (isVoiceChat) {
        await startVoiceChat();
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoading(false);
    }
  });

  const handleStopSession = useMemoizedFn(async () => {
    try {
      setIsLoading(true);
      await stopAvatar();
      // Finalizar las sesiones cuando se para manualmente
      reasoning.endSession?.();
    } catch (error) {
      console.error("Error stopping avatar session:", error);
    } finally {
      setIsLoading(false);
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 relative">
      {sessionState === StreamingAvatarSessionState.INACTIVE ? (
        // Modo formulario full-width
        <motion.div
          className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AvatarConfig config={config} onConfigChange={setConfig} />
        </motion.div>
      ) : (
        // Modo avatar activo - Layout dinámico según el estado enfocado
        <div
          className={`grid grid-cols-1 gap-8 transition-all duration-500 ${
            isAvatarFocused
              ? "lg:grid-cols-[3fr,1fr]" // Avatar enfocado: 75% avatar, 25% chat
              : "lg:grid-cols-2" // Modo normal: 50% cada uno
          }`}
        >
          {/* Left Column - Video */}
          <motion.div
            className="space-y-6 flex flex-col justify-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Video Container - Tamaño dinámico */}
            <motion.div
              className={`w-full transition-all duration-500 ${
                isAvatarFocused
                  ? "aspect-[16/10] lg:aspect-[21/12]" // Más ancho y cinematográfico cuando está enfocado
                  : "aspect-[4/3] lg:aspect-[3/2]" // Proporción normal
              }`}
              animate={{
                scale: isAvatarFocused ? 1.02 : 1,
              }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            >
              <AvatarVideo
                ref={mediaStream}
                isExpanded={isAvatarFocused}
                onToggleExpand={toggleAvatarFocus}
                isReasoningOpen={reasoning.state.isOpen}
                onToggleReasoning={reasoning.togglePanel}
                hasReasoningActivity={reasoning.hasActivity}
              />
            </motion.div>

            {/* Session Controls */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {sessionState === StreamingAvatarSessionState.CONNECTING ? (
                  <motion.div
                    key="connecting"
                    className="flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-2xl text-blue-700"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Connecting to Avatar...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="stop-button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      onClick={handleStopSession}
                      disabled={isLoading}
                      variant="outline"
                      className="flex items-center gap-3 px-8 py-4 text-red-600 border-red-200 hover:bg-red-50"
                      size="lg"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                      Stop Session
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Right Column - Controls - Compacta cuando el avatar está enfocado */}
          <motion.div
            className={`space-y-4 transition-all duration-500 ${
              isAvatarFocused ? "lg:space-y-3" : "space-y-6"
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: isAvatarFocused ? 0.95 : 1,
            }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <AnimatePresence>
              {sessionState === StreamingAvatarSessionState.CONNECTED && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AvatarControls />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Session Controls for inactive state */}
      {sessionState === StreamingAvatarSessionState.INACTIVE && (
        <motion.div
          className="flex justify-center gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Button
            onClick={() => startSessionV2(true)}
            disabled={isLoading}
            className="flex items-center gap-3 px-12 py-6 text-lg"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Play className="w-6 h-6" />
            )}
            Start Voice Chat
          </Button>

          <Button
            onClick={() => startSessionV2(false)}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-3 px-12 py-6 text-lg"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Play className="w-6 h-6" />
            )}
            Start Text Chat
          </Button>
        </motion.div>
      )}

      {/* Message History - Full Width */}
      <AnimatePresence>
        {sessionState === StreamingAvatarSessionState.CONNECTED && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <MessageHistory />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paneles Complementarios - Razonamiento y Satisfacción */}
      {sessionState !== StreamingAvatarSessionState.INACTIVE && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
        >
          {/* Panel de Razonamiento */}
          <div className="order-1 lg:order-1">
            <ReasoningPanel
              state={reasoning.state}
              onClose={reasoning.togglePanel}
              onToggleExpanded={reasoning.toggleExpanded}
              onReset={reasoning.reset}
            />
          </div>

          {/* Panel de Satisfacción del Cliente V2 */}
          <div className="order-2 lg:order-2">
            <SatisfactionPanelV2
              isOpen={isSatisfactionOpen}
              onToggle={() => setIsSatisfactionOpen(!isSatisfactionOpen)}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
