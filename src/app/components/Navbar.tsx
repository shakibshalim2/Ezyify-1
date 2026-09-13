import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Mic, Upload, ShoppingCart, User, Bell, Globe, Menu, X, Home, Compass, Video, ShoppingBag } from 'lucide-react';
import logoImage from '../../assets/logo-full.png';

interface NavbarProps {
  onVoiceClick: () => void;
}

export function Navbar({ onVoiceClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img
                src={logoImage}
                alt="Ezyify Logo"
                className="w-9 h-9 hover:scale-105 transition-transform"
              />
              <span className="text-lg font-semibold tracking-tight text-brand-gradient">Ezyify</span>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden lg:flex items-center gap-5">
              <Link to="/" className="text-white text-sm hover:text-white/80 transition">Home</Link>
              <Link to="/explore" className="text-white/70 text-sm hover:text-white transition">Explore</Link>
              <Link to="/loops" className="text-white/70 text-sm hover:text-white transition">Loops</Link>
              <Link to="/live/1" className="text-white/70 text-sm hover:text-white transition flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-error rounded-full animate-pulse" />
                Live
              </Link>
              <Link to="/shop" className="text-white/70 text-sm hover:text-white transition">Marketplace</Link>
              <Link to="/explore" className="text-white/70 text-sm hover:text-white transition">Creators</Link>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, loops, creators, stores..."
                className="w-full bg-white/10 text-white placeholder-white/40 px-4 py-2.5 pr-24 rounded-full border border-white/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={onVoiceClick}
                  aria-label="Voice search"
                  className="p-2 hover:bg-white/10 rounded-full transition group"
                >
                  <Mic className="w-4 h-4 text-white/60 group-hover:text-white" />
                </button>
                <button aria-label="Search" className="p-2 hover:bg-white/10 rounded-full transition">
                  <Search className="w-4 h-4 text-white/60 hover:text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/upload"
              className="hidden md:flex items-center gap-2 px-4 py-2 text-white rounded-full hover:shadow-brand-lg transition shadow-brand"
              style={{ background: 'var(--brand-gradient)' }}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden lg:inline text-sm font-medium">Upload</span>
            </Link>

            <Link to="/notifications" aria-label="Notifications" className="relative p-2 hover:bg-white/10 rounded-full transition">
              <Bell className="w-5 h-5 text-white/70" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
            </Link>

            <Link to="/cart" aria-label="Cart" className="relative p-2 hover:bg-white/10 rounded-full transition">
              <ShoppingCart className="w-5 h-5 text-white/70" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white">3</span>
            </Link>

            <button aria-label="Change language" className="hidden md:block p-2 hover:bg-white/10 rounded-full transition">
              <Globe className="w-5 h-5 text-white/70" />
            </button>

            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition text-sm"
            >
              <User className="w-4 h-4 text-white/70" />
              <span className="hidden lg:inline text-white/70">Login</span>
            </Link>

            <button aria-label="Open menu" onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 hover:bg-white/10 rounded-full transition">
              <Menu className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="text-base font-semibold text-white">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="p-1.5 rounded-full hover:bg-white/10 transition">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              {[
                { to: '/', label: 'Home', icon: Home },
                { to: '/explore', label: 'Explore', icon: Compass },
                { to: '/loops', label: 'Loops', icon: Video },
                { to: '/shop', label: 'Marketplace', icon: ShoppingBag },
                { to: '/upload', label: 'Upload', icon: Upload },
                { to: '/notifications', label: 'Notifications', icon: Bell },
                { to: '/cart', label: 'Cart', icon: ShoppingCart },
                { to: '/login', label: 'Login', icon: User },
              ].map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
