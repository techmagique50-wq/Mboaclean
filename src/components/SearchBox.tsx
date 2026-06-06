import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'

export interface SearchItem {
  id: string
  label: string
  sub?: string
  icon?: string
}

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Champ de recherche avec autocomplétion (insensible aux accents). */
export function SearchBox<T extends SearchItem>({
  items,
  onSelect,
  placeholder = 'Rechercher…',
}: {
  items: T[]
  onSelect: (item: T) => void
  placeholder?: string
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const term = norm(q.trim())
    if (!term) return []
    return items.filter((i) => norm(`${i.label} ${i.sub ?? ''}`).includes(term)).slice(0, 8)
  }, [q, items])

  const pick = (item: T) => {
    onSelect(item)
    setQ('')
    setOpen(false)
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" size={18} />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-card py-2.5 pl-10 pr-9 text-sm focus:border-brand focus:outline-none"
      />
      {q && (
        <button
          onClick={() => setQ('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-faint hover:bg-hover"
          aria-label="Effacer"
        >
          <X size={16} />
        </button>
      )}

      {open && results.length > 0 && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-line bg-card shadow-lg">
          {results.map((item) => (
            <button
              key={item.id}
              // onMouseDown se déclenche avant le blur → la sélection passe
              onMouseDown={(e) => {
                e.preventDefault()
                pick(item)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-hover"
            >
              {item.icon && <span>{item.icon}</span>}
              <span className="font-medium text-ink">{item.label}</span>
              {item.sub && <span className="ml-auto text-xs text-faint">{item.sub}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
