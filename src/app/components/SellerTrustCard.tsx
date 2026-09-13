import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  Star,
  MessageCircle,
  Truck,
  Package,
  Calendar,
  ShieldCheck,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  Store,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { Separator } from './ui/separator';

export interface SellerMetrics {
  rating: number;
  reviewCount: number;
  responseRate: number;
  responseTime: string; // e.g., "2 hours"
  avgDeliveryDays: number;
  deliveryOnTime: number; // percentage
  totalSales: number;
  totalOrders: number;
  repeatCustomers: number; // percentage
  memberSince: string;
  badges: {
    id: string;
    label: string;
    icon: string;
    color?: string;
  }[];
}

export interface Seller {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  metrics: SellerMetrics;
  storeName?: string;
  bio?: string;
}

interface SellerTrustCardProps {
  seller: Seller;
  onFollowStore?: () => void;
  onVisitStore?: () => void;
  variant?: 'default' | 'compact';
  showCTA?: boolean;
  isFollowing?: boolean;
}

export function SellerTrustCard({ 
  seller, 
  onFollowStore,
  onVisitStore,
  variant = 'default',
  showCTA = true,
  isFollowing = false
}: SellerTrustCardProps) {
  const { metrics } = seller;

  if (variant === 'compact') {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={seller.avatar} alt={seller.name} />
            <AvatarFallback>{seller.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold truncate">{seller.name}</h4>
              {seller.verified && <VerifiedBadge size="sm" variant="seller" />}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {metrics.rating} ({metrics.reviewCount})
              </span>
              <span>{metrics.responseRate}% response</span>
            </div>
          </div>
        </div>
        {showCTA && (
          <div className="flex gap-2">
            <Button size="sm" variant={isFollowing ? "secondary" : "outline"} className="flex-1" onClick={onFollowStore}>
              {isFollowing ? (
                <>
                  <UserCheck className="w-3 h-3 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3 mr-1" />
                  Follow
                </>
              )}
            </Button>
            <Button size="sm" className="flex-1" onClick={onVisitStore}>
              <Store className="w-3 h-3 mr-1" />
              Store
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 ring-2 ring-primary/10">
            <AvatarImage src={seller.avatar} alt={seller.name} />
            <AvatarFallback className="text-lg font-semibold">
              {seller.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{seller.name}</h3>
              {seller.verified && <VerifiedBadge variant="seller" />}
            </div>
            <p className="text-sm text-muted-foreground">@{seller.username}</p>
            {seller.storeName && (
              <p className="text-sm font-medium text-primary">{seller.storeName}</p>
            )}
          </div>
        </div>

        {/* Overall Rating */}
        <div className="text-right">
          <div className="flex items-center gap-1.5 mb-1">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            <span className="text-2xl font-bold">{metrics.rating}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.reviewCount.toLocaleString()} reviews
          </p>
        </div>
      </div>

      {/* Bio */}
      {seller.bio && (
        <p className="text-sm text-muted-foreground mb-6">{seller.bio}</p>
      )}

      {/* Trust Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Response Rate */}
        <div className="text-center p-4 bg-info/8 border border-info/20 rounded-2xl">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <MessageCircle className="w-4 h-4 text-info" />
            <span className="text-2xl font-bold text-info">{metrics.responseRate}%</span>
          </div>
          <p className="text-xs font-semibold text-foreground">Response Rate</p>
          <p className="text-xs text-muted-foreground">Avg: {metrics.responseTime}</p>
        </div>

        {/* Delivery Performance */}
        <div className="text-center p-4 bg-success/8 border border-success/20 rounded-2xl">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <Truck className="w-4 h-4 text-success" />
            <span className="text-2xl font-bold text-success">{metrics.avgDeliveryDays}</span>
          </div>
          <p className="text-xs font-semibold text-foreground">Avg Delivery</p>
          <p className="text-xs text-muted-foreground">{metrics.deliveryOnTime}% on-time</p>
        </div>

        {/* Total Sales */}
        <div className="text-center p-4 bg-primary/8 border border-primary/20 rounded-2xl">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-2xl font-bold text-primary">
              {metrics.totalSales > 1000 ? `${(metrics.totalSales / 1000).toFixed(1)}k` : metrics.totalSales}
            </span>
          </div>
          <p className="text-xs font-semibold text-foreground">Products Sold</p>
          <p className="text-xs text-muted-foreground">{metrics.totalOrders.toLocaleString()} orders</p>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="space-y-3 mb-6">
        {/* On-Time Delivery */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              On-Time Delivery
            </span>
            <span className="font-semibold">{metrics.deliveryOnTime}%</span>
          </div>
          <Progress value={metrics.deliveryOnTime} className="h-2" />
        </div>

        {/* Customer Satisfaction */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Star className="w-4 h-4" />
              Customer Satisfaction
            </span>
            <span className="font-semibold">{(metrics.rating / 5 * 100).toFixed(0)}%</span>
          </div>
          <Progress value={(metrics.rating / 5) * 100} className="h-2" />
        </div>

        {/* Repeat Customers */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Repeat Customers
            </span>
            <span className="font-semibold">{metrics.repeatCustomers}%</span>
          </div>
          <Progress value={metrics.repeatCustomers} className="h-2" />
        </div>
      </div>

      <Separator className="my-6" />

      {/* Badges */}
      {metrics.badges && metrics.badges.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Achievements
          </p>
          <div className="flex flex-wrap gap-2">
            {metrics.badges.map((badge) => (
              <Badge
                key={badge.id}
                variant="secondary"
                className="gap-1.5 py-1.5 px-3"
              >
                {badge.icon === 'shield' && <ShieldCheck className="w-3.5 h-3.5" />}
                {badge.icon === 'star' && <Star className="w-3.5 h-3.5" />}
                {badge.icon === 'award' && <Award className="w-3.5 h-3.5" />}
                {badge.icon === 'check' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Member Since */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Calendar className="w-4 h-4" />
        <span>Trusted seller since {metrics.memberSince}</span>
      </div>

      {/* Call to Action */}
      {showCTA && (
        <div className="flex gap-3">
          <Button 
            variant={isFollowing ? "secondary" : "outline"}
            className="flex-1"
            onClick={onFollowStore}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Follow Store
              </>
            )}
          </Button>
          <Button 
            className="flex-1"
            onClick={onVisitStore}
          >
            <Store className="w-4 h-4 mr-2" />
            Visit Store
          </Button>
        </div>
      )}
    </Card>
  );
}