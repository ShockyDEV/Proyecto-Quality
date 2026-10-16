/**
 * Scripts de arranque (se insertan tal cual en <head>, antes de pintar).
 * Viven fuera de los módulos "use client" para que el layout (servidor)
 * reciba el texto.
 */

/**
 * Apariciones: marca <html data-revela="si"> si hay IntersectionObserver y no
 * se ha pedido reducir movimiento. Si el observador (RevealObserver) no llega
 * a cargarse en 4 s, lo desactiva para que todo quede visible.
 */
export const REVEAL_BOOT = `(function(){try{var d=document.documentElement,m=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.revela=(!m&&'IntersectionObserver' in window)?'si':'no';setTimeout(function(){if(!window.__revealListo)d.dataset.revela='no'},4000)}catch(e){}})();`;

/**
 * Tema: aplica el oscuro antes de pintar si la persona lo eligió (guardado en
 * localStorage) o, si no eligió, si su sistema lo prefiere. Sin almacenamiento
 * disponible (modo privado) manda la preferencia del sistema.
 */
export const THEME_KEY = "quality-tema";
export const THEME_BOOT = `(function(){var t=null;try{t=localStorage.getItem('${THEME_KEY}')}catch(e){}try{var o=t?t==='oscuro':window.matchMedia('(prefers-color-scheme: dark)').matches;if(o)document.documentElement.classList.add('dark')}catch(e){}})();`;
