"use client";

import React, { forwardRef } from "react";
import { ConnectionQuality } from "@heygen/streaming-avatar";
import { motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

import { useConnectionQuality } from "@/components/logic/useConnectionQuality";
import { useStreamingAvatarSession } from "@/components/logic/useStreamingAvatarSession";
import { StreamingAvatarSessionState } from "@/components/logic";
import { LoadingIcon } from "@/components/Icons";

export const AvatarVideo = forwardRef<HTMLVideoElement>(({}, ref) => {
  const { sessionState } = useStreamingAvatarSession();
  const { connectionQuality } = useConnectionQuality();

  const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;
  const isConnecting = sessionState === StreamingAvatarSessionState.CONNECTING;

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case ConnectionQuality.GOOD:
        return <Wifi className="w-4 h-4 text-green-500" />;
      case ConnectionQuality.BAD:
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionQuality) {
      case ConnectionQuality.GOOD:
        return "Buena Conexión";
      case ConnectionQuality.BAD:
        return "Conexión debil";
      default:
        return "Conectando...";
    }
  };

  return (
    <>
      {/* Capa superior: Indicadores arriba */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Connection Quality Indicator */}
        {connectionQuality !== ConnectionQuality.UNKNOWN && (
          <motion.div
            className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {getConnectionIcon()}
            <span className="text-sm font-medium">{getConnectionText()}</span>
          </motion.div>
        )}
      </motion.div>
      {/* Video + Loading state */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-gray-300 text-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Pantalla del teléfono - Aquí irá el video */}
        <video
          ref={ref}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <track kind="captions" />
        </video>

        {/* Loading State */}
        {!isLoaded && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isConnecting ? (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingIcon className="w-12 h-12 text-gray-600" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Conectando con Kira
                  </h3>
                  <p className="text-white/60 text-sm">
                    Por favor espere mientras se establece conexión...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="text-center p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-24 h-24  flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Listo para conexión
                </h3>
                <p className="text-white">
                  Inicia la llamada para iniciar una sesión
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </>
  );
});

AvatarVideo.displayName = "AvatarVideo";
