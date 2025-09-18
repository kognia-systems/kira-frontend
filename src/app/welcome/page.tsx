"use client";

import { StreamingAvatarProvider } from "@/components/logic";
import WelcomeAvatar from "@/components/WelcomeAvatar";

export default function WelcomePage() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <WelcomeAvatar />
    </StreamingAvatarProvider>
  );
}
