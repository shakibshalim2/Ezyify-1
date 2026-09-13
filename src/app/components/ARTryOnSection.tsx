import { Link } from 'react-router';
import { Glasses, Sparkles, ShoppingBag, Sofa, Zap } from 'lucide-react';

const categories = [
  {
    icon: Glasses,
    title: 'Glasses',
    description: 'Virtual try-on for eyewear',
    image: 'https://images.unsplash.com/photo-1553816078-25e0948140f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjM2NDU5NDV8MA&ixlib=rb-4.1.0&q=80&w=600',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    icon: Sparkles,
    title: 'Makeup',
    description: 'Try different makeup looks',
    image: 'https://images.unsplash.com/photo-1718972771654-47be8f36e0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBtYWtldXAlMjBjb3NtZXRpY3N8ZW58MXx8fHwxNzYzNjM1NTUxfDA&ixlib=rb-4.1.0&q=80&w=600',
    gradient: 'from-pink-600 to-rose-600',
  },
  {
    icon: ShoppingBag,
    title: 'Fashion',
    description: 'See clothes on your body',
    image: 'https://images.unsplash.com/photo-1553816078-25e0948140f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjM2NDU5NDV8MA&ixlib=rb-4.1.0&q=80&w=600',
    gradient: 'from-indigo-600 to-purple-600',
  },
  {
    icon: Sofa,
    title: 'Furniture',
    description: 'Visualize in your space',
    image: 'https://images.unsplash.com/photo-1615402052294-a376393da320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBmdXJuaXR1cmUlMjBob21lfGVufDF8fHx8MTc2MzY0OTkyNHww&ixlib=rb-4.1.0&q=80&w=600',
    gradient: 'from-orange-600 to-red-600',
  },
];

export function ARTryOnSection() {
  return (
    <div className="px-4 py-14 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5 text-sm font-semibold text-white" style={{ background: 'var(--brand-gradient)' }}>
            <Zap className="w-3.5 h-3.5" />
            World's First AR Try-On Zone
          </div>
          <h2 className="text-white mb-4">Try Before You Buy</h2>
          <p className="text-white/55 text-lg max-w-xl mx-auto">
            Experience products in augmented reality before making a purchase decision
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((category) => (
            <Link
              key={category.title}
              to="/shop"
              className="group relative overflow-hidden rounded-3xl border border-white/10 hover:border-white/22 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="relative h-80 overflow-hidden bg-white/5">
                <img
                  src={category.image}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* AR badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 rounded-full text-white text-xs font-semibold" style={{ background: 'var(--brand-gradient)' }}>
                    AR Ready
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className={`inline-flex p-2.5 bg-gradient-to-br ${category.gradient} rounded-2xl mb-3 shadow-lg`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-1">{category.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{category.description}</p>
                  <div className={`w-full py-2.5 bg-gradient-to-r ${category.gradient} text-white text-sm font-semibold rounded-xl text-center group-hover:opacity-90 transition-opacity`}>
                    Try Now in AR →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/45 text-sm mb-5">Experience the future of shopping with AI-powered AR technology</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold rounded-full hover:shadow-brand-lg transition-all hover:scale-[1.03]"
            style={{ background: 'var(--brand-gradient)' }}
          >
            <Sparkles className="w-4 h-4" />
            Explore All AR Features
          </Link>
        </div>
      </div>
    </div>
  );
}
