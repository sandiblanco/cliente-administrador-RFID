import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertIcon, InfoIcon } from './icons'

const GENDER_LABELS = { M: 'Masculino', F: 'Femenino' }

// Debe calzar con el width del popover en components.css.
const POPOVER_WIDTH = 220
const VIEWPORT_MARGIN = 12

// Icono de info por corredor en la tabla — al hacer click abre un
// desplegable chico con datos del corredor que no se ven en el resto de
// la fila: género y talla de camiseta (de solo lectura, vienen del
// .xlsx de inscripción — ver parse_runners_xlsx) y dos checks
// editables, permanentes, que sí sobreviven a un reemplazo por .xlsx
// (ver replace_runners_bulk_from_file en el backend, igual mecanismo
// que tag_id): si ya se entregó la camiseta y el paquete de corredor.
// Mismo mecanismo de portal + posicionamiento fijo que TagEditButton,
// por la misma razón (la tabla vive en .table-wrapper con overflow-x:
// auto).
export default function RunnerInfoButton({ runner, onSave }) {
  const [open, setOpen] = useState(false)
  const [shirtDelivered, setShirtDelivered] = useState(!!runner.shirtDelivered)
  const [kitDelivered, setKitDelivered] = useState(!!runner.kitDelivered)
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
      // La columna de info es la última de la tabla: el botón suele
      // quedar cerca del borde derecho de la ventana. Si el popover no
      // entra abierto hacia la derecha (su alineación por defecto), se
      // "voltea" para abrir hacia la izquierda — misma técnica de
      // detección de colisión que usan los popovers de Radix/Floating UI.
      const overflowsRight =
        rect.left + POPOVER_WIDTH + VIEWPORT_MARGIN > window.innerWidth
      const left = overflowsRight
        ? Math.max(VIEWPORT_MARGIN, rect.right - POPOVER_WIDTH)
        : rect.left
      setPosition({
        top: rect.bottom + 8,
        left,
        // La flecha sigue apuntando al centro del botón sin importar de
        // qué lado terminó alineada la caja.
        caretLeft: Math.min(
          POPOVER_WIDTH - 20,
          Math.max(12, rect.left + rect.width / 2 - left)
        ),
      })
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
    setShirtDelivered(!!runner.shirtDelivered)
    setKitDelivered(!!runner.kitDelivered)
    setError(null)
    setOpen((o) => !o)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave({ shirtDelivered, kitDelivered })
      setOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const hasData = runner.shirtDelivered || runner.kitDelivered
  const genderLabel = GENDER_LABELS[(runner.gender ?? '').toUpperCase()] ?? '—'

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`info-edit-trigger ${hasData ? 'info-edit-trigger-set' : ''}`}
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Ver/editar datos del corredor"
        title="Género, talla de camiseta y entregas"
      >
        <InfoIcon />
      </button>

      {open && position &&
        createPortal(
          <div
            ref={popoverRef}
            className="info-edit-popover"
            style={{
              top: position.top,
              left: position.left,
              '--caret-left': `${position.caretLeft}px`,
            }}
          >
            {/* Encabezado con corredor + nombre: quién está viendo/editando
                esto no puede depender solo de la cercanía visual al icono
                que lo abrió — la tabla scrollea y el popover puede
                reposicionarse cerca del borde de la ventana. */}
            <p className="info-edit-heading">
              <span className="info-edit-heading-id">#{runner.id}</span>
              <span className="info-edit-heading-name">{runner.name}</span>
            </p>

            <dl className="info-edit-readonly">
              <div>
                <dt>Género</dt>
                <dd>{genderLabel}</dd>
              </div>
              <div>
                <dt>Talla de camiseta</dt>
                <dd>{runner.shirtSize || 'Sin talla'}</dd>
              </div>
            </dl>

            <label className="info-edit-checkbox">
              <input
                type="checkbox"
                checked={shirtDelivered}
                onChange={(event) => setShirtDelivered(event.target.checked)}
              />
              Camiseta entregada
            </label>

            <label className="info-edit-checkbox">
              <input
                type="checkbox"
                checked={kitDelivered}
                onChange={(event) => setKitDelivered(event.target.checked)}
              />
              Paquete de corredor entregado
            </label>

            {error && (
              <p className="error info-edit-error">
                <AlertIcon className="error-icon" />
                <span>{error}</span>
              </p>
            )}

            <button
              type="button"
              className="btn-primary info-edit-save"
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
