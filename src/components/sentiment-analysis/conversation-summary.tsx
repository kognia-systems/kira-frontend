

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Award,
  Activity
} from "lucide-react";
import { ConversationSummary } from "./types";

interface ConversationSummaryProps {
  summary: ConversationSummary;
  isVisible: boolean;
  onClose?: () => void;
}

export function ConversationSummaryComponent({ 
  summary, 
  isVisible, 
  onClose 
}: ConversationSummaryProps) {

  const getResolutionStatus = () => {
    switch (summary.resolutionStatus) {
      case 'resolved':
        return {
          label: 'Resuelto',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'escalated':
        return {
          label: 'Escalado',
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          label: 'Pendiente',
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
    }
  };

  const getSatisfactionLevel = (score: number) => {
    if (score >= 80) return { label: 'Excelente', color: 'text-green-600' };
    if (score >= 60) return { label: 'Buena', color: 'text-blue-600' };
    if (score >= 40) return { label: 'Regular', color: 'text-orange-600' };
    return { label: 'Baja', color: 'text-red-600' };
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resolutionInfo = getResolutionStatus();
  const satisfactionInfo = getSatisfactionLevel(summary.finalSatisfaction);
  const ResolutionIcon = resolutionInfo.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Resumen de Conversación
                      </h2>
                      <p className="text-sm text-gray-500">
                        Análisis completo de la interacción
                      </p>
                    </div>
                  </div>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <span className="sr-only">Cerrar</span>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* KPI Principal */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-3">
                    <Award className={`w-8 h-8 ${satisfactionInfo.color}`} />
                    <span className={`text-4xl font-bold ${satisfactionInfo.color}`}>
                      {Math.round(summary.finalSatisfaction)}
                    </span>
                    <span className="text-lg text-gray-500">/100</span>
                  </div>
                  <div>
                    <span className={`text-lg font-medium ${satisfactionInfo.color}`}>
                      Satisfacción {satisfactionInfo.label}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Emoción dominante: <span className="font-medium capitalize">{summary.dominantEmotion}</span>
                    </p>
                  </div>
                </div>

                {/* Información del Cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Información del Cliente</span>
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nombre</label>
                        <p className="text-sm text-gray-900">{summary.customerName || 'No identificado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Motivo de Contacto</label>
                        <p className="text-sm text-gray-900">{summary.contactReason || 'Consulta general'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Duración</label>
                        <p className="text-sm text-gray-900">{formatDuration(summary.conversationDuration)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>Estado de Resolución</span>
                    </h3>
                    <div className={`${resolutionInfo.bgColor} ${resolutionInfo.borderColor} border rounded-lg p-4`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <ResolutionIcon className={`w-6 h-6 ${resolutionInfo.color}`} />
                        <span className={`font-semibold ${resolutionInfo.color}`}>
                          {resolutionInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {summary.resolutionStatus === 'resolved' 
                          ? 'La consulta fue resuelta satisfactoriamente.'
                          : summary.resolutionStatus === 'escalated'
                          ? 'La consulta requiere escalamiento para resolución.'
                          : 'La consulta está pendiente de resolución.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones Ejecutadas */}
                {summary.executedActions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Acciones Ejecutadas</span>
                    </h3>
                    <div className="space-y-2">
                      {summary.executedActions.map((action, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span className="text-sm text-gray-700">{action}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights Clave */}
                {summary.keyInsights.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Insights Clave</span>
                    </h3>
                    <div className="space-y-2">
                      {summary.keyInsights.map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <p className="text-sm text-blue-800">{insight}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Generado el {new Date().toLocaleString()}
                  </p>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Cerrar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

