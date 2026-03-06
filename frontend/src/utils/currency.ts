// Detect user's currency based on timezone + Intl.NumberFormat (not navigator.languages)

interface CurrencyInfo {
  code: string
  symbol: string
  rate: number // Approximate rate from EUR for demo conversion
}

// Timezone → currency mapping (reliable, not affected by browser language settings)
const timezoneCurrencyMap: Record<string, CurrencyInfo> = {
  // UAE
  'Asia/Dubai': { code: 'AED', symbol: 'AED', rate: 3.97 },
  // Qatar
  'Asia/Qatar': { code: 'QAR', symbol: 'QAR', rate: 3.94 },
  // Saudi Arabia
  'Asia/Riyadh': { code: 'SAR', symbol: 'SAR', rate: 4.05 },
  // Bahrain
  'Asia/Bahrain': { code: 'BHD', symbol: 'BHD', rate: 0.407 },
  // Kuwait
  'Asia/Kuwait': { code: 'KWD', symbol: 'KWD', rate: 0.332 },
  // Oman
  'Asia/Muscat': { code: 'OMR', symbol: 'OMR', rate: 0.416 },
  // India
  'Asia/Kolkata': { code: 'INR', symbol: '₹', rate: 90.5 },
  'Asia/Calcutta': { code: 'INR', symbol: '₹', rate: 90.5 },
  // Pakistan
  'Asia/Karachi': { code: 'PKR', symbol: 'Rs', rate: 302 },
  // UK
  'Europe/London': { code: 'GBP', symbol: '£', rate: 0.86 },
  // US Timezones
  'America/New_York': { code: 'USD', symbol: '$', rate: 1.08 },
  'America/Chicago': { code: 'USD', symbol: '$', rate: 1.08 },
  'America/Denver': { code: 'USD', symbol: '$', rate: 1.08 },
  'America/Los_Angeles': { code: 'USD', symbol: '$', rate: 1.08 },
  'America/Anchorage': { code: 'USD', symbol: '$', rate: 1.08 },
  'Pacific/Honolulu': { code: 'USD', symbol: '$', rate: 1.08 },
  // Canada
  'America/Toronto': { code: 'CAD', symbol: 'C$', rate: 1.47 },
  'America/Vancouver': { code: 'CAD', symbol: 'C$', rate: 1.47 },
  'America/Edmonton': { code: 'CAD', symbol: 'C$', rate: 1.47 },
  // Europe (EUR)
  'Europe/Paris': { code: 'EUR', symbol: '€', rate: 1.0 },
  'Europe/Berlin': { code: 'EUR', symbol: '€', rate: 1.0 },
  'Europe/Rome': { code: 'EUR', symbol: '€', rate: 1.0 },
  'Europe/Madrid': { code: 'EUR', symbol: '€', rate: 1.0 },
  'Europe/Lisbon': { code: 'EUR', symbol: '€', rate: 1.0 },
  'Europe/Amsterdam': { code: 'EUR', symbol: '€', rate: 1.0 },
  'Europe/Brussels': { code: 'EUR', symbol: '€', rate: 1.0 },
  'Europe/Vienna': { code: 'EUR', symbol: '€', rate: 1.0 },
  'Europe/Dublin': { code: 'EUR', symbol: '€', rate: 1.0 },
  'Europe/Helsinki': { code: 'EUR', symbol: '€', rate: 1.0 },
  'Europe/Athens': { code: 'EUR', symbol: '€', rate: 1.0 },
  // Other Europe
  'Europe/Zurich': { code: 'CHF', symbol: 'CHF', rate: 0.95 },
  'Europe/Copenhagen': { code: 'DKK', symbol: 'kr', rate: 7.46 },
  'Europe/Stockholm': { code: 'SEK', symbol: 'kr', rate: 11.2 },
  'Europe/Oslo': { code: 'NOK', symbol: 'kr', rate: 11.5 },
  'Europe/Warsaw': { code: 'PLN', symbol: 'zł', rate: 4.32 },
  'Europe/Prague': { code: 'CZK', symbol: 'Kč', rate: 25.3 },
  'Europe/Budapest': { code: 'HUF', symbol: 'Ft', rate: 393 },
  'Europe/Bucharest': { code: 'RON', symbol: 'lei', rate: 4.97 },
  'Europe/Istanbul': { code: 'TRY', symbol: '₺', rate: 34.8 },
  // Asia
  'Asia/Tokyo': { code: 'JPY', symbol: '¥', rate: 162.0 },
  'Asia/Shanghai': { code: 'CNY', symbol: '¥', rate: 7.82 },
  'Asia/Hong_Kong': { code: 'HKD', symbol: 'HK$', rate: 8.45 },
  'Asia/Singapore': { code: 'SGD', symbol: 'S$', rate: 1.46 },
  'Asia/Bangkok': { code: 'THB', symbol: '฿', rate: 38.5 },
  'Asia/Seoul': { code: 'KRW', symbol: '₩', rate: 1420 },
  'Asia/Kuala_Lumpur': { code: 'MYR', symbol: 'RM', rate: 5.12 },
  'Asia/Jakarta': { code: 'IDR', symbol: 'Rp', rate: 17100 },
  'Asia/Manila': { code: 'PHP', symbol: '₱', rate: 60.5 },
  'Asia/Taipei': { code: 'TWD', symbol: 'NT$', rate: 34.2 },
  // Australia/NZ
  'Australia/Sydney': { code: 'AUD', symbol: 'A$', rate: 1.65 },
  'Australia/Melbourne': { code: 'AUD', symbol: 'A$', rate: 1.65 },
  'Australia/Perth': { code: 'AUD', symbol: 'A$', rate: 1.65 },
  'Pacific/Auckland': { code: 'NZD', symbol: 'NZ$', rate: 1.79 },
  // South America
  'America/Sao_Paulo': { code: 'BRL', symbol: 'R$', rate: 5.35 },
  'America/Argentina/Buenos_Aires': { code: 'ARS', symbol: '$', rate: 930 },
  'America/Mexico_City': { code: 'MXN', symbol: '$', rate: 18.5 },
  'America/Bogota': { code: 'COP', symbol: '$', rate: 4250 },
  'America/Santiago': { code: 'CLP', symbol: '$', rate: 1010 },
  'America/Lima': { code: 'PEN', symbol: 'S/', rate: 4.05 },
  // Africa
  'Africa/Cairo': { code: 'EGP', symbol: 'E£', rate: 33.5 },
  'Africa/Johannesburg': { code: 'ZAR', symbol: 'R', rate: 20.2 },
  'Africa/Nairobi': { code: 'KES', symbol: 'KSh', rate: 155 },
  'Africa/Lagos': { code: 'NGN', symbol: '₦', rate: 1650 },
  'Africa/Casablanca': { code: 'MAD', symbol: 'MAD', rate: 10.8 },
}

