"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, X } from "lucide-react";
import { Button } from "@/components/Button";

interface ReasoningButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  hasActivity?: boolean;
}

export function ReasoningButton({
  isOpen,
  onToggle,
  hasActivity = false,
}: ReasoningButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Button
        onClick={onToggle}
        className={`
          relative bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white/95 
          rounded-xl p-2 transition-all duration-200 border border-gray-200/50
          ${isOpen ? "bg-blue-50/90 text-blue-700 border-blue-200" : ""}
        `}
        aria-label={isOpen ? "Ocultar razonamiento" : "Mostrar razonamiento"}
        title={isOpen ? "Ocultar razonamiento" : "Mostrar razonamiento"}
      >
        {/* Icono con transición */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
        </motion.div>

        {/* Indicador de actividad */}
        {hasActivity && !isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </Button>
    </motion.div>
  );
}
