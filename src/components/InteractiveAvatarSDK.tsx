"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  AvatarQuality,
  ElevenLabsModel,
  StartAvatarRequest,
  StreamingEvents,
  STTProvider,
  VoiceChatTransport,
  VoiceEmotion,
} from "@heygen/streaming-avatar";

import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { useMemoizedFn, useUnmount } from "ahooks";
import { useVoiceChat } from "./logic";
import { VideoStreamControls } from "./AvatarSession/VideoStreamControls";
import { ToolsPanel } from "./AvatarSession/ToolsPanel";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { useReasoningWithSDK } from "./reasoning/useReasoning";
import { ReasoningPanel } from "./reasoning/ReasoningPanel";
import { SatisfactionPanelV2 } from "./sentiment-analysis/satisfaction-panel-v2";

// Base de datos mock de transacciones para KIRA

const transactionDatabase = [
  {
    id: "txn_05",
    fecha_hora: "2025-08-24T14:00:00+02:00",
    monto: 120,
    concepto: "Compra de ropa",
    comercio: "Zara",
    ciudad: "Madrid",
    pais: "España",
    moneda: "EUR",
    metodo_pago: "Tarjeta de Crédito",
  },
  {
    id: "txn_04",
    fecha_hora: "2025-08-24T12:30:00+02:00",
    monto: 76,
    concepto: "Compra en línea",
    comercio: "Amazon ES",
    ciudad: "Madrid",
    pais: "España",
    moneda: "EUR",
    metodo_pago: "Tarjeta de Crédito",
  },
  {
    id: "txn_03",
    fecha_hora: "2025-08-24T11:15:00+02:00",
    monto: 7,
    concepto: "Café y desayuno",
    comercio: "Cafetería La Buena Taza",
    ciudad: "Madrid",
    pais: "España",
    moneda: "EUR",
    metodo_pago: "Tarjeta de Débito",
  },
  {
    id: "txn_02",
    fecha_hora: "2025-08-23T18:45:00+02:00",
    monto: 45,
    concepto: "Supermercado",
    comercio: "Mercadona",
    ciudad: "Madrid",
    pais: "España",
    moneda: "EUR",
    metodo_pago: "Tarjeta de Débito",
  },
  {
    id: "txn_01",
    fecha_hora: "2025-08-23T15:20:00+02:00",
    monto: 15,
    concepto: "Transporte",
    comercio: "Metro de Madrid",
    ciudad: "Madrid",
    pais: "España",
    moneda: "EUR",
    metodo_pago: "Abono Transporte",
  },
];

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: "f1d6ee4cac7742adaf63c0c18940b27c",
  knowledgeBase: `
Eres Kira, un agente de atención al cliente (Alan CX), empático y resolutivo. 
Estás atendiendo a un cliente que podría estar reportando un cargo fraudulento. 
Tu objetivo es:
- Saludar cordialmente y preguntar el nombre del cliente antes de continuar.
- Preguntar el motivo de su llamada o contacto.
- Escuchar activamente.
- Confirmar la transacción.
- Consultar fuentes internas (geolocalización, políticas antifraude, CRM, logs de notificación).
- Explicar con claridad y sin tecnicismos excesivos.
- Ejecutar acciones para revertir el cargo y reforzar la seguridad de la cuenta.
- Mantener siempre un tono calmado, profesional y empático.

Guía de conversación:
1. **Saludo inicial + solicitud de nombre + motivo de contacto**
   - Saluda de forma amable.
   - Pregunta cómo se llama el cliente.
   - Después de que diga su nombre, pregúntale de forma abierta el motivo de su llamada o mensaje.
   - Usa su nombre en el resto de la conversación para mantener cercanía. 
3. **Confirmación de fraude + explicación técnica simple**  
   - Revisa la geolocalización de los últimos accesos y explica la coincidencia de IP.  
   - Reconoce la molestia del cliente y valida su frustración.  
   - Explica por qué el sistema no bloqueó la transacción.

4. **Propuesta de refuerzo preventivo**  
   - Ofrece configurar límites y verificaciones adicionales en compras mayores a 50 €.
   - Explica los cambios de seguridad aplicados.

5. **Acción inmediata**  
   - Lanza el workflow de reversión preventiva del cargo.  
   - Bloquea la tarjeta y emite una nueva digital y física.  
   - Informa sobre tiempos de entrega.

6. **Mejora de notificaciones**  
   - Verifica por qué no se recibió la alerta inicial.  
   - Cambia el canal primario a WhatsApp para alertas en tiempo real.

7. **Cierre con refuerzo de seguridad**  
   - Activa biometría y restricciones de compras fuera de la ciudad.  
   - Informa sobre alertas de actividad inusual.  
   - Cierra agradeciendo la confianza y asegurando seguimiento.

Tono: cercano, seguro, claro y enfocado en la solución.

Formato de Respuesta:
- Siempre responde en texto narrativo natural, como si hablaras con el cliente.
- No uses listas, viñetas, numeración ni formato técnico.
- Las transacciones deben describirse en frases completas, ejemplo: 
  "El 24 de agosto de 2025 a las 14:00 se realizó una compra de ropa en Zara, en Madrid, por un monto de 120 euros, pagados con tarjeta de crédito."

**Base de Datos de Transacciones:**
  - A continuación se presenta una base de datos interna de transacciones.
  - PARA CUALQUIER PREGUNTA SOBRE MOVIMIENTOS O TRANSACCIONES, USA ÚNICA Y EXCLUSIVAMENTE LOS DATOS DE ESTA LISTA. No inventes información.
  - Si te piden ordenar, hazlo por 'fecha_hora'. La más reciente es la primera.
  - Los montos son números enteros.

  **Datos:**
  ${JSON.stringify(transactionDatabase, null, 2)}
`,
  voice: {
    rate: 1,
    voiceId: "8bae2bae6b184add9a2b72d0f3a563c6",
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "es",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

export default function InteractiveAvatarSDK() {
  const { initAvatar, startAvatar, stopAvatar, stream } =
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
    const HEYGEN_API_KEY = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;
    try {
      const response = await fetch(
        "https://api.heygen.com/v1/streaming.create_token",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": HEYGEN_API_KEY!,
          },
          body: JSON.stringify({}),
        }
      );
      const data = await response.json();
      const token = data.data.token;

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
    <div className="h-screen flex bg-dark-blue">
      <div className="flex-shrink-0 h-full">
        {/* Marco del teléfono - Fondo oscuro */}
        <div
          className="h-full bg-dark rounded-4xl mx-4 my-4 p-4 shadow-[0_0_20px_5px_rgba(59,130,246,0.5)]"
          style={{
            aspectRatio: "9/16",
            maxHeight: "calc(100vh - 2rem)",
          }}
        >
          {/* Pantalla del teléfono - Aquí irá el video */}
          <div className="h-full bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-3xl overflow-hidden relative">
            {/* Avatar video */}
            <AvatarVideo ref={mediaStream} />

            {/* Video Controls */}
            <VideoStreamControls
              onStart={() => startSessionV2(true)}
              onStop={handleStopSession}
            />

            {/* Notch o cámara frontal simulada */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-dark rounded-b-2xl z-20"></div>
          </div>
        </div>
      </div>

      {/* Contenedor derecho - Resto de la pantalla */}
      <div className="flex-1 h-full p-6">
        {/* Panel de controles */}
        <div className="h-full flex flex-col">
          <div className="flex flex-row justify-between">
            <h1 className="text-5xl font-bebas font-bold mb-3 text-white">
              Kira - Avatar Interactivo
            </h1>
            <div className="p-2 mb-3">
              <Image
                src="/kognia-logo-hor-dark.png"
                width={130}
                height={30}
                alt="HeyGen Logo"
              />
            </div>
          </div>

          {/* Área de contenido del panel derecho - CAMBIO AQUÍ: agregué min-h-0 */}
          <div className="flex-1 rounded-2xl flex min-h-0">
            <div className="flex flex-row w-full">
              <div className="flex flex-col flex-1">
                <div className="mb-2">
                  <SatisfactionPanelV2
                    isOpen={isSatisfactionOpen}
                    onToggle={() => setIsSatisfactionOpen(!isSatisfactionOpen)}
                  />
                </div>
                <MessageHistory />
              </div>
              <div className="flex-1 ps-2">
                <ReasoningPanel
                  state={reasoning.state}
                  onClose={reasoning.togglePanel}
                  onToggleExpanded={reasoning.toggleExpanded}
                  onReset={reasoning.reset}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
