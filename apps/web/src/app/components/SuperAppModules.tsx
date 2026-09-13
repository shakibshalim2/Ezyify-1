import { Link } from 'react-router';
import { Wallet, Smartphone, Ticket, UtensilsCrossed, Tag, Plane, Car, Gift, Users, Headphones } from 'lucide-react';

const modules = [
  { icon: Wallet, label: 'Wallet', color: '#4f6ef7', to: '/wallet' },
  { icon: Smartphone, label: 'Recharge', color: '#06b6d4', to: '/shop' },
  { icon: Ticket, label: 'Tickets', color: '#10b981', to: '/shop' },
  { icon: UtensilsCrossed, label: 'Food', color: '#f97316', to: '/shop' },
  { icon: Tag, label: 'Deals', color: '#f59e0b', to: '/deals' },
  { icon: Plane, label: 'Travel', color: '#6366f1', to: '/shop' },
  { icon: Car, label: 'Ride', color: '#ec4899', to: '/shop' },
  { icon: Gift, label: 'Gift Cards', color: '#14b8a6', to: '/shop' },
  { icon: Users, label: 'Community', color: '#3b82f6', to: '/explore' },
  { icon: Headphones, label: 'Support', color: '#8b5cf6', to: '/help' },
];

export function SuperAppModules() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Ezyify Services</h2>
          <Link to="/explore" className="text-white/55 hover:text-white text-sm transition-colors">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-2.5 sm:gap-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.label}
                to={module.to}
                aria-label={module.label}
                className="group flex flex-col items-center gap-2 p-2.5 sm:p-3 bg-white/5 rounded-2xl border border-white/8 hover:border-white/20 hover:bg-white/10 transition-all duration-200 hover:scale-[1.06] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-[1.08] transition-all duration-200"
                  style={{ background: module.color }}
                >
                  <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-white/65 text-[10px] sm:text-[11px] text-center group-hover:text-white/90 transition-colors leading-tight font-medium">
                  {module.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
