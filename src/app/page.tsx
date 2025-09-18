import CursorGlow from "@/components/CursorGlow";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Home | Kira Avatar Demo",
  description: "Pantalla inicial del demo.",
};

export default function HomePage() {
  return (
    <main className="bg-dark grid min-h-screen place-items-center px-4">
      <CursorGlow />
      <div className="flex flex-col items-center gap-2">
        <Image
          src="/beyond/beyond-dark.png"
          alt="Kognia Systems Logo"
          width={300}
          height={200}
          priority={true}
          className="mx-auto w-auto mb-8"
        />
        <h1 className="font-bold text-3xl font-bebas text-white mb-0">
          IA En Acción
        </h1>
        <p className="text-white text-lg mb-10">De Promesa a Realidad </p>

        <Link
          href="/welcome"
          aria-label="Empezar"
          className="px-10 py-3 rounded-2xl border-2 text-white font-bold text-xl shadow-glow-cyan hover:shadow-glow-accent
                    transition-transform duration-200 hover:scale-105 active:scale-95 hover:bg-beyond-blue"
        >
          Bienvenidos
        </Link>
        <p className="text-[10px] text-ai-muted pt-10">Septiembre 2025</p>
      </div>
    </main>
  );
}
