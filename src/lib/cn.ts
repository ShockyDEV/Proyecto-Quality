import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo colisiones (`cn("px-4", "px-6")` → `"px-6"`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
