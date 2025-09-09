"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { CircleArrowRight, FileCog, Megaphone } from "lucide-react";

import { Channel } from "@/app/api/interfaces/channel";

export default function ChannelConfigPage() {
  const params = useParams(); // { id: "1" }
  const kiraId = params.id;
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "channels"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setChannels(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Channel[]
      );
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-6">
      {/* Heder */}
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-black text-xl font-semibold">Mis canales</h1>
        <Link
          href={`/config/kira/${kiraId}/channel-config/providers`}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition"
        >
          Proveedores
          <CircleArrowRight size={18} />
        </Link>
      </div>

      <hr className="border-ai-muted/20 my-4" />

      {channels.length == 0 && loaded ? (
        <div className="p-8 flex flex-col items-center justify-center h-full">
          <Megaphone size={60} className="m-5"></Megaphone>
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">
              Integraciones de Canales
            </h1>
            <p className="text-slate-500 mb-6">
              Todavía no tienes ningún canal configurado para este agente.
              Agrega uno para conectar tu asistente con usuarios en distintos
              medios.
            </p>
            <div className="flex items-center justify-center">
              <Link
                href={`/config/kira/${kiraId}/channel-config/providers`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ai-primary text-white font-medium hover:bg-ai-primary/80 transition"
              >
                Conectar con Proveedores
                <CircleArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <ul>
          {channels.map((ch) => (
            <li key={ch.name} className="pb-2">
              <div className="rounded-2xl w-full border border-ai-muted h-20 p-4 flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src="/heygen-logo.png"
                    width={40}
                    height={40}
                    alt="HeyGen Logo"
                  />
                  <div>
                    <h2 className="text-black text-xl font-semibold">
                      {ch.name}
                    </h2>
                    <p className="text-gray-500 text-sm">{ch.description}</p>
                  </div>
                </div>
                <Link
                  href={`/config/kira/${kiraId}/channel-config/${ch.provider}/${ch.id}`}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/20 text-green-700 hover:bg-green-500/30 transition"
                >
                  <FileCog size={18} />
                  Configurar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
