import { useParams, Link } from 'react-router-dom'
import { MapPin, Clock, Star, Route, Headphones, ChevronLeft, Globe } from 'lucide-react'
import { demoTours, themeLabels } from '../data/demoData'

export default function TourDetailPage() {
  const { id } = useParams()
  const tour = demoTours.find(t => t.id === Number(id))

  if (!tour) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif font-bold mb-4">Tour not found</h2>
        <Link to="/explore" className="text-accent hover:underline">Back to explore</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Back link */}
      <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to explore
      </Link>

      {/* Hero */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
        <div className={`absolute inset-0 gradient-${tour.theme}`} />
        {tour.cover_image_url && (
          <img src={tour.cover_image_url} alt={tour.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className="inline-block px-2 py-0.5 bg-white/90 text-text-primary rounded-md text-xs font-semibold mb-2">
            {themeLabels[tour.theme] || tour.theme}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">{tour.title}</h1>
        </div>
      </div>

      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary">
        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {tour.city}, {tour.country}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {tour.duration_minutes} minutes</span>
        <span className="flex items-center gap-1.5"><Route className="w-4 h-4" /> {tour.distance_km} km</span>
        <span className="flex items-center gap-1.5"><Headphones className="w-4 h-4" /> {tour.stops.length} stops</span>
        <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {tour.available_languages.join(', ').toUpperCase()}</span>
        <span className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-gold fill-gold" /> {tour.avg_rating} ({tour.review_count} reviews)
        </span>
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="font-serif font-semibold text-xl mb-3">About this tour</h2>
            <p className="text-text-secondary leading-relaxed">{tour.description}</p>
          </div>

          {/* Stops timeline */}
          <div>
            <h2 className="font-serif font-semibold text-xl mb-4">Tour stops</h2>
            <div className="space-y-4">
              {tour.stops.map((stop, idx) => (
                <div key={idx} className="flex gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {stop.order}
                    </div>
                    {idx < tour.stops.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border-light mt-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-6">
                    <h3 className="font-semibold text-text-primary">{stop.title}</h3>
                    {stop.description && (
                      <p className="text-sm text-text-secondary mt-1">{stop.description}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-text-muted">
                      {stop.audio_duration_seconds && (
                        <span className="flex items-center gap-1">
                          <Headphones className="w-3 h-3" />
                          {Math.floor(stop.audio_duration_seconds / 60)}:{String(stop.audio_duration_seconds % 60).padStart(2, '0')}
                        </span>
                      )}
                      {stop.walking_duration_seconds && (
                        <span className="flex items-center gap-1">
                          🚶 {Math.ceil(stop.walking_duration_seconds / 60)} min walk
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase card */}
          <div className="bg-bg-card rounded-2xl border border-border-light p-6 sticky top-20">
            <div className="text-3xl font-bold text-text-primary mb-1">€{tour.price.toFixed(2)}</div>
            <p className="text-xs text-text-muted mb-4">One-time purchase · keep forever</p>
            <button className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors">
              Purchase Tour
            </button>
            <p className="text-xs text-text-muted text-center mt-3">
              {tour.total_purchases} people have taken this tour
            </p>
          </div>

          {/* Guide card */}
          <div className="bg-bg-card rounded-2xl border border-border-light p-6">
            <h3 className="font-serif font-semibold mb-3">Your guide</h3>
            <div className="flex items-center gap-3">
              <img src={tour.guide.avatar_url} alt={tour.guide.name} className="w-12 h-12 rounded-full" />
              <div>
                <div className="font-semibold text-text-primary">{tour.guide.name}</div>
                {tour.guide.tagline && (
                  <div className="text-xs text-text-muted italic">"{tour.guide.tagline}"</div>
                )}
              </div>
            </div>
            {tour.guide.bio && (
              <p className="text-sm text-text-secondary mt-3 leading-relaxed">{tour.guide.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
