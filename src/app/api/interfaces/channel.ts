
export interface Channel {
  id?: string;
  name: string; // nombre del agente para el cliente
  description: string; // Descripción del agente para el cliente
  provider: "heygen"; // proveedor del servicio
  agentId: string; // referencia al agente creado
  configId: string; // referencia al documento en heygen-configs
}
