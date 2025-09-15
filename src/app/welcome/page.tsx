"use client";

import { StreamingAvatarProvider } from "@/components/logic";
import WelcomeAvatar from "@/components/WelcomeAvatar";
import { AppSidebar } from "@/components/app-sidebar";
import Image from "next/image";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function WelcomePage() {
  return (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <Image
            src="/beyond/beyond-dark.png"
            alt="Kognia Systems Logo"
            width={100}
            height={100}
            priority={true}
            className="w-auto p-4"
          />
          <SidebarTrigger className="-mr-1 ml-auto rotate-180" />
        </header>
        <StreamingAvatarProvider
          basePath={process.env.NEXT_PUBLIC_BASE_API_URL}
        >
          <WelcomeAvatar />
        </StreamingAvatarProvider>
      </SidebarInset>
      <AppSidebar side="right" variant="floating"/>
    </SidebarProvider>
  );
}
