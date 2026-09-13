import { useEffect } from 'react';
import { useLocation } from 'react-router';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  price?: string;
  currency?: string;
  availability?: 'instock' | 'outofstock' | 'preorder';
  jsonLd?: object;
}

const defaultMeta = {
  siteName: "Ezyify",
  defaultTitle: 'Ezyify — E-Commerce Social Media Ecosystem',
  defaultDescription: 'Shop. Talk. Share. Live the Moment. Ezyify is your E-Commerce Social Media Ecosystem — discover and buy products, connect with creators, go live, and share content all in one place.',
  defaultImage: 'https://ezyify.com/og-image.png',
  defaultKeywords: 'e-commerce, social media, online shopping, content creation, live shopping, marketplace, creator economy, social selling, shopping community',
  twitterHandle: '@ezyify',
  fbAppId: '',
  baseUrl: 'https://ezyify.com',
};

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  price,
  currency = 'USD',
  availability,
  jsonLd,
}: SEOProps) {
  const location = useLocation();

  const fullTitle = title ? `${title} | ${defaultMeta.siteName}` : defaultMeta.defaultTitle;
  const metaDescription = description || defaultMeta.defaultDescription;
  const metaKeywords = keywords || defaultMeta.defaultKeywords;
  const metaImage = image || defaultMeta.defaultImage;
  const metaUrl = url || `${defaultMeta.baseUrl}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper function to update or create meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      
      element.content = content;
    };

    // Basic meta tags
    updateMeta('description', metaDescription);
    updateMeta('keywords', metaKeywords);
    if (author) updateMeta('author', author);

    // Open Graph tags
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', metaDescription, true);
    updateMeta('og:image', metaImage, true);
    updateMeta('og:url', metaUrl, true);
    updateMeta('og:type', type, true);
    updateMeta('og:site_name', defaultMeta.siteName, true);
    
    if (publishedTime) updateMeta('article:published_time', publishedTime, true);
    if (modifiedTime) updateMeta('article:modified_time', modifiedTime, true);
    if (section) updateMeta('article:section', section, true);
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        const tagElement = document.createElement('meta');
        tagElement.setAttribute('property', 'article:tag');
        tagElement.content = tag;
        document.head.appendChild(tagElement);
      });
    }

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:site', defaultMeta.twitterHandle);
    updateMeta('twitter:creator', author || defaultMeta.twitterHandle);
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', metaDescription);
    updateMeta('twitter:image', metaImage);

    // Product specific meta (if type is product)
    if (type === 'product' && price) {
      updateMeta('product:price:amount', price, true);
      updateMeta('product:price:currency', currency, true);
      if (availability) {
        updateMeta('product:availability', availability, true);
      }
    }

    // Mobile web app tags
    updateMeta('mobile-web-app-capable', 'yes');
    updateMeta('apple-mobile-web-app-capable', 'yes');
    updateMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    updateMeta('theme-color', '#7c3aed');

    // Additional SEO tags
    updateMeta('robots', 'index, follow');
    updateMeta('googlebot', 'index, follow');
    updateMeta('format-detection', 'telephone=no');

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = metaUrl;

    // Add JSON-LD structured data
    if (jsonLd) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    // Cleanup function to remove dynamic tags
    return () => {
      // Remove article tags if they exist
      if (tags && tags.length > 0) {
        const tagElements = document.querySelectorAll('meta[property="article:tag"]');
        tagElements.forEach(el => el.remove());
      }
    };
  }, [fullTitle, metaDescription, metaKeywords, metaImage, metaUrl, type, author, publishedTime, modifiedTime, section, tags, price, currency, availability, jsonLd]);

  return null;
}

// Predefined SEO configurations for common pages
export const SEOConfigs = {
  home: {
    title: 'Ezyify — Shop. Talk. Share. Live the Moment.',
    description: 'Ezyify is your E-Commerce Social Media Ecosystem. Discover millions of products, connect with creators, go live, and share content — all in one place. Shop. Talk. Share. Live the Moment.',
    keywords: 'e-commerce, social media ecosystem, online shopping, live shopping, content creation, marketplace, creator economy, social selling',
  },
  
  shop: {
    title: 'Shop - Discover Amazing Products',
    description: 'Browse millions of products from verified sellers. Find the best deals, trending items, and personalized recommendations just for you.',
    keywords: 'online shopping, buy products, best deals, trending products, ecommerce',
  },
  
  explore: {
    title: 'Explore - Discover Trending Content',
    description: 'Discover trending videos, photos, and products. Get inspired by creators and find your next favorite thing.',
    keywords: 'trending content, viral videos, discover creators, explore products',
  },
  
  live: {
    title: 'Live Shopping - Watch & Shop in Real-Time',
    description: 'Join live shopping events, interact with sellers, and grab exclusive deals. Shop while you watch!',
    keywords: 'live shopping, live commerce, interactive shopping, live deals',
  },
  
  loops: {
    title: 'Loops - Short-Form Shopping Videos',
    description: 'Watch addictive short videos featuring products you\'ll love. Swipe, shop, repeat!',
    keywords: 'short videos, shopping videos, product videos, video commerce',
  },
  
  creators: {
    title: 'For Creators - Monetize Your Content',
    description: 'Turn your creativity into income. Create content, build your audience, and earn money through our creator program.',
    keywords: 'content creation, creator economy, monetization, influencer program',
  },
  
  sellers: {
    title: 'Sell on Ezyify - Start Your Online Business',
    description: 'Join thousands of successful sellers. Set up your store, reach millions of buyers, and grow your business with powerful tools.',
    keywords: 'sell online, online store, ecommerce business, seller program',
  },
  
  about: {
    title: 'About Ezyify - Our Mission & Story',
    description: 'Learn about Ezyify\'s mission to build the world\'s premier E-Commerce Social Media Ecosystem. Discover how we empower creators, sellers, and shoppers worldwide.',
    keywords: 'about us, company mission, e-commerce social media, our story',
  },
  
  // Main App Pages
  messages: {
    title: 'Messages - Stay Connected',
    description: 'Chat with sellers, buyers, and creators. Discuss products, negotiate deals, and build relationships.',
    keywords: 'messaging, chat, communication, buyer seller chat',
  },
  
  notifications: {
    title: 'Notifications - Stay Updated',
    description: 'Never miss important updates. Get notified about orders, messages, new followers, and trending content.',
    keywords: 'notifications, updates, alerts, activity feed',
  },
  
  cart: {
    title: 'Shopping Cart - Review Your Items',
    description: 'Review your selected items, apply coupons, and proceed to checkout. Shop with confidence on Ezyify.',
    keywords: 'shopping cart, checkout, buy now, cart items',
  },
  
  wishlist: {
    title: 'Wishlist - Save Your Favorites',
    description: 'Keep track of products you love. Get notified when items go on sale or back in stock.',
    keywords: 'wishlist, saved items, favorites, product bookmarks',
  },
  
  search: {
    title: 'Search - Find Anything',
    description: 'Search millions of products, creators, and content. Discover exactly what you\'re looking for.',
    keywords: 'search, find products, discover, product search',
  },
  
  categories: {
    title: 'Categories - Browse by Category',
    description: 'Explore products organized by categories. Find exactly what you need quickly and easily.',
    keywords: 'product categories, browse categories, shop by category',
  },
  
  upload: {
    title: 'Upload - Create & Share',
    description: 'Upload videos, photos, and products. Share your creativity and start earning.',
    keywords: 'upload content, create post, share video, content creation',
  },
  
  stories: {
    title: 'Stories - Daily Moments',
    description: 'Share and discover daily moments from creators and brands. Stories that disappear in 24 hours.',
    keywords: 'stories, daily content, temporary posts, 24 hour stories',
  },
  
  profile: {
    title: 'Profile - Your Digital Identity',
    description: 'Manage your profile, view your content, track your orders, and connect with your audience.',
    keywords: 'user profile, my account, profile settings, account dashboard',
  },
  
  settings: {
    title: 'Settings - Customize Your Experience',
    description: 'Manage your account settings, privacy preferences, notifications, and security options.',
    keywords: 'settings, account settings, preferences, privacy settings',
  },
  
  help: {
    title: 'Help Center - Get Support',
    description: 'Find answers to common questions, contact support, and learn how to use Ezyify effectively.',
    keywords: 'help center, support, faq, customer service',
  },
  
  // Auth Pages
  login: {
    title: 'Login - Access Your Account',
    description: 'Sign in to your Ezyify account to shop, create, and connect with millions of users.',
    keywords: 'login, sign in, account access, user login',
  },
  
  signup: {
    title: 'Sign Up - Join Ezyify',
    description: 'Create your free Ezyify account and start shopping, creating, and earning today.',
    keywords: 'sign up, register, create account, join ezyify',
  },
  
  // Company Pages
  blog: {
    title: 'Blog - News & Updates',
    description: 'Stay updated with the latest news, features, and insights from Ezyify.',
    keywords: 'blog, news, updates, announcements, company news',
  },
  
  careers: {
    title: 'Careers - Join Our Team',
    description: 'Join Ezyify and help us revolutionize social commerce. Explore exciting career opportunities.',
    keywords: 'careers, jobs, employment, work at ezyify, job openings',
  },
  
  contact: {
    title: 'Contact Us - Get in Touch',
    description: 'Have questions? Contact our team and we\'ll get back to you as soon as possible.',
    keywords: 'contact us, get in touch, support, customer service',
  },
  
  press: {
    title: 'Press & Media - News Room',
    description: 'Press releases, media kits, and news about Ezyify. Resources for journalists and media.',
    keywords: 'press, media, news room, press releases, media kit',
  },
  
  investors: {
    title: 'Investors - Investment Opportunities',
    description: 'Learn about investment opportunities and Ezyify\'s growth story.',
    keywords: 'investors, investment, funding, investor relations',
  },
  
  // Legal Pages
  privacy: {
    title: 'Privacy Policy - Your Privacy Matters',
    description: 'Learn how Ezyify collects, uses, and protects your personal information.',
    keywords: 'privacy policy, data protection, user privacy, gdpr',
  },
  
  terms: {
    title: 'Terms of Service - User Agreement',
    description: 'Read Ezyify\'s terms of service and user agreement before using our platform.',
    keywords: 'terms of service, user agreement, terms and conditions',
  },
  
  communityGuidelines: {
    title: 'Community Guidelines - Be Respectful',
    description: 'Our community guidelines help create a safe and positive environment for everyone.',
    keywords: 'community guidelines, rules, code of conduct, user guidelines',
  },
  
  safety: {
    title: 'Safety Center - Stay Safe Online',
    description: 'Learn about safety features and best practices for secure shopping and content creation.',
    keywords: 'safety, security, online safety, safe shopping',
  },
  
  // Creator Pages
  creatorDashboard: {
    title: 'Creator Dashboard - Manage Your Content',
    description: 'Track your performance, manage content, view analytics, and grow your creator business.',
    keywords: 'creator dashboard, analytics, creator tools, content management',
  },
  
  affiliateManager: {
    title: 'Performance Dashboard - Track Your Earnings',
    description: 'Monitor your shared product performance, track clicks, conversions, and earnings.',
    keywords: 'performance tracking, earnings dashboard, analytics, creator dashboard',
  },
  
  // Seller Pages
  sellerDashboard: {
    title: 'Seller Dashboard - Manage Your Store',
    description: 'Manage products, track orders, view sales analytics, and grow your business.',
    keywords: 'seller dashboard, store management, sales analytics, seller tools',
  },
  
  productManagement: {
    title: 'Product Management - Manage Your Inventory',
    description: 'Add, edit, and manage your product listings with powerful inventory tools.',
    keywords: 'product management, inventory, product listing, stock management',
  },
  
  orders: {
    title: 'Orders - Manage Your Orders',
    description: 'View and manage all your orders. Track shipments and handle customer requests.',
    keywords: 'orders, order management, order tracking, shipments',
  },
  
  earnings: {
    title: 'Earnings - Track Your Revenue',
    description: 'Monitor your sales, commissions, and earnings. View detailed financial reports.',
    keywords: 'earnings, revenue, sales tracking, financial reports',
  },
  
  // User Pages
  checkout: {
    title: 'Checkout - Complete Your Purchase',
    description: 'Securely complete your purchase with multiple payment options and fast delivery.',
    keywords: 'checkout, payment, complete purchase, buy now',
  },
  
  orderTracking: {
    title: 'Order Tracking - Track Your Package',
    description: 'Track your order in real-time. Get delivery updates and estimated arrival times.',
    keywords: 'order tracking, package tracking, delivery status, shipment tracking',
  },
  
  wallet: {
    title: 'Wallet - Manage Your Balance',
    description: 'Manage your Ezyify wallet, add funds, and track your transactions.',
    keywords: 'wallet, balance, transactions, digital wallet',
  },
};

// Helper function to generate JSON-LD structured data
export const generateStructuredData = {
  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: defaultMeta.siteName,
    description: defaultMeta.defaultDescription,
    url: defaultMeta.baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${defaultMeta.baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }),

  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: defaultMeta.siteName,
    description: defaultMeta.defaultDescription,
    url: defaultMeta.baseUrl,
    logo: `${defaultMeta.baseUrl}/logo.png`,
    sameAs: [
      'https://www.facebook.com/ezyify',
      'https://twitter.com/ezyify',
      'https://www.instagram.com/ezyify',
      'https://www.linkedin.com/company/ezyify',
    ],
  }),

  product: (product: { name: string; description: string; image: string; price: string; currency: string; availability: string; rating?: number; reviewCount?: number }) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability === 'instock' ? 'InStock' : 'OutOfStock'}`,
      url: window.location.href,
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      },
    }),
  }),

  article: (article: { title: string; description: string; image: string; publishedTime: string; modifiedTime?: string; author: string; section?: string }) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: defaultMeta.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${defaultMeta.baseUrl}/logo.png`,
      },
    },
    ...(article.section && { articleSection: article.section }),
  }),

  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
};