// Locale-aware date formatting
// Default: dd/mm/yyyy (most of the world)
// US/Canada: mm/dd/yyyy

export function isNorthAmericaLocale(): boolean {
  if (typeof navigator === 'undefined') return false
  const langs = navigator.languages || [navigator.language]
  for (const lang of langs) {
    const lower = lang.toLowerCase()
    if (
      lower === 'en-us' || lower === 'en-ca' ||
      lower.startsWith('en-us') || lower.startsWith('en-ca')
    ) {
      return true
    }
  }
  return false
}

// Format an ISO date (YYYY-MM-DD) for display
export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return ''
  const parts = isoDate.split('-')
  if (parts.length !== 3) return isoDate
  const [y, m, d] = parts
  if (isNorthAmericaLocale()) return `${m}/${d}/${y}`
  return `${d}/${m}/${y}`
}

// Get the expected date placeholder
export function getDatePlaceholder(): string {
  return isNorthAmericaLocale() ? 'mm/dd/yyyy' : 'dd/mm/yyyy'
}

// Format for Kiwi API (always dd/mm/yyyy)
export function toKiwiDate(isoDate: string): string {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

// Parse a user-typed date string back to YYYY-MM-DD
// Accepts dd/mm/yyyy or mm/dd/yyyy based on locale, or YYYY-MM-DD
export function parseDateInput(input: string): string | null {
  if (!input) return null

  // Try YYYY-MM-DD first (internal format)
  const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch) {
    const [, y, m, d] = isoMatch
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // Try locale-aware format: dd/mm/yyyy or mm/dd/yyyy
  const slashMatch = input.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/)
  if (slashMatch) {
    const [, a, b, y] = slashMatch
    if (isNorthAmericaLocale()) {
      // mm/dd/yyyy
      const m = a.padStart(2, '0')
      const d = b.padStart(2, '0')
      if (parseInt(m) >= 1 && parseInt(m) <= 12 && parseInt(d) >= 1 && parseInt(d) <= 31) {
        return `${y}-${m}-${d}`
      }
    } else {
      // dd/mm/yyyy
      const d = a.padStart(2, '0')
      const m = b.padStart(2, '0')
      if (parseInt(m) >= 1 && parseInt(m) <= 12 && parseInt(d) >= 1 && parseInt(d) <= 31) {
        return `${y}-${m}-${d}`
      }
    }
  }

  return null
}

// Get today as YYYY-MM-DD
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
