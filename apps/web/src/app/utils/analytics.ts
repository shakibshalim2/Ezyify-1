// Analytics tracking utility for EZYIFY
// Supports Google Analytics, Meta Pixel, TikTok Pixel, and custom events

// Types
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
}

export interface PageViewData {
  path: string;
  title: string;
  referrer?: string;
}

export interface EcommerceEvent {
  currency: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    item_category?: string;
    price: number;
    quantity: number;
  }>;
}

// Google Analytics (GA4)
export const initGoogleAnalytics = (measurementId: string) => {
  if (typeof window === 'undefined') return;
  if (!measurementId || measurementId === 'G-XXXXXXXXXX') return;

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId, {
    send_page_view: false, // We'll handle page views manually
  });
};

// Meta Pixel (Facebook)
export const initMetaPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;
  // Skip if pixelId is missing, null, or still the placeholder value
  if (!pixelId || pixelId === 'XXXXXXXXXX') return;

  (window as any).fbq = function (...args: any[]) {
    (window as any).fbq.callMethod
      ? (window as any).fbq.callMethod(...args)
      : (window as any).fbq.queue.push(args);
  };

  if (!(window as any)._fbq) (window as any)._fbq = (window as any).fbq;
  (window as any).fbq.push = (window as any).fbq;
  (window as any).fbq.loaded = true;
  (window as any).fbq.version = '2.0';
  (window as any).fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  (window as any).fbq('init', pixelId);
  (window as any).fbq('track', 'PageView');
};

// TikTok Pixel
export const initTikTokPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;
  if (!pixelId || pixelId === 'XXXXXXXXXX') return;

  (window as any).ttq = (window as any).ttq || [];
  const ttq = (window as any).ttq;
  
  ttq.load = function(pixelId: string) {
    ttq.methods = [
      'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'
    ];
    ttq.setAndDefer = function(obj: any, method: string) {
      obj[method] = function (...args: any[]) {
        obj.push([method].concat(args));
      };
    };
    
    for (let i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }
    
    ttq.instance = function(pixelId: string) {
      const instance = ttq._i[pixelId] || [];
      for (let i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(instance, ttq.methods[i]);
      }
      return instance;
    };
    
  };

  ttq._i = ttq._i || {};
  ttq._i[pixelId] = [];
  ttq._t = ttq._t || {};
  ttq._t[pixelId] = +new Date();
  ttq._o = ttq._o || {};
  ttq._o[pixelId] = { pixel_code: pixelId };
  
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + pixelId + '&lib=ttq';
  document.head.appendChild(script);
  
  ttq.load(pixelId);
  ttq.page();
};

// Page View Tracking
export const trackPageView = (data: PageViewData) => {
  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: data.path,
      page_title: data.title,
      page_referrer: data.referrer || document.referrer,
    });
  }

  // Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }

  // TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.page();
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Page View:', data);
  }
};

// Custom Event Tracking
export const trackEvent = (event: AnalyticsEvent) => {
  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.customData,
    });
  }

  // Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('trackCustom', event.action, {
      category: event.category,
      label: event.label,
      value: event.value,
      ...event.customData,
    });
  }

  // TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track(event.action, {
      category: event.category,
      label: event.label,
      value: event.value,
      ...event.customData,
    });
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Event:', event);
  }
};

// E-commerce Events
export const trackPurchase = (data: EcommerceEvent) => {
  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      currency: data.currency,
      value: data.value,
      items: data.items,
    });
  }

  // Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', 'Purchase', {
      currency: data.currency,
      value: data.value,
      contents: data.items.map(item => ({
        id: item.item_id,
        quantity: item.quantity,
      })),
      content_type: 'product',
    });
  }

  // TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track('CompletePayment', {
      currency: data.currency,
      value: data.value,
      contents: data.items.map(item => ({
        content_id: item.item_id,
        content_name: item.item_name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('💰 Purchase:', data);
  }
};

export const trackAddToCart = (product: { id: string; name: string; price: number; category?: string; quantity?: number }) => {
  const data = {
    currency: 'USD',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity: product.quantity || 1,
    }],
  };

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', 'add_to_cart', data);
  }

  // Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', 'AddToCart', {
      currency: data.currency,
      value: data.value,
      content_ids: [product.id],
      content_type: 'product',
    });
  }

  // TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track('AddToCart', {
      currency: data.currency,
      value: data.value,
      content_id: product.id,
      content_name: product.name,
      price: product.price,
      quantity: product.quantity || 1,
    });
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🛒 Add to Cart:', product);
  }
};

