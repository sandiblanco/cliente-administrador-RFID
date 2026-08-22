import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'podio-theme'

function getInitialTheme() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    // localStorage puede no estar disponible (modo privado, etc.).
    return 'dark'
  }
}

// Los roles de color están en styles/tokens.css (:root = claro,
// [data-theme="dark"] = oscuro). Arranca en oscuro: es la lectura más
// fiel de la marca para una pantalla proyectada. El toggle chico de la
// cabecera permite pasar a claro en pantallas muy luminosas.
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Sin persistencia disponible: el toggle sigue funcionando en la sesión.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
