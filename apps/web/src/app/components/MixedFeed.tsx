import { Heart, MessageCircle, Share2, ShoppingCart, Play, Radio, Users, Bookmark, Star, Repeat2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';

interface MixedFeedProps {
  filter: string;
}

const feedItems = [
  {
    type: 'loop',
    to: '/loops',
    image: 'https://images.unsplash.com/photo-1553816078-25e0948140f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjM2NDU5NDV8MA&ixlib=rb-4.1.0&q=80&w=800',
    creator: '@fashionista_bd',
    title: 'Summer Fashion Collection 2026',
    likes: '234K',
    comments: '12K',
    shares: '8.4K',
    viewers: 45678,
  },
  {
    type: 'product',
    to: '/shop',
    image: 'https://images.unsplash.com/photo-1758264364350-f569dbf6bdc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHRlY2hub2xvZ3klMjBwaG9uZXxlbnwxfHx8fDE3NjM3MDg0OTN8MA&ixlib=rb-4.1.0&q=80&w=800',
    title: 'iPhone 15 Pro Max 256GB',
    price: '$999',
    originalPrice: '$1,399',
    discount: '35% OFF',
    rating: '4.8',
    reviews: '2.3K',
    store: 'TechZone BD',
  },
  {
    type: 'live',
    to: '/live/1',
    image: 'https://images.unsplash.com/photo-1495583878253-919110d2689f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwc3RyZWFtaW5nJTIwY29uY2VydHxlbnwxfHx8fDE3NjM2NTE5MDJ8MA&ixlib=rb-4.1.0&q=80&w=800',
    creator: '@tech_guru_live',
    title: 'Mega Electronics Flash Sale — Live Now!',
    viewers: '15.8K',
    duration: '2:45:30',
  },
  {
    type: 'post',
    to: '/explore',
    image: 'https://images.unsplash.com/photo-1718972771654-47be8f36e0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBtYWtldXAlMjBjb3NtZXRpY3N8ZW58MXx8fHwxNzYzNjM1NTUxfDA&ixlib=rb-4.1.0&q=80&w=800',
    creator: '@beauty_queen',
    title: 'My Daily Makeup Routine — Products I Love',
    likes: '89K',
    comments: '5.2K',
    shares: '3.1K',
  },
  {
    type: 'product',
    to: '/shop',
    image: 'https://images.unsplash.com/photo-1615402052294-a376393da320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBmdXJuaXR1cmUlMjBob21lfGVufDF8fHx8MTc2MzY0OTkyNHww&ixlib=rb-4.1.0&q=80&w=800',
    title: 'Modern L-Shape Sofa Set',
    price: '$459',
    originalPrice: '$659',
    discount: '30% OFF',
    rating: '4.6',
    reviews: '890',
    store: 'HomeStyle BD',
  },
  {
    type: 'loop',
    to: '/loops',
    image: 'https://images.unsplash.com/photo-1753161020548-941a7ae21cb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlb3BsZSUyMHNob3BwaW5nfGVufDF8fHx8MTc2MzcwODQ5NHww&ixlib=rb-4.1.0&q=80&w=800',
    creator: '@lifestyle_vlog',
    title: 'Best Shopping Haul of the Month!',
    likes: '156K',
    comments: '8.7K',
    shares: '4.2K',
  },
];

const typeBadge = {
  loop:    { icon: Play,         label: 'Loop',    className: 'bg-primary/75 backdrop-blur-md' },
  live:    { icon: Radio,        label: 'LIVE',    className: 'bg-error backdrop-blur-md' },
  product: { icon: ShoppingCart, label: 'Product', className: 'bg-info/80 backdrop-blur-md' },
  post:    { icon: Users,        label: 'Post',    className: 'bg-success/80 backdrop-blur-md' },
};

// Engagement row with repost state isolated per item
function EngagementRow({ item }: { item: any }) {
  const [reposted, setReposted] = useState(false);
  return (
    <div className="flex items-center gap-5 text-white/70 text-sm">
      <span className="flex items-center gap-1.5 hover:text-like transition-colors cursor-pointer">
        <Heart className="w-4.5 h-4.5" />
        {item.likes}
      </span>
      <span className="flex items-center gap-1.5 hover:text-info transition-colors cursor-pointer">
        <MessageCircle className="w-4.5 h-4.5" />
        {item.comments}
      </span>
      <button
        type="button"
        onClick={e => { e.preventDefault(); e.stopPropagation(); setReposted(r => !r); }}
        className={`flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-0 p-0 ${reposted ? 'text-emerald-400' : 'text-white/70 hover:text-emerald-400'}`}
        aria-label={reposted ? 'Undo repost' : 'Repost'}
        aria-pressed={reposted}
      >
        <Repeat2 className="w-4.5 h-4.5" />
        {Math.round((item.shares ?? 0) * 0.4) + (reposted ? 1 : 0)}
      </button>
      <span className="flex items-center gap-1.5 hover:text-success transition-colors cursor-pointer">
        <Share2 className="w-4.5 h-4.5" />
        {item.shares}
      </span>
    </div>
  );
}

export function MixedFeed({ filter }: MixedFeedProps) {
  const filtered = useMemo(() => feedItems, []);

  return (
    <div className="px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-white">Your Personalized Feed</h2>
          {filter !== 'All' && (
            <span className="px-3 py-1 bg-primary/15 text-primary rounded-full text-sm font-medium border border-primary/20">
              {filter}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, idx) => {
            const badge = typeBadge[item.type as keyof typeof typeBadge];
            const BadgeIcon = badge.icon;
            const isLive = item.type === 'live';
            const isProduct = item.type === 'product';
            const isEngageable = item.type === 'loop' || item.type === 'post';

            return (
              <Link
                key={idx}
                to={item.to}
                className="group relative overflow-hidden rounded-3xl border border-white/10 hover:border-white/22 hover:bg-white/3 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-96 overflow-hidden bg-white/5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                  {/* Type badge — top left */}
                  <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${badge.className}`}>
                    <BadgeIcon className={`w-3.5 h-3.5 text-white ${isLive ? 'animate-pulse' : ''}`} />
                    <span className="text-white text-xs font-semibold">{badge.label}</span>
                  </div>

                  {/* Save button — top right */}
                  <button
                    aria-label="Save"
                    onClick={(e) => e.preventDefault()}
                    className="absolute top-3 right-3 p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors"
                  >
                    <Bookmark className="w-4.5 h-4.5 text-white" />
                  </button>

                  {/* Bottom content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {item.creator && (
                      <p className="text-primary text-xs font-semibold mb-1.5">{item.creator}</p>
                    )}
                    <p className="text-white font-semibold text-base mb-3 leading-snug">{item.title}</p>

                    {/* Product info */}
                    {isProduct && (
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2.5 mb-1.5">
                          <span className="text-white text-2xl font-bold">{item.price}</span>
                          <span className="text-white/50 text-sm line-through">{item.originalPrice}</span>
                          <span className="px-2 py-0.5 bg-success text-white text-xs font-bold rounded-full">{item.discount}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/65 text-xs mb-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span>{item.rating}</span>
                          <span className="text-white/35">·</span>
                          <span>{item.reviews} reviews</span>
                        </div>
                        <p className="text-white/50 text-xs">{item.store}</p>
                      </div>
                    )}

                    {/* Live info */}
                    {isLive && (
                      <div className="flex items-center gap-4 text-white/70 text-sm mb-3">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {item.viewers} watching
                        </span>
                        <span className="text-white/40">{item.duration}</span>
                      </div>
                    )}

                    {/* Social engagement */}
                    {isEngageable && (
                      <EngagementRow item={item} />
                    )}

                    {/* CTAs */}
                    {isProduct && (
                      <div
                        className="w-full py-2.5 mt-3 rounded-xl text-white text-sm font-semibold text-center hover:opacity-90 transition-opacity"
                        style={{ background: 'var(--brand-gradient)' }}
                      >
                        Add to Cart
                      </div>
                    )}
                    {isLive && (
                      <div className="w-full py-2.5 mt-2 bg-error text-white text-sm font-semibold rounded-xl text-center hover:bg-error/90 transition-colors">
                        Join Live Now
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-full shadow-brand hover:shadow-brand-lg transition-all hover:scale-[1.03]"
            style={{ background: 'var(--brand-gradient)' }}
          >
            Explore More Content
          </Link>
        </div>
      </div>
    </div>
  );
}
