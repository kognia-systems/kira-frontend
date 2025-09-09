/* eslint-disable @typescript-eslint/no-explicit-any */
// Motor de razonamiento que mapea eventos de conversación a nodos
import { ReasoningNode, ReasoningStep, ConversationEvent } from "./types";

// Definición de los pasos de razonamiento predefinidos para Kira (agente CX)
export const REASONING_TEMPLATES: Record<string, Partial<ReasoningNode>> = {
  session_start: {
    label: "Iniciando Sesión",
    description: "Estableciendo conexión...",
    icon: "greeting",
  },
  user_greeting: {
    label: "Procesando Saludo",
    description: "Analizando mensaje inicial...",
    icon: "greeting",
  },
  agent_greeting: {
    label: "Generando Respuesta",
    description: "Preparando saludo cordial...",
    icon: "greeting",
  },
  agent_listening: {
    label: "Análizando la solicitud",
    description: "Procesando entrada de audio...",
    icon: "listening",
  },
  agent_analyzing: {
    label: "Consultando información en CRM",
    description: "Analizando contexto y necesidades...",
    icon: "analyzing",
  },
  system_verification: {
    label: "Verificando Datos",
    description: "Confirmando información del sistema...",
    icon: "verification",
  },
  crm_lookup: {
    label: "Consultando CRM",
    description: "Accediendo historial del cliente...",
    icon: "verification",
  },
  fraud_analysis: {
    label: "Análisis de Seguridad",
    description: "Evaluando patrones de riesgo...",
    icon: "fraud",
  },
  decision_making: {
    label: "Evaluando Opciones",
    description: "Determinando mejor curso de acción...",
    icon: "decision",
  },
  action_execution: {
    label: "Ejecutando Acción",
    description: "Procesando solicitud del cliente...",
    icon: "action",
  },
  agent_response: {
    label: "Consultando información en CRM",
    description: "Formulando comunicación clara...",
    icon: "greeting",
  },
  session_end: {
    label: "Finalizando Sesión",
    description: "Cerrando conversación...",
    icon: "decision",
  },
  database_query: {
    label: "Consultando Base de Datos",
    description: "Buscando información específica...",
    icon: "verification",
  },
};

export class ReasoningEngine {
  private nodeCounter = 0;
  private allNodes: ReasoningNode[] = [];
  private isSessionActive = false;
  private pendingAvatarResponse = false;
  private lastAvatarMessageTime = 0;

  constructor() {
    // No necesitamos pasos predefinidos, los crearemos dinámicamente
  }

  // Mapea eventos del SDK a nodos de razonamiento - CONTROLADO
  public processEvent(
    event: ConversationEvent,
    data?: any
  ): ReasoningNode | null {
    console.log(`[ReasoningEngine] Processing event: ${event}`, data);

    // Filtrar eventos que no deben generar nodos duplicados
    if (this.shouldSkipEvent(event)) {
      console.log(
        `[ReasoningEngine] Skipping event: ${event} (controlled generation)`
      );
      return null;
    }

    const template = REASONING_TEMPLATES[event];
    if (!template) {
      console.log(`[ReasoningEngine] No template found for event: ${event}`);
      return null;
    }

    // Activar sesión si no está activa
    if (!this.isSessionActive) {
      this.isSessionActive = true;
    }

    // Control especial para respuestas del avatar
    if (event === "agent_response") {
      this.pendingAvatarResponse = true;
      this.lastAvatarMessageTime = Date.now();
    }

    const node: ReasoningNode = {
      id: `node_${this.nodeCounter++}`,
      label: template.label!,
      description: template.description!,
      status: "active",
      timestamp: new Date(),
      icon: template.icon,
      data,
    };

    // Agregar nodo a la lista general (cronológicamente)
    this.allNodes.push(node);

    console.log(
      `[ReasoningEngine] Added node: ${node.label} (Total nodes: ${this.allNodes.length})`
    );
    return node;
  }

  // Determinar si debemos saltar un evento para evitar duplicados
  private shouldSkipEvent(event: ConversationEvent): boolean {
    const now = Date.now();

    // Control general de frecuencia - no más de un nodo por segundo
    if (this.allNodes.length > 0) {
      const lastNode = this.allNodes[this.allNodes.length - 1];
      if (lastNode?.timestamp) {
        const lastNodeTime = lastNode.timestamp.getTime();
        if (now - lastNodeTime < 1000) {
          console.log(
            `[ReasoningEngine] Skipping ${event} - too frequent (${
              now - lastNodeTime
            }ms)`
          );
          return true;
        }
      }
    }

    // No duplicar respuestas del avatar si ya hay una pendiente reciente
    if (event === "agent_response" && this.pendingAvatarResponse) {
      if (now - this.lastAvatarMessageTime < 3000) {
        // 3 segundos
        return true;
      }
    }

    // No generar "listening" inmediatamente después de respuesta
    if (event === "agent_listening" && this.pendingAvatarResponse) {
      if (now - this.lastAvatarMessageTime < 2000) {
        // 2 segundos
        return true;
      }
      this.pendingAvatarResponse = false; // Reset del estado
    }

    return false;
  }

