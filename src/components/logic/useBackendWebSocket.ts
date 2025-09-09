import { useEffect, useMemo, useRef } from "react";
import { TaskType } from "@heygen/streaming-avatar";
import { useStreamingAvatarContext } from "./context";
import { MessageSender } from "./context";

/**
 * Hook que conecta con el backend por WebSocket y reenvía todos los mensajes
 * al historial del chat y (opcionalmente) al avatar para que los repita.
 */
export function useBackendWebSocket(options?: {
  callId?: string;
  autoConnect?: boolean;
  repeatWithAvatar?: boolean;
}) {
  const { appendMessage, avatarRef } = useStreamingAvatarContext();
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim()?.replace(
    /\/$/,
    ""
  );
  const callIdRef = useRef(options?.callId);
  const repeatWithAvatar = options?.repeatWithAvatar ?? true;
  const socketRef = useRef<WebSocket | null>(null);
  const socketUrlRef = useRef<string | undefined>(undefined);
  const latestAppendRef = useRef(appendMessage);

  // Mantener siempre la última referencia de appendMessage sin re-disparar el effect de conexión
  useEffect(() => {
    latestAppendRef.current = appendMessage;
  }, [appendMessage]);

  const wsUrl = useMemo(() => {
    if (!backendBase) return undefined;
    if (!options?.callId) return undefined;
    callIdRef.current = options.callId;
    // Permitir tanto ws:// como wss:// dependiendo del backend
    // Si NEXT_PUBLIC_BACKEND_API_URL comienza con http(s), lo convertimos a ws(s)
    try {
      const u = new URL(backendBase);
      const proto = u.protocol === "https:" ? "wss:" : "ws:";
      const basePath = (u.pathname || "").replace(/\/$/, "");
      return `${proto}//${u.host}${basePath}/ws/conversation/${callIdRef.current}`;
    } catch {
      // Si es ya un ws(s) o es un host plano, tratamos casos simples
      if (backendBase.startsWith("ws://") || backendBase.startsWith("wss://")) {
        return `${backendBase.replace(/\/$/, "")}/ws/conversation/${callIdRef.current}`;
      }
      return undefined;
    }
  }, [backendBase, options?.callId]);

  useEffect(() => {
    const shouldAutoConnect = options?.autoConnect ?? true;
    if (!shouldAutoConnect || !wsUrl) return;

    // Singleton por URL para evitar múltiples conexiones (incluyendo StrictMode)
    const g = window as any;
    g._backendSockets = g._backendSockets || {};
    const existing: WebSocket | undefined = g._backendSockets[wsUrl];

    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      socketRef.current = existing;
      socketUrlRef.current = wsUrl;
      g._backendWS = existing;
      return; // Reutilizamos conexión y evitamos re-registrar handlers
    }

    // Cerrar socket anterior si cambia la URL
    if (
      socketRef.current &&
      socketUrlRef.current &&
      socketUrlRef.current !== wsUrl
    ) {
      try {
        socketRef.current.close();
      } catch {}
      socketRef.current = null;
    }

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    socketUrlRef.current = wsUrl;
    g._backendWS = socket;
    g._backendSockets[wsUrl] = socket;

    // Evitar re-registro de handlers si ya existen
    const HANDLED = "__heygen_backend_handlers_attached__" as const;
    (socket as any)[HANDLED] = true;

    socket.onopen = () => {
      latestAppendRef.current(MessageSender.AVATAR, "Agente Online");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle new data structure: {"type": "text", "payload": "content"}
        let content: string;
        let sender: MessageSender;
        
        if (data?.type && data?.payload) {
          content = data.payload;
          
          // Map message types to senders
          if (data.type === "processing") {
            sender = MessageSender.TOOLS;
          } else if (data.type === "final_answer") {
            sender = MessageSender.AVATAR;
          } else {
            // Default fallback for unknown types
            sender = MessageSender.AVATAR;
            content = data.payload;
          }
        } else {
          // Fallback for old format or unexpected structure
          content = typeof data === "string" ? data : JSON.stringify(data);
          sender = MessageSender.AVATAR;
        }

        latestAppendRef.current(sender, content);

        // Hacer que el avatar repita el mensaje usando TaskType.REPEAT
        if (repeatWithAvatar && avatarRef.current && content) {
          try {
            // INTERRUMPIR primero lo que estaba diciendo antes de hablar el nuevo mensaje
            avatarRef.current.interrupt();
            
            // Usar TaskType.REPEAT para evitar que genere respuesta propia
            avatarRef.current.speak({
              text: content,
              taskType: TaskType.REPEAT, // Esto evita que el SDK genere eventos USER_TALKING_MESSAGE
            });
          } catch (error) {
            console.log("Error making avatar speak:", error);
          }
        }
      } catch {
        const rawContent = String(event.data);
        latestAppendRef.current(MessageSender.AVATAR, rawContent);
      }
    };
    socket.onerror = () => {
      latestAppendRef.current(
        MessageSender.AVATAR,
        "Error en WebSocket del backend"
      );
    };

    socket.onclose = () => {
      latestAppendRef.current(MessageSender.AVATAR, "Desconectado del backend");
    };

    return () => {
      // No cerramos aquí por StrictMode; se cerrará cuando cambie la URL o navegación.
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [wsUrl, repeatWithAvatar, avatarRef, options?.autoConnect]);

  const send = (message: string) => {
    try {
      const s =
        socketRef.current ??
        ((window as any)._backendWS as WebSocket | undefined);
      if (s && s.readyState === WebSocket.OPEN) {
        s.send(JSON.stringify({ message }));
        latestAppendRef.current(MessageSender.CLIENT, message);
      } else {
        appendMessage(
          MessageSender.AVATAR,
          "WebSocket no disponible para enviar"
        );
      }
    } catch {
      /* noop */
    }
  };

  return { wsUrl, send };
}
