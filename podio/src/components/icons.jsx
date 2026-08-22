// Iconos mínimos en línea (trazo geométrico, sin dependencias) — mismo
// lenguaje visual que cliente/administrador.

export function AlertIcon(props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 3.2 1.8 17h16.4L10 3.2Z" />
      <path d="M10 8v4" />
      <circle cx="10" cy="14.6" r="0.15" fill="currentColor" />
    </svg>
  )
}

export function SunIcon(props) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="8" cy="8" r="3.2" />
      <path d="M8 1v1.4M8 13.6V15M15 8h-1.4M2.4 8H1M12.8 3.2l-1 1M4.2 11.8l-1 1M12.8 12.8l-1-1M4.2 4.2l-1-1" />
    </svg>
  )
}

export function MoonIcon(props) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M14 9.4A6 6 0 1 1 6.6 2a4.7 4.7 0 0 0 7.4 7.4Z" />
    </svg>
  )
}

// Corredor estilizado — mismo motivo que el logo de marca (figura en
// movimiento hecha de trazos rectos y círculos), usado acá como
// insignia decorativa de la cabecera.
export function RunnerBadgeIcon(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <circle cx="38" cy="12" r="6" stroke="currentColor" strokeWidth="3.2" />
      <path
        d="M30 24 L42 34 L49 27"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="49" cy="27" r="3.4" stroke="currentColor" strokeWidth="3" />
      <path
        d="M30 24 L18 42 M34 30 L26 46"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 47 L20 41 M22 51 L28 45"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
