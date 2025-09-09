"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

import ConfigMenuItem from "@/components/ConfigMenuItem";
import { Workflow, Megaphone, Unplug, SlidersHorizontal, Cog } from "lucide-react";

const menuItems = [
  { key: "sources-config", label: "Fuentes", icon: <Unplug /> },
  { key: "agent-config", label: "Lógica del agente", icon: <Cog /> },
  { key: "chat-config", label: "Lineamientos", icon: <SlidersHorizontal /> },
  { key: "channel-config", label: "Canales", icon: <Megaphone /> },
];

export default function AvatarConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const kiraId = params.id;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] h-screen">
      {/* Sidebar interno */}
      <aside className="bg-white border border-ai-muted/20 p-4 flex flex-col rounded-xl m-2">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">
          Configuración del Agente
        </h2>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.key}>
              <Link href={`/config/kira/${kiraId}/${item.key}`}>
                <ConfigMenuItem
                  label={item.label}
                  icon={item.icon}
                  active={pathname.includes(item.key)}
                />
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      {/* Vista dinámica */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
