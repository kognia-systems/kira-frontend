import { useStreamingAvatarContext } from "./context";

export const useMessageHistory = () => {
  const { messages } = useStreamingAvatarContext();
  
  // Solo devolver mensajes regulares (CLIENT y AVATAR), no incluir TOOLS
  // Los mensajes de TOOLS se mostrarán únicamente en la sección de "Razonamiento"
  return { messages };
};
