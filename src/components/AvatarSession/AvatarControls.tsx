import React from "react";
import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";

import { AudioInput } from "./AudioInput";
import { TextInput } from "./TextInput";
import { SpeechToTextButton } from "./SpeechToTextButton";

export const AvatarControls: React.FC = () => {
  const { interrupt } = useInterrupt();

  return (
    <div className="flex flex-col gap-3 relative w-full items-center max-w-full overflow-hidden">
      <TextInput />
      <SpeechToTextButton />
      <div className="absolute top-[-70px] right-3">
        <Button className="!bg-zinc-700 !text-white" onClick={interrupt}>
          Interrupt
        </Button>
      </div>
    </div>
  );
};
