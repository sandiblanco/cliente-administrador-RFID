import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'admin-theme'

function getInitialTheme() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    // localStorage puede no estar disponible (modo privado, etc.).
    return 'light'
  }
}

// Modo oscuro = invertir los roles de color de la paleta (ver
// styles.css, bloque [data-theme="dark"]). Por defecto arranca en
// claro, pensado para uso al aire libre bajo luz solar.
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
