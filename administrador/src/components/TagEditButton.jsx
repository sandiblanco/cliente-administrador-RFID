import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertIcon, TagIcon } from './icons'

// Icono de tag por corredor en la tabla — al hacer click abre un
// desplegable chico con un campo de texto y un botón de guardar para
// asignar/editar el tag_id de ese corredor. Portado a document.body con
// position:fixed, igual que HeaderMenu: la tabla vive dentro de
// .table-wrapper (overflow-x: auto), que recortaría cualquier contenido
// posicionado que se salga de sus límites.
export default function TagEditButton({ runner, onSave }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(runner.tagId || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [position, setPosition] = useState(null)
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return
    }
    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({ top: rect.bottom + 8, left: rect.left })
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
      if (triggerRef.current?.contains(event.target)) {
        return
      }
      if (popoverRef.current?.contains(event.target)) {
        return
      }
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleToggle = () => {
    setValue(runner.tagId || '')
    setError(null)
    setOpen((o) => !o)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave(value.trim() || null)
      setOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`tag-edit-trigger ${runner.tagId ? 'tag-edit-trigger-set' : ''}`}
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={runner.tagId ? `Editar tag RFID (${runner.tagId})` : 'Asignar tag RFID'}
        title={runner.tagId ? `Tag: ${runner.tagId}` : 'Sin tag asignado'}
      >
        <TagIcon />
      </button>

      {open && position &&
        createPortal(
          <div
            ref={popoverRef}
            className="tag-edit-popover"
            style={{ top: position.top, left: position.left }}
          >
            <label className="tag-edit-field">
              Tag RFID
              <input
                type="text"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Ej. E28011..."
                autoComplete="off"
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSave()
                  }
                }}
              />
            </label>

            {error && (
              <p className="error tag-edit-error">
                <AlertIcon className="error-icon" />
                <span>{error}</span>
              </p>
            )}

            <button
              type="button"
              className="btn-primary tag-edit-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>,
          document.body
        )}
    </>
  )
}
