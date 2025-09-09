"use client";

import { Play, Square, Cog, FlaskConical } from "lucide-react";
import Link from "next/link";

interface AvatarCardProps {
  id: string;
  name: string;
  description: string;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function AvatarCard({
  id,
  name,
  description,
  isRunning,
  onStart,
  onStop,
}: AvatarCardProps) {
  return (
    <li className="rounded-xl border border-ai-muted/20 p-4 flex flex-col gap-3">
      <div>
        <h3 className="font-semibold text-ai-primary">{name}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <div className="flex gap-2">
        {isRunning ? (
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
            onClick={onStop}
          >
            <Square size={18} /> Stop
          </button>
        ) : (
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-ai-primary/20 text-ai-primary hover:bg-ai-primary/30 transition"
            onClick={onStart}
          >
            <Play size={18} /> Run
          </button>
        )}

        <Link
          href={`/config/kira/${id}`}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-ai-accent/20 text-ai-accent hover:bg-ai-accent/30 transition"
        >
          <Cog size={18} /> Ajustes
        </Link>
        <Link
          href={`/playground/kira/${id}`}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600/20 text-blue-500 hover:bg-blue-500/30 transition"
        >
          <FlaskConical size={18} /> Playground
        </Link>
      </div>
    </li>
  );
}
