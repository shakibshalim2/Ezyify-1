// Enhanced Mock Data for EZYIFY - 115 Products & 110 Posts

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  seller: string;
  badge?: string;
  inStock: boolean;
  tags: string[];
  delivery?: string;
  commission?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  count: number;
}

export interface Post {
  id: string;
  author: {
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: {
    text: string;
    media: {
      type: 'image' | 'video' | 'carousel';
      url: string | string[];
    };
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  taggedProducts: string[]; // Product IDs
  timestamp: string;
  hashtags: string[];
}

// Categories with images
export const categoryData: Category[] = [
  {
    id: 'all',
    name: 'All',
    icon: '🏪',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    count: 115
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: '👔',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    count: 35
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    count: 30
  },
  {
    id: 'home',
    name: 'Home & Living',
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400',
    count: 23
  },
  {
    id: 'beauty',
    name: 'Beauty',
    icon: '💄',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    count: 14
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
    count: 12
  },
  {
    id: 'books',
    name: 'Books',
    icon: '📚',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    count: 1
  },
];

// Enhanced product data generator
function generateProducts() {
  const products: Product[] = [];
  
  // Sample images for different categories (Unsplash)
  const fashionImages = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
  ];
  
  const electronicsImages = [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400',
    'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  ];
  
  const homeImages = [
    'https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=400',
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400',
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    'https://images.unsplash.com/photo-1582737376752-5196371b1213?w=400',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
  ];
  
  const beautyImages = [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400',
  ];
  
  const sportsImages = [
    'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  ];
  
  // Fashion Products (35 total)
  const fashionProducts = [
    'Premium Cotton T-Shirt', 'Slim Fit Denim Jeans', 'Leather Crossbody Bag', 'Running Sneakers Pro',
    'Aviator Sunglasses', 'Elegant Watch Classic', 'Summer Floral Dress', 'Wool Blend Coat',
    'Leather Belt Classic', 'Canvas Backpack', 'Hooded Sweatshirt', 'Chino Pants Slim',
    'Baseball Cap Classic', 'Ankle Boots Leather', 'Polo Shirt Premium', 'Scarf Wool Blend',
    'Formal Blazer', 'Graphic Tee Collection', 'Yoga Pants High-Waist', 'Tank Top Performance',
    'Maxi Dress Elegant', 'Denim Jacket Vintage', 'Messenger Bag Canvas', 'Slip-On Shoes Casual',
    'Leather Gloves', 'Sports Jersey', 'Cardigan Knit', 'Cocktail Dress',
    'Windbreaker Jacket', 'Cargo Shorts', 'Beanie Hat', 'Running Shorts',
    'Blazer Dress', 'Tote Bag Large', 'Trench Coat'
  ];
  
  fashionProducts.forEach((name, idx) => {
    const basePrice = 20 + Math.random() * 180;
    const hasDiscount = Math.random() > 0.6;
    products.push({
      id: `p${idx + 1}`,
      name,
      price: Math.round(basePrice * 100) / 100,
      originalPrice: hasDiscount ? Math.round((basePrice * 1.4) * 100) / 100 : undefined,
      image: fashionImages[idx % fashionImages.length],
      rating: 4.3 + Math.random() * 0.7,
      reviews: Math.floor(100 + Math.random() * 1500),
      category: 'Fashion',
      seller: ['StyleHub', 'DenimCo', 'LuxeBags', 'FootwearPro', 'WinterWear'][idx % 5],
      badge: hasDiscount ? ['SALE', 'NEW', 'TRENDING', 'BESTSELLER'][idx % 4] : undefined,
      inStock: true,
      tags: [['trending', 'bestseller'], ['new-arrival'], ['luxury'], ['casual'], ['winter']][idx % 5],
      delivery: Math.random() > 0.7 ? 'Free delivery tomorrow' : undefined,
      commission: Math.round(basePrice * 0.15 * 100) / 100
    });
  });
  
  // Electronics Products (30 total)
  const electronicsProducts = [
    'Wireless Earbuds Pro', 'Smartphone Stand Adjustable', 'Mechanical Keyboard RGB', 'Wireless Mouse Silent',
    'USB-C Hub 7-in-1', 'Portable SSD 1TB', 'Webcam 4K HD', 'Power Bank 20000mAh',
    'Smart Watch Fitness', 'Bluetooth Speaker Waterproof', 'Laptop Stand Aluminum', 'Gaming Headset RGB',
    'LED Desk Lamp', 'Wireless Charger Pad', 'Ring Light 10 inch', 'Microphone USB Podcast',
    'Cable Organizer Set', 'Monitor 27 inch 4K', 'Graphics Tablet', 'Gaming Mouse Pad XXL',
    'Phone Gimbal Stabilizer', 'Action Camera 4K', 'Smart LED Bulbs (4-pack)', 'Drone with Camera',
    'Portable Projector', 'VR Headset', 'Dash Cam HD', 'E-Reader 7 inch',
    'Tripod Camera Stand', 'Laptop Cooling Pad'
  ];
  
  electronicsProducts.forEach((name, idx) => {
    const basePrice = 30 + Math.random() * 420;
    const hasDiscount = Math.random() > 0.65;
    products.push({
      id: `p${35 + idx + 1}`,
      name,
      price: Math.round(basePrice * 100) / 100,
      originalPrice: hasDiscount ? Math.round((basePrice * 1.35) * 100) / 100 : undefined,
      image: electronicsImages[idx % electronicsImages.length],
      rating: 4.4 + Math.random() * 0.6,
      reviews: Math.floor(150 + Math.random() * 1400),
      category: 'Electronics',
      seller: ['TechWorld', 'GadgetHub', 'GamingGear', 'StreamPro', 'AudioPlus'][idx % 5],
      badge: hasDiscount ? ['SALE', '4K', 'GAMING', 'BESTSELLER', 'PREMIUM'][idx % 5] : undefined,
      inStock: true,
      tags: [['bestseller', 'trending'], ['gaming'], ['workspace'], ['content-creation'], ['smart-home']][idx % 5],
      delivery: Math.random() > 0.6 ? 'Free delivery tomorrow' : undefined,
      commission: Math.round(basePrice * 0.12 * 100) / 100
    });
  });
  
  // Home & Living Products (23 total)
  const homeProducts = [
    'Aromatherapy Diffuser', 'Throw Pillow Set (4pcs)', 'Table Lamp Modern', 'Wall Art Canvas Print',
    'Ceramic Plant Pot Set', 'Weighted Blanket', 'Kitchen Knife Set Professional', 'Coffee Maker Automatic',
    'Area Rug Modern', 'Wall Clock Minimalist', 'Curtains Blackout', 'Storage Baskets Set',
    'Accent Chair', 'Bookshelf Modern', 'Mirror Full Length', 'Bed Sheets Luxury Set',
    'Bathroom Mat Set', 'Candle Set Aromatherapy', 'Vacuum Cleaner Robot', 'Air Purifier HEPA',
    'Desk Organizer Set', 'Trash Can Touchless', 'Humidifier Ultrasonic'
  ];
  
  homeProducts.forEach((name, idx) => {
    const basePrice = 25 + Math.random() * 275;
    const hasDiscount = Math.random() > 0.6;
    products.push({
      id: `p${65 + idx + 1}`,
      name,
      price: Math.round(basePrice * 100) / 100,
      originalPrice: hasDiscount ? Math.round((basePrice * 1.45) * 100) / 100 : undefined,
      image: homeImages[idx % homeImages.length],
      rating: 4.4 + Math.random() * 0.6,
      reviews: Math.floor(100 + Math.random() * 1100),
      category: 'Home & Living',
      seller: ['HomeEssence', 'CozyHome', 'FurniturePlus', 'SmartHome', 'OrganizePro'][idx % 5],
      badge: hasDiscount ? ['SALE', 'WELLNESS', 'POPULAR', 'BESTSELLER'][idx % 4] : undefined,
      inStock: true,
      tags: [['wellness'], ['furniture'], ['smart-home'], ['organization'], ['trending']][idx % 5],
      delivery: Math.random() > 0.7 ? 'Free delivery' : undefined,
      commission: Math.round(basePrice * 0.14 * 100) / 100
    });
  });
  
  // Beauty Products (14 total)
  const beautyProducts = [
    'Skincare Set Premium', 'Makeup Brush Set (12pcs)', 'Hair Dryer Professional', 'Facial Steamer Spa',
    'Perfume Luxury', 'Face Mask Sheet (10-pack)', 'Nail Polish Set', 'Eyelash Curler',
    'Jade Roller Face', 'Sunscreen SPF 50', 'Lip Gloss Set (5-pack)', 'Hair Serum Repair',
    'Makeup Remover Wipes', 'Electric Facial Brush'
  ];
  
  beautyProducts.forEach((name, idx) => {
    const basePrice = 15 + Math.random() * 135;
    const hasDiscount = Math.random() > 0.6;
    products.push({
      id: `p${88 + idx + 1}`,
      name,
      price: Math.round(basePrice * 100) / 100,
      originalPrice: hasDiscount ? Math.round((basePrice * 1.5) * 100) / 100 : undefined,
      image: beautyImages[idx % beautyImages.length],
      rating: 4.5 + Math.random() * 0.5,
      reviews: Math.floor(200 + Math.random() * 1300),
      category: 'Beauty',
      seller: ['BeautyLux', 'MakeupPro', 'SalonGear', 'SkinCarePro'][idx % 4],
      badge: hasDiscount ? ['SALE', 'LUXURY', 'BESTSELLER', 'TRENDING'][idx % 4] : undefined,
      inStock: true,
      tags: [['skincare'], ['makeup'], ['hair-care'], ['luxury'], ['bestseller']][idx % 5],
      delivery: Math.random() > 0.65 ? 'Free delivery tomorrow' : undefined,
      commission: Math.round(basePrice * 0.16 * 100) / 100
    });
  });
  
  // Sports Products (12 total)
  const sportsProducts = [
    'Yoga Mat Premium', 'Resistance Bands Set', 'Dumbbells Set Adjustable', 'Exercise Ball',
    'Jump Rope Speed', 'Foam Roller', 'Protein Shaker Bottle', 'Gym Bag Duffel',
    'Water Bottle Insulated', 'Kettlebell Cast Iron', 'Massage Gun Recovery', 'Ab Wheel Roller'
  ];
  
  sportsProducts.forEach((name, idx) => {
    const basePrice = 15 + Math.random() * 185;
    const hasDiscount = Math.random() > 0.6;
    products.push({
      id: `p${102 + idx + 1}`,
      name,
      price: Math.round(basePrice * 100) / 100,
      originalPrice: hasDiscount ? Math.round((basePrice * 1.4) * 100) / 100 : undefined,
      image: sportsImages[idx % sportsImages.length],
      rating: 4.4 + Math.random() * 0.6,
      reviews: Math.floor(150 + Math.random() * 1200),
      category: 'Sports',
      seller: ['FitGear', 'CardioGear', 'RecoveryPro', 'StrengthGear'][idx % 4],
      badge: hasDiscount ? ['SALE', 'FITNESS', 'BESTSELLER'][idx % 3] : undefined,
      inStock: true,
      tags: [['fitness'], ['yoga'], ['strength'], ['recovery'], ['cardio']][idx % 5],
      delivery: Math.random() > 0.7 ? 'Free delivery' : undefined,
      commission: Math.round(basePrice * 0.13 * 100) / 100
    });
  });
  
  // Books (1 product)
  products.push({
    id: 'p115',
    name: 'Bestseller Book Bundle',
    price: 59.99,
    originalPrice: 89.99,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    rating: 4.9,
    reviews: 1890,
    category: 'Books',
    seller: 'BookWorld',
    badge: '33% OFF',
    inStock: true,
    tags: ['reading', 'bestseller'],
    commission: 9.99
  });
  
  return products;
}

export const mockProducts: Product[] = generateProducts();

// Helper functions
export function getProductById(id: string): Product | undefined {
  return mockProducts.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return mockProducts.filter(p => p.category === category);
}

export function getProductsByTag(tag: string): Product[] {
  return mockProducts.filter(p => p.tags.includes(tag));
}

export function getPostsByProduct(productId: string): Post[] {
  return mockPosts.filter(p => p.taggedProducts.includes(productId));
}

export const categories = ['All', 'Fashion', 'Electronics', 'Home & Living', 'Beauty', 'Sports', 'Books'];

// Generate 110 Posts
function generatePosts(): Post[] {
  const posts: Post[] = [];
  
  const usernames = [
    'fashionista_emma', 'tech_guru_mike', 'home_decor_sarah', 'fitness_jack', 'beauty_queen_lisa',
    'sneaker_head_alex', 'gamer_pro_david', 'travel_wanderer', 'coffee_addict_jane', 'style_icon_mia',
    'minimal_living', 'bookworm_emily', 'urban_explorer', 'wellness_warrior', 'chef_at_home',
    'smart_tech_user', 'active_lifestyle', 'luxury_lover', 'cozy_home_vibes', 'outdoor_enthusiast',
    'fashion_forward', 'makeup_artist_pro', 'digital_nomad', 'art_collector', 'sleep_expert',
    'streamer_king', 'accessories_queen', 'plant_parent', 'yoga_enthusiast', 'professional_style',
    'beauty_influencer', 'summer_vibes', 'vintage_collector', 'modern_minimalist', 'creative_soul',
    'sports_enthusiast', 'music_lover', 'foodie_adventures', 'productivity_pro', 'aesthetic_life',
    'wanderlust_soul', 'eco_warrior', 'art_enthusiast', 'fitness_motivation', 'style_curator'
  ];
  
  const postImages = [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800',
  ];
  
  const postTexts = [
    'Obsessed with my new outfit! 😍 The quality is amazing and fits perfectly.',
    'Best tech upgrade of 2025! Sound quality is insane 🎧 Totally worth it!',
    'Transformed my living room with these beauties! 🏠✨ Links in bio',
    'Morning workout done! 💪 This gear is a game changer. Who else is crushing their goals?',
    'Glowing skin is always in! ✨ My skincare routine essentials.',
    'Latest addition to the collection 👟🔥 These are fire!',
    'Setup upgrade complete! 🎮⌨️ RGB everything! Stream starts at 8pm',
    'Adventure ready! 🎒✈️ This backpack has everything I need for my trip',
    'Best coffee mornings ☕️❤️ This machine makes barista-quality coffee at home!',
    'Accessorizing like a pro 👜⌚ Details make the difference!',
    'Less is more 🌿 Creating peaceful spaces at home',
    'Current reading list 📚✨ These books changed my perspective!',
    'Street style vibes 🏙️👟 Keeping it fresh and comfortable',
    'Self-care Sunday essentials 🧖‍♀️💆‍♀️ Taking time for me',
    'Cooking up something special 👨‍🍳🔪 These tools are chef-approved!',
  ];
  
  const hashtags = [
    ['OOTD', 'FashionGoals', 'Style'],
    ['Tech', 'Gadgets', 'Audio'],
    ['HomeDecor', 'InteriorDesign', 'CozyHome'],
    ['Fitness', 'Workout', 'HealthyLifestyle'],
    ['Skincare', 'Beauty', 'SelfCare'],
    ['Sneakers', 'Fashion', 'Streetwear'],
    ['Gaming', 'Setup', 'PCGaming'],
    ['Travel', 'Adventure', 'Wanderlust'],
    ['Coffee', 'MorningRoutine', 'CoffeeLover'],
    ['Accessories', 'LuxuryFashion', 'Style'],
  ];
  
  const timestamps = [
    '2h ago', '5h ago', '1d ago', '3h ago', '6h ago', '8h ago', '4h ago', '12h ago',
    '1d ago', '7h ago', '9h ago', '5h ago', '2d ago', '10h ago', '14h ago', '6h ago',
    '8h ago', '3h ago', '11h ago', '1d ago', '13h ago', '4h ago', '15h ago', '2d ago',
    '9h ago', '5h ago', '7h ago', '12h ago', '3h ago', '16h ago', '10h ago', '1d ago'
  ];
  
  // Generate 110 posts
  for (let i = 0; i < 110; i++) {
    const mediaType = Math.random();
    const isVerified = Math.random() > 0.6;
    const productCount = Math.floor(Math.random() * 3) + 1; // 1-3 products per post
    const taggedProductIds = [];
    
    for (let j = 0; j < productCount && i + j < mockProducts.length; j++) {
      taggedProductIds.push(`p${(i + j) % 115 + 1}`);
    }
    
    posts.push({
      id: `post${i + 1}`,
      author: {
        username: usernames[i % usernames.length],
        avatar: `https://i.pravatar.cc/150?img=${(i % 50) + 1}`,
        verified: isVerified
      },
      content: {
        text: postTexts[i % postTexts.length] + ` #${hashtags[i % hashtags.length].join(' #')}`,
        media: {
          type: mediaType > 0.7 ? 'carousel' : (mediaType > 0.3 ? 'image' : 'video'),
          url: mediaType > 0.7 
            ? [postImages[i % postImages.length], postImages[(i + 1) % postImages.length]]
            : postImages[i % postImages.length]
        }
      },
      engagement: {
        likes: Math.floor(1000 + Math.random() * 25000),
        comments: Math.floor(50 + Math.random() * 800),
        shares: Math.floor(20 + Math.random() * 400),
        saves: Math.floor(100 + Math.random() * 1400)
      },
      taggedProducts: taggedProductIds,
      timestamp: timestamps[i % timestamps.length],
      hashtags: hashtags[i % hashtags.length]
    });
  }
  
  return posts;
}

export const mockPosts: Post[] = generatePosts();
