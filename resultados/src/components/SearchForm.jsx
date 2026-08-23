import { SearchIcon } from './icons'

export default function SearchForm({ query, onChange }) {
  return (
    <label className="search-form">
      <SearchIcon className="search-form-icon" />
      <input
        type="search"
        inputMode="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        placeholder="Tu número de dorsal o tu nombre"
        aria-label="Buscar por número de dorsal o nombre"
        value={query}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
