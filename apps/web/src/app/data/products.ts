export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  seller: {
    id: string;
    name: string;
    username: string;
    verified: boolean;
    avatar: string;
  };
  inStock: boolean;
  stock?: number;
  tags: string[];
  affiliateCommission: number;
  sold?: number;
  badge?: string;
}

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Wireless Headphones',
    description: 'Crystal-clear audio with noise cancellation.',
    price: 79.99,
    originalPrice: 129.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
      'https://images.unsplash.com/photo-1545127398-14699f92334b?w=500'
    ],
    rating: 4.8,
    reviews: 2847,
    seller: {
      id: 'seller-001',
      name: 'TechStore',
      username: 'techstore',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=80'
    },
    inStock: true,
    stock: 234,
    tags: ['headphones'],
    affiliateCommission: 8,
    sold: 1250
  },
  {
    id: 'prod-002',
    name: 'Smart Watch',
    description: 'Health monitoring and GPS tracking.',
    price: 199.99,
    originalPrice: 299.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500'
    ],
    rating: 4.7,
    reviews: 1923,
    seller: {
      id: 'seller-001',
      name: 'TechStore',
      username: 'techstore',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=80'
    },
    inStock: true,
    stock: 156,
    tags: ['smartwatch'],
    affiliateCommission: 7,
    sold: 892
  },
  {
    id: 'prod-003',
    name: 'Laptop Stand',
    description: 'Ergonomic aluminum stand.',
    price: 45.99,
    originalPrice: 69.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'
    ],
    rating: 4.6,
    reviews: 567,
    seller: {
      id: 'seller-002',
      name: 'WorkSpace',
      username: 'workspace',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=80'
    },
    inStock: true,
    stock: 89,
    tags: ['laptop'],
    affiliateCommission: 6,
    sold: 423
  },
  {
    id: 'prod-004',
    name: 'Leather Backpack',
    description: 'Handcrafted leather backpack.',
    price: 89.99,
    originalPrice: 149.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500'
    ],
    rating: 4.9,
    reviews: 1456,
    seller: {
      id: 'seller-003',
      name: 'Fashion Hub',
      username: 'fashion',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=80'
    },
    inStock: true,
    stock: 67,
    tags: ['backpack'],
    affiliateCommission: 12,
    sold: 678
  },
  {
    id: 'prod-005',
    name: 'Minimalist Watch',
    description: 'Sleek design, Japanese movement.',
    price: 129.99,
    originalPrice: 199.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'
    ],
    rating: 4.7,
    reviews: 892,
    seller: {
      id: 'seller-003',
      name: 'Fashion Hub',
      username: 'fashion',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=80'
    },
    inStock: true,
    stock: 145,
    tags: ['watch'],
    affiliateCommission: 10,
    sold: 534
  },
  {
    id: 'prod-006',
    name: 'Vitamin C Serum',
    description: 'Anti-aging, reduces dark spots.',
    price: 34.99,
    originalPrice: 59.99,
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500'
    ],
    rating: 4.9,
    reviews: 2145,
    seller: {
      id: 'seller-004',
      name: 'GlowCare',
      username: 'glow',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1765852545581-0cf4fc7a8fa9?w=80'
    },
    inStock: true,
    stock: 312,
    tags: ['skincare'],
    affiliateCommission: 18,
    sold: 1876
  },
  {
    id: 'prod-007',
    name: 'Yoga Mat',
    description: 'Extra thick with alignment marks.',
    price: 34.99,
    originalPrice: 54.99,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'
    ],
    rating: 4.9,
    reviews: 1567,
    seller: {
      id: 'seller-005',
      name: 'FitLife',
      username: 'fit',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1758599881072-62facc386445?w=80'
    },
    inStock: true,
    stock: 456,
    tags: ['yoga'],
    affiliateCommission: 9,
    sold: 1234
  },
  {
    id: 'prod-008',
    name: 'LED Table Lamp',
    description: 'Touch control, adjustable brightness.',
    price: 54.99,
    originalPrice: 89.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'
    ],
    rating: 4.8,
    reviews: 823,
    seller: {
      id: 'seller-006',
      name: 'HomeStyle',
      username: 'home',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1713978800761-1cf90d56f3a6?w=80'
    },
    inStock: true,
    stock: 95,
    tags: ['lamp'],
    affiliateCommission: 10,
    sold: 312
  }
];

export const categories = [
  'Electronics',
  'Fashion',
  'Beauty',
  'Home',
  'Sports',
  'Books'
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(p => p.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(p => p.rating >= 4.7).slice(0, 4);
};

export const getTrendingProducts = (): Product[] => {
  return [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 6);
};
/**
 * Bridges the legacy in-repo catalogue onto the API `ProductSummary` shape so pages that still read
 * `data/products` (search, wishlist, seller store) can render the shared `ProductCard`. Remove once those
 * pages are on `useProducts()`.
 */
export function toProductSummary(p: Product) {
  return {
    id: p.id,
    slug: p.id,
    name: p.name,
    imageUrl: p.image,
    price: { amount: Math.round(p.price * 100), currency: 'USD' as const },
    compareAtPrice: p.originalPrice ? { amount: Math.round(p.originalPrice * 100), currency: 'USD' as const } : null,
    rating: p.rating,
    reviewCount: p.reviews,
    seller: { id: p.seller.id, username: p.seller.username, name: p.seller.name, verified: p.seller.verified },
    badge: null,
    inStock: p.inStock,
    soldCount: p.sold,
  };
}
