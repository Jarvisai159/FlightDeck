import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, Star, Headphones, Route, Search } from 'lucide-react'
import { demoTours, themeLabels, type Tour } from '../data/demoData'

const themes = ['all', 'history', 'food', 'street_art', 'nightlife', 'architecture', 'hidden_gems', 'culture', 'nature']

export default function ExplorePage() {
  const [selectedTheme, setSelectedTheme] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = demoTours.filter(t => {
    if (selectedTheme !== 'all' && t.theme !== selectedTheme) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.city.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-serif font-bold text-text-primary mb-3">
          Walk. Listen. Discover.
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Immersive audio walking tours crafted by passionate local guides.
          Explore Lisbon through stories you won't find in any guidebook.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search tours, cities, themes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Theme filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {themes.map(theme => (
          <button
            key={theme}
            onClick={() => setSelectedTheme(theme)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
              selectedTheme === theme
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-hover border border-border-light'
            }`}
          >
            {theme === 'all' ? 'ALL' : themeLabels[theme] || theme.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tour grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(tour => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          No tours match your filters. Try adjusting your search.
        </div>
      )}
    </div>
  )
}

function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link
      to={`/tour/${tour.id}`}
      className="group bg-bg-card rounded-2xl border border-border-light overflow-hidden hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden">
        <div className={`absolute inset-0 gradient-${tour.theme} opacity-80`} />
        {tour.cover_image_url && (
          <img
            src={tour.cover_image_url}
            alt={tour.title}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
        )}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className="px-2 py-0.5 bg-white/90 text-text-primary rounded-md text-xs font-semibold">
            {themeLabels[tour.theme] || tour.theme}
          </span>
        </div>
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 text-text-primary rounded-md text-sm font-bold">
          €{tour.price.toFixed(2)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-serif font-semibold text-lg text-text-primary group-hover:text-accent transition-colors line-clamp-2">
          {tour.title}
        </h3>
        <p className="text-text-secondary text-sm line-clamp-2">{tour.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {tour.city}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {tour.duration_minutes}m
          </span>
          <span className="flex items-center gap-1">
            <Route className="w-3 h-3" /> {tour.distance_km}km
          </span>
        </div>

        {/* Rating & guide */}
        <div className="flex items-center justify-between pt-2 border-t border-border-light">
          <div className="flex items-center gap-2">
            <img
              src={tour.guide.avatar_url}
              alt={tour.guide.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs text-text-secondary">{tour.guide.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-gold fill-gold" />
            <span className="text-sm font-semibold text-text-primary">{tour.avg_rating}</span>
            <span className="text-xs text-text-muted">({tour.review_count})</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
