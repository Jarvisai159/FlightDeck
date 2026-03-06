// Locale-aware date formatting
// Uses Intl.DateTimeFormat to detect the ACTUAL system date format
// This respects OS settings, not just browser language (en-US ≠ US date format)

// Detect if the user's system formats dates as month-first (MDY)
// by checking how Intl.DateTimeFormat arranges the parts
function detectDateOrder(): 'dmy' | 'mdy' {
  try {
    // Format a known date (Jan 15) and check the order of day vs month
    const formatter = new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const parts = formatter.formatToParts(new Date(2026, 0, 15)) // Jan 15, 2026
    const dayIdx = parts.findIndex((p) => p.type === 'day')
    const monthIdx = parts.findIndex((p) => p.type === 'month')

    // If month comes before day, it's MDY (US-style)
    if (monthIdx >= 0 && dayIdx >= 0 && monthIdx < dayIdx) {
      return 'mdy'
    }
  } catch {
    // Fallback
  }
  // Default: day-month-year (used by ~95% of the world)
  return 'dmy'
}

// Cache the result so we don't re-detect every call
let _dateOrder: 'dmy' | 'mdy' | null = null
function getDateOrder(): 'dmy' | 'mdy' {
  if (_dateOrder === null) {
    _dateOrder = detectDateOrder()
  }
  return _dateOrder
}

export function isMonthFirst(): boolean {
  return getDateOrder() === 'mdy'
}

// Format an ISO date (YYYY-MM-DD) for display
export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return ''
  const parts = isoDate.split('-')
  if (parts.length !== 3) return isoDate
  const [y, m, d] = parts
  if (isMonthFirst()) return `${m}/${d}/${y}`
  return `${d}/${m}/${y}`
}

// Get the expected date placeholder
export function getDatePlaceholder(): string {
  return isMonthFirst() ? 'mm/dd/yyyy' : 'dd/mm/yyyy'
}

// Format for API calls (always dd/mm/yyyy — Kiwi format)
export function toApiDateDMY(isoDate: string): string {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

// Format for Amadeus API (always YYYY-MM-DD)
export function toAmadeusDate(isoDate: string): string {
  return isoDate // Already in YYYY-MM-DD
}

// Parse a user-typed date string back to YYYY-MM-DD
export function parseDateInput(input: string): string | null {
  if (!input) return null

  // Try YYYY-MM-DD first (internal format / ISO)
  const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch) {
    const [, y, m, d] = isoMatch
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // Try locale-aware format
  const slashMatch = input.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/)
  if (slashMatch) {
    const [, a, b, y] = slashMatch
    if (isMonthFirst()) {
      // mm/dd/yyyy
      const m = a.padStart(2, '0')
      const d = b.padStart(2, '0')
      if (+m >= 1 && +m <= 12 && +d >= 1 && +d <= 31) return `${y}-${m}-${d}`
    } else {
      // dd/mm/yyyy
      const d = a.padStart(2, '0')
      const m = b.padStart(2, '0')
      if (+m >= 1 && +m <= 12 && +d >= 1 && +d <= 31) return `${y}-${m}-${d}`
    }
  }

  return null
}

// Get today as YYYY-MM-DD
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
