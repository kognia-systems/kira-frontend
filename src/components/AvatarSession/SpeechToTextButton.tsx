import React from "react";
import { Button } from "../Button";
import { useSpeechToText } from "../logic/useSpeechToText";

export const SpeechToTextButton: React.FC = () => {
  const { 
    isListening, 
    isSpeaking, 
    transcript, 
    isSupported, 
    startListening, 
    stopListening 
  } = useSpeechToText();

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 text-center p-4">
        Speech recognition not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-zinc-800 rounded-xl border border-zinc-700 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        <h3 className="text-sm font-medium text-zinc-200">
          Auto Voice Recognition
        </h3>
      </div>

      {/* Botón principal */}
      <div className="relative">
        <Button
          className={`!p-4 relative transition-all duration-200 ${
            isListening 
              ? '!bg-red-600 hover:!bg-red-700 animate-pulse' 
              : '!bg-green-600 hover:!bg-green-700'
          }`}
          onClick={isListening ? stopListening : startListening}
        >
          {/* Indicador de habla activa */}
          {isSpeaking && (
            <div className="absolute inset-0 rounded-lg border-2 border-yellow-400 animate-ping" />
          )}
          
          {/* Texto del botón */}
          <span className="text-white font-medium">
            {isListening ? '🔴 Stop Auto Voice' : '🎤 Start Auto Voice'}
          </span>
        </Button>
      </div>

      {/* Estado actual */}
      <div className="text-center space-y-2">
        {!isListening ? (
          <div className="text-xs text-gray-400">
            Click to start automatic voice detection
          </div>
        ) : (
          <div className="space-y-1">
            <div className={`text-xs font-medium ${
              isSpeaking ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {isSpeaking ? '🗣️ Speaking detected...' : '👂 Listening for speech...'}
            </div>
          </div>
        )}
      </div>

      {/* Transcripción en tiempo real */}
      {transcript && (
        <div className="w-full">
          <div className="text-xs text-gray-400 mb-1">Current speech:</div>
          <div className="text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 max-h-20 overflow-y-auto">
            {transcript}
          </div>
        </div>
      )}
      
      {/* Instrucciones */}
      {isListening && (
        <div className="text-xs text-gray-500 text-center">
          Speak naturally - your words will be automatically detected and sent
        </div>
      )}
    </div>
  );
};
