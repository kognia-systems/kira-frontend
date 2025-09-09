import {
  AvatarQuality,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import {
  StreamingAvatarProvider,
  StreamingAvatarSessionState,
  useStreamingAvatarContext,
} from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { ToolsPanel } from "./AvatarSession/ToolsPanel";
import { useBackendWebSocket } from "./logic/useBackendWebSocket";
import { createCall } from "./logic/backendClient";

import { AVATARS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: "Elenora_IT_Sitting_public",
  knowledgeId: undefined,
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.BROADCASTER,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "es",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  // No voice chat: solo repetimos lo que venga del backend por WS

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [callId, setCallId] = useState<string | null>(null);
  const { send } = useBackendWebSocket({
    callId: callId ?? undefined,
    repeatWithAvatar: true,
  });
  const { appendMessage } = useStreamingAvatarContext();

  const mediaStream = useRef<HTMLVideoElement>(null);

  const startSessionV2 = useMemoizedFn(async () => {
    try {
      // 1) Crear llamada en backend (retorna token HeyGen y call_id)
      const { token, call_id } = await createCall("USR004");
      setCallId(call_id);

      // 2) Inicializar avatar con el token del backend
      initAvatar(token);

      await startAvatar(config);
    } catch (error) {
      console.error("Error starting avatar session:", error);
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
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Panel principal del avatar */}
        <div className="flex-1 flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
          <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center">
            {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
              <AvatarVideo ref={mediaStream} />
            ) : (
              <AvatarConfig config={config} onConfigChange={setConfig} />
            )}
          </div>
          <div className="flex flex-col gap-3 items-center justify-center p-4 border-t border-zinc-700 w-full max-w-full">
            {sessionState === StreamingAvatarSessionState.CONNECTED ? (
              <AvatarControls />
            ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
              <div className="flex flex-row gap-4">
                <Button onClick={() => startSessionV2()}>Start Session</Button>
              </div>
            ) : (
              <LoadingIcon />
            )}
          </div>
        </div>

        {/* Panel lateral para herramientas - siempre visible cuando hay sesión */}
        {sessionState === StreamingAvatarSessionState.CONNECTED && (
          <div className="lg:w-96 w-full">
            <ToolsPanel />
          </div>
        )}
      </div>

      {/* Panel inferior para historial de mensajes */}
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <MessageHistory />
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
