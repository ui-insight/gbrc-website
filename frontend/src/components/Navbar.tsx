import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Dna } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/getting-started', label: 'Getting Started' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/project-intake', label: 'Project Intake' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="bg-neutral-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline text-white">
            <Dna className="h-8 w-8 text-uidaho-gold" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg tracking-tight">GBRC</span>
              <span className="text-xs text-neutral-400 hidden sm:block">
                Genomics & Bioinformatics Resources Core
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium no-underline transition-colors ${
                  location.pathname === link.to
                    ? 'bg-uidaho-gold text-neutral-900'
                    : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://my.ilabsolutions.com/service_center/show_external/3232/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 px-4 py-2 bg-uidaho-gold text-neutral-900 rounded-md text-sm font-semibold no-underline hover:bg-uidaho-gold-dark transition-colors"
            >
              Request Services
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-neutral-300"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium no-underline ${
                  location.pathname === link.to
                    ? 'bg-uidaho-gold text-neutral-900'
                    : 'text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://my.ilabsolutions.com/service_center/show_external/3232/"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 bg-uidaho-gold text-neutral-900 rounded-md text-base font-semibold no-underline text-center mt-2"
            >
              Request Services
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
