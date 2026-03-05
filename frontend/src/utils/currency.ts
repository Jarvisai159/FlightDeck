// Detect user's locale and provide currency conversion

const currencyByLocale: Record<string, { code: string; symbol: string; rate: number }> = {
  'en-US': { code: 'USD', symbol: '$', rate: 1.08 },
  'en-GB': { code: 'GBP', symbol: '£', rate: 0.86 },
  'en-AU': { code: 'AUD', symbol: 'A$', rate: 1.65 },
  'en-CA': { code: 'CAD', symbol: 'C$', rate: 1.47 },
  'en-IN': { code: 'INR', symbol: '₹', rate: 90.5 },
  'ar-AE': { code: 'AED', symbol: 'AED ', rate: 3.97 },
  'ja-JP': { code: 'JPY', symbol: '¥', rate: 162.0 },
  'zh-CN': { code: 'CNY', symbol: '¥', rate: 7.82 },
  'de-DE': { code: 'EUR', symbol: '€', rate: 1.0 },
  'fr-FR': { code: 'EUR', symbol: '€', rate: 1.0 },
  'pt-PT': { code: 'EUR', symbol: '€', rate: 1.0 },
  'es-ES': { code: 'EUR', symbol: '€', rate: 1.0 },
  'it-IT': { code: 'EUR', symbol: '€', rate: 1.0 },
  'tr-TR': { code: 'TRY', symbol: '₺', rate: 34.8 },
  'pt-BR': { code: 'BRL', symbol: 'R$', rate: 5.35 },
}

// Default fallback: EUR
const defaultCurrency = { code: 'EUR', symbol: '€', rate: 1.0 }

function detectLocale(): string {
  if (typeof navigator !== 'undefined') {
    // navigator.languages is an array of user preferred languages
    const langs = navigator.languages || [navigator.language]
    for (const lang of langs) {
      if (currencyByLocale[lang]) return lang
      // Try matching just the language part (e.g. 'en' from 'en-NZ')
      const prefix = lang.split('-')[0]
      const match = Object.keys(currencyByLocale).find(k => k.startsWith(prefix + '-'))
      if (match) return match
    }
  }
  return 'de-DE' // fallback to EUR
}

export function getUserCurrency() {
  const locale = detectLocale()
  return currencyByLocale[locale] || defaultCurrency
}

export function convertPrice(eurPrice: number): { amount: number; display: string } {
  const cur = getUserCurrency()
  const converted = Math.round(eurPrice * cur.rate)
  return {
    amount: converted,
    display: `${cur.symbol}${converted.toLocaleString()}`,
  }
}

export function getCurrencyCode(): string {
  return getUserCurrency().code
}
