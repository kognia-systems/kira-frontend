"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ChannelProvidersPage() {
  const params = useParams();
  const kiraId = params.id;
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-black text-xl font-semibold">
          Selecciona un proveedor de avatar
        </h1>
      </div>

      <hr className="border-ai-muted/20 my-4" />

      {/* Providers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Heygen Provider Card */}
        <div className="rounded-2xl border border-ai-muted/30 bg-white shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
          <div className="flex items-center gap-4">
            <Image
              src="/heygen-logo.png"
              width={40}
              height={40}
              alt="HeyGen Logo"
            />
            <div>
              <h2 className="text-black text-xl font-semibold">HeyGen</h2>
              <p className="text-gray-500 text-sm">Interactive Avatar</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm my-4 flex-grow">
            Crea avatares interactivos personalizados con la plataforma de
            Heygen.
          </p>
          <Link
            href={`/config/kira/${kiraId}/channel-config/providers/heygen`}
            className="mt-auto w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 transition"
          >
            {/* <Gear size={18} weight="fill" /> */}
            Configurar
          </Link>
        </div>
        {/* Akool Provider Card */}
        {/* Tavus */}
        {/* Hedra Provider Card */}
      </div>
    </div>
  );
}
