
// Tipos para el sistema de razonamiento
export interface ReasoningNode {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  timestamp?: Date;
  icon?: string;
  data?: any;
  parentId?: string;
}

export interface ReasoningEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ReasoningStep {
  phase: string;
  nodes: ReasoningNode[];
  edges: ReasoningEdge[];
}

export interface ReasoningState {
  isOpen: boolean;
  isExpanded: boolean;
  currentStep: number;
  steps: ReasoningStep[];
  mode: 'compact' | 'expanded';
}

// Eventos de conversación que mapearemos a nodos
export enum ConversationEvent {
  SESSION_START = 'session_start',
  USER_GREETING = 'user_greeting', 
  AGENT_GREETING = 'agent_greeting',
  USER_MESSAGE = 'user_message',
  AGENT_LISTENING = 'agent_listening',
  AGENT_ANALYZING = 'agent_analyzing',
  SYSTEM_VERIFICATION = 'system_verification',
  CRM_LOOKUP = 'crm_lookup',
  FRAUD_ANALYSIS = 'fraud_analysis',
  DECISION_MAKING = 'decision_making',
  ACTION_EXECUTION = 'action_execution',
  AGENT_RESPONSE = 'agent_response',
  SESSION_END = 'session_end',
  DATABASE_QUERY = 'database_query',
  INTENT_DETECTED = 'intent_detected'
}
