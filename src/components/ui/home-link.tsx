import Link from "next/link";
import { BASE_PATH, withBase } from "@/lib/base-path";

type Props = {
  href: string;
  className?: string;
  "aria-label"?: string;
  children: React.ReactNode;
};

/**
 * Enlace a una portada. En la subcarpeta de GitHub Pages (sin dominio propio)
 * la portada en español va con un <a> normal: <Link> pediría su contenido en
 * /QUALITY-WEB/index.txt; con <a> la portada se carga siempre entera,
 * sin riesgo de 404. Con dominio propio o en desarrollo es un <Link> de siempre.
 */
export function HomeLink({ href, children, ...rest }: Props) {
  if (BASE_PATH && href === "/") {
    return (
      <a href={withBase("/")} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
