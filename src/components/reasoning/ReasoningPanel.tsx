"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/Button";
import { ReasoningState } from "./types";
import { ReasoningNode } from "./ReasoningNode";
import { HeadCircuit } from "@phosphor-icons/react";

interface ReasoningPanelProps {
  state: ReasoningState;
  onClose: () => void;
  onToggleExpanded: () => void;
  onReset?: () => void;
}

export function ReasoningPanel({
  state,
  onClose,
  onToggleExpanded,
  onReset,
}: ReasoningPanelProps) {
  const { isOpen, isExpanded, steps, currentStep } = state;

  // Estado para revelación progresiva inteligente en tiempo real
  const [revealedNodeIds, setRevealedNodeIds] = useState<Set<string>>(
    new Set()
  );
  const [nodeQueue, setNodeQueue] = useState<string[]>([]);
  const revealIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Obtener todos los nodos hasta el paso actual, ordenados cronológicamente
  const allAvailableNodes = useMemo(() => {
    return steps
      .slice(0, currentStep + 1)
      .flatMap((step) => step.nodes)
      .sort((a, b) => {
        // Mantener orden cronológico para revelación progresiva
        if (a.timestamp && b.timestamp) {
          return a.timestamp.getTime() - b.timestamp.getTime();
        }
        return 0;
      });
  }, [steps, currentStep]);

  // Control de revelación progresiva en tiempo real
  React.useEffect(() => {
    const newNodeIds = allAvailableNodes
      .map((node) => node.id)
      .filter((id) => !revealedNodeIds.has(id));

    if (newNodeIds.length > 0) {
      // Agregar nuevos nodos a la cola
      setNodeQueue((prev) => [...prev, ...newNodeIds]);

      // Iniciar proceso de revelación si no está activo
      if (!revealIntervalRef.current && newNodeIds.length > 0) {
        revealIntervalRef.current = setInterval(() => {
          setNodeQueue((currentQueue) => {
            if (currentQueue.length === 0) {
              if (revealIntervalRef.current) {
                clearInterval(revealIntervalRef.current);
                revealIntervalRef.current = null;
              }
              return currentQueue;
            }

            // Revelar siguiente nodo de la cola
            const nextNodeId = currentQueue[0];
            const remainingQueue = currentQueue.slice(1);

            setRevealedNodeIds((prev) => new Set([...prev, nextNodeId]));

            return remainingQueue;
          });
        }, 800); // Revelación cada 0.8 segundos para ritmo natural
      }
    }
  }, [allAvailableNodes, revealedNodeIds]);

  // Limpiar intervalos al desmontar
  React.useEffect(() => {
    return () => {
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current);
      }
    };
  }, []);

  // Reset cuando se reinicia el motor
  React.useEffect(() => {
    if (allAvailableNodes.length === 0) {
      setRevealedNodeIds(new Set());
      setNodeQueue([]);
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = null;
      }
    }
  }, [allAvailableNodes.length]);

  // Nodos visibles basados en revelación progresiva
  const visibleNodes = allAvailableNodes.filter((node) =>
    revealedNodeIds.has(node.id)
  );
  const hasNodes = allAvailableNodes.length > 0;
  const activeNodes = visibleNodes.filter((node) => node.status === "active");
  const pendingReveal = allAvailableNodes.length - visibleNodes.length;

  return (
    <motion.div
      className="bg-dark-background rounded-2xl border border-gray-200/20 flex flex-col h-full max-h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-300 rounded-xl">
            <HeadCircuit className="text-blue-600" size={28} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Motor de pensamiento cognitivo
            </h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!hasNodes ? (
          // Estado vacío
          <motion.div
            className="flex flex-col items-center justify-center h-full p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 bg-ai-primary/10 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-ai-primary rounded-full animate-pulse" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Esperando conversación
            </h4>
            <p className="text-gray-300 text-sm max-w-sm">
              Los pasos de razonamiento aparecerán aquí cuando inicie la
              interacción con el avatar.
            </p>
          </motion.div>
        ) : (
          // Nodos de razonamiento
          <div className="p-4 space-y-3">
            <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
              <span>Progreso:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <motion.div
                  className="bg-blue-100 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span>
                {currentStep + 1}/{steps.length}
              </span>
            </div>

            {visibleNodes.map((node, index) => (
              <ReasoningNode
                key={node.id}
                node={node}
                isCompact={!isExpanded}
                index={index}
              />
            ))}

            {/* Indicador de progreso dinámico */}
            {pendingReveal > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 flex items-center justify-center py-4"
              >
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span>Procesando pensamiento...</span>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {hasNodes && (
        <div className="border-t border-gray-100 p-3 bg-gray-50/50">
          <p className="text-xs text-gray-500 text-center">
            Kira • Agente de Atención al Cliente
          </p>
        </div>
      )}
    </motion.div>
  );
}
