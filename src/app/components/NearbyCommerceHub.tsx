import { Link } from 'react-router';
import { MapPin, Store, Tag, Users, Navigation, Clock, Star } from 'lucide-react';

const nearbyItems = [
  {
    type: 'store' as const,
    name: 'Fashion Hub',
    category: 'Clothing Store',
    distance: '0.8 km',
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1553816078-25e0948140f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjM2NDU5NDV8MA&ixlib=rb-4.1.0&q=80&w=600',
    discount: '30% OFF',
    to: '/shop',
  },
  {
    type: 'store' as const,
    name: 'Tech Galaxy',
    category: 'Electronics',
    distance: '1.2 km',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1758264364350-f569dbf6bdc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHRlY2hub2xvZ3klMjBwaG9uZXxlbnwxfHx8fDE3NjM3MDg0OTN8MA&ixlib=rb-4.1.0&q=80&w=600',
    discount: '25% OFF',
    to: '/shop',
  },
  {
    type: 'deal' as const,
    name: 'Flash Deal: Beauty Products',
    category: 'Limited Time Offer',
    distance: '2.5 km',
    timeLeft: '2h 35m',
    image: 'https://images.unsplash.com/photo-1718972771654-47be8f36e0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBtYWtldXAlMjBjb3NtZXRpY3N8ZW58MXx8fHwxNzYzNjM1NTUxfDA&ixlib=rb-4.1.0&q=80&w=600',
    discount: '50% OFF',
    to: '/deals',
  },
  {
    type: 'creator' as const,
    name: '@local_seller_bd',
    category: 'Creator · 125K followers',
    distance: '0.5 km',
    liveNow: true,
    image: 'https://images.unsplash.com/photo-1495583878253-919110d2689f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwc3RyZWFtaW5nJTIwY29uY2VydHxlbnwxfHx8fDE3NjM2NTE5MDJ8MA&ixlib=rb-4.1.0&q=80&w=600',
    to: '/live/1',
  },
  {
    type: 'store' as const,
    name: 'Home Decor Plus',
    category: 'Furniture & Decor',
    distance: '1.8 km',
    rating: '4.5',
    image: 'https://images.unsplash.com/photo-1615402052294-a376393da320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBmdXJuaXR1cmUlMjBob21lfGVufDF8fHx8MTc2MzY0OTkyNHww&ixlib=rb-4.1.0&q=80&w=600',
    discount: '40% OFF',
    to: '/shop',
  },
  {
    type: 'deal' as const,
    name: 'Weekend Sale: Electronics',
    category: 'Special Event',
    distance: '3.2 km',
    timeLeft: '1d 5h',
    image: 'https://images.unsplash.com/photo-1753161020548-941a7ae21cb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlb3BsZSUyMHNob3BwaW5nfGVufDF8fHx8MTc2MzcwODQ5NHww&ixlib=rb-4.1.0&q=80&w=600',
    discount: '60% OFF',
    to: '/deals',
  },
];

const typeBadge = {
  store: { icon: Store, label: 'Store', className: 'bg-info/80' },
  deal: { icon: Tag, label: 'Deal', className: 'bg-warning/80' },
  creator: { icon: Users, label: 'Creator', className: 'bg-primary/80' },
};

const ctaLabel = {
  store: 'Visit Store',
  deal: 'Grab Deal',
  creator: 'View Profile',
};

export function NearbyCommerceHub() {
  return (
    <div className="px-4 py-12 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white">Nearby Commerce Hub</h2>
              <p className="text-white/50 text-sm">Stores, deals & creators in your area</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/80 hover:text-white text-sm transition-all">
              <Navigation className="w-4 h-4" />
              Change Location
            </button>
            <Link to="/explore" className="text-white/55 hover:text-white text-sm transition-colors">
              View Map
            </Link>
          </div>
        </div>

        {/* Location pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm mb-8">
          <MapPin className="w-4 h-4 text-success shrink-0" />
          Showing results for: <span className="text-white/90 font-medium">New York, USA</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {nearbyItems.map((item) => {
            const badge = typeBadge[item.type];
            const BadgeIcon = badge.icon;

            return (
              <Link
                key={item.name}
                to={item.to}
                className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/8 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              >
                {/* Image area */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  {/* Type badge — top left */}
                  <div className={`absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1.5 ${badge.className} backdrop-blur-md rounded-full`}>
                    <BadgeIcon className="w-3.5 h-3.5 text-white" />
                    <span className="text-white text-xs font-semibold">{badge.label}</span>
                  </div>

                  {/* Live badge OR distance — top right */}
                  <div className="absolute top-3.5 right-3.5">
                    {(item as any).liveNow ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-error backdrop-blur-md rounded-full">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-xs font-bold tracking-wide">LIVE</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/55 backdrop-blur-md rounded-full text-white/80 text-xs">
                        <Navigation className="w-3 h-3" />
                        {item.distance}
                      </div>
                    )}
                  </div>

                  {/* Content overlay — bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-base mb-0.5 truncate">{item.name}</h3>
                    <p className="text-white/60 text-xs mb-2.5">{item.category}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-white/70 text-xs">
                        {(item as any).rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {(item as any).rating}
                          </span>
                        )}
                        {(item as any).timeLeft && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {(item as any).timeLeft} left
                          </span>
                        )}
                      </div>
                      {(item as any).discount && (
                        <span className="px-2.5 py-1 bg-success text-white text-xs font-bold rounded-full">
                          {(item as any).discount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="p-4">
                  <div
                    className="w-full py-2.5 rounded-xl text-white text-sm font-semibold text-center transition-opacity group-hover:opacity-90"
                    style={{ background: 'var(--brand-gradient)' }}
                  >
                    {(item as any).liveNow ? 'Join Live' : ctaLabel[item.type]}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-white rounded-full hover:shadow-2xl hover:shadow-green-500/20 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}
          >
            <MapPin className="w-4 h-4" />
            Explore All Nearby Locations
          </Link>
        </div>
      </div>
    </div>
  );
}
