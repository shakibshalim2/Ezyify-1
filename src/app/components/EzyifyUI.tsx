/**
 * EZYIFY PREMIUM UI COMPONENT LIBRARY
 * Reusable enterprise-grade components for consistent quality across all pages.
 * Import what you need: import { StatCard, SectionHeader, EmptyState } from '../components/EzyifyUI';
 */

import React from 'react';
import { cn } from './ui/utils';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2,
  Info, XCircle, Inbox, Search, Plus, RefreshCw, ArrowUpRight,
  Sparkles
} from 'lucide-react';

// ─── STAT CARD ─────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  accent?: 'blue' | 'purple' | 'green' | 'amber' | 'red';
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  prefix,
  suffix,
  loading = false,
  trend,
  accent = 'blue',
  className,
}: StatCardProps) {
  const accentMap = {
    blue: 'from-info/10 to-info/5 border-info/30',
    purple: 'from-primary/10 to-primary/5 border-primary/30',
    green: 'from-success/10 to-success/5 border-success/30',
    amber: 'from-warning/10 to-warning/5 border-warning/30',
    red: 'from-error/10 to-error/5 border-error/30',
  };

  const iconAccentMap = {
    blue: 'bg-info/10 text-info',
    purple: 'bg-primary/10 text-primary',
    green: 'bg-success/10 text-success',
    amber: 'bg-warning/10 text-warning',
    red: 'bg-error/10 text-error',
  };

  if (loading) {
    return (
      <div className={cn('p-5 rounded-2xl border border-border bg-card', className)}>
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  const resolvedTrend = trend ?? (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : undefined);

  return (
    <div className={cn(
      'p-5 rounded-2xl border bg-gradient-to-br bg-card hover:shadow-md transition-all duration-200 group',
      accentMap[accent],
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <div className={cn('p-2 rounded-xl', iconAccentMap[accent])}>
            {icon}
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-foreground tracking-tight mb-1.5">
        {prefix && <span className="text-lg font-semibold text-muted-foreground mr-0.5">{prefix}</span>}
        {value}
        {suffix && <span className="text-lg font-semibold text-muted-foreground ml-0.5">{suffix}</span>}
      </p>

      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-1.5">
          {change !== undefined && (
            <>
              {resolvedTrend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-success" />}
              {resolvedTrend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-error" />}
              {resolvedTrend === 'neutral' && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
              <span className={cn(
                'text-xs font-semibold',
                resolvedTrend === 'up' ? 'text-success' :
                resolvedTrend === 'down' ? 'text-error' :
                'text-muted-foreground'
              )}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </>
          )}
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SECTION HEADER ────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning';
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  badge,
  badgeVariant = 'default',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-foreground truncate">{title}</h2>
            {badge !== undefined && (
              <Badge variant={badgeVariant as any} className="shrink-0">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── EMPTY STATE ───────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'search' | 'error' | 'success';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const defaultIcons = {
    default: <Inbox className="w-10 h-10 text-muted-foreground" />,
    search: <Search className="w-10 h-10 text-muted-foreground" />,
    error: <AlertCircle className="w-10 h-10 text-error" />,
    success: <CheckCircle2 className="w-10 h-10 text-success" />,
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-4',
      className
    )}>
      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4 shadow-inset">
        {icon ?? defaultIcons[variant]}
      </div>
      <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            action.href ? (
              <a href={action.href}>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {action.label}
                </Button>
              </a>
            ) : (
              <Button size="sm" onClick={action.onClick} className="gap-2">
                <Plus className="w-4 h-4" />
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            <Button size="sm" variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ALERT BANNER ──────────────────────────────────────────────────────────

interface AlertBannerProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  className?: string;
}

const alertConfig = {
  info: {
    icon: Info,
    wrapper: 'bg-info/8 border-info/20 text-info-foreground',
    iconClass: 'text-info',
    titleClass: 'text-info',
  },
  success: {
    icon: CheckCircle2,
    wrapper: 'bg-success/8 border-success/20',
    iconClass: 'text-success',
    titleClass: 'text-success',
  },
  warning: {
    icon: AlertCircle,
    wrapper: 'bg-warning/8 border-warning/20',
    iconClass: 'text-warning',
    titleClass: 'text-warning',
  },
  error: {
    icon: XCircle,
    wrapper: 'bg-error/8 border-error/20',
    iconClass: 'text-error',
    titleClass: 'text-error',
  },
};

export function AlertBanner({ variant, title, message, action, onDismiss, className }: AlertBannerProps) {
  const config = alertConfig[variant];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex gap-3 px-4 py-3 rounded-xl border text-sm',
      config.wrapper,
      className
    )}>
      <Icon className={cn('w-4.5 h-4.5 shrink-0 mt-0.5', config.iconClass)} />
      <div className="flex-1 min-w-0">
        {title && <p className={cn('font-semibold mb-0.5', config.titleClass)}>{title}</p>}
        <p className="text-foreground/80">{message}</p>
        {action && (
          <button onClick={action.onClick} className={cn('text-xs font-semibold mt-1.5 underline', config.titleClass)}>
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── PAGE HEADER ───────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  badge?: { label: string; variant?: string };
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumbs,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-semibold text-foreground">{title}</h1>
          {badge && (
            <Badge variant={(badge.variant as any) ?? 'secondary'} className="text-xs">
              {badge.label}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0 mt-2 sm:mt-0">{action}</div>}
    </div>
  );
}

// ─── DATA TABLE WRAPPER ────────────────────────────────────────────────────

interface DataTableWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyProps?: Omit<EmptyStateProps, 'className'>;
  className?: string;
}

export function DataTableWrapper({
  children,
  loading,
  empty,
  emptyProps,
  className,
}: DataTableWrapperProps) {
  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-border overflow-hidden', className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0">
            <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (empty && emptyProps) {
    return (
      <div className={cn('rounded-2xl border border-border', className)}>
        <EmptyState {...emptyProps} />
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-border overflow-hidden shadow-xs', className)}>
      {children}
    </div>
  );
}

// ─── LOADING SPINNER ───────────────────────────────────────────────────────

export function LoadingSpinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' };
  return (
    <div className={cn(
      'rounded-full border-primary border-t-transparent animate-spin',
      sizes[size],
      className
    )} />
  );
}

export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ─── AI BADGE ──────────────────────────────────────────────────────────────

export function AIBadge({ label = 'AI Powered', className }: { label?: string; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold',
      'bg-brand-gradient text-white shadow-brand',
      className
    )}>
      <Sparkles className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── QUICK STAT ROW ────────────────────────────────────────────────────────

interface QuickStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function QuickStatRow({ stats }: { stats: QuickStatProps[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <button
          key={i}
          onClick={stat.onClick}
          className={cn(
            'flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card text-left transition-all duration-150',
            stat.onClick ? 'hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
          )}
        >
          {stat.icon && (
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
              {stat.icon}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-foreground text-lg leading-tight truncate">{stat.value}</p>
            <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── TREND INDICATOR ───────────────────────────────────────────────────────

export function TrendIndicator({ value, suffix = '%', className }: { value: number; suffix?: string; className?: string }) {
  const isUp = value > 0;
  const isDown = value < 0;

  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-xs font-semibold',
      isUp ? 'text-success' : isDown ? 'text-error' : 'text-muted-foreground',
      className
    )}>
      {isUp && <TrendingUp className="w-3.5 h-3.5" />}
      {isDown && <TrendingDown className="w-3.5 h-3.5" />}
      {isUp ? '+' : ''}{value}{suffix}
    </span>
  );
}

// ─── LINK CARD ─────────────────────────────────────────────────────────────

interface LinkCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  href: string;
  badge?: string;
  className?: string;
}

export function LinkCard({ title, description, icon, href, badge, className }: LinkCardProps) {
  return (
    <a
      href={href}
      className={cn(
        'flex items-center gap-4 p-4 rounded-2xl border border-border bg-card',
        'hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group',
        className
      )}
    >
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-foreground truncate">{title}</p>
          {badge && <Badge variant="secondary" className="text-[10px] shrink-0">{badge}</Badge>}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>}
      </div>
      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </a>
  );
}

// ─── REFRESH BUTTON ────────────────────────────────────────────────────────

export function RefreshButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <Button variant="ghost" size="icon-sm" onClick={onClick} disabled={loading}>
      <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
    </Button>
  );
}
