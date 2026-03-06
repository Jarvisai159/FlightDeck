import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Plane, Loader2 } from 'lucide-react'
import { searchAirportsLocal, type AirportOption } from '../../data/airports'

interface Props {
  label: string
  value: AirportOption | null
  onChange: (airport: AirportOption | null) => void
  placeholder?: string
}

export default function AirportAutocomplete({ label, value, onChange, placeholder = 'City or airport code' }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AirportOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Display value: show IATA code when selected, or search query
  const displayValue = value && !isOpen ? `${value.city} (${value.iata})` : query

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions from API with fallback to local data
  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSuggestions([])
      return
    }

    // Always show local results immediately
    const local = searchAirportsLocal(term)
    setSuggestions(local)

    // Try API for more results
    try {
      setLoading(true)
      const res = await fetch(`/api/locations?term=${encodeURIComponent(term)}&limit=8`)
      if (res.ok) {
        const data = await res.json()
        if (data.locations && data.locations.length > 0) {
          const apiResults: AirportOption[] = data.locations
            .filter((loc: any) => loc.code && loc.type === 'airport')
            .map((loc: any) => ({
              iata: loc.code,
              name: loc.name || '',
              city: loc.city?.name || '',
              country: loc.city?.country?.name || loc.country?.name || '',
            }))
          if (apiResults.length > 0) {
            // Merge API results with local, dedup by IATA
            const seen = new Set<string>()
            const merged: AirportOption[] = []
            for (const ap of [...apiResults, ...local]) {
              if (!seen.has(ap.iata)) {
                seen.add(ap.iata)
                merged.push(ap)
              }
            }
            setSuggestions(merged.slice(0, 8))
          }
        }
      }
    } catch {
      // API unavailable — local results are already shown
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setIsOpen(true)
    setHighlightIndex(-1)

    // If user clears, reset selection
    if (!val) {
      onChange(null)
      setSuggestions([])
      return
    }

    // Debounce API calls
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 200)
  }

  const handleSelect = (airport: AirportOption) => {
    onChange(airport)
    setQuery(`${airport.city} (${airport.iata})`)
    setIsOpen(false)
    setSuggestions([])
    setHighlightIndex(-1)
  }

  const handleFocus = () => {
    setIsOpen(true)
    if (value) {
      setQuery('')
    }
    if (query.length >= 2) {
      fetchSuggestions(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        handleSelect(suggestions[highlightIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-[160px]">
      <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-bg-primary border border-border rounded-md pl-3 pr-8 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 text-text-muted animate-spin" />
          ) : (
            <MapPin className="w-3.5 h-3.5 text-text-muted" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-bg-secondary border border-border rounded-md shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((airport, idx) => (
            <button
              key={airport.iata}
              type="button"
              onClick={() => handleSelect(airport)}
              className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors ${
                idx === highlightIndex
                  ? 'bg-accent/10 text-text-primary'
                  : 'text-text-secondary hover:bg-bg-hover'
              }`}
            >
              <Plane className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-accent">{airport.iata}</span>
                  <span className="text-xs truncate">{airport.city}</span>
                </div>
                <p className="text-[10px] text-text-muted truncate">
                  {airport.name}{airport.country ? ` \u00b7 ${airport.country}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
