"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface SidebarItemProps {
  href: string;
  children: ReactNode;
}

export function SidebarItem({ href, children }: SidebarItemProps) {
  const pathname = usePathname();
  const active = pathname.includes(href);

  return (
    <Link
      href={href}
      className={`block px-2 py-1 rounded-md transition-colors
          ${
            active
              ? "bg-ai-primary/20 text-white font-semibold"
              : "hover:text-ai-primary hover:bg-ai-primary/10 hover:font-semibold"
          }`}
    >
      {children}
    </Link>
  );
}
