// Iconos mínimos en línea (trazo geométrico, sin dependencias) usados por
// los componentes de presentación. Puramente decorativos/informativos —
// no llevan lógica ni estado propio.

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

export function PendingIcon(props) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 1a7 7 0 1 1-7 7" />
    </svg>
  )
}
