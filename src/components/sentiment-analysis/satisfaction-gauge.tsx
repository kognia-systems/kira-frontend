
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertTriangle, CheckCircle, Minus } from "lucide-react";
import { CustomerSatisfactionMetrics } from "./types";
import { Button } from "@/components/ui/button";

interface SatisfactionGaugeProps {
  metrics: CustomerSatisfactionMetrics;
  isActive: boolean;
  onReanalyze?: () => void;
  isAnalyzing?: boolean;
}

export function SatisfactionGauge({ 
  metrics, 
  isActive, 
  onReanalyze,
  isAnalyzing = false 
}: SatisfactionGaugeProps) {
  const { currentScore, trend, currentInsight, urgency, lastAnalysis } = metrics;

  // Colores basados en la puntuación
  const getGaugeColor = (score: number) => {
    if (score >= 80) return "#22c55e"; // Verde
    if (score >= 60) return "#eab308"; // Amarillo
    if (score >= 40) return "#f97316"; // Naranja
    return "#ef4444"; // Rojo
  };

  const getUrgencyColor = (urgencyLevel?: string) => {
    switch (urgencyLevel) {
      case 'high': return "text-red-600 bg-red-50";
      case 'medium': return "text-yellow-600 bg-yellow-50";
      case 'low': return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'decreasing':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  // Cálculo para el arco del gauge (semicírculo)
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * Math.PI; // Solo medio círculo
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Header con botón reanalizar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Satisfacción del Cliente
        </h3>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          {onReanalyze && (
            <Button
              onClick={onReanalyze}
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span className="text-sm">
                {isAnalyzing ? 'Analizando...' : 'Reanalizar'}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Gauge Semicircular */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <svg
            className="transform -rotate-90"
            width={radius * 2}
            height={radius + 20}
          >
            {/* Círculo base (gris) */}
            <path
              d={`M ${strokeWidth/2},${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - strokeWidth/2},${radius}`}
              fill="transparent"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Círculo de progreso animado */}
            <motion.path
              d={`M ${strokeWidth/2},${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - strokeWidth/2},${radius}`}
              fill="transparent"
              stroke={getGaugeColor(currentScore)}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            
            {/* Efecto de brillo */}
            <motion.path
              d={`M ${strokeWidth/2},${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - strokeWidth/2},${radius}`}
              fill="transparent"
              stroke="url(#gradient)"
              strokeWidth={strokeWidth / 2}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              opacity={0.6}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            />

            {/* Gradiente para el efecto de brillo */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.8" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Score en el centro */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScore}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl font-bold" style={{ color: getGaugeColor(currentScore) }}>
                  {Math.round(currentScore)}
                </div>
                <div className="text-sm text-gray-500">de 100</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Labels del gauge */}
        <div className="flex justify-between w-full max-w-[160px] text-xs text-gray-400">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Insight Contextual */}
      <AnimatePresence mode="wait">
        {currentInsight && (
          <motion.div
            key={currentInsight}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-lg text-sm font-medium ${getUrgencyColor(urgency)}`}
          >
            {currentInsight}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estado y timestamp */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">
                Análisis activo
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-sm text-gray-500">
                Esperando conversación
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {lastAnalysis && (
          <span className="text-xs text-gray-400">
            {lastAnalysis.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
