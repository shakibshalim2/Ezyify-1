import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Home, Compass, Video, ShoppingBag, MessageCircle, Bell, User, Search,
  Upload, Heart, ShoppingCart, Menu, X, Store, Package, Settings, HelpCircle,
  Plus, ChevronDown, LogOut, LayoutDashboard, Zap, Wallet
} from 'lucide-react';
import { EzyifyLogo } from './EzyifyLogo';
import { BottomNav } from './BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useBadgeCount } from '../lib/data';
import { useUnreadCount } from '@ezyify/core';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartCount = useBadgeCount();
  const unread = useUnreadCount();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, navigate]);

  const navLinks = useMemo(() => [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Loops', path: '/loops', icon: Video },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: 'Live', path: '/live/1', icon: Zap, isLive: true },
  ], []);


  return (
    <>
      {/* ── TOP NAV ── */}
      <nav
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/96 backdrop-blur-2xl border-b border-border/60 shadow-[0_1px_12px_rgba(0,0,0,0.06)]'
            : 'bg-background/98 border-b border-border/50'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* h-12 on mobile (48px), h-16 on desktop (64px) — proportional to logo and icons */}
          <div className="flex items-center justify-between h-12 lg:h-16 gap-2 sm:gap-3">

            {/* Left */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
                className="lg:hidden p-1.5 sm:p-2 rounded-xl hover:bg-muted transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
              </button>

              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <EzyifyLogo size={30} className="group-hover:scale-105 transition-transform duration-200" />
                <span className="text-base lg:text-lg font-semibold tracking-tight text-brand-gradient">Ezyify</span>
              </Link>

              {/* Desktop nav links */}
              <nav className="hidden lg:flex items-center gap-0.5 ml-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground-secondary hover:text-foreground hover:bg-muted/70'
                      }`}
                    >
                      {(link as any).isLive ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-error live-badge" />
                          <span className="hidden xl:inline">Live</span>
                        </span>
                      ) : (
                        <>
                          <Icon className="w-[15px] h-[15px] shrink-0" />
                          <span className="hidden xl:inline">{link.name}</span>
                        </>
                      )}
                      {/* Active underline pip */}
                      {active && (
                        <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-4 h-[2.5px] rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-sm lg:max-w-md mx-2 hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-150 ${searchFocused ? 'text-primary' : 'text-foreground-secondary'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search products, creators, stores…"
                  autoComplete="off"
                  className={`w-full pl-10 pr-4 py-2 rounded-full text-sm text-foreground placeholder:text-foreground-secondary transition-all duration-200 outline-none ${
                    searchFocused
                      ? 'bg-card ring-2 ring-primary/25 border border-primary/25 shadow-sm'
                      : 'bg-muted/70 border border-border/50 hover:bg-muted hover:border-border'
                  }`}
                />
              </form>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Upload — desktop + tablet only */}
              <Link to="/upload" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-sm font-semibold text-white bg-brand-gradient shadow-brand hover:shadow-brand-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150">
                <Upload className="w-4 h-4" />
                <span className="hidden lg:inline">Upload</span>
              </Link>

              {/* Messages */}
              <Link to="/messages" aria-label="Messages" className="relative p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all duration-150">
                <MessageCircle className="w-[19px] h-[19px]" />
              </Link>

              {/* Notifications */}
              <Link to="/notifications" aria-label="Notifications" className="relative p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all duration-150">
                <Bell className="w-[19px] h-[19px]" />
                {(unread.data ?? 0) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-error text-error-foreground text-[10px] rounded-full flex items-center justify-center px-1 font-bold border-2 border-background tabular-nums">
                    {unread.data! > 99 ? '99+' : unread.data}
                  </span>
                )}
              </Link>

              {/* Wishlist — tablet+ only */}
              <Link to="/wishlist" aria-label="Wishlist" className="hidden sm:flex p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all duration-150">
                <Heart className="w-[19px] h-[19px]" />
              </Link>

              {/* Cart */}
              <Link to="/cart" aria-label="Cart" className="relative p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all duration-150">
                <ShoppingCart className="w-[19px] h-[19px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center px-1 font-bold border-2 border-background animate-scale-in tabular-nums">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu — desktop only (mobile uses bottom nav Profile + hamburger menu) */}
              <div className="relative hidden lg:flex" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 p-1.5 rounded-xl hover:bg-muted transition-colors"
                  aria-label="User menu"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/20" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center ring-2 ring-primary/20">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-foreground-secondary transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden animate-scale-in z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-semibold text-sm text-foreground">{user?.name ?? 'My Account'}</p>
                      <p className="text-xs text-foreground-secondary">{user ? `@${user.username}` : 'Not signed in'}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { label: 'Profile', icon: User, path: '/profile/me' },
                        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                        { label: 'Seller Hub', icon: Store, path: '/seller-dashboard' },
                        { label: 'Orders', icon: Package, path: '/orders' },
                        { label: 'Settings', icon: Settings, path: '/settings' },
                      ].map(({ label, icon: Icon, path }) => (
                        <Link key={path} to={path} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                          <Icon className="w-4 h-4 text-foreground-secondary" />
                          {label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-border py-1">
                      <button
                        onClick={() => { setUserMenuOpen(false); if (isAuthenticated) void logout(); else navigate('/login'); }}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors hover:bg-muted ${isAuthenticated ? 'text-error' : 'text-primary'}`}
                      >
                        <LogOut className="w-4 h-4" />
                        {isAuthenticated ? 'Sign Out' : 'Sign In'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search — compact row below main bar */}
        <div className="md:hidden px-3 pb-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-secondary pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, creators, stores…"
              autoComplete="off"
              className="w-full pl-8 pr-4 py-1.5 bg-muted/70 border border-border/40 rounded-full text-sm text-foreground placeholder:text-foreground-secondary outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/25 focus:bg-card transition-all"
            />
          </form>
        </div>
      </nav>

      {/* ── MOBILE SLIDE-IN MENU ── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 animate-fade-in" />
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-background border-r border-border shadow-2xl animate-slide-down overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 border-b border-border" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', paddingBottom: '1rem' }}>
              <div className="flex items-center gap-2">
                <EzyifyLogo size={30} />
                <span className="text-base font-semibold tracking-tight text-brand-gradient">Ezyify</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="p-1.5 rounded-xl hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div className="p-3 space-y-0.5">
              <p className="px-3 py-1.5 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Navigate</p>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}>
                    {(link as any).isLive ? (
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-error live-badge" />Live</span>
                    ) : (<><Icon className="w-5 h-5 shrink-0" />{link.name}</>)}
                  </Link>
                );
              })}

              <div className="h-px bg-border my-2" />
              <p className="px-3 py-1.5 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Account</p>

              {[
                { label: 'Profile', icon: User, path: '/profile/me' },
                { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                { label: 'Wallet', icon: Wallet, path: '/wallet' },
                { label: 'Orders', icon: ShoppingBag, path: '/orders' },
                { label: 'Creator Studio', icon: Video, path: '/creator-dashboard' },
                { label: 'Seller Hub', icon: Store, path: '/seller-dashboard' },
                { label: 'Settings', icon: Settings, path: '/settings' },
                { label: 'Help Center', icon: HelpCircle, path: '/help' },
              ].map(({ label, icon: Icon, path }) => (
                <Link key={path} to={path} onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
                  <Icon className="w-5 h-5 text-foreground-secondary" />
                  {label}
                </Link>
              ))}

              <div className="h-px bg-border my-2" />
              <button
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-colors hover:bg-muted ${isAuthenticated ? 'text-error' : 'text-primary'}`}
                onClick={() => { setIsMenuOpen(false); if (isAuthenticated) void logout(); else navigate('/login'); }}
              >
                <LogOut className="w-5 h-5" />
                {isAuthenticated ? 'Sign Out' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}