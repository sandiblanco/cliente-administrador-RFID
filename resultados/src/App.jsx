import { useEffect, useState } from 'react'
import { useSearch } from './hooks/useSearch'
import { useTheme } from './hooks/useTheme'
import SearchForm from './components/SearchForm'
import ResultCard from './components/ResultCard'
import Leaderboard from './components/Leaderboard'
import { AlertIcon, MoonIcon, RunnerBadgeIcon, SunIcon } from './components/icons'

const DEFAULT_FILTERS = { category: '10k', subcategory: '', gender: '' }

export default function App() {
  const { query, setQuery, status, results, error } = useSearch()
  const { theme, toggleTheme } = useTheme()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [highlightRunnerId, setHighlightRunnerId] = useState(null)

  const handleFilterChange = (partial) => {
    setFilters((current) => ({ ...current, ...partial }))
    // Un cambio de filtro manual significa que dejaste de mirar tu
    // propio resultado -- no tiene sentido seguir resaltando una fila
    // que puede ni siquiera estar en la modalidad que elegiste ahora.
    setHighlightRunnerId(null)
  }

  // Cuando la búsqueda encuentra a una sola persona, se arma la tabla
  // para mostrar exactamente su modalidad con su fila resaltada -- así
  // "buscarme" y "ver quiénes están arriba mío" quedan conectados en un
  // solo flujo, en vez de ser dos pantallas separadas.
  const handleSearchResult = (result) => {
    setFilters({
      category: result.category?.toLowerCase() === '10k' ? '10k' : '5k',
      subcategory: result.subcategory ?? '',
      gender: result.gender ?? '',
    })
    setHighlightRunnerId(result.runner_id)
    document.getElementById('leaderboard-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Caso más común: buscaste tu propio dorsal, hay un solo match y ya
  // llegaste -- te ubica directo en la tabla de tu modalidad sin que
  // haga falta un clic extra. Con varios matches por nombre (varios
  // "Juan Pérez") queda un botón por tarjeta en su lugar, ver ResultCard.
  useEffect(() => {
    if (status !== 'done' || results.length !== 1) return
    const [only] = results
    if (!only.finished) return
    setFilters({
      category: only.category?.toLowerCase() === '10k' ? '10k' : '5k',
      subcategory: only.subcategory ?? '',
      gender: only.gender ?? '',
    })
    setHighlightRunnerId(only.runner_id)
  }, [status, results])

  return (
    <main className="app">
      <header className="header">
        <button
          type="button"
          className="theme-toggle-mini"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="badge">
          <RunnerBadgeIcon className="badge-icon" />
        </div>

        <p className="header-eyebrow">Carrera del Informático</p>
        <h1 className="header-title">Resultados</h1>
        <p className="header-sub">Buscá tu resultado por número de dorsal o por tu nombre</p>
      </header>

      <SearchForm query={query} onChange={setQuery} />

      {status === 'loading' && <p className="status-line">Buscando…</p>}

      {status === 'error' && (
        <p className="error-banner" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </p>
      )}

      {status === 'done' && results.length === 0 && (
        <p className="status-line">
          No encontramos a nadie con «{query.trim()}». Revisá el número o probá con el
          nombre completo.
        </p>
      )}

      {status === 'done' && results.length > 0 && (
        <div className="results-list">
          {results.map((result) => (
            <ResultCard
              key={result.runner_id}
              result={result}
              onLocateInLeaderboard={
                result.finished ? () => handleSearchResult(result) : undefined
              }
            />
          ))}
        </div>
      )}

      <Leaderboard
        filters={filters}
        onFilterChange={handleFilterChange}
        highlightRunnerId={highlightRunnerId}
      />
    </main>
  )
}
