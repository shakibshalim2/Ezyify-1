import { products } from './products';

export interface Post {
  id: string;
  type: 'post' | 'loop' | 'story';
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    verified: boolean;
    isCreator?: boolean;
  };
  content: {
    text?: string;
    images?: string[];
    video?: string;
  };
  taggedProducts?: string[]; // product IDs
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export const posts: Post[] = [
  {
    id: 'post-001',
    type: 'post',
    user: {
      id: 'user-001',
      username: 'fashionista_maya',
      name: 'Maya Chen',
      avatar: 'https://images.unsplash.com/photo-1507611268508-bf74edce9029?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Just got these amazing wireless headphones! The sound quality is incredible and they are so comfortable. Perfect for my daily commute 🎧✨ #TechReview #MusicLovers',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'
      ]
    },
    taggedProducts: ['prod-001'],
    likes: 12453,
    comments: 284,
    shares: 156,
    timestamp: '2 hours ago',
    isLiked: false,
    isSaved: false
  },
  {
    id: 'post-002',
    type: 'loop',
    user: {
      id: 'user-002',
      username: 'tech_reviews_pro',
      name: 'Alex Kumar',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Unboxing the new Smart Watch Series 7! This thing is AMAZING 😍 Full review coming soon!',
      video: 'https://images.unsplash.com/photo-1694077743594-7b82dacafaf2?w=1080&q=80',
      images: ['https://images.unsplash.com/photo-1694077743594-7b82dacafaf2?w=1080&q=80']
    },
    taggedProducts: ['prod-002'],
    likes: 8934,
    comments: 167,
    shares: 89,
    views: 45678,
    timestamp: '5 hours ago'
  },
  {
    id: 'post-003',
    type: 'post',
    user: {
      id: 'user-003',
      username: 'beautyby_sarah',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'My skincare routine essentials! This Vitamin C serum has transformed my skin in just 2 weeks 💜✨ Highly recommend!',
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800'
      ]
    },
    taggedProducts: ['prod-007', 'prod-019'],
    likes: 15672,
    comments: 423,
    shares: 234,
    timestamp: '1 day ago',
    isLiked: true
  },
  {
    id: 'post-004',
    type: 'post',
    user: {
      id: 'user-004',
      username: 'homestyle_guru',
      name: 'Emily White',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Transformed my workspace with these minimal pieces! The lamp is perfect for late-night work sessions 💡',
      images: [
        'https://images.unsplash.com/photo-1549833971-c4283bad0032?w=1080&q=80',
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800'
      ]
    },
    taggedProducts: ['prod-011', 'prod-003'],
    likes: 9234,
    comments: 156,
    shares: 78,
    timestamp: '1 day ago'
  },
  {
    id: 'post-005',
    type: 'loop',
    user: {
      id: 'user-005',
      username: 'fitness_journey',
      name: 'Mike Thompson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      verified: false,
      isCreator: true
    },
    content: {
      text: 'Morning yoga routine with my new mat! Game changer for home workouts 🧘‍♂️💪',
      video: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800',
      images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800']
    },
    taggedProducts: ['prod-013'],
    likes: 6789,
    comments: 134,
    shares: 67,
    views: 23456,
    timestamp: '2 days ago'
  },
  {
    id: 'post-006',
    type: 'post',
    user: {
      id: 'user-006',
      username: 'foodie_adventures',
      name: 'Carlos Martinez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      verified: false,
      isCreator: true
    },
    content: {
      text: 'Best coffee maker ever! My mornings are so much better now ☕️ Who else is a coffee addict?',
      images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800']
    },
    taggedProducts: ['prod-025'],
    likes: 5432,
    comments: 98,
    shares: 45,
    timestamp: '2 days ago'
  },
  {
    id: 'post-007',
    type: 'post',
    user: {
      id: 'user-007',
      username: 'urban_style',
      name: 'Jessica Lee',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Obsessed with this leather backpack! Perfect size and the quality is amazing 😍🎒',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'
      ]
    },
    taggedProducts: ['prod-004'],
    likes: 11234,
    comments: 267,
    shares: 145,
    timestamp: '3 days ago',
    isSaved: true
  },
  {
    id: 'post-008',
    type: 'loop',
    user: {
      id: 'user-008',
      username: 'gaming_legends',
      name: 'Tyler Brooks',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'New gaming setup! This Bluetooth speaker is INSANE for the price 🎮🔊',
      video: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
      images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800']
    },
    taggedProducts: ['prod-022'],
    likes: 14567,
    comments: 345,
    shares: 189,
    views: 67890,
    timestamp: '3 days ago'
  },
  {
    id: 'post-009',
    type: 'post',
    user: {
      id: 'user-001',
      username: 'fashionista_maya',
      name: 'Maya Chen',
      avatar: 'https://images.unsplash.com/photo-1507611268508-bf74edce9029?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Summer vibes with these polarized sunglasses! UV protection is a must ☀️😎',
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800']
    },
    taggedProducts: ['prod-018'],
    likes: 8765,
    comments: 187,
    shares: 92,
    timestamp: '4 days ago'
  },
  {
    id: 'post-010',
    type: 'post',
    user: {
      id: 'user-003',
      username: 'beautyby_sarah',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Makeup essentials! These brushes are professional quality at an amazing price 💄✨',
      images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800']
    },
    taggedProducts: ['prod-008'],
    likes: 13456,
    comments: 298,
    shares: 167,
    timestamp: '4 days ago'
  },
  {
    id: 'post-011',
    type: 'loop',
    user: {
      id: 'user-005',
      username: 'fitness_journey',
      name: 'Mike Thompson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      verified: false,
      isCreator: true
    },
    content: {
      text: 'Resistance bands workout! These are perfect for home training 💪🔥',
      video: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800',
      images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800']
    },
    taggedProducts: ['prod-014'],
    likes: 7890,
    comments: 145,
    shares: 73,
    views: 34567,
    timestamp: '5 days ago'
  },
  {
    id: 'post-012',
    type: 'post',
    user: {
      id: 'user-004',
      username: 'homestyle_guru',
      name: 'Emily White',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Cozy corner update! These scented candles create the perfect ambiance 🕯️✨',
      images: ['https://images.unsplash.com/photo-1631691971525-3f4b54255fea?w=1080&q=80']
    },
    taggedProducts: ['prod-010'],
    likes: 6543,
    comments: 123,
    shares: 56,
    timestamp: '5 days ago'
  },
  {
    id: 'post-013',
    type: 'post',
    user: {
      id: 'user-009',
      username: 'runner_life',
      name: 'David Park',
      avatar: 'https://images.unsplash.com/photo-1542190891-2093d38760f2?w=200',
      verified: false,
      isCreator: true
    },
    content: {
      text: 'New running shoes! So light and comfortable, perfect for long runs 👟🏃‍♂️',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800']
    },
    taggedProducts: ['prod-023'],
    likes: 9876,
    comments: 213,
    shares: 98,
    timestamp: '6 days ago'
  },
  {
    id: 'post-014',
    type: 'post',
    user: {
      id: 'user-002',
      username: 'tech_reviews_pro',
      name: 'Alex Kumar',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Wireless charging made easy! No more cables cluttering my desk 📱⚡',
      images: ['https://images.unsplash.com/photo-1678733404886-f6c9551cd283?w=1080&q=80']
    },
    taggedProducts: ['prod-017'],
    likes: 7234,
    comments: 156,
    shares: 78,
    timestamp: '6 days ago'
  },
  {
    id: 'post-015',
    type: 'post',
    user: {
      id: 'user-010',
      username: 'minimalist_life',
      name: 'Rachel Green',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
      verified: false,
      isCreator: true
    },
    content: {
      text: 'My minimal watch collection! This one is my favorite - simple and elegant ⌚',
      images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800']
    },
    taggedProducts: ['prod-005'],
    likes: 10234,
    comments: 189,
    shares: 94,
    timestamp: '1 week ago'
  },
  {
    id: 'post-016',
    type: 'loop',
    user: {
      id: 'user-003',
      username: 'beautyby_sarah',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Hair care routine with this amazing hair oil! Results in just 1 week 💁‍♀️✨',
      video: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800',
      images: ['https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800']
    },
    taggedProducts: ['prod-009'],
    likes: 11567,
    comments: 267,
    shares: 134,
    views: 45678,
    timestamp: '1 week ago'
  },
  {
    id: 'post-017',
    type: 'post',
    user: {
      id: 'user-011',
      username: 'wellness_coach',
      name: 'Amanda Silva',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Aromatherapy essentials! These oils are 100% pure and smell amazing 🌿💜',
      images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800']
    },
    taggedProducts: ['prod-024'],
    likes: 8923,
    comments: 198,
    shares: 87,
    timestamp: '1 week ago'
  },
  {
    id: 'post-018',
    type: 'post',
    user: {
      id: 'user-005',
      username: 'fitness_journey',
      name: 'Mike Thompson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      verified: false,
      isCreator: true
    },
    content: {
      text: 'Hydration is key! This insulated bottle keeps my water ice cold all day 💧',
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800']
    },
    taggedProducts: ['prod-015'],
    likes: 6789,
    comments: 145,
    shares: 67,
    timestamp: '1 week ago'
  },
  {
    id: 'post-019',
    type: 'post',
    user: {
      id: 'user-012',
      username: 'creative_writer',
      name: 'James Wilson',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
      verified: false,
      isCreator: true
    },
    content: {
      text: 'Writing in this leather journal feels so premium! Perfect for daily journaling ✍️📖',
      images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800']
    },
    taggedProducts: ['prod-016'],
    likes: 5678,
    comments: 123,
    shares: 54,
    timestamp: '1 week ago'
  },
  {
    id: 'post-020',
    type: 'post',
    user: {
      id: 'user-004',
      username: 'homestyle_guru',
      name: 'Emily White',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Living room makeover! These throw pillows add the perfect touch 🛋️✨',
      images: ['https://images.unsplash.com/photo-1666585958641-4f70887372a1?w=1080&q=80']
    },
    taggedProducts: ['prod-012'],
    likes: 9234,
    comments: 187,
    shares: 89,
    timestamp: '2 weeks ago'
  },
  {
    id: 'post-021',
    type: 'loop',
    user: {
      id: 'user-006',
      username: 'foodie_adventures',
      name: 'Carlos Martinez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      verified: false,
      isCreator: true
    },
    content: {
      text: 'Morning coffee setup that changed my life ☕ The aroma is incredible every single morning!',
      video: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1080&q=80',
      images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1080&q=80']
    },
    taggedProducts: ['prod-008'],
    likes: 9234,
    comments: 198,
    shares: 112,
    views: 38900,
    timestamp: '2 weeks ago'
  },
  {
    id: 'post-022',
    type: 'loop',
    user: {
      id: 'user-007',
      username: 'urban_style',
      name: 'Jessica Lee',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'OOTD! This leather backpack is getting so many compliments 🎒✨ Perfect for work AND weekend',
      video: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1080&q=80',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1080&q=80']
    },
    taggedProducts: ['prod-004'],
    likes: 16780,
    comments: 412,
    shares: 256,
    views: 87600,
    timestamp: '2 weeks ago'
  },
  {
    id: 'post-023',
    type: 'loop',
    user: {
      id: 'user-011',
      username: 'wellness_coach',
      name: 'Amanda Silva',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      verified: true,
      isCreator: true
    },
    content: {
      text: 'Evening wind-down routine 🌿 These skincare essentials are pure magic for glowing skin',
      video: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1080&q=80',
      images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1080&q=80']
    },
    taggedProducts: ['prod-006'],
    likes: 12340,
    comments: 287,
    shares: 145,
    views: 52100,
    timestamp: '3 weeks ago'
  },
  {
    id: 'post-024',
    type: 'loop',
    user: {
      id: 'user-010',
      username: 'minimalist_life',
      name: 'Rachel Green',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
      verified: false,
      isCreator: true
    },
    content: {
      text: 'Minimal watch collection update! This one is everything ⌚ clean, sleek, perfect',
      video: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1080&q=80',
      images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1080&q=80']
    },
    taggedProducts: ['prod-005'],
    likes: 8920,
    comments: 164,
    shares: 89,
    views: 31200,
    timestamp: '3 weeks ago'
  }
];

