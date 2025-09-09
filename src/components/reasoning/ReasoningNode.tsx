
"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  MessageCircle, 
  Ear, 
  Search, 
  Database, 
  Shield, 
  CheckCircle, 
  Play,
  Clock,
  AlertCircle
} from "lucide-react";
import { ReasoningNode as NodeType } from "./types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  greeting: MessageCircle,
  listening: Ear,
  analyzing: Search,
  verification: Database,
  fraud: Shield,
  decision: CheckCircle,
  action: Play,
  default: Clock
};

const statusColors = {
  pending: "bg-gray-100 text-gray-600 border-gray-200",
  active: "bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-100",
  completed: "bg-green-50 text-green-700 border-green-200",
  error: "bg-red-50 text-red-700 border-red-200"
};

const statusIcons = {
  pending: Clock,
  active: Play,
  completed: CheckCircle,
  error: AlertCircle
};

interface ReasoningNodeProps {
  node: NodeType;
  isCompact?: boolean;
  index: number;
}

export function ReasoningNode({ node, isCompact = false, index }: ReasoningNodeProps) {
  const IconComponent = iconMap[node.icon || 'default'];
  const StatusIcon = statusIcons[node.status];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 200 
      }}
      className={`
        relative rounded-xl border-2 transition-all duration-300 bg-white
        ${statusColors[node.status]}
        ${isCompact ? 'p-3' : 'p-4'}
        ${node.status === 'active' ? 'shadow-md' : 'shadow-sm'}
        ${node.parentId ? 'ml-6' : ''} // Add indentation for child nodes
      `}
    >
      {/* Icono principal */}
      <div className="flex items-start gap-3">
        <motion.div
          animate={node.status === 'active' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`
            flex-shrink-0 border rounded-lg p-2
            ${node.status === 'active' ? 'bg-white/50' : 'bg-white/30'}
          `}
        >
          <IconComponent className="w-4 h-4" />
        </motion.div>

        <div className="flex-1 min-w-0">
          {/* Título */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">
              {node.label}
            </h4>
            <StatusIcon className="w-3 h-3 flex-shrink-0" />
          </div>

          {/* Descripción */}
          {!isCompact && (
            <p className="text-xs opacity-75 leading-relaxed">
              {node.description}
            </p>
          )}

          {/* Timestamp */}
          {node.timestamp && (
            <div className="text-xs opacity-50 mt-2">
              {node.timestamp.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>

      {/* Animación de pulso para nodo activo */}
      {node.status === 'active' && (
        <motion.div
          className="absolute inset-0 rounded-xl border-1 border-blue-300/10"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