export const trackViewContent = (product: { id: string; name: string; price: number; category?: string }) => {
  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', 'view_item', {
      currency: 'USD',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      }],
    });
  }

  // Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      currency: 'USD',
      value: product.price,
    });
  }

  // TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track('ViewContent', {
      content_id: product.id,
      content_name: product.name,
      content_type: 'product',
      currency: 'USD',
      value: product.price,
    });
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('👀 View Content:', product);
  }
};

export const trackSearch = (query: string, results?: number) => {
  const data = {
    search_term: query,
    results_count: results,
  };

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', 'search', data);
  }

  // Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', 'Search', {
      search_string: query,
    });
  }

  // TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track('Search', {
      query: query,
    });
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Search:', data);
  }
};

export const trackSignup = (method?: string) => {
  const data = {
    method: method || 'email',
  };

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', 'sign_up', data);
  }

  // Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', 'CompleteRegistration', data);
  }

  // TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track('CompleteRegistration', data);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Signup:', data);
  }
};

export const trackLogin = (method?: string) => {
  const data = {
    method: method || 'email',
  };

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', 'login', data);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Login:', data);
  }
};

// Social Interaction Events
export const trackShare = (contentType: string, contentId: string, method?: string) => {
  trackEvent({
    category: 'Social',
    action: 'share',
    label: contentType,
    customData: {
      content_id: contentId,
      method: method || 'unknown',
    },
  });
};

export const trackLike = (contentType: string, contentId: string) => {
  trackEvent({
    category: 'Engagement',
    action: 'like',
    label: contentType,
    customData: {
      content_id: contentId,
    },
  });
};

export const trackFollow = (userId: string, username: string) => {
  trackEvent({
    category: 'Social',
    action: 'follow',
    label: username,
    customData: {
      user_id: userId,
    },
  });
};

export const trackVideoPlay = (videoId: string, videoTitle: string, duration?: number) => {
  trackEvent({
    category: 'Video',
    action: 'play',
    label: videoTitle,
    value: duration,
    customData: {
      video_id: videoId,
    },
  });
};

export const trackVideoComplete = (videoId: string, videoTitle: string, watchTime: number) => {
  trackEvent({
    category: 'Video',
    action: 'complete',
    label: videoTitle,
    value: watchTime,
    customData: {
      video_id: videoId,
    },
  });
};

// Performance Tracking
export const trackPerformance = () => {
  if (typeof window === 'undefined' || !(window as any).performance) return;

  const perfData = (window as any).performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  const connectTime = perfData.responseEnd - perfData.requestStart;
  const renderTime = perfData.domComplete - perfData.domLoading;

  if ((window as any).gtag) {
    (window as any).gtag('event', 'timing_complete', {
      name: 'load',
      value: pageLoadTime,
      event_category: 'Performance',
    });

    (window as any).gtag('event', 'timing_complete', {
      name: 'connect',
      value: connectTime,
      event_category: 'Performance',
    });

    (window as any).gtag('event', 'timing_complete', {
      name: 'render',
      value: renderTime,
      event_category: 'Performance',
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('⚡ Performance:', {
      pageLoadTime: `${pageLoadTime}ms`,
      connectTime: `${connectTime}ms`,
      renderTime: `${renderTime}ms`,
    });
  }
};

// Error Tracking
export const trackError = (error: Error, context?: string) => {
  trackEvent({
    category: 'Error',
    action: 'exception',
    label: error.message,
    customData: {
      description: error.stack,
      context: context,
      fatal: false,
    },
  });

  console.error('Error tracked:', error, context);
};

// Initialize all analytics on app load
export const initAnalytics = () => {
  // Replace these with your actual IDs
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Your Google Analytics ID
  const META_PIXEL_ID = 'XXXXXXXXXX'; // Your Meta Pixel ID
  const TIKTOK_PIXEL_ID = 'XXXXXXXXXX'; // Your TikTok Pixel ID

  // Only initialize in production or when explicitly enabled
  try {
    const enableAnalytics = typeof window !== 'undefined' && 
                           window.localStorage && 
                           localStorage.getItem('enableAnalytics') === 'true';
    
    if (process.env.NODE_ENV === 'production' || enableAnalytics) {
      try {
        initGoogleAnalytics(GA_MEASUREMENT_ID);
        initMetaPixel(META_PIXEL_ID);
        initTikTokPixel(TIKTOK_PIXEL_ID);
        
        console.log('📊 Analytics initialized');
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
      }
    } else {
      console.log('📊 Analytics disabled (development mode)');
    }
  } catch (error) {
    console.log('📊 Analytics initialization skipped:', error);
  }
};