export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  verified: boolean;
  followers: number;
  following: number;
  posts: number;
  isCreator: boolean;
  isSeller: boolean;
  joinedDate: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  stats?: {
    totalEarnings?: number;
    totalSales?: number;
    averageRating?: number;
  };
  // Seller-specific metrics
  sellerMetrics?: {
    rating: number;
    reviewCount: number;
    responseRate: number;
    responseTime: string;
    avgDeliveryDays: number;
    deliveryOnTime: number;
    totalSales: number;
    totalOrders: number;
    repeatCustomers: number;
    memberSince: string;
    badges: {
      id: string;
      label: string;
      icon: string;
      color?: string;
    }[];
  };
  storeName?: string;
}

export const users: User[] = [
  {
    id: 'user-001',
    username: 'fashionista_maya',
    name: 'Maya Chen',
    email: 'maya@example.com',
    avatar: 'https://images.unsplash.com/photo-1507611268508-bf74edce9029?w=200',
    bio: 'Fashion Creator | 250K followers | Styling tips & trends 💜✨',
    verified: true,
    followers: 250000,
    following: 342,
    posts: 1245,
    isCreator: true,
    isSeller: false,
    joinedDate: 'January 2024',
    socialLinks: {
      instagram: '@fashionista_maya',
      twitter: '@mayasfashion'
    },
    stats: {
      totalEarnings: 450.00,
      averageRating: 4.9
    }
  },
  {
    id: 'user-002',
    username: 'tech_reviews_pro',
    name: 'Alex Kumar',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    bio: 'Tech Reviewer | Honest reviews | Latest gadgets 📱⚡',
    verified: true,
    followers: 180000,
    following: 198,
    posts: 892,
    isCreator: true,
    isSeller: false,
    joinedDate: 'May 2024',
    socialLinks: {
      instagram: '@techpro_reviews',
      youtube: '@techpro'
    },
    stats: {
      totalEarnings: 320.00,
      averageRating: 4.8
    }
  },
  {
    id: 'user-003',
    username: 'beauty_by_sarah',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    bio: 'Beauty & Makeup Expert | Skincare lover 💄✨',
    verified: true,
    followers: 320000,
    following: 445,
    posts: 1678,
    isCreator: true,
    isSeller: false,
    joinedDate: 'March 2024',
    socialLinks: {
      instagram: '@beautybysarah',
      twitter: '@sarahbeauty'
    },
    stats: {
      totalEarnings: 580.00,
      averageRating: 4.9
    }
  },
  {
    id: 'user-004',
    username: 'home_decor_emma',
    name: 'Emma Williams',
    email: 'emma@example.com',
    avatar: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=200',
    bio: 'Home Decor Expert | Interior design tips 🏠💡',
    verified: true,
    followers: 220000,
    following: 267,
    posts: 934,
    isCreator: true,
    isSeller: false,
    joinedDate: 'March 2024',
    stats: {
      totalEarnings: 380.00,
      averageRating: 4.8
    }
  },
  {
    id: 'user-005',
    username: 'fitness_mike',
    name: 'Mike Ross',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Fitness Coach | Home workouts | Healthy living 💪🔥',
    verified: false,
    followers: 150000,
    following: 312,
    posts: 723,
    isCreator: true,
    isSeller: false,
    joinedDate: 'February 2024',
    stats: {
      totalEarnings: 240.00,
      averageRating: 4.7
    }
  },
  {
    id: 'user-006',
    username: 'foodie_lisa',
    name: 'Lisa Park',
    email: 'lisa@example.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    bio: 'Food & Travel enthusiast | Cooking tips 🍳✈️',
    verified: false,
    followers: 190000,
    following: 423,
    posts: 1123,
    isCreator: true,
    isSeller: false,
    joinedDate: 'January 2024',
    stats: {
      totalEarnings: 280.00,
      averageRating: 4.6
    }
  },
  {
    id: 'user-007',
    username: 'urban_style_jay',
    name: 'Jay Martinez',
    email: 'jay@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    bio: 'Street Style | Fashion blogger | Urban vibes 👟🎒',
    verified: true,
    followers: 160000,
    following: 234,
    posts: 856,
    isCreator: true,
    isSeller: false,
    joinedDate: 'April 2024',
    stats: {
      totalEarnings: 260.00,
      averageRating: 4.7
    }
  },
  {
    id: 'user-008',
    username: 'gamer_dave',
    name: 'Dave Wilson',
    email: 'dave@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    bio: 'Gaming Streamer | Reviews & gameplay 🎮🔊',
    verified: true,
    followers: 280000,
    following: 189,
    posts: 1456,
    isCreator: true,
    isSeller: false,
    joinedDate: 'February 2024',
    stats: {
      totalEarnings: 420.00,
      averageRating: 4.8
    }
  },
  {
    id: 'user-009',
    username: 'runner_life',
    name: 'David Park',
    email: 'david@example.com',
    avatar: 'https://images.unsplash.com/photo-1542190891-2093d38760f2?w=200',
    bio: 'Marathon runner | Fitness tips | Running gear reviews 🏃‍♂️👟',
    verified: false,
    followers: 125000,
    following: 267,
    posts: 645,
    isCreator: true,
    isSeller: false,
    joinedDate: 'May 2024',
    stats: {
      totalEarnings: 180.00,
      averageRating: 4.6
    }
  },
  {
    id: 'user-010',
    username: 'minimalist_life',
    name: 'Rachel Green',
    email: 'rachel@example.com',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
    bio: 'Minimalist lifestyle | Simple living tips ⌚🌿',
    verified: false,
    followers: 95000,
    following: 178,
    posts: 423,
    isCreator: true,
    isSeller: false,
    joinedDate: 'April 2024',
    stats: {
      totalEarnings: 150.00,
      averageRating: 4.5
    }
  },
  {
    id: 'user-011',
    username: 'wellness_coach',
    name: 'Amanda Silva',
    email: 'amanda@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    bio: 'Wellness Coach | Mental health advocate | Self-care 🌿💜',
    verified: true,
    followers: 175000,
    following: 234,
    posts: 789,
    isCreator: true,
    isSeller: false,
    joinedDate: 'February 2024',
    stats: {
      totalEarnings: 270.00,
      averageRating: 4.9
    }
  },
  {
    id: 'user-012',
    username: 'creative_writer',
    name: 'James Wilson',
    email: 'james@example.com',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
    bio: 'Writer | Book reviews | Journaling tips ✍️📖',
    verified: false,
    followers: 85000,
    following: 145,
    posts: 534,
    isCreator: true,
    isSeller: false,
    joinedDate: 'March 2024',
    stats: {
      totalEarnings: 120.00,
      averageRating: 4.6
    }
  },
  // Sellers
  {
    id: 'seller-001',
    username: 'techstore',
    name: 'TechStore Official',
    email: 'info@techstore.com',
    avatar: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=200',
    bio: 'Official Tech Store | Verified Seller | Fast Shipping 📱⚡',
    verified: true,
    followers: 450000,
    following: 23,
    posts: 2345,
    isCreator: false,
    isSeller: true,
    joinedDate: 'December 2023',
    stats: {
      totalSales: 1250000,
      averageRating: 4.8
    },
    sellerMetrics: {
      rating: 4.8,
      reviewCount: 15000,
      responseRate: 95,
      responseTime: '1 hour',
      avgDeliveryDays: 3,
      deliveryOnTime: 98,
      totalSales: 1250000,
      totalOrders: 50000,
      repeatCustomers: 25000,
      memberSince: 'December 2023',
      badges: [
        {
          id: 'badge-001',
          label: 'Top Seller',
          icon: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=50',
          color: '#FFD700'
        },
        {
          id: 'badge-002',
          label: 'Fast Shipping',
          icon: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=50',
          color: '#00FF00'
        }
      ]
    },
    storeName: 'TechStore'
  },
  {
    id: 'seller-002',
    username: 'workspacepro',
    name: 'WorkSpace Pro',
    email: 'info@workspacepro.com',
    avatar: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=200',
    bio: 'Ergonomic workspace solutions | Verified Seller 💼🖥️',
    verified: true,
    followers: 120000,
    following: 12,
    posts: 678,
    isCreator: false,
    isSeller: true,
    joinedDate: 'January 2024',
    stats: {
      totalSales: 450000,
      averageRating: 4.7
    },
    sellerMetrics: {
      rating: 4.7,
      reviewCount: 5000,
      responseRate: 90,
      responseTime: '2 hours',
      avgDeliveryDays: 5,
      deliveryOnTime: 95,
      totalSales: 450000,
      totalOrders: 20000,
      repeatCustomers: 10000,
      memberSince: 'January 2024',
      badges: [
        {
          id: 'badge-001',
          label: 'Top Seller',
          icon: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=50',
          color: '#FFD700'
        },
        {
          id: 'badge-002',
          label: 'Fast Shipping',
          icon: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=50',
          color: '#00FF00'
        }
      ]
    },
    storeName: 'WorkSpace Pro'
  },
  {
    id: 'seller-003',
    username: 'fashionhub',
    name: 'Fashion Hub',
    email: 'info@fashionhub.com',
    avatar: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200',
    bio: 'Trendy fashion & accessories | Verified Seller 👗👜',
    verified: true,
    followers: 380000,
    following: 34,
    posts: 1890,
    isCreator: false,
    isSeller: true,
    joinedDate: 'December 2023',
    stats: {
      totalSales: 890000,
      averageRating: 4.6
    },
    sellerMetrics: {
      rating: 4.6,
      reviewCount: 10000,
      responseRate: 85,
      responseTime: '3 hours',
      avgDeliveryDays: 7,
      deliveryOnTime: 90,
      totalSales: 890000,
      totalOrders: 30000,
      repeatCustomers: 15000,
      memberSince: 'December 2023',
      badges: [
        {
          id: 'badge-001',
          label: 'Top Seller',
          icon: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=50',
          color: '#FFD700'
        },
        {
          id: 'badge-002',
          label: 'Fast Shipping',
          icon: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=50',
          color: '#00FF00'
        }
      ]
    },
    storeName: 'Fashion Hub'
  },
  {
    id: 'seller-004',
    username: 'glowcare',
    name: 'GlowCare Beauty',
    email: 'info@glowcare.com',
    avatar: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200',
    bio: 'Premium beauty & skincare | Verified Seller 💄✨',
    verified: true,
    followers: 560000,
    following: 45,
    posts: 3456,
    isCreator: false,
    isSeller: true,
    joinedDate: 'November 2023',
    stats: {
      totalSales: 1670000,
      averageRating: 4.9
    },
    sellerMetrics: {
      rating: 4.9,
      reviewCount: 20000,
      responseRate: 98,
      responseTime: '1 hour',
      avgDeliveryDays: 2,
      deliveryOnTime: 99,
      totalSales: 1670000,
      totalOrders: 60000,
      repeatCustomers: 30000,
      memberSince: 'November 2023',
      badges: [
        {
          id: 'badge-001',
          label: 'Top Seller',
          icon: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=50',
          color: '#FFD700'
        },
        {
          id: 'badge-002',
          label: 'Fast Shipping',
          icon: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=50',
          color: '#00FF00'
        }
      ]
    },
    storeName: 'GlowCare Beauty'
  },
  {
    id: 'seller-005',
    username: 'homestyle',
    name: 'HomeStyle Co',
    email: 'info@homestyle.com',
    avatar: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200',
    bio: 'Home decor & lifestyle | Verified Seller 🏠💡',
    verified: true,
    followers: 290000,
    following: 28,
    posts: 1567,
    isCreator: false,
    isSeller: true,
    joinedDate: 'January 2024',
    stats: {
      totalSales: 780000,
      averageRating: 4.7
    },
    sellerMetrics: {
      rating: 4.7,
      reviewCount: 7000,
      responseRate: 90,
      responseTime: '2 hours',
      avgDeliveryDays: 5,
      deliveryOnTime: 95,
      totalSales: 780000,
      totalOrders: 25000,
      repeatCustomers: 10000,
      memberSince: 'January 2024',
      badges: [
        {
          id: 'badge-001',
          label: 'Top Seller',
          icon: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=50',
          color: '#FFD700'
        },
        {
          id: 'badge-002',
          label: 'Fast Shipping',
          icon: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=50',
          color: '#00FF00'
        }
      ]
    },
    storeName: 'HomeStyle Co'
  },
  {
    id: 'seller-006',
    username: 'fitlife',
    name: 'FitLife Gear',
    email: 'info@fitlife.com',
    avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
    bio: 'Fitness equipment & accessories | Verified Seller 💪🏋️',
    verified: true,
    followers: 340000,
    following: 31,
    posts: 2123,
    isCreator: false,
    isSeller: true,
    joinedDate: 'December 2023',
    stats: {
      totalSales: 950000,
      averageRating: 4.8
    },
    sellerMetrics: {
      rating: 4.8,
      reviewCount: 12000,
      responseRate: 95,
      responseTime: '1 hour',
      avgDeliveryDays: 3,
      deliveryOnTime: 98,
      totalSales: 950000,
      totalOrders: 40000,
      repeatCustomers: 20000,
      memberSince: 'December 2023',
      badges: [
        {
          id: 'badge-001',
          label: 'Top Seller',
          icon: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=50',
          color: '#FFD700'
        },
        {
          id: 'badge-002',
          label: 'Fast Shipping',
          icon: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=50',
          color: '#00FF00'
        }
      ]
    },
    storeName: 'FitLife Gear'
  },
  {
    id: 'seller-007',
    username: 'stationeryplus',
    name: 'Stationery Plus',
    email: 'info@stationeryplus.com',
    avatar: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200',
    bio: 'Quality stationery & office supplies | Verified Seller 📝✏️',
    verified: true,
    followers: 145000,
    following: 19,
    posts: 892,
    isCreator: false,
    isSeller: true,
    joinedDate: 'February 2024',
    stats: {
      totalSales: 380000,
      averageRating: 4.6
    },
    sellerMetrics: {
      rating: 4.6,
      reviewCount: 5000,
      responseRate: 85,
      responseTime: '3 hours',
      avgDeliveryDays: 7,
      deliveryOnTime: 90,
      totalSales: 380000,
      totalOrders: 15000,
      repeatCustomers: 7500,
      memberSince: 'February 2024',
      badges: [
        {
          id: 'badge-001',
          label: 'Top Seller',
          icon: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=50',
          color: '#FFD700'
        },
        {
          id: 'badge-002',
          label: 'Fast Shipping',
          icon: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=50',
          color: '#00FF00'
        }
      ]
    },
    storeName: 'Stationery Plus'
  }
];

// Helper functions
export const getUserByUsername = (username: string): User | undefined => {
  return users.find(u => u.username === username);
};

export const getUserById = (id: string): User | undefined => {
  return users.find(u => u.id === id);
};

export const getCreators = (): User[] => {
  return users.filter(u => u.isCreator);
};

export const getSellers = (): User[] => {
  return users.filter(u => u.isSeller);
};

export const getVerifiedUsers = (): User[] => {
  return users.filter(u => u.verified);
};

export const getTopCreators = (): User[] => {
  return users
    .filter(u => u.isCreator)
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 10);
};