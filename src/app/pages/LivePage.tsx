import { toast } from 'sonner';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { 
  Users, Gift, Heart, Share2, DollarSign, Send, X, ShoppingBag,
  VolumeX, Volume2, TrendingUp, ChevronRight, MessageCircle, Star, Zap
} from 'lucide-react';
import { mockProducts } from '../data/enhanced-mock-data';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { SEO, SEOConfigs } from '../components/SEO';

function LiveSkeleton() {
  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-muted/20 animate-pulse" />
        <div className="absolute top-4 left-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 bg-white/20 rounded animate-pulse" />
            <div className="h-2.5 w-20 bg-white/15 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-80 flex-col bg-card border-l border-border">
        <div className="p-4 border-b border-border">
          <div className="h-5 w-24 bg-muted/40 rounded animate-pulse" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/40 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 bg-muted/40 rounded animate-pulse" />
                <div className="h-2.5 w-full bg-muted/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LivePage() {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [message, setMessage] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [viewers, setViewers] = useState(2847);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'viewers'>('chat');
  // These must be declared before any conditional return (Rules of Hooks)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Sarah123', avatar: 'https://images.unsplash.com/photo-1716827172706-9f4c36b039eb?w=50', message: 'Love this jacket! 😍', isSystem: false },
    { id: 2, user: 'Mike_Chen', avatar: 'https://images.unsplash.com/photo-1752859951149-7d3fc700a7ec?w=50', message: 'Does it come in blue?', isSystem: false },
    { id: 3, user: 'System', message: '🎉 Emma_W just purchased Premium Cotton T-Shirt!', isSystem: true },
    { id: 4, user: 'FashionLover', avatar: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=50', message: 'Added to cart! 🛍️', isSystem: false },
    { id: 5, user: 'System', message: '💰 Flash Sale: 60% OFF for next 5 minutes!', isSystem: true },
    { id: 6, user: 'Alex_K', avatar: 'https://images.unsplash.com/photo-1615843636565-5cc1a4d187e7?w=50', message: 'Show the bag again please', isSystem: false },
    { id: 7, user: 'Julia_M', avatar: 'https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?w=50', message: 'This stream is amazing! 🔥', isSystem: false },
    { id: 8, user: 'System', message: '🎁 David_L sent 5 gifts!', isSystem: true },
  ]);
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => setIsLoading(false), { timeout: 200 });
      return () => cancelIdleCallback(handle);
    } else {
      const t = setTimeout(() => setIsLoading(false), 50);
      return () => clearTimeout(t);
    }
  }, []);

  // Simulate live viewer count fluctuation
  useEffect(() => {
    const tick = setInterval(() => {
      setViewers(v => Math.max(100, v + Math.floor(Math.random() * 21) - 10));
    }, 4000);
    return () => clearInterval(tick);
  }, []);

  if (isLoading) return <LiveSkeleton />;

  // Mock live stream data
  const currentLive = {
    title: 'Fashion Haul 2026 - New Arrivals! 🔥',
    creator: 'StyleMaven',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    startedAt: '45 min ago',
    viewers: viewers,
    likes: 12453,
    totalSales: 234,
    revenue: 124.50,
    featuredProducts: mockProducts.filter(p => p.category === 'Fashion').slice(0, 5)
  };

  // (chatMessages state declared above, before the early return)

  const sendMessage = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        user: 'You',
        avatar: 'https://images.unsplash.com/photo-1758521541720-1809f58388c2?w=50',
        message: message,
        isSystem: false
      }]);
      setMessage('');
    }
  };

  const sendLike = () => {
    setIsLiked(true);
    setTimeout(() => setIsLiked(false), 1000);
  };

  // (selectedProduct state declared above, before the early return)

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      <SEO {...SEOConfigs.live} />
      <div className="h-full flex flex-col lg:flex-row">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Live Video */}
          <div className="absolute inset-0">
            <img loading="lazy" 
              src={currentLive.thumbnail} 
              alt={currentLive.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
          </div>

          {/* Top Bar */}
          <div className="relative z-10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Creator Info */}
              <Link 
                to={`/profile/${currentLive.creator}`}
                className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full pr-4 hover:bg-black/60 transition-colors"
              >
                <img loading="lazy" 
                  src={currentLive.avatar} 
                  alt={currentLive.creator}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                <div className="text-white">
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm">{currentLive.creator}</p>
                    <VerifiedBadge variant="seller" size="sm" />
                  </div>
                  <p className="text-xs opacity-80">100K followers</p>
                </div>
              </Link>

              {/* Live Badge */}
              <div className="flex items-center gap-1.5 bg-error text-white px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full live-badge" />
                <span className="text-xs font-bold tracking-wide">LIVE</span>
              </div>

              {/* Viewers */}
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full">
                <Users className="w-4 h-4" />
                <span className="text-sm">{currentLive.viewers.toLocaleString()}</span>
              </div>

              {/* Duration */}
              <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
                {currentLive.startedAt}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <Link 
                to="/"
                className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Stream Info */}
          <div className="absolute bottom-0 left-0 right-0 lg:right-80 xl:right-96 p-4 z-10">
            <div className="mb-4">
              <h2 className="text-white text-xl mb-2">{currentLive.title}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="brand">Fashion</Badge>
                <Badge variant="outline" className="text-white border-white">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {currentLive.totalSales} sold
                </Badge>
                <Badge variant="outline" className="text-white border-white">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ${currentLive.revenue.toLocaleString()}
                </Badge>
              </div>
            </div>

            {/* Featured Products Carousel */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Featured Products ({currentLive.featuredProducts.length})
                </p>
                <Link 
                  to="/shop"
                  className="text-white text-sm hover:underline flex items-center gap-1"
                >
                  See All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {currentLive.featuredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="flex-shrink-0 w-32 bg-card/90 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-card transition-colors border border-border"
                  >
                    <div className="aspect-square relative">
                      {product.badge && (
                        <Badge className="absolute top-1 left-1 text-xs bg-error text-error-foreground z-10">
                          {product.badge}
                        </Badge>
                      )}
                      <img loading="lazy" 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs line-clamp-1 text-foreground">{product.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-medium text-foreground">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Chat Preview (Hidden on Desktop) */}
            <div className="lg:hidden bg-black/50 backdrop-blur-sm rounded-2xl p-3 max-h-32 overflow-hidden">
              {chatMessages.slice(-3).map(msg => (
                <div key={msg.id} className="text-white text-sm mb-1">
                  {msg.isSystem ? (
                    <span className="text-warning">{msg.message}</span>
                  ) : (
                    <>
                      <span className="font-medium">{msg.user}: </span>
                      <span className="opacity-90">{msg.message}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Floating Like Animation */}
          {isLiked && (
            <div className="absolute bottom-24 right-4 lg:right-80 xl:right-96 z-20 animate-ping">
              <Heart className="w-12 h-12 text-like fill-like" />
            </div>
          )}
        </div>

        {/* Right Sidebar - Chat & Products (Desktop) */}
        <div className="hidden lg:flex lg:w-80 xl:w-96 bg-card border-l border-border flex-col">
          {/* Chat Header */}
          <div className="flex items-center border-b border-border p-4">
            <button onClick={() => setSidebarTab('chat')} className={`flex-1 flex items-center justify-center gap-2 py-2 border-b-2 transition-colors ${sidebarTab === 'chat' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">Live Chat</span>
            </button>
            <button onClick={() => setSidebarTab('viewers')} className={`flex-1 flex items-center justify-center gap-2 py-2 border-b-2 transition-colors ${sidebarTab === 'viewers' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <Users className="w-4 h-4" />
              <span className="font-medium">{viewers.toLocaleString()}</span>
            </button>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`${msg.isSystem ? 'text-center' : ''}`}>
                  {msg.isSystem ? (
                    <div className="bg-muted border border-border rounded-xl px-3 py-2">
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <img loading="lazy" 
                        src={msg.avatar} 
                        alt={msg.user}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{msg.user}</p>
                        <p className="text-sm text-foreground break-words">{msg.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Say something..."
                className="flex-1 px-3.5 py-2 bg-input-background text-foreground border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground transition-all"
              />
              <button
                onClick={sendMessage}
                aria-label="Send message"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-brand transition-all hover:shadow-brand-lg hover:scale-105 active:scale-95 shrink-0"
                style={{ background: 'var(--brand-gradient)' }}
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={sendLike}
                aria-label="Send like"
                className="w-8 h-8 rounded-full bg-like/10 text-like flex items-center justify-center hover:bg-like/20 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Heart className="w-4 h-4" />
              </button>
              <button aria-label="Send gift" onClick={() => toast.success('Gift sent! 🎁')} className="w-8 h-8 rounded-full bg-warning/10 text-warning flex items-center justify-center hover:bg-warning/20 transition-all hover:scale-105 shrink-0">
                <Gift className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-3 z-20 pb-safe">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Say something..."
            className="flex-1 px-3.5 py-2 bg-input-background text-foreground border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground transition-all"
          />
          <button
            onClick={sendMessage}
            aria-label="Send message"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-brand shrink-0"
            style={{ background: 'var(--brand-gradient)' }}
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={sendLike}
            aria-label="Send like"
            className="w-9 h-9 rounded-full bg-like/10 text-like flex items-center justify-center hover:bg-like/20 transition-colors shrink-0"
          >
            <Heart className="w-5 h-5" />
          </button>
          <button aria-label="Send gift" onClick={() => toast.success('Gift sent! 🎁')} className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/15 transition-colors shrink-0">
            <Gift className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end lg:items-center justify-center p-4">
          <div className="bg-card rounded-t-2xl lg:rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h3 className="text-lg text-foreground">Product Details</h3>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            
            <div className="p-4">
              <img loading="lazy" 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                className="w-full aspect-square object-cover rounded-xl mb-4"
              />
              
              <div className="mb-4">
                {selectedProduct.badge && (
                  <Badge className="bg-error text-error-foreground mb-2">{selectedProduct.badge}</Badge>
                )}
                <h2 className="text-2xl text-foreground mb-2">{selectedProduct.name}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-foreground">{selectedProduct.rating}</span>
                  <span className="text-muted-foreground">({selectedProduct.reviews} reviews)</span>
                </div>
                
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl text-foreground">${selectedProduct.price}</span>
                  {selectedProduct.originalPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">${selectedProduct.originalPrice}</span>
                      <Badge className="bg-error text-error-foreground">
                        {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const cart = (() => { try { return JSON.parse(localStorage.getItem('ezyify_cart') || '[]'); } catch { return []; } })();
                    const existing = cart.find((i: any) => i.id === selectedProduct!.id);
                    if (existing) { existing.quantity += 1; } else { cart.push({ id: selectedProduct!.id, quantity: 1 }); }
                    localStorage.setItem('ezyify_cart', JSON.stringify(cart));
                    window.dispatchEvent(new Event('cartUpdated'));
                    toast.success('Added to cart!');
                    setSelectedProduct(null);
                  }}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  className="flex-1 text-white" style={{ background: "var(--brand-gradient)" }}
                  onClick={() => {
                    const cart = (() => { try { return JSON.parse(localStorage.getItem('ezyify_cart') || '[]'); } catch { return []; } })();
                    const existing = cart.find((i: any) => i.id === selectedProduct!.id);
                    if (existing) { existing.quantity += 1; } else { cart.push({ id: selectedProduct!.id, quantity: 1 }); }
                    localStorage.setItem('ezyify_cart', JSON.stringify(cart));
                    window.dispatchEvent(new Event('cartUpdated'));
                    setSelectedProduct(null);
                    navigate('/checkout');
                  }}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}