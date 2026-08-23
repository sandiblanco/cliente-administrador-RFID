// Iconos mínimos en línea (trazo geométrico, sin dependencias) — el
// mismo lenguaje visual que el cliente de registro. Puramente
// presentacionales, sin lógica ni estado propio.

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

export function ReloadIcon(props) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
      <path d="M13.5 2.5v3.4h-3.4" />
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

export function KebabIcon(props) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <circle cx="8" cy="2.6" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="8" cy="13.4" r="1.4" />
    </svg>
  )
}

export function UploadIcon(props) {
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
      <path d="M8 11V2.5M8 2.5 4.7 5.8M8 2.5l3.3 3.3" />
      <path d="M2.5 11v1.8a1.7 1.7 0 0 0 1.7 1.7h7.6a1.7 1.7 0 0 0 1.7-1.7V11" />
    </svg>
  )
}

export function TagIcon(props) {
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
      <path d="M8.6 1.8H3.4a1.6 1.6 0 0 0-1.6 1.6v5.2c0 .42.17.83.47 1.13l5.9 5.9a1.6 1.6 0 0 0 2.26 0l4.44-4.44a1.6 1.6 0 0 0 0-2.26l-5.9-5.9a1.6 1.6 0 0 0-1.13-.47Z" />
      <circle cx="5.2" cy="5.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function InfoIcon(props) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="8" cy="8" r="6.4" />
      <path d="M8 7.4v4" />
      <circle cx="8" cy="4.8" r="0.15" fill="currentColor" />
    </svg>
  )
}

export function PlusIcon(props) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 2.5v11M2.5 8h11" />
    </svg>
  )
}

export function SearchIcon(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="7" cy="7" r="4.6" />
      <path d="M14 14l-3.3-3.3" />
    </svg>
  )
}
