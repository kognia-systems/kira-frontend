import type { Metadata } from "next";
import { Bebas_Neue, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/Toaster";

// Importamos las fuentes
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400", // Bebas Neue solo tiene weight normal
  variable: "--font-bebas",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Kira Avatar Demo",
  description: "Demo con avatar interactivo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`dark ${robotoCondensed.variable} ${bebasNeue.variable}`}
    >
      <body className="font-roboto font-r antialiased overflow-hidden">
        {children}
        <Toaster></Toaster>
      </body>
    </html>
  );
}
