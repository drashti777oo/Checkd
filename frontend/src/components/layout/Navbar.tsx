import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const isFemale = user?.gender?.toLowerCase() === 'female';

  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Health Check', path: '/check' },
        ...(isFemale ? [{ name: 'Cycle Tracker', path: '/cycle' }] : []),
        { name: 'History', path: '/history' },
        { name: 'Profile', path: '/profile' },
      ]
    : [{ name: 'Home', path: '/' }];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#fffcf8]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffb800] text-white shadow-sm">
              <CheckCircle2 className="h-5 w-5 fill-white text-[#ffb800]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0f172a]">checkd</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-semibold transition-colors hover:text-[#ffb800]',
                location.pathname === link.path ? 'text-[#ffb800] border-b-2 border-[#ffb800] pb-1' : 'text-[#334155]'
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-[#0f172a] hover:text-[#ffb800] transition-colors"
            >
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-[#0f172a] hover:text-[#ffb800] transition-colors">
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#0f172a] px-6 py-2 text-sm font-medium text-white shadow-sm transition-transform hover:scale-105"
              >
                Get Started &rarr;
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-[#0f172a] hover:bg-slate-100 focus:outline-none"
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
                  'block rounded-md px-3 py-3 text-base font-medium',
                  location.pathname === link.path ? 'bg-[#fffcf8] text-[#ffb800]' : 'text-[#0f172a] hover:bg-slate-50'
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-slate-100">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="block w-full rounded-md px-3 py-3 text-center text-base font-medium text-[#0f172a] hover:bg-slate-50"
                >
                  Log out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full rounded-md px-3 py-3 text-center text-base font-medium text-[#0f172a] hover:bg-slate-50"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full rounded-full bg-[#0f172a] px-3 py-3 text-center text-base font-medium text-white shadow-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
