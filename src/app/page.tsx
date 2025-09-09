import CursorGlow from "@/components/CursorGlow";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Home | Kira Avatar Demo",
  description: "Pantalla inicial del demo.",
};

export default function HomePage() {
  return (
    <main className="bg-gradient-to-bl from-black to-ai-surface grid min-h-screen place-items-center px-4">
      <CursorGlow />
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-bold text-6xl font-bebas text-white mb-0">KIRA</h1>
        <p className="text-white text-2xl">Interactive Avatar</p>
        <p className="text-ai-muted font-roboto">Showcase</p>

        <Link
          href="/config/kira"
          aria-label="Empezar"
          className="px-10 py-4 rounded-2xl
          bg-gradient-to-r from-ai-primary to-ai-accent
                   text-ai-surface font-bold shadow-glow-cyan hover:shadow-glow-accent
                   transition-transform duration-200 hover:scale-105 active:scale-95
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-ai-primary/60"
        >
          Empezar
        </Link>
        <p className="text-[10px] text-ai-muted pt-10">Powered By</p>
        <Image
          src="/kognia-logo-hor-dark.png"
          alt="Kognia Systems Logo"
          width={200}
          height={200}
          className="mx-auto"
        ></Image>
      </div>
    </main>
  );
}
