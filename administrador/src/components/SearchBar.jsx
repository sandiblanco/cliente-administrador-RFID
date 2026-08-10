export default function SearchBar({ query, onChange, placeholder = 'Buscar por ID o nombre…' }) {
  return (
    <div className="search-bar">
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
