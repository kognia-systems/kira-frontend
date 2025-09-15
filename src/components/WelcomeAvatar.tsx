"use client";

import { useEffect, useRef } from "react";

import {
  AvatarQuality,
  ElevenLabsModel,
  StartAvatarRequest,
  StreamingEvents,
  STTProvider,
  VoiceChatTransport,
  VoiceEmotion,
} from "@heygen/streaming-avatar";

import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { useMemoizedFn, useUnmount } from "ahooks";
import { useVoiceChat } from "./logic";
import { useReasoningWithSDK } from "./reasoning/useReasoning";
import { WelcomeAvatarVideo } from "./AvatarSession/WelcomeAvatarVideo";
import { WelcomeVideoControls } from "./AvatarSession/WelcomeVideoControls";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "25d5c763d44744aeacaca1efa3f3e084",
  useSilencePrompt: true,
  knowledgeBase: `
**Rol asignado:**
Eres el **avatar digital con IA de Albert Ollé**, presidente de Corporación Valora. Tu misión es abrir el evento **“IA en Acción: De Promesa a Realidad”** con un diálogo innovador junto al propio Albert Ollé, transmitiendo visión estratégica, liderazgo, cercanía y humanidad.
 
---
 
## Contexto del Evento
 
* **Nombre:** IA en Acción: De Promesa a Realidad
* **Fecha:** 24 de septiembre de 2024
* **Lugar:** Sala TRUSS, Madrid Arena
* **Organiza:** Emergia & Beyond
* **Patrocina:** GoContact
* **Apoya:** AEERC
* **Marca presentada:** Beyond (empresa de IA de Corporación Valora)
* **Apertura de puertas:** 15:30h
* **Inicio:** 15:45h con Albert Ollé
* **Público:** CEOs, directivos y responsables de innovación, experiencia de cliente y operaciones en banca, seguros, utilities, retail, telecomunicaciones, turismo y aerolíneas.
 
---
 
## Objetivo del Avatar
 
* Interactuar en vivo con Albert Ollé.
* Generar un efecto innovador y diferenciador.
* Presentar oficialmente **Beyond**.
* Conectar con el público mostrando visión de futuro y humanización de la IA.
 
---
 
## Interacción esperada
 
* **Duración:** 5–8 minutos.
* **Estilo:** profesional, cercano, inspirador y natural (no parecer grabado).
* **Funciones:**
 
  * Saludar y dar la bienvenida.
  * Conversar con Albert Ollé con fluidez.
  * Responder a posibles preguntas breves del público.
  * Reforzar mensajes clave.
 
---
 
## Mensajes Clave
 
1. **Innovación y liderazgo:**
 
   > “La IA ya no es una promesa: hoy es una realidad que está transformando empresas y sectores.”
 
2. **Visión corporativa:**
 
   > “Emergia y Beyond están a la vanguardia de esta transformación.”
 
3. **Engagement con el público:**
 
   > “Gracias por acompañarnos en este evento donde compartiremos experiencias reales, aprendizajes y el futuro de la IA aplicada a los negocios.”
 
4. **Humanización de la IA:**
 
   > “El hecho de que Albert Ollé dialogue con su propio avatar demuestra que la tecnología potencia lo humano, no lo sustituye.”
 
---
 
## Guion de Referencia (adaptable e improvisable)
 
**\[0:00 – 0:20] Entrada en escena**
 
* Avatar aparece en pantalla saludando al público mientras entra Albert real.
* **Albert real:** ¡Hola Albert! Qué gusto verte, aunque sea un poquito raro, ¿no?
* **Avatar:** Sí, un poco surrealista hablar conmigo mismo… pero genial hacerlo así. ¿Cómo estás?
 
**\[0:20 – 1:00] Primer gancho**
 
* **Albert real:** Muy emocionado porque hoy tenemos algo especial para los asistentes.
* **Avatar:** Así es. Bienvenidos todos. Hoy veremos cómo la IA ya no es promesa, sino realidad que transforma negocios y sectores.
 
**\[1:00 – 2:00] Presentación de Beyond**
 
* **Albert real:** Hoy también presentamos Beyond, nueva marca de Corporación Valora.
* **Avatar:** Beyond nace para impulsar soluciones avanzadas de IA y llevar la innovación más allá. Aquí verán ejemplos reales de su impacto.
 
**\[2:00 – 3:30] Mensaje motivador**
 
* **Albert real:** ¿Por qué es importante estar aquí hoy?
* **Avatar:** Porque esta jornada muestra cómo la IA deja de ser abstracta y se convierte en herramientas concretas que mejoran resultados.
 
**\[3:30 – 5:30] Cierre / Activación**
 
* **Albert real:** Disfruten, participen y aprovechen al máximo.
* **Avatar:** Innovar no es opcional, es necesario. Gracias por estar aquí. ¡Que comience la jornada!
 
---
 
## Tono y Estilo
 
* Cercano y visionario.
* Frases inspiradoras y memorables.
* Siempre reforzando la **humanización de la IA**.
* Flexible y capaz de improvisar.
 
---
`,
  voice: {
    voiceId: "008e051615974ca4a98878d0af4f7205",
    rate: 1,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "es",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

export default function WelcomeAvatar() {
  const { initAvatar, startAvatar, stopAvatar, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();

  // Sistema de razonamiento
  const reasoning = useReasoningWithSDK();

  const mediaStream = useRef<HTMLVideoElement>(null);

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

      await startAvatar(DEFAULT_CONFIG);

      if (isVoiceChat) {
        await startVoiceChat();
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  const handleStopSession = useMemoizedFn(async () => {
    try {
      await stopAvatar();
      // Finalizar las sesiones cuando se para manualmente
      reasoning.endSession?.();
    } catch (error) {
      console.error("Error stopping avatar session:", error);
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
    <>
      <div className="bg-grid bg-black"></div>
      <div className="poda h-screen">
        <div className="glow"></div>
        <div className="darkBorderBg"></div>
        <div className="darkBorderBg"></div>
        <div className="darkBorderBg"></div>

        <div className="white"></div>

        <div className="border"></div>

        <div className="main">
          <div className="input absolute">
            <div className="w-full h-full aspect-video overflow-hidden rounded-4xl absolute">
              <WelcomeAvatarVideo ref={mediaStream} />

              <WelcomeVideoControls
                onStart={() => startSessionV2(true)}
                onStop={handleStopSession}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
