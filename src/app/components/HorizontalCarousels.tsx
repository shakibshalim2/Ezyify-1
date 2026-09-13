import { ChevronLeft, ChevronRight, Flame, ShoppingBag, Radio, Star, Store, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

const carousels = [
  {
    title: 'Trending Loops',
    icon: Flame,
    iconBg: '#ef4444',
    to: '/loops',
    items: Array(8).fill(null).map((_, i) => ({
      image: 'https://images.unsplash.com/photo-1553816078-25e0948140f6?w=400&auto=format&fit=crop',
      title: `Loop ${i + 1}`,
      meta: `${(i + 1) * 1.2}M views`,
    })),
  },
  {
    title: 'Best Sellers',
    icon: ShoppingBag,
    iconBg: '#4f6ef7',
    to: '/shop',
    items: Array(8).fill(null).map((_, i) => ({
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
      title: `Product ${i + 1}`,
      meta: `$${(i + 1) * 29} · ${30 + i * 5}% OFF`,
    })),
  },
  {
    title: 'Live Now',
    icon: Radio,
    iconBg: '#10b981',
    to: '/live/1',
    isLive: true,
    items: Array(8).fill(null).map((_, i) => ({
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop',
      title: `Live ${i + 1}`,
      meta: `${(i + 1) * 5}K watching`,
    })),
  },
  {
    title: 'Creator Spotlight',
    icon: Star,
    iconBg: '#f59e0b',
    to: '/explore',
    items: Array(8).fill(null).map((_, i) => ({
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop',
      title: `@creator${i + 1}`,
      meta: `${(i + 1) * 100}K followers`,
    })),
  },
  {
    title: 'Top Stores',
    icon: Store,
    iconBg: '#06b6d4',
    to: '/shop',
    items: Array(8).fill(null).map((_, i) => ({
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&auto=format&fit=crop',
      title: `Store ${i + 1}`,
      meta: `⭐ 4.8`,
    })),
  },
  {
    title: 'Beauty Deals',
    icon: Sparkles,
    iconBg: '#ec4899',
    to: '/deals',
    items: Array(8).fill(null).map((_, i) => ({
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop',
      title: `Beauty ${i + 1}`,
      meta: `$${(i + 1) * 19}`,
    })),
  },
];

export function HorizontalCarousels() {
  return (
    <div className="px-4 py-8 space-y-10">
      {carousels.map((carousel) => {
        const Icon = carousel.icon;
        return (
          <div key={carousel.title} className="max-w-[1920px] mx-auto">
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: carousel.iconBg }}>
                  <Icon className="w-4.5 h-4.5 text-white" />
                </div>
                <h2 className="text-white font-semibold text-lg">{carousel.title}</h2>
              </div>
              <div className="flex items-center gap-2.5">
                <Link to={carousel.to} className="text-white/55 hover:text-white text-sm transition-colors">View All</Link>
                <div className="flex gap-1.5">
                  <button aria-label="Previous" className="w-8 h-8 bg-white/5 hover:bg-white/12 border border-white/8 rounded-xl flex items-center justify-center transition-all">
                    <ChevronLeft className="w-4 h-4 text-white/60" />
                  </button>
                  <button aria-label="Previous" className="w-8 h-8 bg-white/5 hover:bg-white/12 border border-white/8 rounded-xl flex items-center justify-center transition-all">
                    <ChevronRight className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scroll row */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {carousel.items.map((item, idx) => (
                <Link
                  key={idx}
                  to={carousel.to}
                  className="group flex-shrink-0 w-52 rounded-2xl overflow-hidden border border-white/8 hover:border-white/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="relative h-72 bg-white/5">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.06]"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {carousel.isLive && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-error rounded-full">
                        <span className="w-1.5 h-1.5 bg-white rounded-full live-badge" />
                        <span className="text-white text-xs font-bold tracking-wide">LIVE</span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-medium text-sm truncate mb-0.5">{item.title}</p>
                      <p className="text-white/60 text-xs">{item.meta}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
