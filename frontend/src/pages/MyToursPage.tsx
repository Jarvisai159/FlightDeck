import { Headphones } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MyToursPage() {
  return (
    <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
        <Headphones className="w-8 h-8 text-accent" />
      </div>
      <h1 className="text-2xl font-serif font-bold text-text-primary mb-3">Your purchased tours</h1>
      <p className="text-text-secondary mb-8">
        Sign in to see your purchased tours and continue where you left off.
      </p>
      <Link
        to="/explore"
        className="inline-flex px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors"
      >
        Explore Tours
      </Link>
    </div>
  )
}
