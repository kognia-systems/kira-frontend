"use client";

import Link from "next/link";
import { KogniaLogo } from "./Icons";


export default function NavBar() {
  return (
    <div className="flex justify-between items-center max-w-6xl mx-auto px-6 py-4">
      <div className="flex items-center gap-4">
        <Link href="https://kognia.io/" target="_blank">
          <KogniaLogo />
        </Link>
      </div>
      <div className="flex items-center gap-6"></div>
    </div>
  );
}
