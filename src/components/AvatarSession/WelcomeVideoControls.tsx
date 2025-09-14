import { LoaderCircle, Hand, Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import {
  StreamingAvatarSessionState,
  useInterrupt,
  useStreamingAvatarSession,
  useVoiceChat,
} from "../logic";
import { useConversationState } from "../logic/useConversationState";
import { motion } from "framer-motion";
import { useSpeechToText } from "../logic/useSpeechToText";

interface VideoControlsProps {
  onStart: () => void;
  onStop: () => void;
}

export function WelcomeVideoControls({ onStart, onStop }: VideoControlsProps) {
  const { sessionState } = useStreamingAvatarSession();
  const { isUserTalking } = useConversationState();
  const { isMuted, muteInputAudio, unmuteInputAudio } = useVoiceChat();
  const { interrupt } = useInterrupt();
  const { startListening, stopListening, isListening } = useSpeechToText();

  const isConnecting = sessionState === StreamingAvatarSessionState.CONNECTING;

  const handleMute = () => {
    if(isListening) {
      muteInputAudio();
      stopListening();
    } else {
      unmuteInputAudio();
      startListening();
    }
  } 

  return (
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
      <div className="h-full flex items-end p-4 pb-6">
        {sessionState === StreamingAvatarSessionState.INACTIVE ? (
          /* Botón de llamada cuando avatar NO está activo */
          <div className="w-full flex flex-col gap-1 justify-center items-center">
            <button
              onClick={onStart}
              disabled={isConnecting}
              className="h-14 gap-2 px-4 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {isConnecting ? (
                <LoaderCircle className="w-6 h-6 animate-spin" />
              ) : (
                <Phone size={24} />
              )}
              Inicia la llamada
            </button>
          </div>
        ) : (
          /* Botones cuando avatar ESTÁ activo */
          <div className="w-full flex justify-center space-x-6">
            {/* Botón Hangup */}
            <button
              onClick={onStop}
              className="w-14 h-14 bg-red-500/90 rounded-full flex items-center justify-center text-white hover:bg-red-500 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <PhoneOff size={24} />
            </button>

            {/* Botón Mute/Unmute */}
            <motion.div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isUserTalking
                  ? "bg-green-300 text-green-600"
                  : isMuted
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600"
              }`}
              animate={isUserTalking ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{
                duration: 0.5,
                repeat: isUserTalking ? Infinity : 0,
              }}
            >
              <button onClick={handleMute}>
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
            </motion.div>

            {/* Botón Interrupt */}
            <button
              className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 hover:scale-105 transition-all duration-200 shadow-lg"
              onClick={interrupt}
            >
              <Hand size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
