import { Dna } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Dna className="h-6 w-6 text-uidaho-gold" />
              <span className="font-bold text-white text-lg">GBRC</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              The IIDS Genomics and Bioinformatics Resources Core at the University of
              Idaho provides state-of-the-art genomic and bioinformatic services to
              researchers across campus and beyond.
            </p>
            <p className="text-xs mt-4">
              University of Idaho &middot; IRIC 210 &middot; 685 S. Line Street &middot;
              Moscow, Idaho 83844
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm list-none p-0">
              <li>
                <Link to="/services" className="hover:text-white transition-colors no-underline text-neutral-400">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/getting-started" className="hover:text-white transition-colors no-underline text-neutral-400">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors no-underline text-neutral-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors no-underline text-neutral-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Resources
            </h3>
            <ul className="space-y-2 text-sm list-none p-0">
              <li>
                <a
                  href="https://my.ilabsolutions.com/service_center/show_external/3232/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors no-underline text-neutral-400"
                >
                  iLab Portal
                </a>
              </li>
              <li>
                <a
                  href="https://www.uidaho.edu/research"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors no-underline text-neutral-400"
                >
                  U of I Research
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} University of Idaho. All rights reserved.</p>
          <p className="mt-1">RRID:SCR_026416</p>
        </div>
      </div>
    </footer>
  )
}
