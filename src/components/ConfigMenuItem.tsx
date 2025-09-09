"use client";

import React from "react";

interface ConfigMenuItemProps {
  label: string;
  active: boolean;
  icon: React.ReactNode;
}

export default function ConfigMenuItem({
  label,
  active,
  icon,
}: ConfigMenuItemProps) {
  return (
    <button
      className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center gap-2 ${
        active
          ? "bg-ai-primary text-slate-900 font-medium"
          : "hover:bg-ai-muted/20 text-slate-600"
      }`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {label}
    </button>
  );
}
