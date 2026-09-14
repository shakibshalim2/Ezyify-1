import { Shield, Lock, CheckCircle2, Award, RefreshCw, Zap, Users, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';

interface TrustSignalsProps {
  variant?: 'full' | 'compact' | 'minimal';
  context?: 'checkout' | 'product' | 'seller' | 'general';
  className?: string;
}

export function TrustSignals({ 
  variant = 'full', 
  context = 'general',
  className = '' 
}: TrustSignalsProps) {
  
  // Contextual trust signals
  const getContextualSignals = () => {
    switch (context) {
      case 'checkout':
        return [
          {
            icon: Shield,
            label: 'Escrow Protected',
            description: 'Money held safely until delivery confirmed',
            color: 'text-success'
          },
          {
            icon: Lock,
            label: '256-bit SSL Encryption',
            description: 'Your payment info is secure',
            color: 'text-info'
          },
          {
            icon: RefreshCw,
            label: 'Easy Returns',
            description: '7-day return policy on most items',
            color: 'text-primary'
          },
          {
            icon: CheckCircle2,
            label: 'Buyer Protection',
            description: 'Full refund if item not as described',
            color: 'text-success'
          }
        ];
      
      case 'product':
        return [
          {
            icon: CheckCircle2,
            label: 'Authenticity Guaranteed',
            description: 'Verified genuine products only',
            color: 'text-success'
          },
          {
            icon: Shield,
            label: 'Quality Checked',
            description: 'Inspected before shipping',
            color: 'text-info'
          },
          {
            icon: RefreshCw,
            label: 'Free Returns',
            description: 'Return within 7 days',
            color: 'text-primary'
          }
        ];
      
      case 'seller':
        return [
          {
            icon: Award,
            label: 'Verified Seller',
            description: 'KYC verified & trusted',
            color: 'text-info'
          },
          {
            icon: Users,
            label: '10k+ Happy Customers',
            description: '4.8 star average rating',
            color: 'text-success'
          },
          {
            icon: Zap,
            label: 'Fast Shipping',
            description: 'Ships within 24 hours',
            color: 'text-warning'
          }
        ];
      
      default:
        return [
          {
            icon: Shield,
            label: 'Secure Platform',
            description: 'Trusted by millions',
            color: 'text-success'
          },
          {
            icon: Lock,
            label: 'Data Protected',
            description: 'Your privacy matters',
            color: 'text-info'
          }
        ];
    }
  };

  const signals = getContextualSignals();

  if (variant === 'minimal') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {signals.slice(0, 3).map((signal, index) => {
          const Icon = signal.icon;
          return (
            <Badge key={index} variant="secondary" className="gap-1.5">
              <Icon className={`w-3 h-3 ${signal.color}`} />
              {signal.label}
            </Badge>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        {signals.map((signal, index) => {
          const Icon = signal.icon;
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className={`p-1.5 rounded-full bg-muted ${signal.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-xs">{signal.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {signals.map((signal, index) => {
        const Icon = signal.icon;
        return (
          <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
            <div className={`p-2 rounded-full bg-background ${signal.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-0.5">{signal.label}</h4>
              <p className="text-xs text-muted-foreground">{signal.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Security Badges Component
export function SecurityBadges({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>SSL Secured</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-4 h-4" />
        <span>PCI DSS</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="w-4 h-4" />
        <span>Verified by Visa</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Mastercard SecureCode</span>
      </div>
    </div>
  );
}

// Money-back Guarantee Badge
export function MoneyBackGuarantee({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 bg-success/5 border border-success/30 rounded-full ${className}`}>
      <Shield className="w-5 h-5 text-success" />
      <div className="text-left">
        <p className="text-sm font-bold text-success">100% Money-Back Guarantee</p>
        <p className="text-xs text-success">Full refund if not satisfied</p>
      </div>
    </div>
  );
}

// Escrow Protection Badge
export function EscrowProtectionBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-info/5 border border-info/30 rounded-full ${className}`}>
      <Shield className="w-4 h-4 text-info" />
      <span className="text-sm font-medium text-info">
        Escrow Protected
      </span>
    </div>
  );
}

// Secure Payment Badge
export function SecurePaymentBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-background/30 border border-border rounded-full ${className}`}>
      <Lock className="w-4 h-4 text-foreground dark:text-muted-foreground" />
      <span className="text-sm font-medium text-foreground dark:text-foreground">
        Secure Payment
      </span>
    </div>
  );
}
