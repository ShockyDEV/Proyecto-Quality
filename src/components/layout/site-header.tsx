"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV, UI } from "@/content/ui";
import { withBase } from "@/lib/base-path";
import { HomeLink } from "@/components/ui/home-link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { href, LOCALES, LOCALE_LABELS, pick, stripLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

/**
 * Cabecera fija y clara, como la de la web del IUCE: filete superior (aquí
 * con los tres colores del logo), logo, menú con la sección activa subrayada
 * en teja, idioma y tema.
 *
 * El conmutador de idioma usa <a> nativo a propósito: fuerza una navegación
 * completa y evita que el router de Next reutilice el árbol del otro idioma
 * (lección aprendida en iuce-web).
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = stripLocale(usePathname() || "/");
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (path: string) => pathname === `${path}/` || pathname.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-50">
      <a
        href="#contenido"
        className="sr-only-focusable absolute left-4 top-3 z-[60] rounded-md bg-petroleo px-4 py-2 text-sm font-semibold text-sobre-petroleo"
      >
        {pick(UI.skip, locale)}
      </a>

      {/* Filete con los tres colores de las figuras del logo */}
      <div className="flex h-[3px]" aria-hidden>
        <span className="flex-1 bg-verde" />
        <span className="flex-1 bg-petroleo" />
        <span className="flex-1 bg-teja" />
      </div>

      <div className="border-b border-linea bg-superficie/95 backdrop-blur supports-[backdrop-filter]:bg-superficie/85">
        <div className="contenedor flex h-[var(--header-h)] items-center justify-between gap-6">
          <HomeLink href={href(locale, "/")} className="flex shrink-0 items-center" aria-label={`QUALITY, ${pick(UI.home, locale).toLowerCase()}`}>
            <Image src="/brand/quality-logo.png" alt="" width={495} height={200} priority className="h-10 w-auto dark:hidden" />
            <Image src="/brand/quality-logo-claro.png" alt="" width={495} height={200} priority className="hidden h-10 w-auto dark:block" />
          </HomeLink>

          <nav aria-label={pick(UI.mainNav, locale)} className="hidden h-full md:block">
            <ul className="flex h-full items-center gap-7">
              {NAV.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path} className="h-full">
                    <Link
                      href={href(locale, item.path)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-full items-center border-b-2 pt-0.5 text-[0.94rem] font-medium transition-colors",
                        active ? "border-teja text-tinta" : "border-transparent text-cuerpo hover:text-tinta",
                      )}
                    >
                      {pick(item.label, locale)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <LanguageSwitch locale={locale} pathname={pathname} />
            <ThemeToggle labels={{ dark: pick(UI.themeDark, locale), light: pick(UI.themeLight, locale) }} />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-tinta transition-colors hover:bg-tintado md:hidden"
              aria-expanded={open}
              aria-controls="menu-movil"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
              <span className="sr-only">{open ? pick(UI.close, locale) : pick(UI.menu, locale)}</span>
            </button>
          </div>
        </div>

        {/* Menú móvil: se despliega bajo la barra */}
        <nav id="menu-movil" hidden={!open} aria-label={pick(UI.mainNav, locale)} className="border-t border-linea md:hidden">
          <ul className="contenedor divide-y divide-linea py-2">
            {NAV.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    href={href(locale, item.path)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 py-3.5 font-display text-lg font-semibold",
                      active ? "text-tinta" : "text-cuerpo",
                    )}
                  >
                    <span className={cn("h-5 w-[3px] rounded-sm", active ? "bg-teja" : "bg-transparent")} aria-hidden />
                    {pick(item.label, locale)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function LanguageSwitch({ locale, pathname }: { locale: Locale; pathname: string }) {
  return (
    <div className="mr-1 flex items-center text-[0.8rem] font-semibold" role="group" aria-label={pick(UI.language, locale)}>
      {LOCALES.map((l, i) => {
        const current = l === locale;
        return (
          <span key={l} className="flex items-center">
            {i > 0 && (
              <span className="px-0.5 text-linea" aria-hidden>
                /
              </span>
            )}
            {current ? (
              <span
                className="relative px-1.5 py-1 text-tinta after:absolute after:inset-x-1.5 after:bottom-0 after:h-0.5 after:bg-teja"
                aria-current="true"
                lang={LOCALE_LABELS[l].htmlLang}
                title={LOCALE_LABELS[l].long}
              >
                {LOCALE_LABELS[l].short}
              </span>
            ) : (
              <a
                href={withBase(href(l, pathname))}
                hrefLang={LOCALE_LABELS[l].htmlLang}
                lang={LOCALE_LABELS[l].htmlLang}
                title={LOCALE_LABELS[l].long}
                className="rounded-sm px-1.5 py-1 text-tenue transition-colors hover:text-tinta"
              >
                {LOCALE_LABELS[l].short}
              </a>
            )}
          </span>
        );
      })}
    </div>
  );
}
