import { useEffect, useRef, useState } from 'react'
import { formatElapsed } from '../utils/formatElapsed'
import { PODIUM_GROUPS, normalize } from '../utils/category'
import FitName from './FitName'

const MEDALS = ['1º', '2º', '3º']
const FLASH_DURATION_MS = 1800

export default function PodiumBoard({ runners }) {
  const [recentlyUpdated, setRecentlyUpdated] = useState(() => new Set())
  const prevTimestamps = useRef(new Map())

  // Detecta llegadas/correcciones nuevas comparando contra el timestamp
  // que tenía cada corredor en el render anterior, para dar un destello
  // breve en el puesto que cambió — sin esto, una actualización en vivo
  // pasa desapercibida en una pantalla que nadie está mirando fijo.
  useEffect(() => {
    const changed = []
    runners.forEach((runner) => {
      if (!runner.timestamp) return
      const prev = prevTimestamps.current.get(runner.id)
      if (prev !== runner.timestamp) {
        changed.push(runner.id)
      }
      prevTimestamps.current.set(runner.id, runner.timestamp)
    })

    if (changed.length === 0) return

    setRecentlyUpdated((prev) => new Set([...prev, ...changed]))
    const timer = setTimeout(() => {
      setRecentlyUpdated((prev) => {
        const next = new Set(prev)
        changed.forEach((id) => next.delete(id))
        return next
      })
    }, FLASH_DURATION_MS)

    return () => clearTimeout(timer)
  }, [runners])

  const podiums = PODIUM_GROUPS.map((group) => {
    const top3 = runners
      .filter((r) => r.timestamp)
      .filter(group.match)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(0, 3)
    return { ...group, top3 }
  })

  const finished5k = runners.filter(
    (r) => normalize(r.category) === '5k' && r.timestamp
  ).length

  return (
    <>
      <div className="podium-grid">
        {podiums.map((group) => (
          <article key={group.id} className="podium-card">
            <h2 className="podium-card-title">{group.label}</h2>
            <ol className="podium-list">
              {MEDALS.map((medal, i) => {
                const runner = group.top3[i]
                const flash = runner && recentlyUpdated.has(runner.id)
                return (
                  <li
                    key={medal}
                    className={`podium-place podium-place-${i + 1} ${
                      flash ? 'podium-place-updated' : ''
                    }`}
                  >
                    <span className="podium-medal">{i + 1}</span>
                    {runner ? (
                      <>
                        <FitName name={runner.name} className="podium-name" />
                        <span className="podium-time">
                          {formatElapsed(runner.elapsedSeconds)}
                        </span>
                      </>
                    ) : (
                      <span className="podium-name podium-name-empty">
                        Sin definir
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </article>
        ))}
      </div>

      <p className="note-5k">
        5K · modalidad recreativa, sin podio ·{' '}
        <strong>{finished5k}</strong> {finished5k === 1 ? 'llegada' : 'llegadas'}
      </p>
    </>
  )
}
