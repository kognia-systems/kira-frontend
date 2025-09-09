"use client";

import { AvatarCard } from "@/components/AvatarCard";
import { db } from "@/lib/firebase";
import { Agent } from "@/lib/interfaces";
import {
  doc,
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

function runAgent(id: string) {
  const ref = doc(db, "agents-kira", id);
  updateDoc(ref, {
    is_running: true,
  });
}

function stopAgent(id: string) {
  const ref = doc(db, "agents-kira", id);
  updateDoc(ref, {
    is_running: false,
  });
}

export default function KiraPage() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const q = query(collection(db, "agents-kira"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setAgents(snapshot.docs.map((doc) => doc.data() as Agent));
    });
    return () => unsub();
  }, []);

  return (
    <div className="m-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bebas text-ai-primary">
          Agentes Avatar - Kira
        </h1>
        <Link
          href="/config/kira/new"
          aria-label="Crear Agente"
          className="flex gap-2 items-center px-4 py-2 rounded-xl font-medium
                    bg-gradient-to-r from-[#22D3EE] to-[#A78BFA]
                    text-white shadow-glow-cyan hover:shadow-glow-accent
                    transition-transform duration-200 hover:scale-105 active:scale-95
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-ai-primary/60"
        >
          <Plus size={18} />
          Crear Agente
        </Link>
      </div>

      <ul className="grid gap-3">
        {agents.map((agent) => (
          <AvatarCard
            key={agent.id}
            id={agent.id}
            name={agent.name}
            description={agent.description}
            isRunning={agent.is_running}
            onStart={() => runAgent(agent.id)}
            onStop={() => stopAgent(agent.id)}
          />
        ))}
      </ul>
    </div>
  );
}
