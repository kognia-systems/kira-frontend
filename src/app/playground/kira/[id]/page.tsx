"use client";

import InteractiveAvatarSDK from "@/components/InteractiveAvatarSDK";
import { StreamingAvatarProvider } from "@/components/logic";

export default function AvatarTestPage() {
  return (
    // <div className="w-full h-screen overflow-auto">
    //   <InteractiveAvatar />
    // </div>

    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatarSDK />
    </StreamingAvatarProvider>
  );
}
