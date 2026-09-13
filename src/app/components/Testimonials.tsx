import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    type: 'Creator',
    typeBadge: 'bg-primary/20 text-primary border-primary/20',
    name: 'Sarah Ahmed',
    handle: '@fashionista_bd',
    image: 'https://images.unsplash.com/photo-1553816078-25e0948140f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjM2NDU5NDV8MA&ixlib=rb-4.1.0&q=80&w=400',
    quote: 'Ezyify transformed my content creation journey. I went from 10K to 2.3M followers in just 6 months!',
    rating: 5,
  },
  {
    type: 'Seller',
    typeBadge: 'bg-success/20 text-success border-success/20',
    name: 'Karim Hassan',
    handle: 'TechZone BD',
    image: 'https://images.unsplash.com/photo-1758264364350-f569dbf6bdc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHRlY2hub2xvZ3klMjBwaG9uZXxlbnwxfHx8fDE3NjM3MDg0OTN8MA&ixlib=rb-4.1.0&q=80&w=400',
    quote: 'Best platform for selling electronics. The AI recommendations bring me 10x more customers than other marketplaces.',
    rating: 5,
  },
  {
    type: 'Buyer',
    typeBadge: 'bg-info/20 text-info border-info/20',
    name: 'Nadia Rahman',
    handle: 'Happy Customer',
    image: 'https://images.unsplash.com/photo-1718972771654-47be8f36e0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBtYWtldXAlMjBjb3NtZXRpY3N8ZW58MXx8fHwxNzYzNjM1NTUxfDA&ixlib=rb-4.1.0&q=80&w=400',
    quote: 'Shopping here is addictive! The loops are entertaining and I discover amazing products every day. Love the AR try-on!',
    rating: 5,
  },
  {
    type: 'Partner',
    typeBadge: 'bg-warning/20 text-warning border-warning/20',
    name: 'Rakib Islam',
    handle: 'Ezyify Delivery',
    image: 'https://images.unsplash.com/photo-1753161020548-941a7ae21cb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlb3BsZSUyMHNob3BwaW5nfGVufDF8fHx8MTc2MzcwODQ5NHww&ixlib=rb-4.1.0&q=80&w=400',
    quote: 'Great earnings and flexible schedule. The app makes deliveries super easy with smart routing.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <div className="px-4 py-14">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-white mb-3">Loved by Millions Worldwide</h2>
          <p className="text-white/55 text-lg max-w-lg mx-auto">
            Real stories from creators, sellers, buyers, and partners across the globe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all duration-200 hover:scale-[1.02] p-6"
            >
              {/* Large decorative quote mark */}
              <div className="absolute top-5 right-5 opacity-[0.07] pointer-events-none">
                <Quote className="w-14 h-14 text-white" />
              </div>

              {/* Profile */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/15 shrink-0">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{t.name}</p>
                  <p className="text-white/50 text-xs truncate">{t.handle}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${t.typeBadge}`}>
                    {t.type}
                  </span>
                </div>
              </div>

              {/* Quote */}
              <p className="text-white/75 text-sm leading-relaxed flex-1 mb-5 relative z-10">
                "{t.quote}"
              </p>

              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
