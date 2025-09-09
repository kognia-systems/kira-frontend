import React from "react";
import { useStreamingAvatarContext } from "../logic/context";
import { HeadCircuit } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export const ToolsPanel: React.FC = () => {
  const { toolsMessages } = useStreamingAvatarContext();

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200 flex flex-col h-full max-h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <HeadCircuit className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Razonamiento
            </h3>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-2">
        <div className="h-full overflow-y-auto space-y-4">
          {toolsMessages.map((message) => (
            <div
              key={message.id}
              className="bg-gray-200 border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-dark rounded-full mt-1.5 flex-shrink-0"></div>
                <div className="text-sm text-dark-100">{message.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
