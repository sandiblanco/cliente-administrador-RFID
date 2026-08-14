import { SearchIcon } from './icons'

export default function SearchBar({ query, onChange, placeholder = 'Buscar por ID o nombre…' }) {
  return (
    <div className="search-bar">
      <SearchIcon className="search-icon" />
      <input
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar corredor"
      />
    </div>
  )
}
