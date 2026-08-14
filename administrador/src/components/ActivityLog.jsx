import { useEffect, useRef } from 'react'
import { formatClock } from '../utils/formatTime'

// Umbral, en px, para considerar que el usuario "está al final" del log y
// por lo tanto seguir haciendo auto-scroll con cada entrada nueva. Si se
// desplazó hacia arriba a leer algo viejo, no se lo interrumpe (igual que
// un chat de Twitch).
const BOTTOM_THRESHOLD_PX = 48

export default function ActivityLog({ entries }) {
  const scrollRef = useRef(null)
  const stickToBottomRef = useRef(true)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottomRef.current = distanceFromBottom < BOTTOM_THRESHOLD_PX
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el && stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [entries])

  return (
    <aside className="activity-log" aria-label="Actividad en vivo">
      <h2 className="activity-log-title">Actividad en vivo</h2>
      <div className="activity-log-scroll" ref={scrollRef} onScroll={handleScroll}>
        {entries.length === 0 ? (
          <p className="activity-log-empty">Todavía no hay actividad registrada…</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className={`activity-entry activity-${entry.kind}`}>
              <div className="activity-entry-head">
                <span className="activity-tag">{entry.tag}</span>
                <span className="activity-time">{formatClock(entry.at)}</span>
              </div>
              <p className="activity-text">{entry.text}</p>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