  // Analizar texto del avatar para detectar consultas de base de datos - CONTROLADO
  public analyzeAvatarResponse(text: string): ReasoningNode | null {
    if (!text || typeof text !== "string") return null;

    // Evitar análisis duplicados muy frecuentes
    const now = Date.now();
    if (this.lastAvatarMessageTime && now - this.lastAvatarMessageTime < 3000) {
      console.log(
        `[ReasoningEngine] Skipping avatar text analysis - too frequent`
      );
      return null;
    }

    console.log(
      `[ReasoningEngine] Analyzing avatar text (length: ${text.length}):`,
      text.substring(0, 100) + "..."
    );

    // Detectar menciones de actividades específicas
    const activityPatterns = [
      {
        patterns: [
          /buscando en mi base de datos/i,
          /consultando la base de datos/i,
          /revisando en el sistema/i,
        ],
        label: "Consulta Base de Datos",
        icon: "verification",
      },
      {
        patterns: [/verificando/i, /confirmando/i, /revisando datos/i],
        label: "Verificación de Datos",
        icon: "verification",
      },
      {
        patterns: [/analizando/i, /evaluando/i, /procesando información/i],
        label: "Razonamiento",
        icon: "analyzing",
      },
      {
        patterns: [
          /detecté una transacción/i,
          /encontré un movimiento/i,
          /veo una operación/i,
        ],
        label: "Detección de Transacción",
        icon: "fraud",
      },
    ];

    for (const activity of activityPatterns) {
      const hasMatch = activity.patterns.some((pattern) => pattern.test(text));

      if (hasMatch) {
        // Extraer información específica del texto
        const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4})/;
        const amountPatterns = [
          /(\d+(?:\.\d+)?)\s*euros?/i,
          /€\s*(\d+(?:\.\d+)?)/i,
          /(\d+(?:\.\d+)?)\s*€/i,
          /importe:?\s*(\d+(?:\.\d+)?)/i,
        ];

        const dateMatch = text.match(datePattern);
        let amountMatch = null;

        for (const pattern of amountPatterns) {
          amountMatch = text.match(pattern);
          if (amountMatch) break;
        }

        let description =
          text.length > 100 ? text.substring(0, 97) + "..." : text;

        if (dateMatch || amountMatch) {
          const details = [];
          if (dateMatch) details.push(`*Fecha:* ${dateMatch[1]}`);
          if (amountMatch) details.push(`*Importe:* ${amountMatch[1]} euros`);

          if (details.length > 0) {
            description = `${details.join(" • ")}`;
          }
        }

        const node: ReasoningNode = {
          id: `node_${this.nodeCounter++}`,
          label: activity.label,
          description,
          status: "active",
          timestamp: new Date(),
          icon: activity.icon,
          data: {
            extractedDate: dateMatch ? dateMatch[1] : null,
            extractedAmount: amountMatch ? amountMatch[1] : null,
            originalText: text,
          },
        };

        // Actualizar timestamp para control de frecuencia
        this.lastAvatarMessageTime = now;

        // Agregar a la lista cronológica
        this.allNodes.push(node);
        console.log(
          `[ReasoningEngine] Added activity node: ${node.label} (Total nodes: ${this.allNodes.length})`
        );
        return node;
      }
    }

    return null;
  }

  // Organizar nodos en pasos dinámicos para la visualización
  public getSteps(): ReasoningStep[] {
    if (this.allNodes.length === 0) {
      return [];
    }

    // Crear un solo paso con todos los nodos cronológicamente
    const dynamicStep: ReasoningStep = {
      phase: "Motor de Pensamiento Cognitivo",
      nodes: [...this.allNodes], // Copia de todos los nodos
      edges: [],
    };

    return [dynamicStep];
  }

  public getCurrentStep(): number {
    return this.allNodes.length > 0 ? 0 : -1;
  }

  public getAllNodes(): ReasoningNode[] {
    return [...this.allNodes]; // Retornar copia para evitar mutaciones
  }

  public getActiveNodesCount(): number {
    return this.allNodes.filter((node) => node.status === "active").length;
  }

  public getTotalNodesCount(): number {
    return this.allNodes.length;
  }

  public isSessionEnded(): boolean {
    return this.allNodes.some(
      (node) =>
        node.label === "Cierre de Sesión" || node.label === "Session End"
    );
  }

  public reset() {
    console.log("[ReasoningEngine] Resetting engine");
    this.nodeCounter = 0;
    this.allNodes = [];
    this.isSessionActive = false;
    this.pendingAvatarResponse = false;
    this.lastAvatarMessageTime = 0;
  }

  // Marcar todos los nodos como completados al finalizar la sesión
  public endSession() {
    console.log("[ReasoningEngine] Ending session");
    this.allNodes.forEach((node) => {
      if (node.status === "active") {
        node.status = "completed";
      }
    });
    this.isSessionActive = false;
  }
}
