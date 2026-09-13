import { Calendar, Zap, Users } from 'lucide-react';
import { Link } from 'react-router';

const events = [
  {
    title: '11.11 Mega Sale',
    subtitle: 'Up to 90% OFF Everything',
    date: 'Nov 11, 2026',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop',
    badge: 'Mega Event',
    badgeColor: '#ef4444',
    viewers: '1.2M',
  },
  {
    title: 'Fashion Week 2026',
    subtitle: 'Top Designers Live',
    date: 'Mar 15–22, 2026',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop',
    badge: 'Fashion',
    badgeColor: '#ec4899',
    viewers: '890K',
  },
  {
    title: 'Tech Fest 2026',
    subtitle: 'Latest Gadgets Unveiled',
    date: 'Apr 10, 2026',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop',
    badge: 'Electronics',
    badgeColor: '#3b82f6',
    viewers: '650K',
  },
];

export function LiveEventsShowcase() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Live Events & Mega Sales</h2>
              <p className="text-white/50 text-xs">Don't miss out on exclusive events</p>
            </div>
          </div>
          <Link to="/live/1" className="text-white/55 hover:text-white text-sm transition-colors">View All Events</Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <Link
              key={event.title}
              to="/live/1"
              className="group relative overflow-hidden rounded-3xl border border-white/8 hover:border-white/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.07]"
                  style={{ backgroundImage: `url(${event.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-3 py-1 rounded-full text-white text-xs font-semibold" style={{ background: event.badgeColor }}>
                    {event.badge}
                  </span>
                </div>

                {/* Date */}
                <div className="absolute top-3.5 right-3.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </div>
                </div>

                {/* Viewers */}
                <div className="absolute bottom-16 left-4">
                  <div className="flex items-center gap-1.5 text-white/70 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    {event.viewers} registered
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base mb-0.5">{event.title}</h3>
                <p className="text-white/60 text-xs mb-3">{event.subtitle}</p>
                <div
                  className="w-full py-2.5 rounded-xl text-white text-sm font-semibold text-center transition-all hover:opacity-90"
                  style={{ background: event.badgeColor }}
                >
                  Join Event →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
