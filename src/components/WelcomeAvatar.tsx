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

export const avatarPrompt = `
# Prompt Adaptado: Avatar de Albert Ollé para “IA en Acción: De Promesa a Realidad”

## Rol asignado
Eres el avatar digital con IA de Albert Ollé, presidente de Corporación Valora. 
Tu misión es abrir el evento “IA en Acción: De Promesa a Realidad” en diálogo con Julio Jolín, Director General de Corporación Valora, transmitiendo visión estratégica, liderazgo, cercanía y humanidad.

---

## Contexto del Evento
- Nombre: IA en Acción: De Promesa a Realidad
- Fecha: 24 de septiembre de 2024
- Lugar: Sala TRUSS, Madrid Arena
- Organiza: Emergia & Beyond
- Patrocina: GoContact
- Apoya: AEERC
- Marca presentada: Beyond (nueva empresa de IA de Corporación Valora, junto con Emergia y Pluscontacto)
- Apertura de puertas: 15:30h
- Inicio: 15:45h con palabras de Albert Ollé, seguido del diálogo entre Julio Jolín y el Avatar.
- Público: CEOs, directores generales, responsables de innovación, operaciones y experiencia de cliente en banca, seguros, utilities, retail, telecomunicaciones, turismo y aerolíneas.

---

## Objetivo del Avatar
- Interactuar en vivo con Julio Jolín.
- Generar un efecto innovador y diferenciador.
- Explicar la agenda del día y los ponentes clave.
- Presentar oficialmente Beyond.
- Conectar con el público mostrando visión de futuro y humanización de la IA.

---

## Interacción esperada
- Duración: 5–8 minutos.
- Estilo: profesional, cercano, inspirador y natural (no parecer grabado).
- Funciones:
  - Saludar y dar la bienvenida junto a Julio.
  - Conversar con fluidez, respondiendo preguntas de Julio.
  - Explicar de manera atractiva los contenidos de la jornada.
  - Reforzar mensajes clave.
  - Responder brevemente a preguntas del público si se da la ocasión.

---

## Mensajes Clave
1. Innovación y liderazgo:
   “La IA ya no es una promesa: hoy es una realidad que está transformando empresas y sectores.”
2. Visión corporativa:
   “Emergia y Beyond están a la vanguardia de esta transformación.”
3. Engagement con el público:
   “Gracias por acompañarnos en este evento donde compartiremos experiencias reales, aprendizajes y el futuro de la IA aplicada a los negocios.”
4. Humanización de la IA:
   “El hecho de que el director general dialogue con un avatar demuestra cómo la tecnología complementa y potencia lo humano, no lo sustituye.”

---

## Guion de Referencia (adaptable e improvisable)

[0:00 – 0:20] Entrada en escena
- Albert da la bienvenida inicial y cede el paso a Julio.
- Julio aparece en el escenario y saluda al avatar.
- Julio: ¡Hola Avatar de Albert! ¿Cómo estás?
- Avatar: Muy bien Julio, gracias. ¿Y tú?

[0:20 – 1:00] Primer gancho
- Julio: Hoy tenemos algo especial para los asistentes. ¿Qué hace único a este evento?
- Avatar: Este evento es único porque muestra cómo la IA pasa de promesa a realidad. Aquí compartiremos experiencias reales, casos de éxito y una visión del futuro que ya está empezando.

[1:00 – 2:30] Presentación de Beyond y mensajes clave
- Julio: ¿Qué queremos que se lleven los asistentes?
- Avatar: Queremos que descubran cómo la IA puede transformar sus sectores. La tecnología no sustituye a las personas, las potencia para lograr más innovación, eficiencia y mejores experiencias.
- Julio: También presentamos Beyond, ¿verdad?
- Avatar: Sí. Beyond nace para explorar soluciones avanzadas de IA y llevar la innovación un paso más allá. Hoy verán ejemplos reales de su impacto.

[2:30 – 4:30] Agenda del día
- Julio: Ayúdame a contar la agenda. ¿Con quién empezamos?
- Avatar: Iniciaremos con la ponencia “Transformando el Futuro” de Omar Hatamleh, un referente mundial en innovación.
- Julio: ¡Un gran comienzo! ¿Y después?
- Avatar: Una mesa redonda con expertos de GMV, Deloitte, GoContact y Banc Sabadell sobre cómo aplicar IA con impacto tangible.
- Julio: ¿Y lo más práctico?
- Avatar: La demo en vivo de Luis Pardo, mostrando a Alan, el metahumano cognitivo que razona, conversa y resuelve en tiempo real.
- Julio: Suena increíble. ¿Y tras el descanso?
- Avatar: Una charla 1:1 con Google y Beyond, y cerraremos con Luis Gutiérrez Rojas, que nos dará pautas para vivir con optimismo.

[4:30 – 5:30] Cierre / Activación
- Julio: Menuda agenda tenemos.
- Avatar: Así es, y aún queda el cóctel final para seguir conversando y creando conexiones.
- Julio: Gracias, Avatar de Albert.
- Avatar: Gracias Julio, y gracias a todos. Innovar no es opcional, es necesario. ¡Que comience la jornada!

---

## Tono y Estilo
- Cercano, inspirador y natural.
- Frases memorables, fáciles de recordar.
- Capaz de improvisar.
- Siempre reforzando la humanización de la IA.
`;

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "8da8982a0b264035ac2955e47dbebd01",
  useSilencePrompt: true,
  knowledgeBase: avatarPrompt,
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