// Helper functions
export const getPostById = (id: string): Post | undefined => {
  return posts.find(p => p.id === id);
};

export const getPostsByUser = (username: string): Post[] => {
  return posts.filter(p => p.user.username === username);
};

export const getLoops = (): Post[] => {
  return posts.filter(p => p.type === 'loop');
};

export const getFeedPosts = (): Post[] => {
  return posts.filter(p => p.type === 'post');
};
/**
 * Bridges legacy in-repo posts onto the API `Post` shape so Loops/PostViewer (still on `data/posts`)
 * can open the shared `CommentSheet`. Remove once those surfaces are on `useLoops()` / `usePost()`.
 */
export function toCorePost(p: Post) {
  const images = p.content.images ?? (p.content.video ? [p.content.video] : []);
  return {
    id: p.id,
    kind: p.type,
    author: { id: p.user.id, username: p.user.username, name: p.user.name, avatarUrl: p.user.avatar, verified: p.user.verified, role: p.user.isCreator ? ('creator' as const) : ('user' as const) },
    caption: p.content.text ?? '',
    hashtags: (p.content.text?.match(/#(\w+)/g) ?? []).map(h => h.slice(1)),
    media: images.map(url => ({ type: p.type === 'loop' ? ('video' as const) : ('image' as const), url, thumbnailUrl: p.type === 'loop' ? url : null, width: null, height: null, durationMs: null })),
    taggedProductIds: p.taggedProducts ?? [],
    engagement: { likes: p.likes, comments: p.comments, shares: p.shares, saves: 0, views: p.views, isLiked: !!p.isLiked, isSaved: !!p.isSaved },
    location: null,
    createdAt: new Date().toISOString(),
  };
}
