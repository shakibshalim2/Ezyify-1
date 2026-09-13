/**
 * Lazy Data Loading Manager - Prevents loading all data into memory at once
 */

import type { Product } from '../data/products';
import type { Post } from '../data/posts';
import type { User } from '../data/users';

// Data cache with LRU (Least Recently Used) eviction
const cache = new Map<string, { data: any; timestamp: number; hits: number }>();
const MAX_CACHE_SIZE = 30; // Reduced from 50 for better memory management
const CACHE_TTL = 3 * 60 * 1000; // Reduced to 3 minutes from 5

// Clean old cache entries
function cleanCache() {
  const now = Date.now();
  const entries = Array.from(cache.entries());
  
  // Remove expired entries
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  });
  
  // If still over limit, remove least recently used
  if (cache.size > MAX_CACHE_SIZE) {
    const sorted = entries.sort((a, b) => a[1].hits - b[1].hits);
    const toRemove = sorted.slice(0, cache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => cache.delete(key));
  }
}

// Get data with caching
function getCached<T>(key: string, loader: () => T): T {
  const cached = cache.get(key);
  
  if (cached) {
    cached.hits++;
    cached.timestamp = Date.now();
    return cached.data as T;
  }
  
  const data = loader();
  cache.set(key, { data, timestamp: Date.now(), hits: 1 });
  
  // Clean cache periodically
  if (cache.size > MAX_CACHE_SIZE) {
    cleanCache();
  }
  
  return data;
}

// Lazy load products with pagination
export function getProducts(page = 1, limit = 15): Product[] {
  return getCached(`products-${page}-${limit}`, () => {
    const allProducts = require('../data/products').products;
    const start = (page - 1) * limit;
    return allProducts.slice(start, start + limit);
  });
}

// Lazy load posts with pagination
export function getPosts(page = 1, limit = 15): Post[] {
  return getCached(`posts-${page}-${limit}`, () => {
    const allPosts = require('../data/posts').posts;
    const start = (page - 1) * limit;
    return allPosts.slice(start, start + limit);
  });
}

// Lazy load users
export function getUsers(page = 1, limit = 15): User[] {
  return getCached(`users-${page}-${limit}`, () => {
    const allUsers = require('../data/users').users;
    const start = (page - 1) * limit;
    return allUsers.slice(start, start + limit);
  });
}

// Get single product by ID
export function getProductData(id: string): Product | undefined {
  return getCached(`product-${id}`, () => {
    const { getProductById } = require('../data/products');
    return getProductById(id);
  });
}

// Get single post by ID
export function getPostData(id: string): Post | undefined {
  return getCached(`post-${id}`, () => {
    const { getPostById } = require('../data/posts');
    return getPostById(id);
  });
}

// Clear cache manually
export function clearDataCache() {
  cache.clear();
}

// Clear specific cache entry
export function clearCacheEntry(key: string) {
  cache.delete(key);
}

// Get cache stats for debugging
export function getCacheStats() {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    entries: Array.from(cache.keys()),
  };
}