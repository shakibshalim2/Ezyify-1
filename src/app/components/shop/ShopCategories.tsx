import React from 'react';
import { Link } from 'react-router';
import { 
  Laptop, 
  Shirt, 
  Sparkles, 
  Home, 
  Dumbbell, 
  BookOpen
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  image: string;
}

export const shopCategories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: <Laptop className="w-6 h-6" />,
    count: 156,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300'
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    icon: <Shirt className="w-6 h-6" />,
    count: 234,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300'
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    icon: <Sparkles className="w-6 h-6" />,
    count: 189,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300'
  },
  {
    id: 'home',
    name: 'Home & Living',
    icon: <Home className="w-6 h-6" />,
    count: 312,
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300'
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    icon: <Dumbbell className="w-6 h-6" />,
    count: 145,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300'
  },
  {
    id: 'books',
    name: 'Books & Stationery',
    icon: <BookOpen className="w-6 h-6" />,
    count: 98,
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300'
  }
];

interface ShopCategoriesProps {
  variant?: 'grid' | 'carousel';
  limit?: number;
}

export const ShopCategories = React.memo(({ variant = 'grid', limit }: ShopCategoriesProps) => {
  const displayCategories = limit ? shopCategories.slice(0, limit) : shopCategories;

  if (variant === 'carousel') {
    return (
      <div className="overflow-x-auto pb-4 -mx-2 px-2">
        <div className="flex gap-4 min-w-max">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.name}`}
              className="flex-shrink-0 w-32 group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2 border border-border">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                <div className="absolute bottom-2 left-2 text-white">
                  {category.icon}
                </div>
              </div>
              <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground">{category.count} items</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {displayCategories.map((category) => (
        <Link
          key={category.id}
          to={`/shop?category=${category.name}`}
          className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all"
        >
          <div className="relative aspect-square overflow-hidden">
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
            <div className="absolute bottom-3 left-3 text-white">
              {category.icon}
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{category.count} products</p>
          </div>
        </Link>
      ))}
    </div>
  );
});

ShopCategories.displayName = 'ShopCategories';
