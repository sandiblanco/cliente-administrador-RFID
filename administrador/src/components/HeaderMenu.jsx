import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { KebabIcon, UploadIcon } from './icons'

// Menú de tres puntos del header. Por ahora solo tiene la entrada a
// "Subir archivo de corredores", pero queda como el lugar natural para
// futuras acciones que no encajan como pestaña ni como botón fijo.
//
// El dropdown se porta a document.body en vez de vivir dentro de
// .header: el header tiene `overflow: hidden` (para contener el fondo
// decorativo dentro de sus esquinas redondeadas) y eso recortaba
// cualquier contenido posicionado que se saliera de sus límites.
export default function HeaderMenu({ onUploadRunners }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return
    }
    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }
    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="header-menu">
      <button
        ref={triggerRef}
        type="button"
        className="header-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Más opciones"
      >
        <KebabIcon />
      </button>

      {open && position &&
        createPortal(
          <div
            ref={dropdownRef}
            className="header-menu-dropdown"
            role="menu"
            style={{ top: position.top, right: position.right }}
          >
            <button
              type="button"
              role="menuitem"
              className="header-menu-item"
              onClick={() => {
                setOpen(false)
                onUploadRunners()
              }}
            >
              <UploadIcon />
              Subir archivo de corredores
            </button>
          </div>,
          document.body
        )}
    </div>
  )
}
