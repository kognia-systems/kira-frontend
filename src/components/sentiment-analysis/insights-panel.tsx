

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, Zap, Heart, Brain } from "lucide-react";
import { EmotionAnalysis, SentimentInsight, SentimentScore } from "./types";

interface InsightsPanelProps {
  currentSentiment: SentimentScore;
  detectedEmotions: EmotionAnalysis[];
  recentInsights: SentimentInsight[];
  isActive: boolean;
}

export function InsightsPanel({ 
  currentSentiment, 
  detectedEmotions, 
  recentInsights, 
  isActive 
}: InsightsPanelProps) {

  const getSentimentDisplay = (sentiment: SentimentScore) => {
    if (sentiment.compound > 0.2) {
      return { 
        label: "Positivo", 
        color: "text-green-600", 
        bgColor: "bg-green-50", 
        icon: CheckCircle 
      };
    } else if (sentiment.compound < -0.2) {
      return { 
        label: "Negativo", 
        color: "text-red-600", 
        bgColor: "bg-red-50", 
        icon: AlertCircle 
      };
    } else {
      return { 
        label: "Neutral", 
        color: "text-blue-600", 
        bgColor: "bg-blue-50", 
        icon: Info 
      };
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'frustración':
      case 'preocupación':
        return AlertCircle;
      case 'satisfacción':
      case 'confianza':
        return Heart;
      case 'urgencia':
        return Zap;
      default:
        return Brain;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'frustración':
        return "text-red-500 bg-red-50";
      case 'satisfacción':
        return "text-green-500 bg-green-50";
      case 'confianza':
        return "text-blue-500 bg-blue-50";
      case 'preocupación':
        return "text-orange-500 bg-orange-50";
      case 'urgencia':
        return "text-yellow-500 bg-yellow-50";
      case 'calma':
        return "text-teal-500 bg-teal-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return CheckCircle;
      case 'negative': return AlertCircle;
      case 'alert': return Zap;
      default: return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return "text-green-600";
      case 'negative': return "text-red-600";
      case 'alert': return "text-orange-600";
      default: return "text-blue-600";
    }
  };

  const sentimentDisplay = getSentimentDisplay(currentSentiment);
  const SentimentIcon = sentimentDisplay.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Análisis de Emociones
        </h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${sentimentDisplay.bgColor}`}>
          <SentimentIcon className={`w-4 h-4 ${sentimentDisplay.color}`} />
          <span className={`text-sm font-medium ${sentimentDisplay.color}`}>
            {sentimentDisplay.label}
          </span>
        </div>
      </div>

      {/* Sentimiento Actual */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Estado Emocional</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Positivo</div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentSentiment.positive * 100}%` }}
              className="bg-green-200 h-2 rounded-full mx-auto"
              style={{ maxWidth: '100%' }}
            >
              <motion.div 
                className="bg-green-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </motion.div>
            <div className="text-xs font-medium text-green-600">
              {Math.round(currentSentiment.positive * 100)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Neutral</div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentSentiment.neutral * 100}%` }}
              className="bg-blue-200 h-2 rounded-full mx-auto"
              style={{ maxWidth: '100%' }}
            >
              <motion.div 
                className="bg-blue-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </motion.div>
            <div className="text-xs font-medium text-blue-600">
              {Math.round(currentSentiment.neutral * 100)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Negativo</div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentSentiment.negative * 100}%` }}
              className="bg-red-200 h-2 rounded-full mx-auto"
              style={{ maxWidth: '100%' }}
            >
              <motion.div 
                className="bg-red-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </motion.div>
            <div className="text-xs font-medium text-red-600">
              {Math.round(currentSentiment.negative * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Emociones Detectadas */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Emociones Detectadas</h4>
        <AnimatePresence mode="popLayout">
          {detectedEmotions.length > 0 ? (
            <div className="space-y-2">
              {detectedEmotions.map((emotion, index) => {
                const EmotionIcon = getEmotionIcon(emotion.emotion);
                const colorClass = getEmotionColor(emotion.emotion);
                
                return (
                  <motion.div
                    key={`${emotion.emotion}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${colorClass.split(' ')[1]}`}
                  >
                    <div className="flex items-center space-x-2">
                      <EmotionIcon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
                      <span className={`font-medium capitalize ${colorClass.split(' ')[0]}`}>
                        {emotion.emotion}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-white rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`h-full ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${emotion.intensity}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${colorClass.split(' ')[0]}`}>
                        {Math.round(emotion.intensity)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4 text-gray-500 text-sm"
            >
              {isActive ? 'Analizando emociones...' : 'Sin emociones detectadas'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Insights Recientes */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Insights Recientes</h4>
        <AnimatePresence mode="popLayout">
          {recentInsights.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentInsights.map((insight) => {
                const InsightIcon = getInsightIcon(insight.type);
                const colorClass = getInsightColor(insight.type);
                
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50"
                  >
                    <InsightIcon className={`w-4 h-4 mt-0.5 ${colorClass}`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{insight.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {insight.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4 text-gray-500 text-sm"
            >
              {isActive ? 'Generando insights...' : 'Sin insights disponibles'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

