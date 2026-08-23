import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'resultados-theme'

function getInitialTheme() {
  try {
    // A diferencia del podio (pantalla proyectada, arranca oscuro), esta
    // app la abre gente en el celular a plena luz del día — arranca
    // clara, con el mismo toggle para quien prefiera oscuro.
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

// Los roles de color están en styles/tokens.css (:root = claro,
// [data-theme="dark"] = oscuro) — mismo mecanismo que podio/administrador.
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
