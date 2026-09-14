import { DollarSign, Truck, MapPin, Star, Eye, TrendingUp, Tag, Award } from 'lucide-react';

interface SmartFiltersProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const filters = [
  { id: 'All',          label: 'All',           icon: null },
  { id: 'Trending',     label: 'Trending',      icon: TrendingUp },
  { id: 'Under499',     label: 'Under $10',     icon: DollarSign },
  { id: 'FastDelivery', label: 'Fast Delivery',  icon: Truck },
  { id: 'LocalSeller',  label: 'Local Seller',  icon: MapPin },
  { id: 'BestDiscount', label: 'Best Discount', icon: Tag },
  { id: 'TopReviews',   label: 'Top Rated',     icon: Star },
  { id: 'MostWatched',  label: 'Most Watched',  icon: Eye },
  { id: 'AIPicked',     label: 'AI Picks',      icon: Award },
];

export function SmartFilters({ activeFilter, setActiveFilter }: SmartFiltersProps) {
  return (
    <div className="sticky top-40 z-20 border-b border-white/8" style={{ background: 'rgba(10,12,22,0.82)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-[1920px] mx-auto px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-150 shrink-0 ${
                  isActive
                    ? 'text-white shadow-brand'
                    : 'bg-white/5 text-white/65 hover:bg-white/10 hover:text-white border border-white/8 hover:border-white/15'
                }`}
                style={isActive ? { background: 'var(--brand-gradient)' } : {}}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