// Fallback currency
const defaultCurrency: CurrencyInfo = { code: 'USD', symbol: '$', rate: 1.08 }

function detectCurrency(): CurrencyInfo {
  try {
    // Method 1: Use timezone (most reliable for physical location)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && timezoneCurrencyMap[tz]) {
      return timezoneCurrencyMap[tz]
    }

    // Method 2: Use Intl.NumberFormat to detect currency from locale
    try {
      const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })
      // Check if the locale uses a different currency naturally
      const resolved = formatter.resolvedOptions()
      // If the resolved locale points to a specific region, try to infer currency
      const locale = resolved.locale
      if (locale.includes('-AE') || locale.includes('ar-AE')) return timezoneCurrencyMap['Asia/Dubai']
      if (locale.includes('-GB')) return timezoneCurrencyMap['Europe/London']
      if (locale.includes('-IN')) return timezoneCurrencyMap['Asia/Kolkata']
      if (locale.includes('-JP')) return timezoneCurrencyMap['Asia/Tokyo']
    } catch {}

    // Method 3: Timezone offset as a last resort
    const offset = new Date().getTimezoneOffset()
    if (offset === -240) return timezoneCurrencyMap['Asia/Dubai']  // UTC+4 (UAE, Oman)
    if (offset === -180) return timezoneCurrencyMap['Asia/Riyadh']  // UTC+3 (Saudi, Qatar, Kuwait, Bahrain)
    if (offset === -330) return timezoneCurrencyMap['Asia/Kolkata']  // UTC+5:30 (India)
    if (offset === 0) return timezoneCurrencyMap['Europe/London']    // UTC+0 (UK)
    if (offset === -60) return { code: 'EUR', symbol: '€', rate: 1.0 }   // UTC+1 (Central Europe)
    if (offset === 300) return timezoneCurrencyMap['America/New_York']     // UTC-5 (US East)
    if (offset === 360) return timezoneCurrencyMap['America/Chicago']      // UTC-6 (US Central)
    if (offset === 480) return timezoneCurrencyMap['America/Los_Angeles']  // UTC-8 (US West)
  } catch {}

  return defaultCurrency
}

// Cache the detected currency
let _cachedCurrency: CurrencyInfo | null = null

export function getUserCurrency(): CurrencyInfo {
  if (!_cachedCurrency) {
    _cachedCurrency = detectCurrency()
  }
  return _cachedCurrency
}

export function convertPrice(eurPrice: number): { amount: number; display: string } {
  const cur = getUserCurrency()
  const converted = Math.round(eurPrice * cur.rate)
  return {
    amount: converted,
    display: `${cur.symbol} ${converted.toLocaleString()}`,
  }
}

export function getCurrencyCode(): string {
  return getUserCurrency().code
}

// Format a price with the correct currency
export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`
  }
}
