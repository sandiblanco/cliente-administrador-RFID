import { useLayoutEffect, useRef } from 'react'

// Piso absoluto — deliberadamente bajo: el pedido explícito es que el
// nombre nunca se corte ni baje de línea, así que ante un nombre muy
// largo en una tarjeta angosta se prioriza mantenerlo entero en una
// línea aunque quede chico, en vez de recurrir al ellipsis (que sigue
// ahí en CSS solo como red de seguridad de verdad última, no como
// salida cómoda).
const MIN_FONT_PX = 8
// Margen de seguridad: sin esto, redondeos de sub-pixel entre
// scrollWidth/clientWidth pueden dejar el texto recortado 1px por un
// pelo incluso después de "ajustarlo".
const SAFETY_MARGIN = 0.96

// Nombre del podio que se autoajusta: arranca en el tamaño que le da
// el CSS (clamp con cqw/cqh, ver .podium-name) y, si a ese tamaño no
// entra en una sola línea dentro del ancho disponible, lo achica hasta
// que sí entre — nunca al revés (no lo agranda más allá de lo que
// definió el CSS) y nunca lo manda a una segunda línea. Se vuelve a
// medir cada vez que cambia el nombre o el tamaño del contenedor
// (ResizeObserver), porque el mismo ancho de tarjeta se recalcula en
// vivo con la ventana o al pasar de 3 a 4 corredores en el podio.
export default function FitName({ name, className }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const fit = () => {
      // Vuelve al tamaño "natural" (el que le da el CSS) antes de medir
      // — si no, una vez achicado nunca se vuelve a agrandar aunque el
      // contenedor crezca (p. ej. se rota la pantalla o se agranda la
      // ventana).
      el.style.fontSize = ''
      const available = el.clientWidth
      const needed = el.scrollWidth
      if (available <= 0 || needed <= available) {
        return
      }
      const naturalSize = parseFloat(getComputedStyle(el).fontSize)
      const scaled = (naturalSize * available * SAFETY_MARGIN) / needed
      el.style.fontSize = `${Math.max(scaled, MIN_FONT_PX)}px`
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [name])

  return (
    <span ref={ref} className={className}>
      {name}
    </span>
  )
}
