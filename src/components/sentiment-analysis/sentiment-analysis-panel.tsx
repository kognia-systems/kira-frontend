

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, ChevronDown } from "lucide-react";
import { SatisfactionGauge } from "./satisfaction-gauge";
import { SentimentState } from "./types";

interface SentimentAnalysisPanelProps {
  state: SentimentState;
  isOpen: boolean;
  onToggle: () => void;
  isAnalyzing?: boolean;
  onReanalyze?: () => void;
}

export function SentimentAnalysisPanel({ 
  state, 
  isOpen, 
  onToggle,
  isAnalyzing = false,
  onReanalyze
}: SentimentAnalysisPanelProps) {

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header del Panel */}
        <button
          onClick={onToggle}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900">
                Analytics de CX
              </h2>
              <p className="text-sm text-gray-500">
                {state.isActive ? 'Análisis de experiencia del cliente' : 'Análisis de satisfacción del cliente'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Indicador de actividad */}
            <AnimatePresence>
              {state.isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-1"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600 font-medium">Activo</span>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Icono de expansión */}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </button>

        {/* Contenido del Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden border-t border-gray-200"
            >
              <div className="p-6">
                {/* Gauge de Satisfacción Mejorado */}
                <SatisfactionGauge 
                  metrics={state.satisfactionMetrics}
                  isActive={state.isActive}
                  onReanalyze={onReanalyze}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

