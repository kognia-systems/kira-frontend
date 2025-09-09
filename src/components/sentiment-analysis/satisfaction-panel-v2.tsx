"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Minus,
} from "lucide-react";
import { Button } from "@/components/Button";
import { useSatisfactionSystem } from "./use-satisfaction-system";

interface SatisfactionPanelV2Props {
  isOpen: boolean;
  onToggle: () => void;
}

export function SatisfactionPanelV2({
  isOpen,
  onToggle,
}: SatisfactionPanelV2Props) {
  const {
    isAnalyzing,
    result,
    error,
    reanalyze,
    conversationLength,
    hasMessages,
  } = useSatisfactionSystem();

  // Colores según el score
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "#22c55e"; // Verde
    if (score >= 0.4) return "#eab308"; // Amarillo
    return "#ef4444"; // Rojo
  };

  // Score como porcentaje para visualización
  const scorePercentage = result
    ? Math.round(result.sentiment_score * 100)
    : 50;

  // Icono según el label
  const getLabelIcon = () => {
    if (!result) return <Minus className="w-4 h-4 text-gray-400" />;

    switch (result.label) {
      case "positivo":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "negativo":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Color del estado según el label
  const getStatusColor = () => {
    if (!result) return "text-gray-600";

    switch (result.label) {
      case "positivo":
        return "text-green-600";
      case "negativo":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="bg-dark-background rounded-2xl border border-gray-200/20">
      {/* Header del Panel */}

      <div className="flex items-center space-x-3 p-4">
        {/* Contenido del Panel */}
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden border-gray-200"
          >
            <div className="">
              {/* Gauge de Satisfacción */}
              <div className="flex flex-col items-center space-y-4">
                {/* Score Visual */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-8 border-gray-200/10 flex items-center justify-center relative overflow-hidden">
                    {/* Progreso animado */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(${getScoreColor(
                          result?.sentiment_score || 0.5
                        )} ${scorePercentage * 3.6}deg, transparent 0deg)`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                    {/* Centro blanco */}
                    <div className="w-12 h-12 bg-dark-background rounded-full flex flex-col items-center justify-center z-10">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={scorePercentage}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-center"
                        >
                          <div
                            className="text-sm font-bold"
                            style={{
                              color: getScoreColor(
                                result?.sentiment_score || 0.5
                              ),
                            }}
                          >
                            {scorePercentage}
                          </div>
                          <div className="text-xs text-white">de 100</div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 p-3 rounded-lg"
                  >
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </AnimatePresence>

        <div className="text-left flex-grow">
          <h2 className="text-lg font-semibold text-white">
            Satisfacción del Cliente
          </h2>
          <p className="text-sm text-gray-300">
            {hasMessages
              ? `${conversationLength} mensajes analizados`
              : "Análisis en tiempo real"}
          </p>
        </div>

        <div className="flex justify-center">
          <div>
            {/* Label y botón */}
            <div className="flex items-center">
              {getLabelIcon()}
              <span className={`text-xs font-medium text-white ${getStatusColor()}`}>
                {result?.label
                  ? result.label.charAt(0).toUpperCase() + result.label.slice(1)
                  : "Neutral"}
              </span>
            </div>
            {/* Botón de reanálisis */}
            <Button
              onClick={reanalyze}
              disabled={isAnalyzing || !hasMessages}
              className="flex items-center !px-2 mx-auto mt-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
