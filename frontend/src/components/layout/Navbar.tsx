import { NavLink } from 'react-router-dom'
import { Plane, BarChart3, Search, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const tabs = [
  { to: '/search', label: 'Flights', icon: Search },
  { to: '/history', label: 'History', icon: BarChart3 },
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="bg-bg-secondary/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-accent -rotate-45" />
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              FlightDeck
            </span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0.5">
            {tabs.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-accent bg-accent/8'
                      : 'text-text-muted hover:text-text-primary'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-bg-tertiary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-text-muted" /> : <Moon className="w-3.5 h-3.5 text-text-muted" />}
            </button>
            <span className="text-[9px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
              BETA
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
