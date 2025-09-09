import React, { useCallback, useEffect, useState } from "react";
import { usePrevious } from "ahooks";

import { Button } from "../Button";
import { PaperPlaneTilt } from "phosphor-react";
import { Input } from "../Input";
import { useConversationState } from "../logic/useConversationState";
import { useBackendWebSocket } from "../logic/useBackendWebSocket";
import { useSpeechToText } from "../logic/useSpeechToText";
import { useVoiceChat } from "../logic/useVoiceChat";

export const TextInput: React.FC = () => {
  const { send } = useBackendWebSocket();
  const { startListening, stopListening } = useConversationState();
  const [message, setMessage] = useState("");

  const handleSend = useCallback(() => {
    if (message.trim() === "") {
      return;
    }
    // enviar al backend por WS; el avatar repetirá lo recibido del agente
    send(message);
    setMessage("");
  }, [message, send]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSend();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend]);

  const previousText = usePrevious(message);

  useEffect(() => {
    if (!previousText && message) {
      startListening();
    } else if (previousText && !message) {
      stopListening();
    }
  }, [message, previousText, startListening, stopListening]);

  return (
    <div className="flex flex-row gap-1 items-end w-full">
      <Input
        className="flex-1"
        placeholder="Escribe para empezar a chatear con el avatar..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button className="flex-shrink-0 bg-ai-accent" onClick={handleSend}>
        <PaperPlaneTilt size={24} />
      </Button>
    </div>
  );
};
