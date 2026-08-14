import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'admin-theme'

function getInitialTheme() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    // localStorage puede no estar disponible (modo privado, etc.).
    return 'dark'
  }
}

// Los roles de color están en styles/tokens.css (:root = claro,
// [data-theme="dark"] = oscuro). Por defecto arranca en oscuro: es
// donde la identidad de marca de Carrera del Informático se expresa
// completa (fondo navy, acentos neón). El claro sigue disponible con
// el mismo botón, para uso en pantallas muy luminosas.
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
