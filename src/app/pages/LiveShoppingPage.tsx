import { SEO } from '../components/SEO';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { toast } from 'sonner';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Send, 
  Users, 
  Eye,
  X,
  Plus,
  Minus,
  Tag,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useParams, Link } from 'react-router';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  quantity: number;
}

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
}

// SKELETON FOR INSTANT UI - CRITICAL FOR LIVE SHOPPING
function LiveShoppingSkeleton() {
  return (<div className="h-screen bg-black flex flex-col lg:flex-row">
      {/* Main Video Skeleton */}
      <div className="flex-1 relative flex flex-col">
        <div className="flex-1 relative bg-gradient-to-br from-primary/10 via-primary/5 to-card">
          {/* Live Badge Skeleton */}
          <div className="absolute top-4 left-4 z-10">
            <Skeleton className="h-8 w-20 bg-white/10" />
          </div>
          
          {/* Stats Skeleton */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <Skeleton className="h-10 w-24 rounded-full bg-white/10" />
            <Skeleton className="h-10 w-24 rounded-full bg-white/10" />
          </div>
          
          {/* Host Info Skeleton */}
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-white/20" />
                  <Skeleton className="h-3 w-24 bg-white/20" />
                </div>
                <Skeleton className="h-8 w-20 bg-white/20" />
              </div>
              <Skeleton className="h-5 w-48 bg-white/20" />
            </div>
          </div>
          
          {/* Video Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4 bg-white/10" />
              <Skeleton className="h-6 w-48 mx-auto mb-2 bg-white/10" />
              <Skeleton className="h-4 w-64 mx-auto bg-white/10" />
            </div>
          </div>
        </div>
        
        {/* Action Buttons Skeleton (Mobile) */}
        <div className="lg:hidden flex items-center justify-around p-4 bg-black border-t border-white/10">
          <Skeleton className="h-10 w-10 rounded bg-white/10" />
          <Skeleton className="h-10 w-10 rounded bg-white/10" />
          <Skeleton className="h-10 w-24 rounded bg-white/10" />
        </div>
      </div>
      
      {/* Sidebar Skeleton */}
      <div className="w-full lg:w-96 bg-black border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col max-h-[40vh] lg:max-h-none">
        {/* Chat Header Skeleton */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 bg-white/20" />
            <Skeleton className="h-6 w-20 bg-white/20" />
          </div>
        </div>
        
        {/* Messages Skeleton */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0 bg-white/10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24 bg-white/10" />
                <Skeleton className="h-4 w-full bg-white/10" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Input Skeleton */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-10 bg-white/10" />
            <Skeleton className="h-10 w-10 bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveShoppingPage() {
  const { id } = useParams();
  
  // ALL HOOKS AT TOP LEVEL - SKELETON-FIRST PATTERN
  const [isLoading, setIsLoading] = useState(true);
  const [showProductOverlay, setShowProductOverlay] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Progressive data loading
  useEffect(() => {
    const loadLiveData = () => {
      // Simulate loading live session data
      setComments([
        {
          id: '1',
          user: { name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
          text: 'This looks amazing! 😍',
          timestamp: '2m ago'
        },
        {
          id: '2',
          user: { name: 'Mike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
          text: 'What is the material?',
          timestamp: '1m ago'
        },
        {
          id: '3',
          user: { name: 'Emma', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
          text: 'Added to cart! 🛒',
          timestamp: '30s ago'
        }
      ]);
      
      setIsLoading(false);
    };

    // Use requestIdleCallback for non-blocking load
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadLiveData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      setTimeout(loadLiveData, 16);
    }
  }, []);
  
  // Show skeleton while loading
  if (isLoading) {
    return <LiveShoppingSkeleton />;
  }

  const liveSession = {
    id: id || 'live1',
    title: 'Flash Sale: Premium Wireless Headphones 🎧',
    host: {
      name: 'TechStore Official',
      username: 'techstore',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      verified: true
    },
    viewers: 2847,
    likes: 1205,
    startedAt: '45 minutes ago',
    videoUrl: 'https://example.com/live-stream'
  };

  const featuredProducts: Product[] = [
    {
      id: 'p1',
      name: 'Wireless Bluetooth Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      price: 79.99,
      originalPrice: 149.99,
      discount: 47,
      inStock: true,
      quantity: 45
    },
    {
      id: 'p2',
      name: 'Premium Phone Case',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400',
      price: 24.99,
      originalPrice: 39.99,
      discount: 38,
      inStock: true,
      quantity: 120
    },
    {
      id: 'p3',
      name: 'USB-C Fast Charger',
      image: 'https://images.unsplash.com/photo-1591290619762-5af4fb3ebac7?w=400',
      price: 34.99,
      originalPrice: 59.99,
      discount: 42,
      inStock: true,
      quantity: 78
    }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      user: {
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
      },
      text: message,
      timestamp: 'Just now'
    };
    
    setComments([...comments, newComment]);
    setMessage('');
  };

  const handleQuickBuy = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    toast.success(`Added ${quantity}x ${selectedProduct?.name} to cart`);
    setSelectedProduct(null);
    setQuantity(1);
  };

  return (
    <div className="h-screen bg-black flex flex-col lg:flex-row">
      <SEO title="Live Shopping — Ezyify" description="Watch live shopping events, interact with sellers, and grab exclusive real-time deals on Ezyify." />
      {/* Main Video Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Live Video Placeholder */}
        <div className="flex-1 relative bg-gradient-to-br from-[#0d0f1a] via-[#111430] to-[#0f1225]">
          {/* Live Badge */}
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-error text-white px-3 py-1.5 text-xs font-bold live-badge">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              LIVE
            </Badge>
          </div>

          {/* Stats Overlay */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">{liveSession.viewers.toLocaleString()}</span>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">{liveSession.likes.toLocaleString()}</span>
            </div>
          </div>

          {/* Host Info Overlay */}
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <img
                      loading="lazy" 
                  src={liveSession.host.avatar} 
                  alt={liveSession.host.name} 
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{liveSession.host.name}</h3>
                    {liveSession.host.verified && <VerifiedBadge variant="seller" size="sm" />}
                  </div>
                  <p className="text-white/80 text-sm">@{liveSession.host.username}</p>
                </div>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-brand hover:shadow-brand-lg transition-all"
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  <Heart className="w-3.5 h-3.5" />
                  Follow
                </button>
              </div>
              <h2 className="text-white font-semibold text-lg">{liveSession.title}</h2>
            </div>
          </div>

          {/* Floating Product Cards */}
          {showProductOverlay && (
            <div className="absolute bottom-32 left-4 right-4 lg:right-auto lg:max-w-sm z-10 animate-slide-in-left">
              <Card className="bg-black/70 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">Featured Products</h3>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-white h-6 w-6 p-0"
                      onClick={() => setShowProductOverlay(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {featuredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="flex gap-3 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => handleQuickBuy(product)}
                      >
                        <img
                      loading="lazy" 
                          src={product.image} 
                          alt={product.name} 
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium mb-1 line-clamp-1">{product.name}</h4>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold text-sm">₹{product.price}</span>
                            {product.originalPrice && (
                              <>
                                <span className="text-white/50 line-through text-xs">₹{product.originalPrice}</span>
                                {product.discount && (
                                  <Badge className="bg-error text-error-foreground text-xs px-1.5 py-0">
                                    {product.discount}% OFF
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-success text-white text-xs px-1.5 py-0">
                              {product.quantity} left
                            </Badge>
                            <Button 
                              size="sm" 
                              className="h-6 text-xs bg-primary/10 hover:bg-primary/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickBuy(product);
                              }}
                            >
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Buy
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Show Products Button (when overlay is hidden) */}
          {!showProductOverlay && (
            <button
              onClick={() => setShowProductOverlay(true)}
              className="absolute bottom-32 left-4 z-10 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-brand"
            >
              <Tag className="w-4 h-4" />
              Show Products
            </button>
          )}

          {/* Video Placeholder Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12" />
              </div>
              <p className="text-lg font-semibold">Live Shopping Stream</p>
              <p className="text-sm text-white/70">Video stream would appear here</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Mobile) */}
        <div className="lg:hidden flex items-center justify-around p-4 bg-black border-t border-white/10">
          <Button size="sm" variant="ghost" className="text-white">
            <Heart className="w-5 h-5" />
          </Button>
          <Button size="sm" variant="ghost" className="text-white">
            <Share2 className="w-5 h-5" />
          </Button>
          <Link to="/cart">
            <Button size="sm" className="bg-primary/10 hover:bg-primary/10">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
            </Button>
          </Link>
        </div>
      </div>

      {/* Sidebar - Chat & Products */}
      <div className="w-full lg:w-96 bg-black border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col max-h-[40vh] lg:max-h-none">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Live Chat</h3>
            <Badge className="bg-white/10 text-white">
              {comments.length} messages
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <img
                      loading="lazy" 
                src={comment.user.avatar} 
                alt={comment.user.name} 
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-medium text-sm">{comment.user.name}</span>
                  <span className="text-white/50 text-xs">{comment.timestamp}</span>
                </div>
                <p className="text-white/90 text-sm break-words">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              placeholder="Say something..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button 
              size="icon" 
              className="bg-primary/10 hover:bg-primary/10 flex-shrink-0"
              onClick={handleSendMessage}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Buy Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Quick Buy</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="flex gap-4">
                <img
                      loading="lazy" 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">{selectedProduct.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-primary">₹{selectedProduct.price}</span>
                    {selectedProduct.originalPrice && (
                      <>
                        <span className="text-muted-foreground line-through">₹{selectedProduct.originalPrice}</span>
                        {selectedProduct.discount && (
                          <Badge className="bg-error text-error-foreground">
                            {selectedProduct.discount}% OFF
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <Badge className="bg-success/10 text-success">
                    Only {selectedProduct.quantity} left!
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-2xl font-bold text-foreground w-12 text-center">{quantity}</span>
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => setQuantity(Math.min(selectedProduct.quantity, quantity + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-info/8 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">₹{(selectedProduct.price * quantity).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-success">
                  <span>You save</span>
                  <span className="font-semibold">
                    ₹{selectedProduct.originalPrice ? ((selectedProduct.originalPrice - selectedProduct.price) * quantity).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedProduct(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddToCart}
              className="w-full sm:w-auto bg-primary/10 hover:bg-primary/10"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Link to="/checkout" className="w-full sm:w-auto">
              <Button 
                className="w-full bg-success hover:bg-success/90"
              >
                Buy Now
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}