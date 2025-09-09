import React, { useEffect, useRef } from "react";

import { useMessageHistory, MessageSender } from "../logic";
import { AnimatePresence, motion } from "framer-motion";
import { Chats, Robot, UserCircle } from "phosphor-react";
import { TextInput } from "./TextInput";

export const MessageHistory: React.FC = () => {
  const { messages } = useMessageHistory();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // if (messages.length === 0) {
  //   return null;
  // }

  return (
    <motion.div
      className="bg-dark-background rounded-2xl border border-gray-100/20 flex flex-col h-full max-h-full shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-100/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-300 rounded-xl">
            <Chats className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Historial de conversación
            </h3>
          </div>
        </div>
      </div>

      {/* Chat content bubbles - Toma toda la altura disponible */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full overflow-y-auto space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`flex gap-3 ${
                  message.sender === MessageSender.CLIENT
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.sender === MessageSender.CLIENT
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  {/* Avatar Bubble */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === MessageSender.CLIENT
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {message.sender === MessageSender.CLIENT ? (
                      <UserCircle className="w-4 h-4" />
                    ) : (
                      <Robot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <motion.div
                    className={`px-4 py-3 rounded-2xl ${
                      message.sender === MessageSender.CLIENT
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.1 }}
                  >
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Text input - Solo se muestra cuando no hay mensajes
      {messages.length > 0 && (
        <motion.div
          className="m-4 pt-4 border-t border-gray-100 flex-shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <TextInput />
        </motion.div>
      )} */}
    </motion.div>
  );
};
