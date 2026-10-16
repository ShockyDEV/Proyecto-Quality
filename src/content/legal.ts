import type { L10n } from "@/lib/i18n";
import { SITE } from "@/content/site";

/**
 * Textos legales: PROPUESTA de trabajo (adaptada de la web de ieTIC 2027),
 * pendiente de revisión por las investigadoras principales y, si procede,
 * por los servicios jurídicos de la USAL. El correo de contacto aparece
 * cuando se rellene SITE.email.
 */
export interface LegalDoc {
  title: L10n;
  intro: L10n;
  sections: { heading: L10n; body: L10n<string[]> }[];
}

const contacto: L10n<string[]> = SITE.email
  ? {
      es: [`Para cualquier consulta sobre la web, escribe a ${SITE.email}.`],
      en: [`For any questions about this website, write to ${SITE.email}.`],
    }
  : { es: [], en: [] };

export const AVISO_LEGAL: LegalDoc = {
  title: { es: "Aviso legal", en: "Legal notice" },
  intro: {
    es: "Información general sobre la titularidad y las condiciones de uso de la web del proyecto QUALITY.",
    en: "General information on the ownership and terms of use of the QUALITY project website.",
  },
  sections: [
    {
      heading: { es: "Titular", en: "Owner" },
      body: {
        es: [
          `Proyecto QUALITY (${SITE.reference}), con sus investigadoras principales en la Universidad de Salamanca. Patio de Escuelas, 1, 37008 Salamanca.`,
          ...contacto.es,
        ],
        en: [
          `QUALITY project (${SITE.reference}), whose principal investigators are based at the University of Salamanca. Patio de Escuelas, 1, 37008 Salamanca, Spain.`,
          ...contacto.en,
        ],
      },
    },
    {
      heading: { es: "Objeto", en: "Purpose" },
      body: {
        es: [
          "Esta web informa sobre el proyecto de investigación QUALITY: sus objetivos, su enfoque, el equipo que lo desarrolla y sus resultados.",
        ],
        en: [
          "This website provides information about the QUALITY research project: its aims, its approach, the team carrying it out and its results.",
        ],
      },
    },
    {
      heading: { es: "Propiedad intelectual", en: "Intellectual property" },
      body: {
        es: [
          "Los logotipos de las instituciones, grupos y organismos financiadores son marcas de sus titulares. El logotipo de QUALITY pertenece al proyecto.",
          "Los textos de esta web pueden citarse indicando la fuente.",
        ],
        en: [
          "The logos of the institutions, groups and funding bodies are trademarks of their respective owners. The QUALITY logo belongs to the project.",
          "The texts on this website may be quoted provided the source is acknowledged.",
        ],
      },
    },
    {
      heading: { es: "Enlaces externos", en: "External links" },
      body: {
        es: [
          "La web enlaza a sitios de terceros (perfiles del equipo, webs de proyectos anteriores e instituciones). El proyecto no se hace responsable de sus contenidos.",
        ],
        en: [
          "This website links to third-party sites (team profiles, previous project websites and institutions). The project is not responsible for their content.",
        ],
      },
    },
  ],
};

export const PRIVACIDAD: LegalDoc = {
  title: { es: "Privacidad", en: "Privacy" },
  intro: {
    es: "Esta web está diseñada para recoger los mínimos datos posibles.",
    en: "This website is designed to collect as little data as possible.",
  },
  sections: [
    {
      heading: { es: "Sin cookies ni analítica", en: "No cookies or analytics" },
      body: {
        es: [
          "La web no instala cookies ni utiliza herramientas de analítica o publicidad. Las tipografías se sirven desde la propia web.",
          "Si eliges el modo claro u oscuro, esa preferencia se guarda en el almacenamiento local de tu navegador (localStorage). No se envía a ningún servidor y puedes borrarla desde la configuración del navegador.",
        ],
        en: [
          "This website does not set cookies or use analytics or advertising tools. Fonts are served from the website itself.",
          "If you choose light or dark mode, that preference is stored in your browser's local storage (localStorage). It is never sent to any server and you can delete it from your browser settings.",
        ],
      },
    },
    {
      heading: { es: "Alojamiento", en: "Hosting" },
      body: {
        es: [
          "La web está alojada en GitHub Pages (GitHub, Inc.), que, como cualquier servicio de alojamiento, recibe la dirección IP de quien la visita para poder servirla y por seguridad.",
        ],
        en: [
          "The website is hosted on GitHub Pages (GitHub, Inc.), which, like any hosting service, receives visitors' IP addresses in order to serve the site and for security purposes.",
        ],
      },
    },
    {
      heading: { es: "Responsable y derechos", en: "Data controller and your rights" },
      body: {
        es: [
          "Responsable del tratamiento: Universidad de Salamanca. Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a la Delegación de Protección de Datos: dpd@usal.es.",
        ],
        en: [
          "Data controller: University of Salamanca. You can exercise your rights of access, rectification, erasure, objection, restriction and portability by writing to the Data Protection Officer: dpd@usal.es.",
        ],
      },
    },
  ],
};

export const ACCESIBILIDAD: LegalDoc = {
  title: { es: "Accesibilidad", en: "Accessibility" },
  intro: {
    es: "Queremos que cualquier persona pueda consultar esta web, sea cual sea el dispositivo o la tecnología de apoyo que utilice.",
    en: "We want everyone to be able to use this website, whatever device or assistive technology they use.",
  },
  sections: [
    {
      heading: { es: "Compromiso", en: "Commitment" },
      body: {
        es: [
          "La web se ha desarrollado con el objetivo de cumplir el nivel AA de las Pautas de Accesibilidad para el Contenido Web (WCAG 2.1), conforme al Real Decreto 1112/2018: contraste suficiente también en modo oscuro, navegación completa con teclado, textos alternativos, estructura semántica y compatibilidad con lectores de pantalla. Las animaciones se desactivan si el sistema tiene activada la reducción de movimiento.",
        ],
        en: [
          "This website has been built to meet level AA of the Web Content Accessibility Guidelines (WCAG 2.1), in line with Spanish Royal Decree 1112/2018: sufficient contrast in dark mode as well, full keyboard navigation, text alternatives, semantic structure and screen-reader compatibility. Animations are turned off if your system is set to reduce motion.",
        ],
      },
    },
    {
      heading: { es: "Comunícanos cualquier barrera", en: "Tell us about any barrier" },
      body: {
        es: [
          SITE.email
            ? `Si encuentras algún problema de accesibilidad, escríbenos a ${SITE.email} y lo resolveremos lo antes posible.`
            : "Si encuentras algún problema de accesibilidad, comunícalo al equipo del proyecto y lo resolveremos lo antes posible.",
        ],
        en: [
          SITE.email
            ? `If you find any accessibility problem, write to us at ${SITE.email} and we will fix it as soon as possible.`
            : "If you find any accessibility problem, let the project team know and we will fix it as soon as possible.",
        ],
      },
    },
  ],
};
