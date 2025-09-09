"use client";

import { SidebarItem } from "@/components/SidebarItem";
import Image from "next/image";

export default function ConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-screen grid grid-cols-[250px_1fr] overflow-hidden">
      {/* Sidebar */}
      <aside className="bg-ai-surface border-r border-ai-muted/20 p-4 overflow-y-auto">
        <nav className="flex flex-col gap-4">
          <Image
            src="/kognia-logo-hor-dark.png"
            width={180}
            height={40}
            alt="HeyGen Logo"
          />
          <h2 className="text-xl font-semibold text-ai-primary">
            Alan Customer Experience
          </h2>
          <ul className="flex flex-col gap-2 text-slate-300">
            <li>
              <SidebarItem href="/config/kira">
                KIRA - Interactive Avatar
              </SidebarItem>
            </li>
            <li>
              <SidebarItem href="/config/voxi">
                VOXI - Voice AI Agent
              </SidebarItem>
            </li>
            <li>
              <SidebarItem href="/config/charly">
                CHARLY - AI Chat Agent
              </SidebarItem>
            </li>
            <li>
              <SidebarItem href="/config/credentials">Credenciales</SidebarItem>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Vista principal */}
      <section className="bg-white overflow-y-auto h-full">{children}</section>
    </main>
  );
}
