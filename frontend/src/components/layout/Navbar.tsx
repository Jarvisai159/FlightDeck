import { NavLink } from 'react-router-dom'
import { Plane, BarChart3, Search, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const tabs = [
  { to: '/status', label: 'STATUS', icon: Plane },
  { to: '/history', label: 'HISTORY', icon: BarChart3 },
  { to: '/search', label: 'SEARCH', icon: Search },
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="bg-bg-secondary border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Plane className="w-4.5 h-4.5 text-white -rotate-45" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text-primary">
              Flight<span className="text-accent">Deck</span>
            </span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-bg-primary rounded-lg p-1">
            {tabs.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold tracking-widest transition-all duration-200 ${
                    isActive
                      ? 'bg-accent text-white shadow-md shadow-accent/25'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center hover:bg-bg-hover transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-text-secondary" /> : <Moon className="w-4 h-4 text-text-secondary" />}
            </button>
            <span className="text-[10px] font-mono text-text-muted bg-bg-tertiary px-2 py-0.5 rounded">
              DEMO
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
