"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_KEY } from "@/lib/reveal-boot";

/**
 * Conmutador claro/oscuro. El tema inicial lo pone THEME_BOOT en <head>
 * antes de pintar; aquí solo se lee la clase y se guarda la elección.
 */
export function ThemeToggle({ labels }: { labels: { dark: string; light: string } }) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "oscuro" : "claro");
    } catch {
      // Sin almacenamiento (modo privado): vale para esta visita
    }
    setDark(next);
  };

  const label = dark ? labels.light : labels.dark;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-tenue transition-colors hover:bg-tintado hover:text-tinta"
    >
      {/* Antes de hidratar se ve la luna, sin saltos de tamaño */}
      {dark ? <Sun className="h-[18px] w-[18px]" aria-hidden /> : <Moon className="h-[18px] w-[18px]" aria-hidden />}
    </button>
  );
}
