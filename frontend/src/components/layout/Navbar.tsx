import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Mock authentication state for layout visualization
  const isAuthenticated = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup';

  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Health Check', path: '/check' },
        { name: 'History', path: '/history' },
      ]
    : [
        { name: 'Log in', path: '/login' },
      ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">Checkd</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                location.pathname === link.path ? "text-blue-600" : "text-slate-600"
              )}
            >
              {link.name}
            </Link>
          ))}
          {!isAuthenticated && (
            <Link
              to="/signup"
              className="inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
            >
              Start a Check
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/profile" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <User className="h-4 w-4" />
              <span className="sr-only">Profile</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  location.pathname === link.path
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {link.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="mt-4 block w-full rounded-md bg-blue-600 px-3 py-2 text-center text-base font-medium text-white hover:bg-blue-700"
              >
                Start a Check
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  location.pathname === '/profile'
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                Profile
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
