import { NavLink } from 'react-router-dom'
import { Headphones, Compass, BookOpen } from 'lucide-react'

const tabs = [
  { to: '/explore', label: 'EXPLORE', icon: Compass },
  { to: '/my-tours', label: 'MY TOURS', icon: BookOpen },
]

export default function Navbar() {
  return (
    <nav className="bg-bg-secondary border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Headphones className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text-primary font-serif">
              Wandr
            </span>
          </NavLink>

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
            <span className="text-[10px] font-mono text-text-muted bg-bg-secondary px-2 py-0.5 rounded border border-border-light">
              BETA
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
