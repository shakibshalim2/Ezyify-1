import { Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

// General Purpose Loading Spinner
export function LoadingSpinner({ size = 'md', message }: { size?: 'sm' | 'md' | 'lg', message?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

// Full Page Loading
export function LoadingPage({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Post Card Skeleton
export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 lg:p-6 flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>

        {/* Image */}
        <Skeleton className="w-full aspect-square" />

        {/* Content */}
        <div className="p-4 lg:p-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          
          {/* Actions */}
          <div className="flex gap-6 pt-3">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full aspect-square" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-20" />
      </CardContent>
    </Card>
  );
}

// Feed Loading (Multiple Post Skeletons)
export function FeedLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Product Grid Loading
export function ProductGridLoading({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Profile Header Skeleton
export function ProfileHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full h-48 lg:h-64" />
      <div className="max-w-6xl mx-auto px-4 -mt-20">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="flex gap-6">
            <Skeleton className="w-32 h-32 lg:w-40 lg:h-40 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-6">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Comment Skeleton
export function CommentSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// Upload Progress
export function UploadProgress({ progress, filename }: { progress: number, filename?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-foreground font-medium">
          {filename ? `Uploading ${filename}` : 'Uploading...'}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#4f6ef7] to-[#7c3aed] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
    </div>
  );
}

// Processing State
export function ProcessingState({ message = 'Processing...' }: { message?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-foreground font-medium">{message}</p>
    </div>
  );
}

// Inline Loading (for buttons)
export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <span className="flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      {text}
    </span>
  );
}

// Shimmer Effect (for images loading)
export function ImageShimmer() {
  return (
    <div className="w-full h-full bg-gradient-to-r from-muted via-muted-foreground/20 to-muted animate-pulse" />
  );
}

// Dots Loading Animation
export function DotsLoading() {
  return (
    <div className="flex gap-1 items-center justify-center">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
    </div>
  );
}

// Table Loading
export function TableLoading({ rows = 5, columns = 4 }: { rows?: number, columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}