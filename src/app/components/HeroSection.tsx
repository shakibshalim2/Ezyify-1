import { Link } from 'react-router';
import { Play, TrendingUp, Zap, Users, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden" style={{ minHeight: '560px' }}>
      {/* Premium dark background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0d0f1a 0%, #111430 50%, #0f1225 100%)' }} />

      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'rgba(79,110,247,0.18)', filter: 'blur(120px)' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'rgba(124,58,237,0.18)', filter: 'blur(120px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(236,72,153,0.08)', filter: 'blur(100px)' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 sm:py-20 lg:py-24 text-center">

        {/* AI badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-sm text-white/75">E-Commerce Social Media Ecosystem</span>
        </div>

        {/* Headline */}
        <h1 className="mb-5 animate-slide-up" style={{
          fontSize: 'clamp(2.25rem,7vw,4.5rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg,#ffffff 0%,#c4b5fd 40%,#818cf8 70%,#60a5fa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Shop. Talk. Share.<br />Live the Moment.
        </h1>

        <p className="text-lg sm:text-xl text-white/55 max-w-2xl mb-10 leading-relaxed animate-fade-in">
          Your AI-powered social commerce universe — discover, shop, create and connect, all in one place.
        </p>

        {/* CTA row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-slide-up">
          <Link to="/shop" className="group inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white transition-all duration-200 hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#4f6ef7 0%,#7c3aed 100%)', boxShadow: '0 8px 28px rgba(79,110,247,0.35)' }}>
            <ShoppingBag className="w-4 h-4" />
            Explore Marketplace
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link to="/loops" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 hover:scale-105">
            <Play className="w-4 h-4" />
            Watch Loops
          </Link>

          <Link to="/live/1" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white bg-error hover:bg-error transition-all duration-200 hover:scale-105"
            style={{ boxShadow: '0 4px 18px rgba(239,68,68,0.35)' }}>
            <span className="w-2 h-2 bg-white rounded-full live-badge" />
            Join Live Now
          </Link>

          <Link to="/sell-on-ezyify" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white/75 border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105">
            <Zap className="w-4 h-4" />
            Become a Seller
          </Link>
        </div>

        {/* Trust stats */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 animate-fade-in">
          {[
            { icon: Users, label: '10M+ Users' },
            { icon: ShoppingBag, label: '5M+ Products' },
            { icon: Play, label: '1M+ Loops' },
            { icon: TrendingUp, label: '500K+ Sellers' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-white/40">
              <Icon className="w-4 h-4 text-white/25" />
              <span>{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm text-white/40">
            <span className="w-2 h-2 bg-error rounded-full live-badge" />
            <span>50K+ Live Now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
