import { Link } from 'react-router';
import { Sparkles, TrendingUp, UserPlus, Radio } from 'lucide-react';

const topDeals = [
  { name: 'iPhone 15 Pro', discount: '-35%' },
  { name: 'Nike Air Max', discount: '-40%' },
  { name: 'Sony WH-1000XM5', discount: '-28%' },
];

const suggestedCreators = [
  {
    handle: '@fashionista_bd',
    category: 'Fashion',
    followers: '2.3M',
    avatar: 'https://images.unsplash.com/photo-1553816078-25e0948140f6?w=80&auto=format&fit=crop',
    gradient: 'from-pink-500 to-orange-500',
  },
  {
    handle: '@tech_guru_official',
    category: 'Tech',
    followers: '1.8M',
    avatar: 'https://images.unsplash.com/photo-1758264364350-f569dbf6bdc5?w=80&auto=format&fit=crop',
    gradient: 'from-blue-500 to-cyan-500',
  },
];

const upcomingLives = [
  { title: 'Mega Electronics Flash Sale', time: 'Starts in 15 mins', urgency: 'live' },
  { title: 'Beauty Products Bonanza', time: 'Starts in 2 hours', urgency: 'soon' },
];

export function AIDailySummary() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 p-7 sm:p-8" style={{ background: 'linear-gradient(135deg, rgba(79,110,247,0.12) 0%, rgba(124,58,237,0.10) 50%, rgba(14,16,35,0.95) 100%)' }}>
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(79,110,247,0.08)', filter: 'blur(80px)' }} />

          {/* Header */}
          <div className="flex items-center gap-3 mb-7 relative z-10">
            <div className="p-2.5 rounded-2xl shadow-brand" style={{ background: 'var(--brand-gradient)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Your AI Daily Summary</h3>
              <p className="text-white/50 text-xs">Personalized just for you · Updated now</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {/* Today's Top Deals */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/8 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-primary/15 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <span className="text-white font-medium text-sm">Today's Top Deals</span>
              </div>
              <div className="space-y-2.5 mb-4">
                {topDeals.map((deal) => (
                  <div key={deal.name} className="flex items-center justify-between text-sm">
                    <span className="text-white/75 truncate">{deal.name}</span>
                    <span className="text-success font-semibold shrink-0 ml-2">{deal.discount}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/deals"
                className="w-full block text-center py-2 bg-white/8 hover:bg-white/14 rounded-xl text-white/75 hover:text-white transition-all text-sm"
              >
                View All Deals →
              </Link>
            </div>

            {/* Creators to Follow */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/8 hover:border-info/30 transition-colors">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-info/15 rounded-xl">
                  <UserPlus className="w-4 h-4 text-info" />
                </div>
                <span className="text-white font-medium text-sm">Creators to Follow</span>
              </div>
              <div className="space-y-3 mb-4">
                {suggestedCreators.map((creator) => (
                  <div key={creator.handle} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-white/10">
                      <img
                        src={creator.avatar}
                        alt={creator.handle}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{creator.handle}</p>
                      <p className="text-white/50 text-xs">{creator.category} · {creator.followers}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/explore"
                className="w-full block text-center py-2 bg-info/12 hover:bg-info/20 rounded-xl text-info/90 hover:text-info transition-all text-sm font-medium"
              >
                Discover More →
              </Link>
            </div>

            {/* Live Sales Starting Soon */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/8 hover:border-error/30 transition-colors">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-error/15 rounded-xl">
                  <Radio className="w-4 h-4 text-error animate-pulse" />
                </div>
                <span className="text-white font-medium text-sm">Live Sales Starting Soon</span>
              </div>
              <div className="space-y-2.5 mb-4">
                {upcomingLives.map((live) => (
                  <div key={live.title} className="bg-white/5 rounded-xl p-3">
                    <p className="text-white text-sm font-medium mb-1.5 leading-snug">{live.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/55 text-xs">{live.time}</span>
                      {live.urgency === 'live' ? (
                        <span className="px-2 py-0.5 bg-error/20 text-error text-xs font-semibold rounded-full">● LIVE</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs font-semibold rounded-full">Soon</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/live/1"
                className="w-full block text-center py-2 bg-error/12 hover:bg-error/22 rounded-xl text-error/90 hover:text-error transition-all text-sm font-medium"
              >
                Set Reminders →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
