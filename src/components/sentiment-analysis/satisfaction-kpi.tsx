

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CustomerSatisfactionMetrics } from "./types";

interface SatisfactionKPIProps {
  metrics: CustomerSatisfactionMetrics;
  isActive: boolean;
}

export function SatisfactionKPI({ metrics, isActive }: SatisfactionKPIProps) {
  const { currentScore, trend, peakScore, lowestScore } = metrics;
  
  // Log para debugging - ver qué está recibiendo el componente
  console.log('[SatisfactionKPI] 📊 Componente renderizado con:', {
    metrics,
    isActive,
    currentScore: Math.round(currentScore),
    trend,
    peakScore: Math.round(peakScore),
    lowestScore: Math.round(lowestScore)
  });

  // Determinar color basado en la puntuación
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-yellow-500 to-yellow-600";
    if (score >= 40) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'increasing': return "text-green-600";
      case 'decreasing': return "text-red-600";
      default: return "text-gray-500";
    }
  };

  const getTrendText = () => {
    switch (trend) {
      case 'increasing': return "En mejora";
      case 'decreasing': return "Descendiendo";
      default: return "Estable";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      {/* Header del KPI */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Satisfacción del Cliente
        </h3>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {getTrendText()}
          </span>
        </div>
      </div>

      {/* KPI Principal - Barra de Satisfacción */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentScore}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`text-4xl font-bold ${getScoreColor(currentScore)}`}
              >
                {Math.round(currentScore)}
              </motion.span>
            </AnimatePresence>
            <span className="text-lg text-gray-500 ml-1">/100</span>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Máximo: {Math.round(peakScore)}</div>
            <div>Mínimo: {Math.round(lowestScore)}</div>
          </div>
        </div>

        {/* Barra de Progreso Animada */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getBarColor(currentScore)} rounded-full relative`}
              initial={{ width: 0 }}
              animate={{ width: `${currentScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Efecto de brillo */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ 
                  duration: 2, 
                  ease: "easeInOut",
                  repeat: isActive ? Infinity : 0,
                  repeatDelay: 3
                }}
                style={{ width: '50%' }}
              />
            </motion.div>
          </div>
          
          {/* Indicador de posición */}
          <motion.div
            className="absolute top-0 w-1 h-4 bg-gray-800 rounded-full"
            initial={{ left: "50%" }}
            animate={{ left: `${currentScore}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transform: 'translateX(-50%)' }}
          />
        </div>

        {/* Etiquetas de la escala */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>Insatisfecho</span>
          <span>Neutral</span>
          <span>Muy Satisfecho</span>
        </div>
      </div>

      {/* Indicador de Estado */}
      <div className="flex items-center justify-center pt-2 border-t border-gray-100">
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">
                Analizando en tiempo real
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-sm text-gray-500">
                En espera de conversación
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

