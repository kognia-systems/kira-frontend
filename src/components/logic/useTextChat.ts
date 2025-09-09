import { TaskMode, TaskType } from "@heygen/streaming-avatar";
import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

export const useTextChat = () => {
  const { avatarRef } = useStreamingAvatarContext();

  const repeatMessage = useCallback(
    (message: string) => {
      if (!avatarRef.current) return;

      return avatarRef.current?.speak({
        text: message,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.ASYNC,
      });
    },
    [avatarRef],
  );


  return {
    repeatMessage,
  };
};
