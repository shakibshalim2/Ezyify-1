import { Link } from 'react-router';
import { Sparkles, Eye, ShoppingBag, MapPin, Brain } from 'lucide-react';

const recommendations = [
  {
    icon: Eye,
    label: 'Because You Watched',
    count: '23 items',
    gradient: 'linear-gradient(135deg, #4f6ef7 0%, #7c3aed 100%)',
    to: '/explore',
  },
  {
    icon: ShoppingBag,
    label: 'Because You Bought',
    count: '15 items',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    to: '/shop',
  },
  {
    icon: MapPin,
    label: 'Based on Your City',
    count: '89 items',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    to: '/explore',
  },
  {
    icon: Brain,
    label: 'AI Picks for You',
    count: '156 items',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #ef4444 100%)',
    to: '/explore',
  },
];

export function AIRecommendationBar() {
  return (
    <div className="sticky top-16 z-30 border-b border-white/8" style={{ background: 'rgba(13,15,26,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-[1920px] mx-auto px-4 py-3.5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
          <span className="text-white/80 text-sm font-medium">AI-Powered Recommendations</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {recommendations.map((rec) => (
            <Link
              key={rec.label}
              to={rec.to}
              className="group relative overflow-hidden p-3.5 rounded-2xl hover:scale-[1.02] hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
              style={{ background: rec.gradient }}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-200 rounded-2xl" />
              <div className="relative flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl shrink-0">
                  <rec.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate leading-snug">{rec.label}</p>
                  <p className="text-white/65 text-xs mt-0.5">{rec.count}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
