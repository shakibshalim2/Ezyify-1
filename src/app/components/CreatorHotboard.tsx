import { Link } from 'react-router';
import { TrendingUp, Crown, Flame, Eye, Heart, Users } from 'lucide-react';

const creators = [
  {
    rank: 1,
    name: '@fashionista_bd',
    category: 'Fashion & Lifestyle',
    followers: '2.3M',
    todayViews: '5.8M',
    loops: '234',
    image: 'https://images.unsplash.com/photo-1553816078-25e0948140f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjM2NDU5NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    growth: '+25%',
    badge: 'Top Creator',
    gradient: 'from-yellow-600 to-orange-600',
    path: '/profile/fashionista_bd',
  },
  {
    rank: 2,
    name: '@tech_guru_official',
    category: 'Tech Reviews',
    followers: '1.8M',
    todayViews: '4.2M',
    loops: '189',
    image: 'https://images.unsplash.com/photo-1758264364350-f569dbf6bdc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHRlY2hub2xvZ3klMjBwaG9uZXxlbnwxfHx8fDE3NjM3MDg0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    growth: '+32%',
    badge: 'Rising Star',
    gradient: 'from-blue-600 to-cyan-600',
    path: '/profile/tech_guru_official',
  },
  {
    rank: 3,
    name: '@beauty_queen',
    category: 'Beauty & Makeup',
    followers: '1.5M',
    todayViews: '3.9M',
    loops: '312',
    image: 'https://images.unsplash.com/photo-1718972771654-47be8f36e0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBtYWtldXAlMjBjb3NtZXRpY3N8ZW58MXx8fHwxNzYzNjM1NTUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    growth: '+18%',
    badge: 'Hot Trending',
    gradient: 'from-pink-600 to-rose-600',
    path: '/profile/beauty_queen',
  },
  {
    rank: 4,
    name: '@lifestyle_vlog',
    category: 'Lifestyle',
    followers: '1.2M',
    todayViews: '2.8M',
    loops: '156',
    image: 'https://images.unsplash.com/photo-1753161020548-941a7ae21cb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlb3BsZSUyMHNob3BwaW5nfGVufDF8fHx8MTc2MzcwODQ5NHww&ixlib=rb-4.1.0&q=80&w=1080',
    growth: '+28%',
    badge: 'Top 10',
    gradient: 'from-indigo-600 to-violet-600',
    path: '/profile/lifestyle_vlog',
  },
  {
    rank: 5,
    name: '@home_stylist',
    category: 'Home Decor',
    followers: '980K',
    todayViews: '2.1M',
    loops: '98',
    image: 'https://images.unsplash.com/photo-1615402052294-a376393da320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBmdXJuaXR1cmUlMjBob21lfGVufDF8fHx8MTc2MzY0OTkyNHww&ixlib=rb-4.1.0&q=80&w=1080',
    growth: '+41%',
    badge: 'Fastest Growing',
    gradient: 'from-green-600 to-emerald-600',
    path: '/profile/home_stylist',
  },
];

export function CreatorHotboard() {
  return (
    <div className="px-4 py-12 bg-gradient-to-b from-transparent via-orange-950/20 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-lg">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-white">Creator Hotboard</h2>
          </div>
          <p className="text-white/55 text-lg">Top trending creators today · Updated in real-time</p>
        </div>

        <div className="space-y-3">
          {creators.map((creator, idx) => (
            <Link
              key={creator.rank}
              to={creator.path}
              className={`group relative flex overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border transition-all duration-200 hover:bg-white/8 hover:scale-[1.015] hover:shadow-xl ${
                idx === 0
                  ? 'border-2 border-yellow-500/40 shadow-lg shadow-yellow-500/10'
                  : 'border border-white/10 hover:border-white/20'
              }`}
            >
              <div className="relative p-5 md:p-6 flex items-center gap-5 w-full">
                {/* Rank badge */}
                <div className="shrink-0">
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-2xl ${
                      idx === 0
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30'
                        : 'bg-white/8'
                    }`}
                  >
                    {idx === 0
                      ? <Crown className="w-7 h-7 text-white" />
                      : <span className="text-white/80 text-xl font-bold">#{creator.rank}</span>
                    }
                  </div>
                </div>

                {/* Profile image */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/15">
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  {idx === 0 && (
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                      <Crown className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <h3 className="text-white font-semibold text-base truncate">{creator.name}</h3>
                    <span className={`px-2.5 py-0.5 bg-gradient-to-r ${creator.gradient} rounded-full text-white text-xs font-semibold shrink-0`}>
                      {creator.badge}
                    </span>
                  </div>
                  <p className="text-white/55 text-sm mb-3">{creator.category}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Users, color: 'text-purple-400', label: 'Followers', value: creator.followers },
                      { icon: Eye, color: 'text-info', label: "Today's Views", value: creator.todayViews },
                      { icon: Heart, color: 'text-like', label: 'Loops', value: creator.loops },
                      { icon: TrendingUp, color: 'text-success', label: 'Growth', value: creator.growth },
                    ].map(({ icon: Icon, color, label, value }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                        <div>
                          <p className="text-white/40 text-[10px] leading-none mb-0.5">{label}</p>
                          <p className={`text-sm font-semibold ${value.startsWith('+') ? 'text-success' : 'text-white'}`}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop follow CTA */}
                <div className="shrink-0 hidden lg:block">
                  <span
                    className={`inline-flex items-center px-5 py-2.5 bg-gradient-to-r ${creator.gradient} text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all group-hover:scale-105`}
                    onClick={(e) => e.preventDefault()}
                  >
                    Follow
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all hover:scale-105"
          >
            <Flame className="w-4 h-4" />
            View Full Creator Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
